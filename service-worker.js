// A new version number to force the service worker to update and invalidate old caches.
const CACHE_NAME = 'maistermind-teleprompter-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// On install, cache the core assets and immediately activate the new service worker.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching new assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// On activation, clean up any old caches and take control of all pages.
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
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// On fetch, intercept requests and apply a network-first strategy.
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // First, try to fetch the request from the network.
    fetch(event.request)
      .then(networkResponse => {
        // If the network request is successful, cache the response and return it.
        // We need to clone the response because it's a stream that can only be consumed once.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return networkResponse;
      })
      .catch(() => {
        // If the network request fails (e.g., offline), try to get the response from the cache.
        return caches.match(event.request);
      })
  );
});
