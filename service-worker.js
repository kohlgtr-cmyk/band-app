const CACHE_NAME = 'echodome-v4'; // ← mudei para v2 para forçar atualização

const STATIC_FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

// Músicas para pré-cachear (serão baixadas em background na instalação)
const MUSIC_FILES = [
  './assets/music/love-story.mp3',
  './assets/music/between-the-lines.mp3',
  './assets/music/eu-nao-queria-sentir-assim.mp3',
  './assets/music/echos.mp3',
  './assets/music/i-feel-stuck.mp3',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cacheia interface imediatamente
      await cache.addAll(STATIC_FILES);
      // Tenta cachear músicas em background (não bloqueia instalação)
      cache.addAll(MUSIC_FILES).catch(() => {});
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
  // Ignora requisições que não são GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        // Só cacheia respostas válidas
        if (!response || response.status !== 200) return response;

        // Cacheia MP3s, imagens e fontes ao carregar
        if (e.request.url.match(/\.(mp3|jpg|jpeg|png|webp|gif|woff2?)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline e não tem cache: retorna página principal como fallback
        return caches.match('./index.html');
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