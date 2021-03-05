let cacheName = 'lernkarten_v1.0.0';
const STORES = [];
self.addEventListener('install', function(e) {
});
function clearOutdatedCache() {
  caches.keys().then(function(storedCaches) {
    return Promise.all(
      storedCaches.filter(function(storedCache) {
       return !storedCache.includes(cacheName)
      }).map(function(cacheName) {
        caches.delete(cacheName);
      })
    );
  })
}
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
