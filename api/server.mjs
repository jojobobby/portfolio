// Comments for rrobinson.me. No accounts: a commenter is a name, an optional email and a
// random device id kept by their browser, plus the IP the request came from (spam limits).
// Emails and IPs never leave this service: the public list has names, text and times only.
import http from 'node:http';
import pg from 'pg';
import nodemailer from 'nodemailer';
import { LIMITS, validateComment, clientIp, token, mail } from './lib.mjs';
import { migrateVideos, scheduleVideoSync, syncVideos, listVideos, videoThumb } from './youtube.mjs';

pg.types.setTypeParser(1082, (v) => v); // dates stay 'YYYY-MM-DD' strings, no time zone shifts
const CHANNEL = process.env.YOUTUBE_HANDLE || '@RalphOfc';

const SITE = process.env.SITE_URL || 'https://rrobinson.me';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.mail.svc',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  name: 'rrobinson.me', // HELO must be a full domain name
  tls: { rejectUnauthorized: false }, // in-cluster hop; the public side has a real certificate
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
    `);
    await migrateVideos(c);
  } finally {
    await c.query('SELECT pg_advisory_unlock(424242)').catch(() => {});
    c.release();
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}
const redirect = (res, to) => { res.writeHead(302, { location: to, 'cache-control': 'no-store' }); res.end(); };

async function readJson(req) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > 16_000) throw new Error('too big'); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function sendMail(to, { subject, text }) {
  try { await mailer.sendMail({ from: FROM, to, subject, text }); }
  catch (e) { console.error('mail failed:', e.message); }
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

  const { rows: [recent] } = await db.query(
    `SELECT count(*) FILTER (WHERE c.ip = $1) AS by_ip, count(*) FILTER (WHERE m.device_id = $2) AS by_device
       FROM comments c LEFT JOIN commenters m ON m.id = c.commenter_id
      WHERE c.created_at > now() - interval '10 minutes'`, [ip, c.deviceId]);
  if (Number(recent.by_ip) >= LIMITS.perIpPer10Min || Number(recent.by_device) >= LIMITS.perDevicePer10Min)
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

  if (confirmToken) await sendMail(c.email, mail.confirm(SITE, c.name, c.post, `${SITE}/api/confirm?token=${confirmToken}`));
  if (parent && parent.email && parent.email_confirmed && parent.notify && parent.email !== c.email) {
    const excerpt = c.body.length > 280 ? `${c.body.slice(0, 277)}...` : c.body;
    await sendMail(parent.email, mail.reply(SITE, parent.name, c.name, excerpt, c.post, `${SITE}/api/unsubscribe?token=${parent.unsubscribe_token}`));
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
      res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' });
      return res.end(img);
    }
    if (url.pathname === '/api/comments' && req.method === 'GET') {
      const post = url.searchParams.get('post') || '';
      if (!/^[a-z0-9-]{1,100}$/.test(post)) return send(res, 400, { error: 'Unknown post.' });
      return send(res, 200, await listComments(post));
    }
    if (url.pathname === '/api/comments' && req.method === 'POST') return await createComment(req, res);
    if (url.pathname === '/api/confirm') {
      const hit = await byToken('confirm_token', url.searchParams.get('token') || '');
      if (!hit) return redirect(res, `${SITE}/writing`);
      await db.query('UPDATE comments SET email_confirmed = true WHERE email = $1', [hit.email]);
      return redirect(res, `${SITE}/writing/${hit.post}?confirmed=1#comments`);
    }
    if (url.pathname === '/api/unsubscribe') {
      const hit = await byToken('unsubscribe_token', url.searchParams.get('token') || '');
      if (!hit) return redirect(res, `${SITE}/writing`);
      await db.query('UPDATE comments SET notify = false WHERE email = $1', [hit.email]);
      return redirect(res, `${SITE}/writing/${hit.post}?unsubscribed=1#comments`);
    }
    if (url.pathname === '/api/videos/sync' && req.method === 'POST') {
      if (!ADMIN_TOKEN || req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return send(res, 403, { error: 'Forbidden.' });
      return send(res, 200, await syncVideos(db, CHANNEL));
    }
    const del = url.pathname.match(/^\/api\/comments\/(\d+)$/);
    if (del && req.method === 'DELETE') {
      if (!ADMIN_TOKEN || req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return send(res, 403, { error: 'Forbidden.' });
      await db.query('UPDATE comments SET deleted = true WHERE id = $1', [del[1]]);
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'Not found.' });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Something went wrong. Try again in a moment.' });
  }
});

await migrate();
if (process.env.VIDEO_SYNC !== 'off') scheduleVideoSync(db, CHANNEL);
server.listen(Number(process.env.PORT || 3000), () => console.log('comments api listening'));
