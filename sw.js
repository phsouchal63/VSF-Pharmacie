/* Service worker — Sacs pharmacie VSF. Coque d'application en cache ; l'API Apps Script n'est jamais mise en cache. */
const CACHE = 'sacs-vsf-v4';
const COQUE = ['./', 'index.html', 'manifest.webmanifest', 'assets/vsf-logo.png', 'assets/vsf-logo-white.svg', 'assets/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(COQUE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const memeOrigine = url.origin === self.location.origin;
  const polices = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!memeOrigine && !polices) return;   // API Apps Script et autres : réseau direct

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const enCache = await cache.match(req, { ignoreSearch: true });
    const reseau = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (enCache) { e.waitUntil(reseau); return enCache; }          // cache d'abord, mise à jour en arrière-plan
    const r = await reseau;
    if (r) return r;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  })());
});
