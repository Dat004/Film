// Service Worker: Media Segment Cache & Smart Prefetch Engine
const CACHE_NAME = 'media-segments-v1';
const MAX_CACHE_ITEMS = 100;

// Install event: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: claim clients and clean up old caches if needed
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('media-segments-')) {
            return caches.delete(name);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// LRU Cache Purge helper
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Fetch event: Intercept .m3u8 and .ts media segment requests (Cache-First strategy)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Only intercept video segment chunks (.ts, .m4s, or media segment queries)
  const isMediaSegment = url.includes('.ts') || url.includes('.m4s') || (url.includes('.m3u8') && !url.includes('api.phim'));

  if (!isMediaSegment || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.status === 200) {
          // Clone response and store in CacheStorage
          cache.put(event.request, networkResponse.clone());
          trimCache(CACHE_NAME, MAX_CACHE_ITEMS);
        }
        return networkResponse;
      } catch (err) {
        return cachedResponse || Response.error();
      }
    })
  );
});

// Message event: Receive prefetch requests from Client runtime
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SW_PREFETCH_SEGMENTS' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        for (const url of data.urls) {
          try {
            const existing = await cache.match(url);
            if (!existing) {
              const res = await fetch(url, { mode: 'cors' });
              if (res.status === 200) {
                await cache.put(url, res);
                console.log('[SW Media] Cached prefetched segment:', url);
              }
            }
          } catch (err) {
            console.warn('[SW Media] Prefetch segment failed for:', url, err);
          }
        }
        trimCache(CACHE_NAME, MAX_CACHE_ITEMS);
      })
    );
  } else if (data.type === 'SW_CLEAR_CACHE') {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});
