// ---- STATE ----
let currentTrack = null;
let queue = [];
let queueIndex = 0;
let playing = false;
let shuffle = false;
let repeat = false;
let currentAlbumId = null;
let lyricsOpen = false;
let aboutPanelOpen = false;
let galleryLightboxOpen = false;
let progressBarDragging = false;
let sleepTimer = null;
let wakeLock = null;
let visualizerActive = false;
let userInteracted = false;

/** Se a faixa já passou deste ponto, "voltar" reinicia do zero; se já estiver no início, vai à faixa anterior. */
const PREV_AT_START_SEC = 2;

// ---- USER INTERACTION DETECTION ----
function markUserInteraction() {
  if (!userInteracted) {
    userInteracted = true;
    console.log('[App] Interação detectada - AudioContext liberado');
  }
}

document.addEventListener('click', markUserInteraction, { once: true });
document.addEventListener('touchstart', markUserInteraction, { once: true });
document.addEventListener('keydown', markUserInteraction, { once: true });

// ---- LAZY LOADING MODULES ----
const lazyModules = {
  visualizer: () => import('./modules/visualizer.js'),
  share: () => import('./modules/share.js')
};

async function loadModule(name) {
  if (!lazyModules[name]) {
    console.error(`Module ${name} not found`);
    return null;
  }
  try {
    const module = await lazyModules[name]();
    console.log(`[Lazy] Loaded: ${name}`);
    return module;
  } catch (err) {
    console.error(`[Lazy] Failed to load ${name}:`, err);
    return null;
  }
}

function preloadModule(name, delay = 5000) {
  setTimeout(() => {
    if (!document.hidden) {
      loadModule(name).catch(() => {});
    }
  }, delay);
}

// ---- OFFLINE / DOWNLOAD STATE ----
let downloadedSongs = JSON.parse(localStorage.getItem('echodome-downloads') || '[]');

function saveDownloadState() {
  localStorage.setItem('echodome-downloads', JSON.stringify(downloadedSongs));
}

function isSongDownloaded(songId) {
  return downloadedSongs.includes(songId);
}

// ---- PLAY COUNTS ----
const PLAY_COUNTS_KEY = 'echodome-play-counts';

function loadPlayCounts() {
  try {
    const raw = localStorage.getItem(PLAY_COUNTS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return {};
    const out = {};
    for (const k of Object.keys(o)) {
      const v = o[k];
      const n = typeof v === 'number' ? v : parseInt(String(v), 10);
      if (!isNaN(n) && n >= 0) out[String(k)] = n;
    }
    return out;
  } catch {
    return {};
  }
}

let playCounts = loadPlayCounts();

function savePlayCounts() {
  try {
    localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(playCounts));
  } catch (e) {
    console.warn('echodome: não foi possível salvar contagem de plays', e);
  }
}

function getPlayCount(songId) {
  const k = String(songId);
  const n = playCounts[k];
  if (typeof n === 'number' && !isNaN(n) && n >= 0) return n;
  return 0;
}

function recordPlay(songId) {
  const k = String(songId);
  playCounts[k] = getPlayCount(songId) + 1;
  savePlayCounts();

  const history = JSON.parse(localStorage.getItem('echodome-history') || '[]');
  history.push({
    songId,
    timestamp: Date.now(),
    duration: audio.duration || 0,
    completed: false
  });
  if (history.length > 1000) history.shift();
  localStorage.setItem('echodome-history', JSON.stringify(history));
}

function getHomeSongList() {
  return songs
    .slice()
    .sort((a, b) => {
      const diff = getPlayCount(b.id) - getPlayCount(a.id);
      return diff !== 0 ? diff : a.id - b.id;
    })
    .slice(0, 8);
}

const audio = document.getElementById('audio');

// ---- INIT ----
function init() {
  console.log('[Init] Iniciando EchoDome...');
  
  try {
    // Renderizações primeiro (crítico)
    renderHomeAlbums();
    renderHomeSongs();
    renderAllAlbumsGrid();
    renderAllSongs();
    renderGallery();
    
    console.log('[Init] Renderizações completas');
    
    // Eventos (assíncronos, não bloqueantes)
    audioEvents();
    offlineCheck();
    setupProgressBar();
    setupKeyboardShortcuts();
    setupTouchGestures();
    setupWakeLock();
    
    // SW em background (não bloqueia renderização)
    setTimeout(() => {
      registerSW();
    }, 100);
    
    // Preload módulos opcionais (baixa prioridade)
    setTimeout(() => {
      preloadModule('share', 3000);
    }, 2000);
    
    // Escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (galleryLightboxOpen) closeGalleryLightbox();
      else if (aboutPanelOpen) closeAboutPanel();
      else if (lyricsOpen) closeLyrics();
    });
    
    console.log('[Init] EchoDome pronto');
  } catch (err) {
    console.error('[Init] Erro fatal:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Delay mínimo para garantir que o navegador respire
  setTimeout(init, 0);
}

function syncMenuAria() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;
  menuBtn.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
}

