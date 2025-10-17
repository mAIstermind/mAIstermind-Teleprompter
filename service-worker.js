const GH_PAGES_PREFIX = '/mAIstermind-Teleprompter';
const CACHE_NAME = 'maistermind-teleprompter-pwa-v1';
const urlsToCache = [
  `${GH_PAGES_PREFIX}/`,
  `${GH_PAGES_PREFIX}/index.html`,
  `${GH_PAGES_PREFIX}/manifest.json`,
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and API calls.
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Fetch from the network.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we get a valid response, update the cache.
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // The network failed, but we might have a cached response.
          // This path is taken when the initial cache.match() fails, but fetch also fails.
          // If response is not null here, it means we did find it in cache initially.
          // If it is null, then both cache and network failed.
        });

        // Return the cached response if it exists, otherwise wait for the network.
        return response || fetchPromise;
      });
    })
  );
});


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
    })
  );
});