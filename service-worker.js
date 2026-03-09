const CACHE_NAME = 'echodome-v17';
const MUSIC_CACHE = 'echodome-music-v1';

// Arquivos estáticos essenciais para o app funcionar offline
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/data.js',
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

// ---- FETCH: serve do cache quando disponível ----
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const isAudio = e.request.url.match(/\.(mp3|ogg|wav|m4a|aac|flac)(\?.*)?$/i);

  e.respondWith(
    // Áudio vem do MUSIC_CACHE, estáticos do CACHE_NAME
    caches.open(isAudio ? MUSIC_CACHE : CACHE_NAME)
      .then(cache => cache.match(e.request))
      .then(cached => {
        if (cached) return cached;

        // Não está no cache — busca na rede
        return fetch(e.request)
          .then(response => {
            if (!response || response.status !== 200) return response;
            // Cacheia automaticamente apenas arquivos estáticos
            if (!isAudio) {
              caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            // Offline e não tem cache → retorna a página principal
            return caches.match('./index.html');
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
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const cache = await caches.open(MUSIC_CACHE);
      await cache.put(url, response);

      notifyClients({ type: 'DOWNLOAD_DONE', songId });
    } catch (err) {
      console.error('[SW] Erro ao baixar música:', err);
      notifyClients({ type: 'DOWNLOAD_ERROR', songId });
    }
  }

  // Remover uma música do cache
  if (type === 'DELETE_SONG') {
    try {
      const cache = await caches.open(MUSIC_CACHE);
      await cache.delete(url);
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