// ---- SERVICE WORKER ----
async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('service-worker.js', {
      updateViaCache: 'none'
    });

    console.log('SW registered:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showToast('Nova versão disponível. Recarregue para atualizar.');
        }
      });
    });

    navigator.serviceWorker.addEventListener('message', e => {
      const { type, songId } = e.data;

      if (type === 'DOWNLOAD_DONE') {
        if (!downloadedSongs.includes(songId)) {
          downloadedSongs.push(songId);
          saveDownloadState();
        }
        updateAllDownloadBtns(songId, 'downloaded');
        refreshRows();
        showToast('Música baixada para offline!');
      }

      if (type === 'DOWNLOAD_ERROR') {
        updateAllDownloadBtns(songId, 'error');
        setTimeout(() => updateAllDownloadBtns(songId, 'none'), 3000);
        showToast('Erro ao baixar música');
      }

      if (type === 'DELETE_DONE') {
        downloadedSongs = downloadedSongs.filter(id => id !== songId);
        saveDownloadState();
        updateAllDownloadBtns(songId, 'none');
        refreshRows();
        showToast('Download removido');
      }
    });

  } catch (err) {
    console.warn('SW registration failed:', err);
  }
}

function sendSWMessage(data) {
  if (!('serviceWorker' in navigator)) return;

  const send = (sw) => {
    try {
      sw.postMessage(data);
    } catch (e) {
      console.warn('SW postMessage failed:', e);
    }
  };

  if (navigator.serviceWorker.controller) {
    send(navigator.serviceWorker.controller);
    return;
  }

  navigator.serviceWorker.ready.then((reg) => {
    const sw = reg.active || reg.waiting;
    if (sw) send(sw);
  }).catch(err => {
    console.error('SW ready failed:', err);
  });
}

// ---- DOWNLOAD ----
async function toggleDownload(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song || !song.file) return;

  const isMarkedDownloaded = isSongDownloaded(songId);

  if (isMarkedDownloaded) {
    updateAllDownloadBtns(songId, 'deleting');
    sendSWMessage({ type: 'DELETE_SONG', url: song.file, songId });
  } else {
    if (!navigator.onLine) {
      showToast('Você está offline. Conecte-se para baixar.');
      return;
    }

    updateAllDownloadBtns(songId, 'downloading');
    sendSWMessage({ type: 'DOWNLOAD_SONG', url: song.file, songId });
  }
}

function updateAllDownloadBtns(songId, state) {
  document.querySelectorAll('[data-dl="' + songId + '"]').forEach(btn => {
    btn.dataset.dlState = state;
    btn.title = state === 'downloaded'  ? 'Remover download'
              : state === 'downloading' ? 'Baixando...'
              : state === 'deleting'    ? 'Removendo...'
              : state === 'error'       ? 'Erro — tente novamente'
              : 'Baixar para ouvir offline';
    btn.innerHTML = dlIconSVG(state);
  });
}

function dlIconSVG(state) {
  switch (state) {
    case 'downloaded':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    case 'downloading':
    case 'deleting':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation:echodl-spin 1s linear infinite;display:block"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    case 'error':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    default:
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 11l5 5 5-5M5 21h14"/></svg>';
  }
}

// ---- RENDER HELPERS ----
function coverHTML(album) {
  if (album && album.cover) return '<img src="' + album.cover + '" alt="' + (album.name||'') + '" loading="lazy" />';
  return album ? (album.coverEmoji || '🎵') : '🎵';
}

function albumCardHTML(album) {
  return (
    '<div class="album-card" onclick="openAlbum(\'' + album.id + '\')">' +
      '<div class="album-card-cover">' +
        coverHTML(album) +
        '<button class="album-play-over" onclick="event.stopPropagation();playAlbum(\'' + album.id + '\')">' +
          '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="album-card-name">' + album.name + '</div>' +
      '<div class="album-card-year">' + album.year + '</div>' +
    '</div>'
  );
}

function aboutIconSVG() {
  return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
}

