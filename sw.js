const CACHE='random-pwa-v15';
const ASSETS=[
  '/random/',
  '/random/index.html',
  '/random/random-manifest-v2.webmanifest',
  '/random/icon-192.png',
  '/random/icon-512.png',
  '/random/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url=new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy=response.clone();
          caches.open(CACHE).then(cache => cache.put('/random/index.html',copy));
          return response;
        })
        .catch(() => caches.match('/random/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy=response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request,copy));
      return response;
    }))
  );
});
