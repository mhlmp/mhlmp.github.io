const CACHE_NAME = 'LinkMeir-Pro-v3';
const urlsToCache = [
  './',
  './index.html',
  './icon.jpg',
  './manifest.json'
];

// התקנה: שמירת קבצי הליבה בלבד (ללא מידע משתמש)
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
  const url = event.request.url;

  // 1. התעלמות מוחלטת מבקשות Firebase/Google (כדי למנוע שמירת מידע אישי ב-Cache)
  if (url.includes('firestore.googleapis.com') || 
      url.includes('googleapis.com') ||
      url.includes('firebase')) {
      return; // תן לרשת לטפל בזה ישירות
  }

  // 2. עבור קובץ ה-HTML - תמיד נסה רשת קודם (Network First)
  // זה מבטיח שתמיד תקבל את הגרסה הכי מעודכנת של האפליקציה
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 3. קבצים סטטיים (תמונות, סקריפטים) - Cache First
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
