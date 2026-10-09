// Saves a local copy of every YouTube thumbnail the site uses into public/media/yt/<id>.jpg,
// so pages never depend on YouTube's image server. Runs before every build (npm "prebuild").
// Already-downloaded thumbnails are kept; a failed download never fails the build.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/media/yt';
mkdirSync(out, { recursive: true });

const ids = new Set(JSON.parse(readFileSync('src/data/videos.json', 'utf8')).map((v) => v.id));
const projects = 'src/content/projects';
for (const f of readdirSync(projects)) {
  const m = readFileSync(join(projects, f), 'utf8').match(/^video:\s*([A-Za-z0-9_-]{11})\s*$/m);
  if (m) ids.add(m[1]);
}

// Best first. YouTube answers 404 for sizes a video doesn't have.
const sizes = ['maxresdefault', 'sddefault', 'hqdefault'];
for (const id of ids) {
  const file = join(out, `${id}.jpg`);
  if (existsSync(file)) continue;
  let saved = false;
  for (const size of sizes) {
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`);
      if (!res.ok) continue;
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      console.log(`thumbnail ${id}: ${size}`);
      saved = true;
      break;
    } catch {}
  }
  if (!saved) console.warn(`thumbnail ${id}: not downloaded (the page falls back to a plain card)`);
}
