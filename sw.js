const CACHE_NAME = 'gitmanhwa-cache-v2';
const urlsToCache = [
  'index.html',
  'series.html',
  'reader.html',
  'css/style.css',
  'js/app.js',
  'data/series.json'
];

// Install: cache file inti
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Fetch: strategi cache-first untuk gambar, network-first untuk file inti
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Hanya tangani request GET ke domain yang sama
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // File inti (HTML, CSS, JS) → network-first (selalu update)
  if (
    event.request.url.includes('.html') ||
    event.request.url.includes('.css') ||
    event.request.url.includes('.js') ||
    event.request.url.includes('series.json')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
          });
        })
    );
    return;
  }

  // Gambar & aset lain → cache-first (cepat)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      
      return fetch(event.request).then(response => {
        // Cache semua gambar yang berhasil dimuat
        if (response.ok && event.request.url.includes('/series/')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
