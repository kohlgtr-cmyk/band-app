// EchoDome Band - Production Service Worker v50
// Features: Audio caching, offline playback, quota handling, range requests

const CACHE_VERSION = 'v50.1.08';
const STATIC_CACHE = `echodome-static-${CACHE_VERSION}`;
const MUSIC_CACHE = `echodome-music-${CACHE_VERSION}`;
const IMAGES_CACHE = `echodome-images-${CACHE_VERSION}`;

// App shell files
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/gallery.js',
  './js/modules/visualizer.js',
  './js/modules/share.js',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

// Utils
function resolveAbsoluteUrl(urlOrPath) {
  try {
    return new URL(urlOrPath, self.location.origin).href;
  } catch {
    return urlOrPath;
  }
}

function isAudioFile(url) {
  return /\.(mp3|ogg|wav|m4a|aac|flac)(\?.*)?$/i.test(url) || 
         url.includes('/music/') ||
         url.includes('assets/music');
}

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => Promise.allSettled(APP_SHELL.map(f => 
        fetch(f, { cache: 'no-cache' })
          .then(r => r.ok ? cache.put(f, r) : Promise.resolve())
          .catch(() => Promise.resolve())
      )))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('echodome-') && !k.includes(CACHE_VERSION))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch with range request support for audio
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isNavigate = e.request.mode === 'navigate' || e.request.destination === 'document';
  const isAudio = isAudioFile(url.pathname) || e.request.destination === 'audio';
  const isImage = e.request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);

  // Navigation: Network First
  if (isNavigate) {
    e.respondWith(networkFirst(e.request, STATIC_CACHE));
    return;
  }

  // Audio: Cache First with Range Request support
  if (isAudio) {
    e.respondWith(audioCacheStrategy(e.request));
    return;
  }

  // Images: Cache First
  if (isImage) {
    e.respondWith(cacheFirst(e.request, IMAGES_CACHE));
    return;
  }

  // Others: Cache First
  e.respondWith(cacheFirst(e.request, STATIC_CACHE));
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      try {
        await cache.put(request, response.clone());
      } catch (quotaError) {
        console.warn('[SW] Quota exceeded, skipping cache:', request.url);
      }
    }
    return response;
  } catch (error) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        await cache.put(request, networkResponse.clone());
      } catch (e) {}
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const fallback = await cache.match('./index.html');
    if (fallback) return fallback;

    throw error;
  }
}

// Audio strategy with range request support
async function audioCacheStrategy(request) {
  const cache = await caches.open(MUSIC_CACHE);
  const absoluteUrl = resolveAbsoluteUrl(request.url);

  // Check for range request
  const rangeHeader = request.headers.get('range');

  // Try cache first (both relative and absolute URLs)
  let cached = await cache.match(request);
  if (!cached) {
    cached = await cache.match(absoluteUrl);
  }

  if (cached) {
    // Handle range request from cache
    if (rangeHeader) {
      return createRangeResponse(cached, rangeHeader);
    }

    // Return full cached response
    // Update in background if online
    if (navigator.onLine) {
      fetch(request).then(async (response) => {
        if (response.ok) {
          try {
            await cache.put(absoluteUrl, response.clone());
          } catch (e) {}
        }
      }).catch(() => {});
    }

    return cached;
  }

  // Not in cache - fetch from network
  try {
    const response = await fetch(request);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Cache the full response
    try {
      await cache.put(absoluteUrl, response.clone());
    } catch (quotaError) {
      console.warn('[SW] Quota exceeded, streaming without cache');
    }

    return response;
  } catch (error) {
    console.error('[SW] Audio fetch failed:', error);
    return new Response(null, {
      status: 503,
      statusText: 'Audio unavailable offline'
    });
  }
}

// Create 206 Partial Content response from full response
async function createRangeResponse(response, rangeHeader) {
  const bytes = /^bytes=(\d+)-(\d*)/.exec(rangeHeader);
  if (!bytes) return response;

  const start = parseInt(bytes[1], 10);
  const end = bytes[2] ? parseInt(bytes[2], 10) : undefined;

  const blob = await response.blob();
  const sliced = blob.slice(start, end);
  const slicedSize = sliced.size;
  const totalSize = blob.size;

  const actualEnd = end || (start + slicedSize - 1);

  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: [
      ['Content-Type', response.headers.get('Content-Type') || 'audio/mpeg'],
      ['Content-Range', `bytes ${start}-${actualEnd}/${totalSize}`],
      ['Content-Length', slicedSize],
      ['Accept-Ranges', 'bytes']
    ]
  });
}

// Message handling
self.addEventListener('message', async (e) => {
  const { type, url, songId } = e.data;
  if (!type || !url || !songId) return;

  const absUrl = resolveAbsoluteUrl(url);
  const cache = await caches.open(MUSIC_CACHE);

  if (type === 'DOWNLOAD_SONG') {
    try {
      const existing = await cache.match(absUrl);
      if (existing) {
        notifyClients({ type: 'DOWNLOAD_DONE', songId });
        return;
      }

      const response = await fetch(absUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      try {
        await cache.put(absUrl, response.clone());
        notifyClients({ type: 'DOWNLOAD_DONE', songId });
      } catch (quotaError) {
        notifyClients({ type: 'DOWNLOAD_ERROR', songId, error: 'quota' });
      }
    } catch (err) {
      notifyClients({ type: 'DOWNLOAD_ERROR', songId });
    }
  }

  if (type === 'DELETE_SONG') {
    try {
      await cache.delete(absUrl);
      notifyClients({ type: 'DELETE_DONE', songId });
    } catch (err) {
      notifyClients({ type: 'DELETE_ERROR', songId });
    }
  }

  if (type === 'CHECK_CACHE') {
    const found = await cache.match(absUrl);
    notifyClients({ type: 'CHECK_RESULT', songId, cached: !!found });
  }
});

function notifyClients(message) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      clients.forEach(c => {
        try {
          c.postMessage(message);
        } catch (e) {}
      });
    });
}

console.log('[SW] EchoDome Service Worker v50 ready');
