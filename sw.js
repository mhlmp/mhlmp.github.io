// הוקפץ לגרסה 4.3 כדי לאלץ רענון במכשיר שלך
const CACHE_NAME = 'LinkManager-v4.3-SyncEngine';

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
  // 1. מתעלמים מבקשות שהן לא קריאה (GET)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // 2. הגנה קריטית לפיירבייס:
  // אם הבקשה מיועדת לשרת חיצוני (Firebase, Google, Groq וכו'),
  // אנחנו עוצרים את ה-Service Worker ונותנים לדפדפן לטפל בזה טבעי.
  // זה פותר את בעיית המסך הריק!
  if (url.origin !== self.location.origin) {
      return; 
  }

  // 3. אסטרטגיית Network First רק לקבצים המקומיים שלנו
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
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
