// גרסה 6.0 - תיקון קריטי לנתיבי Auth
const CACHE_NAME = 'LinkManager-v6.0-AuthFix';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(error => console.error('[Service Worker] Cache addAll failed:', error))
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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // התיקון הקריטי: נותן לפיירבייס לנהל את נתיבי ההתחברות שלו בצורה טבעית!
  // כל בקשה שמתחילה ב- /__/ שייכת פנימית ל-Firebase Auth / Hosting.
  if (url.pathname.startsWith('/__/') || url.origin !== self.location.origin) {
      return; 
  }

  if (event.request.mode === 'navigate' || url.pathname === '/') {
      event.respondWith(
          fetch(event.request).catch(() => {
              return caches.match('/', { ignoreSearch: true });
          })
      );
      return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
