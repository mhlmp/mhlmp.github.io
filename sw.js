// 1. הגרסה הוקפצה ל-4.2 לאיפוס קאש והחלת התיקונים הקריטיים
const CACHE_NAME = 'LinkManager-v4.2-SyncEngine';

// שימוש בנתיבי שורש (Root) בלבד כדי לנעול את ה-Scope
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// התקנה - דוחף את הגרסה החדשה מיד
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('[Service Worker] Cache addAll failed:', error))
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
  // הגנה קריטית: אי אפשר לקאשש בקשות POST/PUT. מתעלמים מכל מה שאינו בקשת קריאה (GET)
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  
  // החרגת כל קריאות ה-API כדי שה-SW לא יתערב או ינסה לקאשש אותן
  if (url.includes('firestore.googleapis.com') || 
      url.includes('generativelanguage.googleapis.com') || 
      url.includes('api.groq.com') ||                      
      url.includes('openrouter.ai') ||                     
      url.includes('api.allorigins.win') || 
      url.includes('corsproxy.io') ||
      url.includes('api.codetabs.com') ||
      url.includes('firebase') ||
      url.startsWith('chrome-extension')) {
      return; // נותן לבקשה לצאת לרשת כרגיל ללא מעורבות SW
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // נוודא שהתגובה תקינה ורק אז נשמור ב-Cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// טיפול בלחיצה על התראות מערכת
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
