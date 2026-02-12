const CACHE_NAME = 'LinkMeir-CloudOnly-v3';
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
          console.log('Opened cache');
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
  // התעלם מבקשות ל-Firebase (כדי שיהיו תמיד מעודכנות מהרשת)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('google.com') ||
      event.request.url.includes('firebase')) {
      return;
  }

  // עבור קובץ ה-HTML הראשי - נסה רשת קודם, ואז מטמון
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // עבור קבצים סטטיים - נסה מטמון קודם
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
