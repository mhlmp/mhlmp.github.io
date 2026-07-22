// הוקפץ לגרסה 5.0 - ניקוי לוגיקת Cache בעייתית וחסימת בעיות התחברות ב-PWA
const CACHE_NAME = 'LinkManager-v5.0-StableSync';

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
  
  // הגנה קריטית: אנו שומרים רק בקשות שמגיעות לאותו הדומיין של האתר שלך.
  // זה מונע "השתלטות" על בקשות התחברות לגוגל ולפיירבייס שמפילות את הלוגין באפליקציה.
  if (url.origin !== self.location.origin) {
      return; 
  }

  // עבור ניווט לעמוד הראשי (למשל פתיחת האפליקציה מהמסך בית גם אם התווסף פרמטר קוד)
  if (event.request.mode === 'navigate' || url.pathname === '/') {
      event.respondWith(
          fetch(event.request).catch(() => {
              // במצב אופליין נטען מהקאש, תוך התעלמות מפרמטרים דינמיים של פיירבייס
              return caches.match('/', { ignoreSearch: true });
          })
      );
      return;
  }

  // שאר הקבצים המקומיים: נסה להביא מהרשת קודם (כדי לקבל עדכונים), ואם נופל הבא מהקאש
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