function songRowHTML(song, num, opts) {
  opts = opts || {};
  const showPlayCount = !!opts.showPlayCount;
  const musicsPage = !!opts.musicsPage;
  const album = albums.find(a => a.id === song.albumId);
  const isPlaying = currentTrack && currentTrack.id === song.id;
  const isDownloaded = isSongDownloaded(song.id);

  const thumb = album && album.cover
    ? '<img src="' + album.cover + '" alt="" loading="lazy" />'
    : (album ? album.coverEmoji || '🎵' : '🎵');

  const hasLyrics = typeof song.lyrics === 'string' && song.lyrics.trim().length > 0;
  const hasAbout = typeof song.about === 'string' && song.about.trim().length > 0;
  const lyrBtn = (hasLyrics || hasAbout)
    ? '<button type="button" class="song-lbtn" onclick="event.stopPropagation();showLyrics(' + song.id + ')" title="Ver letra"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></button>'
    : '<span style="width:32px;flex-shrink:0;"></span>';

  const dlState = isDownloaded ? 'downloaded' : 'none';
  const dlTitle = isDownloaded ? 'Remover download' : 'Baixar para ouvir offline';
  const dlBtn = song.file
    ? '<button class="dl-btn" data-dl="' + song.id + '" data-dl-state="' + dlState + '" title="' + dlTitle + '" onclick="event.stopPropagation();toggleDownload(' + song.id + ')">' + dlIconSVG(dlState) + '</button>'
    : '<span></span>';

  const aboutBtnMusics = musicsPage
    ? '<button type="button" class="about-btn" onclick="event.stopPropagation();showSongAbout(' + song.id + ')" title="Sobre a música" aria-label="Abrir sobre a música">' + aboutIconSVG() + '</button>'
    : '';

  const plays = getPlayCount(song.id);
  const playsLabel = plays === 1 ? '1 reprodução neste aparelho' : plays + ' reproduções neste aparelho';
  const durClass = showPlayCount ? 'song-dur song-dur--with-plays' : 'song-dur';
  const durInner = showPlayCount
    ? (
        '<span class="song-plays" title="Reproduções neste aparelho" aria-label="' + playsLabel + '">' + plays + '×</span>' +
        '<span class="song-dur-time">' + (song.duration || '—') + '</span>'
      )
    : (song.duration || '');

  const rowExtra = musicsPage ? ' song-row--musics' : '';
  return (
    '<div class="song-row' + (isPlaying ? ' playing' : '') + (showPlayCount ? ' song-row--plays' : '') + rowExtra + '" onclick="playSong(' + song.id + ')">' +
      '<div class="song-num">' + (isPlaying ? '▶' : num) + '</div>' +
      '<div class="song-thumb">' + thumb + '</div>' +
      '<div class="song-info">' +
        '<div class="song-name">' + song.title + '</div>' +
        '<div class="song-sub">' + (album ? album.name : '') + (isDownloaded ? ' · <span style="color:var(--gold);font-size:10px;letter-spacing:1px;">OFFLINE</span>' : '') + '</div>' +
      '</div>' +
      lyrBtn +
      aboutBtnMusics +
      dlBtn +
      '<div class="' + durClass + '">' + durInner + '</div>' +
    '</div>'
  );
}

(function injectSpinKeyframe() {
  if (document.getElementById('echodl-style')) return;
  const s = document.createElement('style');
  s.id = 'echodl-style';
  s.textContent = '@keyframes echodl-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
})();

// ---- RENDERS ----
function renderHomeAlbums() {
  const el = document.getElementById('homeAlbums');
  if (!el) return console.warn('homeAlbums não encontrado');
  el.innerHTML = albums.map(albumCardHTML).join('');
}

function renderHomeSongs() {
  const el = document.getElementById('homeSongs');
  if (!el) return;
  const list = getHomeSongList();
  el.innerHTML = list.map((s, i) => songRowHTML(s, i + 1, { showPlayCount: true })).join('');
}

function renderAllAlbumsGrid() {
  const el = document.getElementById('allAlbums');
  if (!el) return;
  el.innerHTML = albums.map(albumCardHTML).join('');
}

