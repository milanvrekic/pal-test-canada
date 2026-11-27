// PAL Test Canada offline support.
// - Install: every page and every built file is saved up front (the list is written in by tools/postexport.mjs), so the
//   whole site works offline after one visit, not only the pages already opened.
// - Pages: network first, falling back to the saved copy.
// - Built assets, fonts and images: cache first (their file names change when they change).
const CACHE = 'paltest-v2';
// Filled in at build time: { pages: ['/', '/quiz', ...], assets: ['/_expo/static/js/web/entry-<hash>.js', ...] }.
const PRECACHE = /*PRECACHE*/ { pages: ['/', '/quiz', '/spot', '/flashcards', '/practical', '/rules'], assets: [] };

const isAsset = (pathname) => /^\/(_expo|assets|fonts)\//.test(pathname) || /\.(png|jpg|jpeg|webp|svg|ttf|woff2?)$/.test(pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      // One failed file must not stop the rest (addAll is all-or-nothing).
      const add = (url) => c.add(new Request(url, { cache: 'reload' })).catch(() => {});
      // Asset names carry a content hash, so a saved one never changes: only fetch the new ones.
      const have = new Set((await c.keys()).map((r) => new URL(r.url).pathname));
      await Promise.all([...PRECACHE.assets.filter((u) => !have.has(u)).map(add), ...PRECACHE.pages.map(add), add('/manifest.webmanifest')]);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      // Drop built files from older deploys so the cache doesn't grow with every release.
      if (PRECACHE.assets.length) {
        const keep = new Set(PRECACHE.assets);
        const c = await caches.open(CACHE);
        const stale = (await c.keys()).filter((r) => /^\/_expo\//.test(new URL(r.url).pathname) && !keep.has(new URL(r.url).pathname));
        await Promise.all(stale.map((r) => c.delete(r)));
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Save under the path alone: /quiz?course=cfsc&mode=exam is the same page as /quiz.
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : '/')
            .then((hit) => hit || caches.match('/')),
        ),
    );
    return;
  }

  if (isAsset(url.pathname)) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
