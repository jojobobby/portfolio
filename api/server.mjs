// Comments for rrobinson.me. No accounts: a commenter is a name, an optional email and a
// random device id kept by their browser, plus the IP the request came from (spam limits).
// Emails and IPs never leave this service: the public list has names, text and times only.
import http from 'node:http';
import pg from 'pg';
import nodemailer from 'nodemailer';
import { LIMITS, validateComment, clientIp, token, isAdmin, mail } from './lib.mjs';
import { migrateVideos, scheduleVideoSync, syncVideos, listVideos, videoThumb } from './youtube.mjs';

pg.types.setTypeParser(1082, (v) => v); // dates stay 'YYYY-MM-DD' strings, no time zone shifts
const CHANNEL = process.env.YOUTUBE_HANDLE || '@RalphOfc';

const SITE = process.env.SITE_URL || 'https://rrobinson.me';
// The static site, reached inside the cluster, to check a post exists before taking comments on it.
const SITE_INTERNAL = process.env.SITE_INTERNAL_URL || 'http://portfolio';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.mail.svc',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  name: 'rrobinson.me', // HELO must be a full domain name
  // The inbox presents its public certificate, so check it under that name. Without one
  // configured (local testing against Mailpit), accept any certificate.
  tls: process.env.SMTP_TLS_NAME ? { servername: process.env.SMTP_TLS_NAME } : { rejectUnauthorized: false },
  // Authenticated submission to the inbox server: it delivers @tidangames.com mail itself and
  // relays the rest. (The send-only relay refuses mail for our own domain as a loop.)
  ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {}),
});
const FROM = process.env.MAIL_FROM || 'Rapheal Robinson <noreply@tidangames.com>';

async function migrate() {
  const c = await db.connect();
  try {
    await c.query('SELECT pg_advisory_lock(424242)'); // replicas start together
    await c.query(`
      CREATE TABLE IF NOT EXISTS commenters (
        id          bigserial PRIMARY KEY,
        device_id   text UNIQUE NOT NULL,
        first_ip    inet,
        last_ip     inet,
        user_agent  text,
        first_seen  timestamptz NOT NULL DEFAULT now(),
        last_seen   timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS comments (
        id                 bigserial PRIMARY KEY,
        post               text NOT NULL,
        parent_id          bigint REFERENCES comments(id),
        commenter_id       bigint REFERENCES commenters(id),
        name               text NOT NULL,
        email              text,
        email_confirmed    boolean NOT NULL DEFAULT false,
        confirm_token      text UNIQUE,
        unsubscribe_token  text UNIQUE,
        notify             boolean NOT NULL DEFAULT true,
        body               text NOT NULL,
        ip                 inet,
        created_at         timestamptz NOT NULL DEFAULT now(),
        deleted            boolean NOT NULL DEFAULT false
      );
      CREATE INDEX IF NOT EXISTS comments_post ON comments (post, created_at);
      CREATE INDEX IF NOT EXISTS comments_ip ON comments (ip, created_at);
      CREATE TABLE IF NOT EXISTS mail_log (
        email    text NOT NULL,
        kind     text NOT NULL,
        sent_at  timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS mail_log_email ON mail_log (email, kind, sent_at);
    `);
    await migrateVideos(c);
  } finally {
    await c.query('SELECT pg_advisory_unlock(424242)').catch(() => {});
    c.release();
  }
}

const SECURITY = { 'x-content-type-options': 'nosniff', 'strict-transport-security': 'max-age=31536000' };

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...SECURITY, ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}
const redirect = (res, to) => { res.writeHead(302, { location: to, 'cache-control': 'no-store', ...SECURITY }); res.end(); };

async function readJson(req) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > 16_000) throw new Error('too big'); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

/** Send unless this address already got `max` emails of this kind today. */
async function sendMail(to, kind, max, { subject, text, unsubscribe }) {
  const { rows: [sent] } = await db.query(
    `SELECT count(*) AS n FROM mail_log WHERE email = $1 AND kind = $2 AND sent_at > now() - interval '1 day'`, [to, kind]);
  if (Number(sent.n) >= max) return;
  await db.query('INSERT INTO mail_log (email, kind) VALUES ($1, $2)', [to, kind]);
  const headers = unsubscribe ? { 'List-Unsubscribe': `<${unsubscribe}>` } : {};
  try { await mailer.sendMail({ from: FROM, to, subject, text, headers }); }
  catch (e) { console.error('mail failed:', e.message); }
}

