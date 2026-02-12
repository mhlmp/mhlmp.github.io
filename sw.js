const CACHE_NAME = 'LinkManager-Cloud-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg'
];

// התקנה: שמירת קבצי המערכת בלבד (ללא דאטה)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// אקטיבציה: ניקוי גרסאות ישנות
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

// שליפת נתונים
self.addEventListener('fetch', event => {
  // 1. התעלמות מוחלטת מבקשות Firebase/Google (כדי למנוע שמירת מידע אישי ב-Cache)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebase')) {
      return; // תן לרשת לטפל בזה ישירות
  }

  // 2. עבור קובץ ה-HTML - תמיד נסה רשת קודם (כדי לקבל עדכוני קוד)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 3. קבצים סטטיים אחרים - נסה מה-Cache קודם
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