function renderAllSongs() {
  const el = document.getElementById('allSongsList');
  if (!el) return;
  el.innerHTML = songs.map((s, i) =>
    songRowHTML(s, i + 1, { musicsPage: true })
  ).join('');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- LAZY LOADING GALLERY ----
function renderGallery() {
  const root = document.getElementById('galleryGrid');
  if (!root) return;

  const list = typeof galleryPhotos !== 'undefined' && Array.isArray(galleryPhotos) ? galleryPhotos : [];
  if (!list.length) {
    root.innerHTML = '<p class="gallery-empty">Nenhuma foto na galeria.</p>';
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  root.innerHTML = list.map((item, i) => {
    const src = escapeHtml(item.src);
    const alt = escapeHtml(item.alt || item.caption || 'Foto da galeria');
    const cap = item.caption ? `<span class="gallery-item__caption">${escapeHtml(item.caption)}</span>` : '';

    return `
      <button type="button" class="gallery-item" onclick="openGalleryLightbox(${i})" aria-label="${alt}">
        <span class="gallery-item__frame">
          <img data-src="${src}" alt="${alt}" loading="lazy" decoding="async" class="lazy-img"/>
        </span>
        ${cap}
      </button>
    `;
  }).join('');

  root.querySelectorAll('.lazy-img').forEach(img => imageObserver.observe(img));
}

function openGalleryLightbox(index) {
  const list = typeof galleryPhotos !== 'undefined' && Array.isArray(galleryPhotos) ? galleryPhotos : [];
  const item = list[index];
  if (!item) return;
  const lb = document.getElementById('galleryLightbox');
  const img = document.getElementById('galleryLightboxImg');
  const cap = document.getElementById('galleryLightboxCaption');
  img.src = item.src;
  img.alt = item.alt || item.caption || '';
  cap.textContent = item.caption || '';
  cap.style.display = item.caption ? 'block' : 'none';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  galleryLightboxOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeGalleryLightbox() {
  const lb = document.getElementById('galleryLightbox');
  if (!lb || !lb.classList.contains('open')) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  galleryLightboxOpen = false;
  document.body.style.overflow = '';
  const img = document.getElementById('galleryLightboxImg');
  img.removeAttribute('src');
}

// ---- NAVIGATION ----
function showView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  if (name === 'home') renderHomeSongs();
  if (name === 'gallery') renderGallery();
  closeSidebar();
}

function openAlbum(albumId) {
  const album = albums.find(a => a.id === albumId);
  const albumSongs = songs.filter(s => s.albumId === albumId);
  currentAlbumId = albumId;
  document.getElementById('detailCover').innerHTML = coverHTML(album);
  document.getElementById('detailTitle').textContent = album.name;
  document.getElementById('detailMeta').textContent = album.year + ' · ' + albumSongs.length + ' músicas';
  document.getElementById('detailSongs').innerHTML = albumSongs.map((s, i) => songRowHTML(s, i + 1)).join('');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  showView('album-detail', null);
}

// ---- PLAYBACK ----
async function playSong(songId, q) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;

  recordPlay(songId);
  currentTrack = song;
  queue = q || songs;
  queueIndex = queue.findIndex(s => s.id === songId);

  const absoluteUrl = new URL(song.file, window.location.origin).href;
  audio.src = absoluteUrl;
  audio.volume = document.getElementById('volSlider').value / 100;

  try {
    await audio.play();
    playing = true;

    requestWakeLock();
    preloadNextSong();
    
    // REMOVIDO: initVisualizer() daqui - agora só via toggleVisualizer
    
  } catch (err) {
    console.error('Playback failed:', err);
    playing = false;
    if (!navigator.onLine && !isSongDownloaded(songId)) {
      showToast('Música não disponível offline');
    }
  }

  updatePlayerUI();
  refreshRows();
}

function playAlbum(albumId) {
  const s = songs.filter(x => x.albumId === albumId);
  if (s.length) playSong(s[0].id, s);
}

function playAll() {
  const s = songs.filter(x => x.albumId === currentAlbumId);
  if (s.length) playSong(s[0].id, s);
}

function togglePlay() {
  if (!currentTrack) return;
  playing ? audio.pause() : audio.play();
  playing = !playing;
  updatePlayIcon();

  if (playing) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
}

function prevTrack() {
  if (!queue.length || !currentTrack) return;
  const t = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  if (t > PREV_AT_START_SEC) {
    audio.currentTime = 0;
    syncProgressUI(0);
    return;
  }
  queueIndex = (queueIndex - 1 + queue.length) % queue.length;
  playSong(queue[queueIndex].id, queue);
}

function nextTrack() {
  if (!queue.length) return;
  queueIndex = shuffle
    ? Math.floor(Math.random() * queue.length)
    : (queueIndex + 1) % queue.length;
  playSong(queue[queueIndex].id, queue);
}

function toggleShuffle() {
  shuffle = !shuffle;
  const btn = document.getElementById('shuffleBtn');
  btn.classList.toggle('active', shuffle);
  btn.setAttribute('aria-pressed', shuffle ? 'true' : 'false');
}

function toggleRepeat() {
  repeat = !repeat;
  const btn = document.getElementById('repeatBtn');
  btn.classList.toggle('active', repeat);
  btn.setAttribute('aria-pressed', repeat ? 'true' : 'false');
}

// ---- SMART FEATURES ----
function preloadNextSong() {
  if (!queue.length || queueIndex >= queue.length - 1) return;

  const nextSong = queue[queueIndex + 1];
  if (isSongDownloaded(nextSong.id)) return;

  fetch(nextSong.file, { mode: 'no-cors' })
    .then(r => r.blob())
    .then(blob => {
      if (blob.size > 0) {
        caches.open('echodome-music-v50').then(cache => {
          cache.put(nextSong.file, new Response(blob));
        });
      }
    })
    .catch(() => {});
}

function toggleSleepTimer() {
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    sleepTimer = null;
    showToast('Timer cancelado');
    document.getElementById('sleepBtn').classList.remove('active');
  } else {
    const minutes = 30;
    sleepTimer = setTimeout(() => {
      audio.pause();
      playing = false;
      updatePlayIcon();
      showToast('Timer encerrado - música pausada');
      sleepTimer = null;
    }, minutes * 60 * 1000);

    showToast(`Timer de ${minutes}min ativado`);
    document.getElementById('sleepBtn').classList.add('active');
  }
}