// Comments are only taken on posts that exist. Answers are cached, so it costs one request per post.
const known = new Map();
async function postExists(post) {
  const hit = known.get(post);
  if (hit && hit.until > Date.now()) return hit.ok;
  const res = await fetch(`${SITE_INTERNAL}/writing/${post}/`, { method: 'HEAD', redirect: 'manual' });
  const ok = res.status === 200;
  known.set(post, { ok, until: Date.now() + (ok ? 3_600_000 : 300_000) });
  return ok;
}

async function listComments(post) {
  const { rows } = await db.query(
    `SELECT id, parent_id, name, body, created_at FROM comments
      WHERE post = $1 AND NOT deleted ORDER BY created_at`, [post]);
  return rows.map((r) => ({ id: Number(r.id), parentId: r.parent_id && Number(r.parent_id), name: r.name, body: r.body, createdAt: r.created_at }));
}

async function createComment(req, res) {
  let input;
  try { input = await readJson(req); } catch { return send(res, 400, { error: 'Bad request.' }); }
  if (input?.website) return send(res, 200, { ok: true }); // honeypot: bots fill every field
  const v = validateComment(input);
  if (!v.ok) return send(res, 400, { error: v.error });
  const c = v.value;
  const ip = clientIp(req.headers, req.socket.remoteAddress);
  if (!(await postExists(c.post).catch(() => false))) return send(res, 400, { error: 'Unknown post.' });

  const { rows: [recent] } = await db.query(
    `SELECT count(*) AS total, count(*) FILTER (WHERE c.ip = $1) AS by_ip, count(*) FILTER (WHERE m.device_id = $2) AS by_device
       FROM comments c LEFT JOIN commenters m ON m.id = c.commenter_id
      WHERE c.created_at > now() - interval '10 minutes'`, [ip, c.deviceId]);
  if (Number(recent.by_ip) >= LIMITS.perIpPer10Min || Number(recent.by_device) >= LIMITS.perDevicePer10Min
      || Number(recent.total) >= LIMITS.sitePer10Min)
    return send(res, 429, { error: 'Slow down a little and try again in a few minutes.' });

  let parent = null;
  if (c.parentId) {
    const { rows } = await db.query('SELECT id, name, email, email_confirmed, notify, unsubscribe_token FROM comments WHERE id = $1 AND post = $2 AND NOT deleted', [c.parentId, c.post]);
    if (!rows.length) return send(res, 400, { error: 'That comment is gone.' });
    parent = rows[0];
  }

  const { rows: [who] } = await db.query(
    `INSERT INTO commenters (device_id, first_ip, last_ip, user_agent) VALUES ($1, $2, $2, $3)
     ON CONFLICT (device_id) DO UPDATE SET last_ip = $2, last_seen = now(), user_agent = $3 RETURNING id`,
    [c.deviceId, ip, String(req.headers['user-agent'] || '').slice(0, 300)]);

  // An address confirmed once stays confirmed; otherwise ask once before any reply email.
  let confirmed = false;
  if (c.email) {
    const { rows } = await db.query('SELECT 1 FROM comments WHERE email = $1 AND email_confirmed LIMIT 1', [c.email]);
    confirmed = rows.length > 0;
  }
  const confirmToken = c.email && !confirmed ? token() : null;
  const { rows: [row] } = await db.query(
    `INSERT INTO comments (post, parent_id, commenter_id, name, email, email_confirmed, confirm_token, unsubscribe_token, body, ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [c.post, c.parentId, who.id, c.name, c.email, confirmed, confirmToken, c.email ? token() : null, c.body, ip]);

  if (confirmToken) {
    await sendMail(c.email, 'confirm', LIMITS.confirmsPerAddressPerDay,
      mail.confirm(SITE, c.name, c.post, `${SITE}/api/confirm?token=${confirmToken}`));
  }
  if (parent && parent.email && parent.email_confirmed && parent.notify && parent.email !== c.email) {
    const excerpt = c.body.length > 280 ? `${c.body.slice(0, 277)}...` : c.body;
    const unsubscribe = `${SITE}/api/unsubscribe?token=${parent.unsubscribe_token}`;
    await sendMail(parent.email, 'reply', LIMITS.repliesPerAddressPerDay,
      { ...mail.reply(SITE, parent.name, c.name, excerpt, c.post, unsubscribe), unsubscribe });
  }
  send(res, 201, { id: Number(row.id), needsConfirm: Boolean(confirmToken) });
}

async function byToken(column, tokenValue) {
  const { rows } = await db.query(`SELECT email, post FROM comments WHERE ${column} = $1`, [tokenValue]);
  return rows[0];
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/healthz') return send(res, 200, { ok: true });
    if (url.pathname === '/api/videos' && req.method === 'GET') {
      return send(res, 200, await listVideos(db), { 'cache-control': 'public, max-age=300' });
    }
    const thumb = url.pathname.match(/^\/api\/videos\/([A-Za-z0-9_-]{11})\/thumb$/);
    if (thumb) {
      const img = await videoThumb(db, thumb[1]);
      if (!img) return send(res, 404, { error: 'No thumbnail.' });
      res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400', ...SECURITY });
      return res.end(img);
    }
    if (url.pathname === '/api/comments' && req.method === 'GET') {
      const post = url.searchParams.get('post') || '';
      if (!/^[a-z0-9-]{1,100}$/.test(post)) return send(res, 400, { error: 'Unknown post.' });
      return send(res, 200, await listComments(post));
    }
    if (url.pathname === '/api/comments' && req.method === 'POST') return await createComment(req, res);
    // The emailed link opens the post, and a button there confirms. Mail scanners follow links
    // but do not press buttons, so a scanner cannot sign someone up for reply emails.
    if (url.pathname === '/api/confirm' && req.method === 'GET') {
      const t = url.searchParams.get('token') || '';
      const hit = await byToken('confirm_token', t);
      if (!hit) return redirect(res, `${SITE}/writing`);
      return redirect(res, `${SITE}/writing/${hit.post}?confirm=${encodeURIComponent(t)}#comments`);
    }
    if (url.pathname === '/api/confirm' && req.method === 'POST') {
      let input;
      try { input = await readJson(req); } catch { return send(res, 400, { error: 'Bad request.' }); }
      const hit = await byToken('confirm_token', String(input?.token || ''));
      if (!hit) return send(res, 404, { error: 'That link has expired.' });
      await db.query('UPDATE comments SET email_confirmed = true WHERE email = $1', [hit.email]);
      return send(res, 200, { ok: true });
    }
    if (url.pathname === '/api/unsubscribe') {
      const hit = await byToken('unsubscribe_token', url.searchParams.get('token') || '');
      if (!hit) return redirect(res, `${SITE}/writing`);
      await db.query('UPDATE comments SET notify = false WHERE email = $1', [hit.email]);
      return redirect(res, `${SITE}/writing/${hit.post}?unsubscribed=1#comments`);
    }
    if (url.pathname === '/api/videos/sync' && req.method === 'POST') {
      if (!isAdmin(req.headers.authorization, ADMIN_TOKEN)) return send(res, 403, { error: 'Forbidden.' });
      return send(res, 200, await syncVideos(db, CHANNEL));
    }
    const del = url.pathname.match(/^\/api\/comments\/(\d+)$/);
    if (del && req.method === 'DELETE') {
      if (!isAdmin(req.headers.authorization, ADMIN_TOKEN)) return send(res, 403, { error: 'Forbidden.' });
      await db.query('UPDATE comments SET deleted = true WHERE id = $1', [del[1]]);
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'Not found.' });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Something went wrong. Try again in a moment.' });
  }
});

// IPs are only needed for spam limits, so they are dropped after a while.
async function forgetOldIps() {
  try {
    await db.query(`UPDATE comments SET ip = NULL WHERE ip IS NOT NULL AND created_at < now() - make_interval(days => $1)`, [LIMITS.keepIpsDays]);
    await db.query(`UPDATE commenters SET first_ip = NULL, last_ip = NULL, user_agent = NULL
                     WHERE last_ip IS NOT NULL AND last_seen < now() - make_interval(days => $1)`, [LIMITS.keepIpsDays]);
    await db.query(`DELETE FROM mail_log WHERE sent_at < now() - interval '2 days'`);
  } catch (e) { console.error('cleanup failed:', e.message); }
}

server.headersTimeout = 10_000;
server.requestTimeout = 15_000;

await migrate();
if (process.env.VIDEO_SYNC !== 'off') scheduleVideoSync(db, CHANNEL);
forgetOldIps();
setInterval(forgetOldIps, 6 * 60 * 60 * 1000);
server.listen(Number(process.env.PORT || 3000), () => console.log('comments api listening'));
