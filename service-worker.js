const CACHE_NAME = 'banda-app-v1';

// Arquivos da interface (sempre em cache)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/app.js',
  '/manifest.json'
];

// Instala e cacheia os arquivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Cache primeiro, rede como fallback
// Para músicas (MP3): cacheia ao carregar
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cacheia MP3s e imagens automaticamente
        if (e.request.url.match(/\.(mp3|jpg|jpeg|png|webp|gif)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
}); /*
```

---

## 📋 Como usar

**1. Configure suas músicas** — edite apenas o `js/data.js`:
- Troque o nome da banda
- Adicione seus álbuns com capa e ano
- Adicione suas músicas com o caminho do MP3 e a letra

**2. Coloque os arquivos:**
```
assets/music/  ← seus arquivos .mp3
assets/img/    ← capas dos álbuns, icon-192.png, icon-512.png */