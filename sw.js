// 1. הוספתי תמיכה ב-AI
const CACHE_NAME = 'LinkManager-v2-AI-' + new Date().getTime(); 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

// שנה את השורה הראשונה ל:
const CACHE_NAME = 'LinkManager-v2-AI-' + new Date().getTime(); 

// ... שאר הקוד נשאר אותו דבר עד לפונקציית ה-fetch ...

self.addEventListener('fetch', event => {
  // התעלם מבקשות פיירבייס, שירותי גוגל, ורשתות ה-API של הבינה המלאכותית
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || 
      url.includes('generativelanguage.googleapis.com') || // Gemini API
      url.includes('api.groq.com') ||                      // Groq API
      url.includes('openrouter.ai') ||                     // OpenRouter/DeepSeek API
      url.includes('api.allorigins.win') ||                // Proxy for Web Scraping
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
