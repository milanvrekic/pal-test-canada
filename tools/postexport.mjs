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
await import('./sitemap.mjs');
await import('./agent-files.mjs');
