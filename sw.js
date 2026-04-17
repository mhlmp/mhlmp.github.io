// 1. הוספתי תמיכה ב-AI
const CACHE_NAME = 'LinkManager-v2-AI-' + new Date().getTime(); 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('allorigins.win')) { // החרגתי את הפרוקסי כדי שכל קריאת AI תהיה בזמן אמת!
      return;
  }
  event.respondWith(
    fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => caches.match(event.request))
  );
});
