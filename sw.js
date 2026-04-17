// 1. שנה את מספר הגרסה בכל פעם שאתה מעלה עדכון ל-GitHub
const CACHE_NAME = 'LinkManager-v2-AI-' + new Date().getTime();

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
  if (url.includes('firestore.googleapis.com') || 
      url.includes('generativelanguage.googleapis.com') || 
      url.includes('api.groq.com') ||                      
      url.includes('openrouter.ai') ||                     
      url.includes('api.allorigins.win') ||                
      url.includes('firebase')) {
      return;
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
