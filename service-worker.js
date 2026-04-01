const CACHE_NAME = 'echodome-v32';
const MUSIC_CACHE = 'echodome-music-v2';

function resolveAbsoluteUrl(urlOrPath) {
  try {
    return new URL(urlOrPath, self.location.origin).href;
  } catch {
    return urlOrPath;
  }
}

// Arquivos estáticos essenciais para o app funcionar offline
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/gallery.js',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

// ---- INSTALL: cacheia arquivos estáticos ----
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(STATIC_FILES.map(f => cache.add(f)))
    )
  );
  self.skipWaiting();
});

// ---- ACTIVATE: limpa caches antigos ----
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== MUSIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---- FETCH: HTML sempre tenta rede primeiro (evita app “preso” em cache antigo) ----
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const isNavigate =
    e.request.mode === 'navigate' || e.request.destination === 'document';

  if (isNavigate) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(e.request).then(
            (r) =>
              r ||
              caches.match('./index.html') ||
              caches.match('/index.html') ||
              caches.match('index.html')
          )
        )
    );
    return;
  }

  const isAudio = e.request.url.match(/\.(mp3|ogg|wav|m4a|aac|flac)(\?.*)?$/i);

  e.respondWith(
    caches.open(isAudio ? MUSIC_CACHE : CACHE_NAME)
      .then((cache) => cache.match(e.request))
      .then((cached) => {
        if (cached) return cached;

        return fetch(e.request)
          .then((response) => {
            if (!response || response.status !== 200) return response;
            if (!isAudio) {
              caches.open(CACHE_NAME).then((c) => c.put(e.request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            const req = e.request;
            const dest = req.destination;
            if (isAudio || dest === 'audio') {
              return new Response(null, {
                status: 503,
                statusText: 'Audio unavailable offline'
              });
            }
            return new Response('', { status: 503, statusText: 'Offline' });
          });
      })
  );
});

// ---- MESSAGE: recebe comandos do app ----
self.addEventListener('message', async e => {
  const { type, url, songId } = e.data;

  // Baixar uma música
  if (type === 'DOWNLOAD_SONG') {
    try {
      const abs = resolveAbsoluteUrl(url);
      const response = await fetch(abs);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const cache = await caches.open(MUSIC_CACHE);
      await cache.put(abs, response.clone());

      notifyClients({ type: 'DOWNLOAD_DONE', songId });
    } catch (err) {
      console.error('[SW] Erro ao baixar música:', err);
      notifyClients({ type: 'DOWNLOAD_ERROR', songId });
    }
  }

  // Remover uma música do cache
  if (type === 'DELETE_SONG') {
    try {
      const abs = resolveAbsoluteUrl(url);
      const cache = await caches.open(MUSIC_CACHE);
      await cache.delete(abs);
      notifyClients({ type: 'DELETE_DONE', songId });
    } catch (err) {
      console.error('[SW] Erro ao remover música:', err);
    }
  }
});

// Envia mensagem para todas as abas abertas do app
function notifyClients(message) {
  self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
    clients.forEach(c => c.postMessage(message))
  );
}