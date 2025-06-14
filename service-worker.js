const CACHE_NAME = 'zunaid-laundry-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/main.js',
  '/config.js',
  '/state.js',
  '/dom.js',
  '/ui.js',
  '/events.js',
  '/translations.js',
  '/manifest.json',
  '/icon_basket.png',
  '/icon_plus.png',
  '/icon_minus.png',
  '/icon_truck.png',
  '/icon_location.png',
  '/icon_whatsapp.png',
  '/icon_my_orders.png',
  '/icon_support.png',
  '/icon_header_laundry.png',
  '/icon_resend.png',
  '/icon_view_summary.png',
  '/icon_install.png',
  '/pwa_icon_192.png',
  '/pwa_icon_512.png'
];

// Install event: Open a cache and add all the app shell files to it
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If the resource is in the cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If the resource is not in the cache, fetch it from the network.
      return fetch(event.request).then(networkResponse => {
        // If the fetch is successful, clone the response and cache it.
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        // If the fetch fails (e.g., user is offline), it will result in a network error.
        // For assets not in the cache, this is expected.
        console.error('Service Worker Fetch failed:', error);
        throw error;
      });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});