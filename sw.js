const CACHE_NAME = 'LinkMeir-v3-Secure';
const urlsToCache = [
  './',
  './index.html',
  './icon.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
          return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // התעלמות מבקשות ל-Firebase (כדי לקבל תמיד מידע עדכני)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('google.com') ||
      event.request.url.includes('googleapis.com')) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
