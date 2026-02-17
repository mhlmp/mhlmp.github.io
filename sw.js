// 1. שנה את מספר הגרסה בכל פעם שאתה מעלה עדכון ל-GitHub
const CACHE_NAME = 'LinkManager-v' + new Date().getTime(); 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg'
];

// התקנה - דוחף את הגרסה החדשה מיד
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// הפעלה - מנקה קאש ישן מיד
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

// אסטרטגיית טעינה: Network First (קודם רשת, אם נכשל - זיכרון)
self.addEventListener('fetch', event => {
  // התעלם מבקשות Firebase וגוגל - הן מנהלות אופליין לבד
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebase')) {
      return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // אם הצלחנו להביא מהרשת, נשמור עותק עדכני בזיכרון
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // אם אין אינטרנט, נטען מהזיכרון המקומי
        return caches.match(event.request);
      })
  );
});

