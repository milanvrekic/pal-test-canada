#!/usr/bin/env node
// Tells Bing and the other IndexNow search engines (Yandex, Naver, Seznam, Yep) which pages exist, right after a deploy,
// so they re-crawl without waiting. Run by .github/workflows/indexnow.yml once the new deploy is live.
// The key is public by design: search engines check it at https://paltest.ca/<key>.txt (app/public/<key>.txt).
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = 'https://paltest.ca';
const HOST = 'paltest.ca';
const publicDir = fileURLToPath(new URL('../app/public/', import.meta.url));
const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file missing from app/public');
const key = keyFile.replace('.txt', '');

// Wait until the live site serves the key (first deploy) and a sitemap, up to about 10 minutes.
async function live(url, check) {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
      if (r.ok) {
        const text = await r.text();
        if (check(text)) return text;
      }
    } catch {}
    await new Promise((ok) => setTimeout(ok, 15000));
  }
  throw new Error(`${url} not live`);
}

await live(`${SITE}/${keyFile}`, (t) => t.trim() === key);
const sitemap = await live(`${SITE}/sitemap.xml`, (t) => t.includes('<urlset'));
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [...new Set([...pages, `${SITE}/llms.txt`, `${SITE}/llms-full.txt`])];

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls }),
});
// 200 = received, 202 = received and the key is being checked. Anything else is worth a look.
console.log(`IndexNow: ${urls.length} URLs, HTTP ${res.status}`);
if (![200, 202].includes(res.status)) {
  console.log(await res.text());
  process.exit(1);
}