async function setupWakeLock() {
  if (!('wakeLock' in navigator)) return;

  audio.addEventListener('play', requestWakeLock);
  audio.addEventListener('pause', releaseWakeLock);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && playing) {
      requestWakeLock();
    }
  });
}

async function requestWakeLock() {
  if (!('wakeLock' in navigator) || wakeLock) return;

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch (err) {
    console.log('Wake lock failed:', err);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// ---- VISUALIZER (VERSÃO SIMPLES) ----
function toggleVisualizer() {
  // Clique no botão já é interação do usuário — marca diretamente
  markUserInteraction();

  if (!window.Visualizer) {
    console.warn('[App] Visualizer não disponível');
    return;
  }

  const isFullscreen = window.Visualizer.toggleFullscreen();
  visualizerActive = isFullscreen;

  const btn = document.getElementById('vizBtn');
  btn.classList.toggle('active', isFullscreen);
}

// ---- PROGRESS BAR ----
function syncProgressUI(t) {
  if (!audio.duration) return;
  const pct = (t / audio.duration) * 100;
  document.getElementById('pFill').style.width = pct + '%';
  document.getElementById('pThumb').style.left = pct + '%';
  document.getElementById('pCurrent').textContent = fmt(t);
}

function seekFromClientX(clientX) {
  if (!currentTrack || !audio.duration) return;
  const bar = document.getElementById('pBar');
  const rect = bar.getBoundingClientRect();
  const w = rect.width;
  if (w <= 0) return;
  const pct = (clientX - rect.left) / w;
  audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
  syncProgressUI(audio.currentTime);
}

function setupProgressBar() {
  const bar = document.getElementById('pBar');
  let onMove = null;
  let onUp = null;

  bar.addEventListener('pointerdown', (e) => {
    if (!currentTrack) return;
    if (!audio.duration) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
    progressBarDragging = true;
    bar.classList.add('is-scrubbing');

    onMove = (ev) => {
      if (!progressBarDragging) return;
      ev.preventDefault();
      seekFromClientX(ev.clientX);
    };

    onUp = () => {
      progressBarDragging = false;
      bar.classList.remove('is-scrubbing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      onMove = null;
      onUp = null;
    };

    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

function setVolume(v) { audio.volume = v / 100; }

// ---- AUDIO EVENTS ----
function audioEvents() {
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || progressBarDragging) return;
    syncProgressUI(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('pTotal').textContent = fmt(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (repeat) {
      audio.play();
    } else {
      nextTrack();
    }
  });

  audio.addEventListener('play', () => {
    playing = true;
    updatePlayIcon();
    requestWakeLock();
    
    // Só tenta visualizador se já houver interação e estiver ativo
    if (userInteracted && visualizerActive) {
      requestAnimationFrame(() => {
        initVisualizer();
      });
    }
  });

  audio.addEventListener('pause', () => {
    playing = false;
    updatePlayIcon();
    releaseWakeLock();
  });
}

// ---- UI ----
function updatePlayerUI() {
  const album = albums.find(a => a.id === currentTrack.albumId);
  document.getElementById('pTitle').textContent = currentTrack.title;
  document.getElementById('pArtist').textContent = album ? album.name : BAND_NAME;

  const coverEl = document.getElementById('pCover');
  if (album && album.cover) coverEl.innerHTML = '<img src="' + album.cover + '" alt="" />';
  else coverEl.innerHTML = '<span>' + (album ? album.coverEmoji || '🎵' : '🎵') + '</span>';

  updatePlayIcon();
  updateMediaSession();
}

function updatePlayIcon() {
  document.getElementById('playIcon').innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  document.getElementById('playBtn').setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
}

function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;

  const album = albums.find(a => a.id === currentTrack.albumId);

  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentTrack.title,
    artist: BAND_NAME,
    album: album ? album.name : '',
    artwork: album && album.cover ? [{ src: album.cover, sizes: '512x512', type: 'image/jpeg' }] : []
  });

  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
  navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
  navigator.mediaSession.setActionHandler('seekto', (d) => {
    if (d.seekTime) audio.currentTime = d.seekTime;
  });
}

function refreshRows() {
  renderHomeSongs();
  const active = document.querySelector('.view.active');
  if (!active) return;
  if (active.id === 'view-all-songs') renderAllSongs();
  if (active.id === 'view-album-detail' && currentAlbumId) {
    const s = songs.filter(x => x.albumId === currentAlbumId);
    document.getElementById('detailSongs').innerHTML = s.map((x, i) => songRowHTML(x, i + 1)).join('');
  }
}

// ---- LYRICS ----
function toggleLyrics() {
  lyricsOpen ? closeLyrics() : (currentTrack ? showLyrics(currentTrack.id) : null);
}

function showLyrics(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  closeAboutPanel();
  const hasLyrics = typeof song.lyrics === 'string' && song.lyrics.trim().length > 0;
  document.getElementById('lyricsTitle').textContent = song.title;
  const body = document.getElementById('lyricsBody');
  body.textContent = hasLyrics ? song.lyrics : 'Letra não disponível.';
  body.classList.toggle('is-empty', !hasLyrics);
  const panel = document.getElementById('lyricsPanel');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.getElementById('lyricsBtn').classList.add('active');
  lyricsOpen = true;
}

function showSongAbout(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  closeLyrics();
  const hasAbout = typeof song.about === 'string' && song.about.trim().length > 0;
  document.getElementById('aboutPanelTitle').textContent = song.title;
  const body = document.getElementById('aboutPanelBody');
  body.textContent = hasAbout ? song.about : 'Nenhuma informação cadastrada para esta faixa.';
  body.classList.toggle('is-empty', !hasAbout);
  const panel = document.getElementById('aboutPanel');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  aboutPanelOpen = true;
}

function closeAboutPanel() {
  const panel = document.getElementById('aboutPanel');
  if (!panel) return;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  aboutPanelOpen = false;
}

function closeLyrics() {
  const panel = document.getElementById('lyricsPanel');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.getElementById('lyricsBtn').classList.remove('active');
  lyricsOpen = false;
}

// ---- SEARCH ----
function handleSearch(q) {
  if (!q.trim()) { showView('home', null); return; }
  const r = songs.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('searchResults').innerHTML =
    r.length ? r.map((s, i) => songRowHTML(s, i + 1)).join('')
             : '<p style="color:var(--t2);padding:20px">Nenhum resultado.</p>';
  showView('search', null);
}

// ---- SIDEBAR ----
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
  syncMenuAria();
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  syncMenuAria();
}

// ---- OFFLINE ----
function offlineCheck() {
  const badge = document.getElementById('offlineBadge');
  let wasOffline = false;

  const update = () => {
    const isOffline = !navigator.onLine;
    if (badge) badge.style.display = isOffline ? 'flex' : 'none';

    if (isOffline && !wasOffline) {
      showToast('⚡ Modo offline ativado');
    } else if (!isOffline && wasOffline) {
      showToast('✓ Conexão restaurada');
    }
    wasOffline = isOffline;

    document.querySelectorAll('.dl-btn').forEach(btn => {
      const songId = parseInt(btn.dataset.dl);
      const isDownloaded = isSongDownloaded(songId);

      if (isOffline && !isDownloaded) {
        btn.disabled = true;
        btn.style.opacity = '0.3';
        btn.title = 'Indisponível offline';
      } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        const state = isDownloaded ? 'downloaded' : 'none';
        btn.title = state === 'downloaded' ? 'Remover download' : 'Baixar para ouvir offline';
      }
    });
  };

  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

// ---- KEYBOARD SHORTCUTS ----
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch(e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        if (e.ctrlKey) nextTrack();
        break;
      case 'ArrowLeft':
        if (e.ctrlKey) prevTrack();
        break;
      case 'l':
      case 'L':
        toggleLyrics();
        break;
      case 's':
      case 'S':
        if (e.ctrlKey) {
          e.preventDefault();
          toggleShuffle();
        }
        break;
      case 'r':
      case 'R':
        toggleRepeat();
        break;
      case 'm':
      case 'M':
        audio.muted = !audio.muted;
        showToast(audio.muted ? '🔇 Mudo' : '🔊 Som ativado');
        break;
      case 'ArrowUp':
        e.preventDefault();
        audio.volume = Math.min(1, audio.volume + 0.1);
        document.getElementById('volSlider').value = audio.volume * 100;
        break;
      case 'ArrowDown':
        e.preventDefault();
        audio.volume = Math.max(0, audio.volume - 0.1);
        document.getElementById('volSlider').value = audio.volume * 100;
        break;
    }
  });
}

