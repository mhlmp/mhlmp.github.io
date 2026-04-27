// 1. שנה את מספר הגרסה באופן ידני בכל פעם שאתה מעלה עדכון משמעותי ל-GitHub כדי לאלץ רענון קאש לכל המשתמשים.
const CACHE_NAME = 'LinkManager-v4.0-SyncEngine';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
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
            console.log('[Service Worker] Deleting old cache:', cacheName);
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
  const url = event.request.url;
  
  // החרגת כל קריאות ה-API כדי שה-SW לא יתערב או ינסה לקאשש אותן
  if (url.includes('firestore.googleapis.com') || 
      url.includes('generativelanguage.googleapis.com') || 
      url.includes('api.groq.com') ||                      
      url.includes('openrouter.ai') ||                     
      url.includes('api.allorigins.win') || 
      url.includes('corsproxy.io') ||
      url.includes('api.codetabs.com') ||
      url.includes('firebase')) {
      return; // נותן לבקשה לצאת לרשת כרגיל ללא מעורבות SW
  }

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

// טיפול בלחיצה על התראות מערכת (Push Notifications)
self.addEventListener('notificationclick', event => {
  event.notification.close(); // סוגר את ההתראה
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // אם האפליקציה כבר פתוחה באחד הטאבים, נביא אותה לפרונט
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      // אם היא סגורה לגמרי, נפתח אותה מחדש
      return clients.openWindow('/');
    })
  );
});
