// Offline support: keeps a copy of the app files on the device.
// Your data is never here — it lives in the app's local database.
const CACHE = 'health-log-v4';
const ASSETS = ['./', 'index.html', 'styles.css', 'data.js', 'app.js', 'analysis.js', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache, so a new version never
  // gets stored with stale copies of the files.
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Online: always get the latest files (falls back to the saved copy after a
// few seconds or when offline). Offline: use the saved copy.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const scope = new URL(self.registration.scope);
  const rel = url.pathname.startsWith(scope.pathname) ? url.pathname.slice(scope.pathname.length) : null;
  const nav = e.request.mode === 'navigate';
  if (!nav && (rel === null || !ASSETS.includes(rel || './'))) return;
  const key = nav ? 'index.html' : rel || './';
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    const net = fetch(new Request(nav ? new URL('index.html', scope).href : url.href, { cache: 'no-cache' }))
      .then(res => { if (res.ok) cache.put(key, res.clone()); return res; });
    if (!cached) return net;
    const timeout = new Promise(r => setTimeout(() => r(cached), 4000));
    return Promise.race([net.catch(() => cached), timeout]);
  })());
});
