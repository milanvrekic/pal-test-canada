#!/usr/bin/env node
// Runs after `expo export` (see build:web in app/package.json).
// - 404.html: Netlify serves it for any address with no page. Expo writes the not-found screen as +not-found.html;
//   the copy gets a title and noindex tag.
// - Drops Expo's route list (_sitemap.html) in case the plugin option ever stops applying.
// - Writes sitemap.xml.
import { readdirSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const notFound = join(dist, '+not-found.html');
if (!existsSync(notFound)) throw new Error('+not-found.html missing from the export');
// Expo doesn't apply generateMetadata to the not-found route, so its title and noindex tag are added here.
const head =
  '<title>Page not found | PAL Test Canada</title><meta name="robots" content="noindex, follow"/>';
writeFileSync(join(dist, '404.html'), readFileSync(notFound, 'utf8').replace('</head>', `${head}</head>`));
rmSync(join(dist, '_sitemap.html'), { force: true });
// Route groups like (tabs) are also exported under their folder name; the same pages already exist at their real URLs.
for (const f of readdirSync(dist)) if (f.startsWith('(')) rmSync(join(dist, f), { recursive: true, force: true });
console.log('404.html written; _sitemap.html removed');

// Offline support: write the list of pages and built files into sw.js, so the service worker can save the whole site
// on the first visit. Without it only the pages already opened worked offline; every other page was blank.
{
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  const rel = (f) => '/' + f.slice(dist.length + 1).split('\\').join('/');
  const files = walk(dist).map(rel);
  // Pages by their public address (/quiz, /guides/exam-day). Templates ([slug].html) and Expo's own pages are skipped.
  const pages = files
    .filter((f) => f.endsWith('.html') && !/\/(\[|_|\+)/.test(f) && f !== '/404.html')
    .map((f) => f.replace(/\/index\.html$/, '/').replace(/\.html$/, ''))
    .map((f) => (f.length > 1 ? f.replace(/\/$/, '') : f))
    .sort();
  const assets = files.filter((f) => /^\/(_expo|assets|fonts)\//.test(f)).map((f) => f.replace(/ /g, '%20')).sort();
  const swFile = join(dist, 'sw.js');
  const sw = readFileSync(swFile, 'utf8');
  const marker = /\/\*PRECACHE\*\/ \{[^\n]*\};/;
  if (!marker.test(sw)) throw new Error('sw.js: PRECACHE marker missing');
  writeFileSync(swFile, sw.replace(marker, () => `${JSON.stringify({ pages, assets })};`));
  console.log(`sw.js: ${pages.length} pages and ${assets.length} files saved for offline use`);
}
await import('./sitemap.mjs');
await import('./agent-files.mjs');
