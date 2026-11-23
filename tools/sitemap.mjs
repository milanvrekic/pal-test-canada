#!/usr/bin/env node
// Writes dist/sitemap.xml from the exported HTML pages, after `expo export`. Skips templates ([slug].html),
// Expo's own pages (_sitemap, +not-found) and pages not meant for search (/quiz).
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE_URL = 'https://paltest.ca'; // keep in step with SITE_URL in app/src/lib/content.ts
const dist = process.argv[2] ?? 'dist';
const skip = (p) => /(^|\/)(\[|_|\+)/.test(p) || p === 'quiz.html' || p === '404.html';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith('.html') ? [relative(dist, full)] : [];
  });

const day = new Date().toISOString().slice(0, 10);
const urls = walk(dist)
  .filter((p) => !skip(p))
  .map((p) => '/' + p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, ''))
  .map((p) => (p.length > 1 ? p.replace(/\/$/, '') : p))
  .sort();
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${day}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`,
);
console.log(`sitemap.xml: ${urls.length} pages`);
