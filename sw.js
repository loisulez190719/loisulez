const CACHE_NAME = 'spotify-desktop-v2';
const ASSETS = [
  '/loisulez/',
  '/loisulez/index.html',
  '/loisulez/manifest.json',
  '/loisulez/icon-192.png',
  '/loisulez/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});

// Periodic keepalive ping — mantiene el SW vivo
self.addEventListener('periodicsync', event => {
  if (event.tag === 'keepalive') {
    event.waitUntil(Promise.resolve());
  }
});

// Background sync fallback
self.addEventListener('sync', event => {
  if (event.tag === 'keepalive') {
    event.waitUntil(Promise.resolve());
  }
});

// Mensaje desde la página para keepalive
self.addEventListener('message', event => {
  if (event.data === 'ping') {
    event.source && event.source.postMessage('pong');
  }
});
