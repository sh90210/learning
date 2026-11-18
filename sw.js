// Offline support: the app shell is cached on install; audio and fonts are
// cached the first time they play. Bump VERSION when files change.
const VERSION = 'v2.1.0';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/main.js', 'js/ui.js', 'js/audio.js', 'js/lines.js', 'js/art.js', 'js/hangul.js', 'js/curriculum.js',
  'js/engine.js', 'js/store.js', 'js/lesson.js', 'js/trace.js', 'js/read.js', 'js/grownups.js', 'js/report.js', 'js/faces.js',
  'icons/icon-192.png', 'icons/icon-512.png',
  'audio/playful/manifest.json', 'audio/female/manifest.json', 'audio/male/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheFirst = (url.pathname.includes('/audio/') && !url.pathname.endsWith('manifest.json')) || url.pathname.includes('/assets/') || url.host.includes('fonts.g');
  if (cacheFirst) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }
  // app files: network first so updates arrive, cache when offline
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && url.origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
});
