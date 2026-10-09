// Keeps a copy of every video on the YouTube channel: id, title, upload date and the
// thumbnail image. Never the video itself; that stays on YouTube. No API key: it reads the
// channel's public video list the same way the YouTube website does.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const HEADERS = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' };
const SIX_HOURS = 6 * 60 * 60 * 1000;

/** Collect { id, title } from any YouTube page JSON, plus the next-page token. Exported for tests. */
export function collect(node, out = { items: [], next: null }) {
  if (!node || typeof node !== 'object') return out;
  const vr = node.videoRenderer;
  if (vr?.videoId) out.items.push({ id: vr.videoId, title: vr.title?.runs?.map((r) => r.text).join('') || vr.title?.simpleText || '' });
  const lv = node.lockupViewModel;
  if (lv?.contentId && lv.contentType !== 'LOCKUP_CONTENT_TYPE_PLAYLIST') out.items.push({ id: lv.contentId, title: lv.metadata?.lockupMetadataViewModel?.title?.content || '' });
  if (node.continuationCommand?.token) out.next = node.continuationCommand.token;
  for (const k of Object.keys(node)) collect(node[k], out);
  return out;
}

async function channelVideos(handle) {
  const html = await (await fetch(`https://www.youtube.com/${handle}/videos`, { headers: HEADERS })).text();
  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const version = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
  const initial = html.match(/var ytInitialData = (\{.*?\});<\/script>/s)?.[1];
  if (!key || !version || !initial) throw new Error('YouTube page format changed');
  const out = collect(JSON.parse(initial));
  for (let page = 0; out.next && page < 100; page++) {
    const token = out.next; out.next = null;
    const res = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${key}`, {
      method: 'POST', headers: { ...HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: version, hl: 'en' } }, continuation: token }),
    });
    collect(await res.json(), out);
  }
  const seen = new Set();
  return out.items.filter((v) => v.id && !seen.has(v.id) && seen.add(v.id));
}

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

/** "Aug 19, 2023" / "Premiered Aug 19, 2023" / "Streamed live on Aug 19, 2023" -> "2023-08-19". Exported for tests. */
export function parseDateText(text) {
  const m = String(text || '').match(/([A-Z][a-z]{2})[a-z]* (\d{1,2}), (\d{4})/);
  if (!m || !MONTHS[m[1]]) return null;
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
}

// The watch page answers servers in data centres with a consent page and the player API asks
// them to sign in, but the "next" API (what loads beside a playing video) still has the date.
async function uploadDate(id) {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/next', {
      method: 'POST', headers: { ...HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ videoId: id, context: { client: { clientName: 'WEB', clientVersion: '2.20250101.00.00', hl: 'en' } } }),
    });
    const text = JSON.stringify(await res.json()).match(/"dateText":\{"simpleText":"([^"]+)"/)?.[1];
    const date = parseDateText(text);
    if (date) return date;
  } catch {}
  const html = await (await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: HEADERS })).text();
  return html.match(/"(?:uploadDate|publishDate)":"(\d{4}-\d{2}-\d{2})/)?.[1] || null;
}

async function thumbnail(id) {
  for (const size of ['maxresdefault', 'sddefault', 'hqdefault']) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  return null;
}

export async function migrateVideos(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id            text PRIMARY KEY,
      title         text NOT NULL,
      published_on  date,
      thumb         bytea,
      first_seen    timestamptz NOT NULL DEFAULT now(),
      last_seen     timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS video_sync (id int PRIMARY KEY, last_run timestamptz);
  `);
}

/** One sync. New videos get their date and thumbnail; titles are refreshed; nothing is ever deleted. */
export async function syncVideos(db, handle) {
  const list = await channelVideos(handle);
  let added = 0;
  for (const v of list) {
    const { rows } = await db.query('SELECT published_on IS NOT NULL AS dated, thumb IS NOT NULL AS has_thumb FROM videos WHERE id = $1', [v.id]);
    if (rows.length && rows[0].dated && rows[0].has_thumb) {
      await db.query('UPDATE videos SET title = $2, last_seen = now() WHERE id = $1', [v.id, v.title]);
      continue;
    }
    const [date, thumb] = await Promise.all([uploadDate(v.id).catch(() => null), thumbnail(v.id).catch(() => null)]);
    await db.query(
      `INSERT INTO videos (id, title, published_on, thumb) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET title = $2, published_on = COALESCE($3, videos.published_on),
         thumb = COALESCE($4, videos.thumb), last_seen = now()`,
      [v.id, v.title, date, thumb]);
    added++;
  }
  await db.query(`INSERT INTO video_sync (id, last_run) VALUES (1, now()) ON CONFLICT (id) DO UPDATE SET last_run = now()`);
  return { seen: list.length, updated: added };
}

/** Run a sync now if the last one is over 6 hours old, then every 6 hours. Only one replica syncs at a time. */
export function scheduleVideoSync(db, handle) {
  const run = async () => {
    const c = await db.connect();
    try {
      const { rows: [lock] } = await c.query('SELECT pg_try_advisory_lock(424243) AS got');
      if (!lock.got) return;
      try {
        const { rows } = await c.query('SELECT last_run FROM video_sync WHERE id = 1');
        if (rows[0]?.last_run && Date.now() - new Date(rows[0].last_run).getTime() < SIX_HOURS - 60_000) return;
        const r = await syncVideos(db, handle);
        console.log(`video sync: ${r.seen} on the channel, ${r.updated} new or refreshed`);
      } finally { await c.query('SELECT pg_advisory_unlock(424243)'); }
    } catch (e) { console.error('video sync failed:', e.message); }
    finally { c.release(); }
  };
  run();
  setInterval(run, 15 * 60 * 1000); // checks often; syncs only when 6 hours have passed
}

export async function listVideos(db) {
  const { rows } = await db.query('SELECT id, title, published_on FROM videos ORDER BY published_on DESC NULLS LAST, first_seen DESC');
  return rows.map((r) => ({ id: r.id, title: r.title, date: r.published_on }));
}

export async function videoThumb(db, id) {
  const { rows } = await db.query('SELECT thumb FROM videos WHERE id = $1', [id]);
  return rows[0]?.thumb || null;
}
