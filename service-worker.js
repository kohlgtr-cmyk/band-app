const CACHE_NAME = 'echodome-v14'; // Versão nova para limpar erros antigos

// Arquivos ESSENCIAIS para o App ser considerado instalável
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css', // Faltava no seu original
  './js/app.js',
  './js/data.js',
  './assets/img/icon-192.png', // Faltava no seu original
  './assets/img/icon-512.png'  // Faltava no seu original
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Promise.allSettled evita que o erro em um arquivo trave tudo
      return Promise.allSettled(
        STATIC_FILES.map(file => cache.add(file))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        if (e.request.url.match(/\.(mp3|jpg|jpeg|png|webp|gif|woff2?)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});