// ---- TOUCH GESTURES ----
function setupTouchGestures() {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
      if (deltaX > 0) prevTrack();
      else nextTrack();
    }
  }, { passive: true });
}

// ---- TOAST NOTIFICATIONS ----
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ---- DATA EXPORT/IMPORT ----
function exportUserData() {
  const data = {
    playCounts,
    downloadedSongs,
    history: localStorage.getItem('echodome-history'),
    trends: localStorage.getItem('echodome-trends'),
    timestamp: Date.now()
  };

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `echodome-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Backup exportado!');
}

async function shareSong() {
  if (!currentTrack) {
    showToast('Nenhuma música tocando');
    return;
  }

  const shareModule = await loadModule('share');
  if (shareModule && shareModule.shareSong) {
    shareModule.shareSong(currentTrack, BAND_NAME);
  }
}

// ---- UTILS ----
function fmt(s) {
  if (isNaN(s)) return '0:00';
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

// ---- EQUALIZADOR DE ÁUDIO ----
let audioContext = null;
let analyser = null;
let source = null;
let equalizerActive = false;
let eqBars = [];
let eqAnimationId = null;

function initEqualizer() {
  const audio = document.getElementById('audio');
  const eqContainer = document.getElementById('equalizer');
  
  if (!audio || !eqContainer) return;
  
  // Criar barras do equalizador (20 barras)
  eqContainer.innerHTML = '';
  eqBars = [];
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';
    bar.style.height = '2px';
    eqContainer.appendChild(bar);
    eqBars.push(bar);
  }
  
  // Configurar Web Audio API
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
    }
    
    // Conectar source apenas uma vez
    if (!source && audioContext) {
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    
    equalizerActive = true;
    eqContainer.classList.add('active');
    animateEqualizer();
    
  } catch (err) {
    console.error('[Equalizer] Erro ao inicializar:', err);
  }
}

function animateEqualizer() {
  if (!equalizerActive || !analyser) return;
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  // Atualizar barras
  const step = Math.floor(dataArray.length / eqBars.length);
  eqBars.forEach((bar, i) => {
    const value = dataArray[i * step] || 0;
    const percent = value / 255;
    const height = Math.max(2, percent * 40);
    bar.style.height = height + 'px';
  });
  
  eqAnimationId = requestAnimationFrame(animateEqualizer);
}

function stopEqualizer() {
  equalizerActive = false;
  if (eqAnimationId) cancelAnimationFrame(eqAnimationId);
  const eqContainer = document.getElementById('equalizer');
  if (eqContainer) eqContainer.classList.remove('active');
  
  // Resetar barras
  eqBars.forEach(bar => bar.style.height = '2px');
}

// Iniciar equalizador quando o áudio tocar
audio.addEventListener('play', () => {
  if (userInteracted) {
    initEqualizer();
  }
  updateFloatingPlayIcon(true);
});

audio.addEventListener('pause', () => {
  stopEqualizer();
  updateFloatingPlayIcon(false);
});

// Atualizar ícone do botão flutuante
function updateFloatingPlayIcon(isPlaying) {
  const icon = document.getElementById('floatingPlayIcon');
  if (icon) {
    icon.innerHTML = isPlaying
      ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';
  }
}

// ---- TEMA OFFLINE FANTASMAGÓRICO ----
function updateOfflineTheme() {
  const isOffline = !navigator.onLine;
  const body = document.body;
  const badge = document.getElementById('offlineBadge');
  
  if (isOffline) {
    body.classList.add('offline-theme');
    if (badge) {
      badge.innerHTML = '⚡ OFFLINE — Modo Fantasma';
      badge.style.display = 'flex';
    }
    console.log('[Theme] Modo fantasma ativado');
  } else {
    body.classList.remove('offline-theme');
    if (badge) {
      badge.innerHTML = '⚡ Offline';
      badge.style.display = 'none';
    }
    console.log('[Theme] Modo normal ativado');
  }
}

// Sobrescrever a função offlineCheck existente ou adicionar listeners
const originalOfflineCheck = offlineCheck;
offlineCheck = function() {
  // Chamar função original se existir
  if (typeof originalOfflineCheck === 'function') {
    originalOfflineCheck();
  }
  
  // Adicionar tema
  updateOfflineTheme();
  
  // Listeners adicionais para tema
  window.removeEventListener('online', updateOfflineTheme);
  window.removeEventListener('offline', updateOfflineTheme);
  window.addEventListener('online', updateOfflineTheme);
  window.addEventListener('offline', updateOfflineTheme);
};

// Inicializar tema ao carregar
document.addEventListener('DOMContentLoaded', updateOfflineTheme);

// ---- GESTOS DE TOQUE MELHORADOS ----
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const deltaTime = Date.now() - touchStartTime;
  
  // Swipe horizontal para mudar música (apenas se não estiver arrastando a barra de progresso)
  if (Math.abs(deltaX) > 80 && Math.abs(deltaY) < 100 && deltaTime < 300) {
    if (!progressBarDragging) {
      if (deltaX > 0) {
        prevTrack();
        showToast('⏮ Faixa anterior');
      } else {
        nextTrack();
        showToast('⏭ Próxima faixa');
      }
    }
  }
  
  // Toque duplo na área do player para play/pause
  if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
    // Verificar se o toque foi na área do player
    const target = e.target;
    if (target.closest('.player') || target.closest('.p-cover')) {
      togglePlay();
    }
  }
}, { passive: true });

// ---- CONTROLE DO EQUALIZADOR ----
let equalizerEnabled = false;

function toggleEqualizer() {
  const eqBtn = document.getElementById('eqBtn');
  const vizEqBtn = document.getElementById('vizEqBtn');
  
  equalizerEnabled = !equalizerEnabled;
  
  if (equalizerEnabled) {
    // Iniciar equalizador
    initEqualizer();
    if (eqBtn) eqBtn.classList.add('active');
    if (vizEqBtn) vizEqBtn.classList.add('active');
    showToast('🎵 Equalizador ativado');
  } else {
    // Parar equalizador
    stopEqualizer();
    if (eqBtn) eqBtn.classList.remove('active');
    if (vizEqBtn) vizEqBtn.classList.remove('active');
    showToast('🔇 Equalizador desativado');
  }
}

// Atualizar ícone do play no visualizador fullscreen
const originalUpdatePlayIcon = updatePlayIcon;
updatePlayIcon = function() {
  originalUpdatePlayIcon();
  
  // Atualizar ícone no fullscreen
  const vizPlayBtn = document.getElementById('vizPlayBtn');
  if (vizPlayBtn) {
    const isPlaying = !audio.paused;
    vizPlayBtn.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
};

// Sincronizar estado do equalizador quando entrar no fullscreen
const originalToggleVisualizer = toggleVisualizer;
toggleVisualizer = function() {
  originalToggleVisualizer();
  
  // Sincronizar estado do botão de equalizador no fullscreen
  setTimeout(() => {
    const vizEqBtn = document.getElementById('vizEqBtn');
    if (vizEqBtn) {
      if (equalizerEnabled) vizEqBtn.classList.add('active');
      else vizEqBtn.classList.remove('active');
    }
  }, 100);
};

// Make functions available globally for HTML onclick handlers
window.showView = showView;
window.openAlbum = openAlbum;
window.playSong = playSong;
window.playAlbum = playAlbum;
window.playAll = playAll;
window.togglePlay = togglePlay;
window.prevTrack = prevTrack;
window.nextTrack = nextTrack;
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
window.toggleLyrics = toggleLyrics;
window.showLyrics = showLyrics;
window.showSongAbout = showSongAbout;
window.closeAboutPanel = closeAboutPanel;
window.closeLyrics = closeLyrics;
window.handleSearch = handleSearch;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleDownload = toggleDownload;
window.openGalleryLightbox = openGalleryLightbox;
window.closeGalleryLightbox = closeGalleryLightbox;
window.setVolume = setVolume;
window.toggleSleepTimer = toggleSleepTimer;
window.toggleVisualizer = toggleVisualizer;
window.exportUserData = exportUserData;
window.shareSong = shareSong;
window.toggleEqualizer = toggleEqualizer;