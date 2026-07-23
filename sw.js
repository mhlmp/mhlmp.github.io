// גרסה 7.0 (Self-Healing & Auth-Safe)
const CACHE_NAME = 'LinkManager-v7.0-MaxOptimized';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // מנגנון ניקוי מטמון עצמי - מוחק כל זכר לגרסאות הבעייתיות הקודמות
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // חסימת יירוט לבקשות לא רלוונטיות (רק GET מטופל)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // חוק ברזל מס' 1: ה-Service worker לא נוגע בחיבורי Firebase או בקשות API לשרתים זרים!
  if (url.origin !== self.location.origin || url.pathname.startsWith('/__/')) {
      return; 
  }

  // חוק ברזל מס' 2: בקשות HTML עובדות בשיטת Network First (להבטחת קוד מעודכן תמיד)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
      event.respondWith(
          fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => {
                return cached || caches.match('/');
            }))
      );
      return;
  }

  // חוק ברזל מס' 3: קבצים סטטיים בשיטת Stale-While-Revalidate (מהירות בזק)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {}); // מתעלם משגיאות רשת ברקע
      
      return cachedResponse || fetchPromise;
    })
  );
});
