const CACHE_NAME = 'pbl-connect-v3.0';

const urlsToCache = [
  './it-login.html',
  './IT_Dashboard.html',
  './manifest.json',
  './pbl-config.js',
  './app-icon.png'
];

// Install Event (Fault-tolerant cache)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('📦 PWA: Pre-caching core shell');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('⚠️ Cache skipped for:', url);
        }
      }
    })
  );
});

// Activate Event (Purge old cache versions)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Purging outdated PWA cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-First Strategy)
self.addEventListener('fetch', event => {
  // Google Apps Script API calls ko cache nahi karna
  if (event.request.url.includes('script.google.com') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Agar response valid hai to cache update karo
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
