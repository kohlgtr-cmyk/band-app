// app.js — EchoDome
// Versão corrigida: sem duplicatas, sem conflitos de módulo

// ── STATE ────────────────────────────────────────────────────────────────────
let currentTrack    = null;
let queue           = [];
let queueIndex      = 0;
let playing         = false;
let shuffle         = false;
let repeat          = false;
let currentAlbumId  = null;
let lyricsOpen      = false;
let aboutPanelOpen  = false;
let galleryLightboxOpen = false;
let progressBarDragging = false;
let sleepTimer      = null;
let wakeLock        = null;
let userInteracted  = false;
let eqPanelOpen     = false;

const PREV_AT_START_SEC = 2;

// ── WEB AUDIO ─────────────────────────────────────────────────────────────────
// Variáveis globais compartilhadas com visualizer.js
window.audioContext      = null;
window.analyser          = null;
window.source            = null;
window.equalizerFilters  = [];

const EQ_FREQUENCIES = [60, 170, 350, 1000, 3500, 6000, 10000, 16000];

// ── USER INTERACTION ──────────────────────────────────────────────────────────
function markUserInteraction() {
  if (userInteracted) return;
  userInteracted = true;
  if (window.audioContext && window.audioContext.state === 'suspended') {
    window.audioContext.resume().catch(() => {});
  }
}
document.addEventListener('click',      markUserInteraction, { once: true });
document.addEventListener('touchstart', markUserInteraction, { once: true });
document.addEventListener('keydown',    markUserInteraction, { once: true });

// ── AUDIO ELEMENT ─────────────────────────────────────────────────────────────
const audio = document.getElementById('audio');

// ── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  console.log('[Init] Iniciando EchoDome...');
  try {
    renderHomeAlbums();
    renderHomeSongs();
    renderAllAlbumsGrid();
    renderAllSongs();
    renderGallery();
    initVisualizerBars();

    audioEvents();
    offlineCheck();
    setupProgressBar();
    setupKeyboardShortcuts();
    setupTouchGestures();
    setupWakeLock();

    setTimeout(registerSW, 100);

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (galleryLightboxOpen) closeGalleryLightbox();
      else if (aboutPanelOpen) closeAboutPanel();
      else if (lyricsOpen)     closeLyrics();
      else if (eqPanelOpen)    toggleEqPanel();
    });

    // Sincroniza TODOS os sliders de volume via event delegation
    // Funciona para #volSlider, .eq-master-slider e qualquer outro que apareça
    document.addEventListener('input', (e) => {
      if (e.target.id === 'volSlider' || e.target.classList.contains('eq-master-slider')) {
        setVolume(e.target.value);
      }
    });

    // Aplica volume inicial igual em todos os controles
    const initialVol = document.getElementById('volSlider')?.value ?? 80;
    setVolume(initialVol);

    console.log('[Init] EchoDome pronto');
  } catch (err) {
    console.error('[Init] Erro fatal:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 0);
}

// ── SERVICE WORKER ────────────────────────────────────────────────────────────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('service-worker.js', { updateViaCache: 'none' });
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          showToast('Nova versão disponível. Recarregue para atualizar.');
        }
      });
    });
    navigator.serviceWorker.addEventListener('message', e => {
      const { type, songId } = e.data;
      if (type === 'DOWNLOAD_DONE') {
        if (!downloadedSongs.includes(songId)) { downloadedSongs.push(songId); saveDownloadState(); }
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
  const send = (sw) => { try { sw.postMessage(data); } catch(e) {} };
  if (navigator.serviceWorker.controller) { send(navigator.serviceWorker.controller); return; }
  navigator.serviceWorker.ready.then(reg => { const sw = reg.active || reg.waiting; if (sw) send(sw); }).catch(() => {});
}

// ── OFFLINE / DOWNLOAD ────────────────────────────────────────────────────────
let downloadedSongs = JSON.parse(localStorage.getItem('echodome-downloads') || '[]');
function saveDownloadState() { localStorage.setItem('echodome-downloads', JSON.stringify(downloadedSongs)); }
function isSongDownloaded(songId) { return downloadedSongs.includes(songId); }

async function toggleDownload(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song || !song.file) return;
  if (isSongDownloaded(songId)) {
    updateAllDownloadBtns(songId, 'deleting');
    sendSWMessage({ type: 'DELETE_SONG', url: song.file, songId });
  } else {
    if (!navigator.onLine) { showToast('Você está offline. Conecte-se para baixar.'); return; }
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
    case 'downloaded':  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    case 'downloading':
    case 'deleting':    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation:echodl-spin 1s linear infinite;display:block"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    case 'error':       return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
    default:            return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 11l5 5 5-5M5 21h14"/></svg>';
  }
}

(function injectSpinKeyframe() {
  if (document.getElementById('echodl-style')) return;
  const s = document.createElement('style');
  s.id = 'echodl-style';
  s.textContent = '@keyframes echodl-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
})();

// ── PLAY COUNTS ───────────────────────────────────────────────────────────────
const PLAY_COUNTS_KEY = 'echodome-play-counts';
function loadPlayCounts() {
  try {
    const raw = localStorage.getItem(PLAY_COUNTS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return {};
    const out = {};
    for (const k of Object.keys(o)) {
      const n = typeof o[k] === 'number' ? o[k] : parseInt(String(o[k]), 10);
      if (!isNaN(n) && n >= 0) out[String(k)] = n;
    }
    return out;
  } catch { return {}; }
}
let playCounts = loadPlayCounts();
function savePlayCounts() { try { localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(playCounts)); } catch(e) {} }
function getPlayCount(songId) { const n = playCounts[String(songId)]; return (typeof n === 'number' && !isNaN(n) && n >= 0) ? n : 0; }
function recordPlay(songId) {
  const k = String(songId);
  playCounts[k] = getPlayCount(songId) + 1;
  savePlayCounts();
  const history = JSON.parse(localStorage.getItem('echodome-history') || '[]');
  history.push({ songId, timestamp: Date.now(), duration: audio.duration || 0, completed: false });
  if (history.length > 1000) history.shift();
  localStorage.setItem('echodome-history', JSON.stringify(history));
}

function getHomeSongList() {
  return songs.slice().sort((a, b) => {
    const diff = getPlayCount(b.id) - getPlayCount(a.id);
    return diff !== 0 ? diff : a.id - b.id;
  }).slice(0, 8);
}

// ── RENDER HELPERS ────────────────────────────────────────────────────────────
function coverHTML(album) {
  if (album && album.cover) return '<img src="' + album.cover + '" alt="' + (album.name || '') + '" loading="lazy" />';
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
  const musicsPage    = !!opts.musicsPage;
  const album      = albums.find(a => a.id === song.albumId);
  const isPlaying  = currentTrack && currentTrack.id === song.id;
  const isDownloaded = isSongDownloaded(song.id);

  const thumb = album && album.cover
    ? '<img src="' + album.cover + '" alt="" loading="lazy" />'
    : (album ? album.coverEmoji || '🎵' : '🎵');

  const hasLyrics = typeof song.lyrics === 'string' && song.lyrics.trim().length > 0;
  const hasAbout  = typeof song.about  === 'string' && song.about.trim().length  > 0;
  const lyrBtn = (hasLyrics || hasAbout)
    ? '<button type="button" class="song-lbtn" onclick="event.stopPropagation();showLyrics(' + song.id + ')" title="Ver letra"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></button>'
    : '<span style="width:32px;flex-shrink:0;"></span>';

  const dlState = isDownloaded ? 'downloaded' : 'none';
  const dlBtn = song.file
    ? '<button class="dl-btn" data-dl="' + song.id + '" data-dl-state="' + dlState + '" title="' + (isDownloaded ? 'Remover download' : 'Baixar para ouvir offline') + '" onclick="event.stopPropagation();toggleDownload(' + song.id + ')">' + dlIconSVG(dlState) + '</button>'
    : '<span></span>';

  const aboutBtnMusics = musicsPage
    ? '<button type="button" class="about-btn" onclick="event.stopPropagation();showSongAbout(' + song.id + ')" title="Sobre a música" aria-label="Abrir sobre a música">' + aboutIconSVG() + '</button>'
    : '';

  const plays = getPlayCount(song.id);
  const playsLabel = plays === 1 ? '1 reprodução neste aparelho' : plays + ' reproduções neste aparelho';
  const durClass = showPlayCount ? 'song-dur song-dur--with-plays' : 'song-dur';
  const durInner = showPlayCount
    ? '<span class="song-plays" title="Reproduções neste aparelho" aria-label="' + playsLabel + '">' + plays + '×</span><span class="song-dur-time">' + (song.duration || '—') + '</span>'
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
      lyrBtn + aboutBtnMusics + dlBtn +
      '<div class="' + durClass + '">' + durInner + '</div>' +
    '</div>'
  );
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── RENDERS ───────────────────────────────────────────────────────────────────
function renderHomeAlbums() {
  const el = document.getElementById('homeAlbums');
  if (!el) return;
  el.innerHTML = albums.map(albumCardHTML).join('');
}
function renderHomeSongs() {
  const el = document.getElementById('homeSongs');
  if (!el) return;
  el.innerHTML = getHomeSongList().map((s, i) => songRowHTML(s, i + 1, { showPlayCount: true })).join('');
}
function renderAllAlbumsGrid() {
  const el = document.getElementById('allAlbums');
  if (!el) return;
  el.innerHTML = albums.map(albumCardHTML).join('');
}
function renderAllSongs() {
  const el = document.getElementById('allSongsList');
  if (!el) return;
  el.innerHTML = songs.map((s, i) => songRowHTML(s, i + 1, { musicsPage: true })).join('');
}

// ── GALLERY ───────────────────────────────────────────────────────────────────
function renderGallery() {
  const root = document.getElementById('galleryGrid');
  if (!root) return;
  const list = (typeof galleryPhotos !== 'undefined' && Array.isArray(galleryPhotos)) ? galleryPhotos : [];
  if (!list.length) { root.innerHTML = '<p class="gallery-empty">Nenhuma foto na galeria.</p>'; return; }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      obs.unobserve(img);
    });
  }, { rootMargin: '50px' });

  root.innerHTML = list.map((item, i) => {
    const src = escapeHtml(item.src);
    const alt = escapeHtml(item.alt || item.caption || 'Foto da galeria');
    const cap = item.caption ? `<span class="gallery-item__caption">${escapeHtml(item.caption)}</span>` : '';
    return `<button type="button" class="gallery-item" onclick="openGalleryLightbox(${i})" aria-label="${alt}"><span class="gallery-item__frame"><img data-src="${src}" alt="${alt}" loading="lazy" decoding="async" class="lazy-img"/></span>${cap}</button>`;
  }).join('');

  root.querySelectorAll('.lazy-img').forEach(img => observer.observe(img));
}

function openGalleryLightbox(index) {
  const list = (typeof galleryPhotos !== 'undefined' && Array.isArray(galleryPhotos)) ? galleryPhotos : [];
  const item = list[index];
  if (!item) return;
  const lb  = document.getElementById('galleryLightbox');
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
  document.getElementById('galleryLightboxImg').removeAttribute('src');
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function showView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
  if (btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  if (name === 'home')    renderHomeSongs();
  if (name === 'gallery') renderGallery();
  closeSidebar();
}

function syncMenuAria() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;
  menuBtn.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
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

// ── PLAYBACK ──────────────────────────────────────────────────────────────────
async function playSong(songId, q) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;

  recordPlay(songId);
  currentTrack = song;
  queue = q || songs;
  queueIndex = queue.findIndex(s => s.id === songId);

  audio.src = new URL(song.file, window.location.origin).href;
  audio.volume = document.getElementById('volSlider').value / 100;

  try {
    await audio.play();
    playing = true;
    requestWakeLock();
    preloadNextSong();
  } catch (err) {
    console.error('Playback failed:', err);
    playing = false;
    if (!navigator.onLine && !isSongDownloaded(songId)) showToast('Música não disponível offline');
  }

  updatePlayerUI();
  refreshRows();

  // Atualiza info no visualizador se estiver aberto
  if (window.Visualizer && window.Visualizer.isFullscreen) {
    window.Visualizer._updateTrackInfo();
  }
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
  if (playing) { audio.pause(); }
  else {
    markUserInteraction();
    audio.play().catch(e => console.warn('play failed', e));
  }
}

function prevTrack() {
  if (!queue.length || !currentTrack) return;
  const t = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  if (t > PREV_AT_START_SEC) { audio.currentTime = 0; syncProgressUI(0); return; }
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
  if (btn) { btn.classList.toggle('active', shuffle); btn.setAttribute('aria-pressed', String(shuffle)); }
}

function toggleRepeat() {
  repeat = !repeat;
  const btn = document.getElementById('repeatBtn');
  if (btn) { btn.classList.toggle('active', repeat); btn.setAttribute('aria-pressed', String(repeat)); }
}

// ── UI ────────────────────────────────────────────────────────────────────────
function updatePlayerUI() {
  if (!currentTrack) return;
  const album = albums.find(a => a.id === currentTrack.albumId);
  document.getElementById('pTitle').textContent  = currentTrack.title;
  document.getElementById('pArtist').textContent = album ? album.name : BAND_NAME;
  const coverEl = document.getElementById('pCover');
  if (album && album.cover) coverEl.innerHTML = '<img src="' + album.cover + '" alt="" />';
  else coverEl.innerHTML = '<span>' + (album ? album.coverEmoji || '🎵' : '🎵') + '</span>';
  updatePlayIcon();
  updateMediaSession();
}

function updatePlayIcon() {
  const playIcon = document.getElementById('playIcon');
  const playBtn  = document.getElementById('playBtn');
  const floatIcon = document.getElementById('floatingPlayIcon');

  if (playIcon) playIcon.innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  if (playBtn) playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
  if (floatIcon) floatIcon.innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';

  // Sincroniza ícone no visualizador fullscreen
  const vizIcon = document.getElementById('viz-play-icon');
  if (vizIcon) vizIcon.innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
}

function updateMediaSession() {
  if (!('mediaSession' in navigator) || !currentTrack) return;
  const album = albums.find(a => a.id === currentTrack.albumId);
  navigator.mediaSession.metadata = new MediaMetadata({
    title:   currentTrack.title,
    artist:  BAND_NAME,
    album:   album ? album.name : '',
    artwork: album && album.cover ? [{ src: album.cover, sizes: '512x512', type: 'image/jpeg' }] : []
  });
  navigator.mediaSession.setActionHandler('play',          () => audio.play());
  navigator.mediaSession.setActionHandler('pause',         () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
  navigator.mediaSession.setActionHandler('nexttrack',     nextTrack);
  navigator.mediaSession.setActionHandler('seekto',        (d) => { if (d.seekTime) audio.currentTime = d.seekTime; });
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

// ── AUDIO EVENTS ──────────────────────────────────────────────────────────────
function audioEvents() {
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || progressBarDragging) return;
    syncProgressUI(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('pTotal').textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (repeat) audio.play();
    else nextTrack();
  });
  audio.addEventListener('play', () => {
    playing = true;
    updatePlayIcon();
    requestWakeLock();
    // Inicializa AudioContext após interação
    if (userInteracted && !window.audioContext) initAudioContext();
    else if (window.audioContext && window.audioContext.state === 'suspended') window.audioContext.resume();
    startVisualizerBars();
  });
  audio.addEventListener('pause', () => {
    playing = false;
    updatePlayIcon();
    releaseWakeLock();
    stopVisualizerBars();
  });
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function syncProgressUI(t) {
  if (!audio.duration) return;
  const pct = (t / audio.duration) * 100;
  const fill  = document.getElementById('pFill');
  const thumb = document.getElementById('pThumb');
  const cur   = document.getElementById('pCurrent');
  if (fill)  fill.style.width  = pct + '%';
  if (thumb) thumb.style.left  = pct + '%';
  if (cur)   cur.textContent   = fmt(t);
}

function seekFromClientX(clientX) {
  if (!currentTrack || !audio.duration) return;
  const bar  = document.getElementById('pBar');
  const rect = bar.getBoundingClientRect();
  if (rect.width <= 0) return;
  const pct = (clientX - rect.left) / rect.width;
  audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
  syncProgressUI(audio.currentTime);
}

function setupProgressBar() {
  const bar = document.getElementById('pBar');
  if (!bar) return;
  bar.addEventListener('pointerdown', (e) => {
    if (!currentTrack || !audio.duration) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
    progressBarDragging = true;
    bar.classList.add('is-scrubbing');
    const onMove = (ev) => { if (progressBarDragging) { ev.preventDefault(); seekFromClientX(ev.clientX); } };
    const onUp   = () => {
      progressBarDragging = false;
      bar.classList.remove('is-scrubbing');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    document.addEventListener('pointermove',   onMove, { passive: false });
    document.addEventListener('pointerup',     onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

function setVolume(v) {
  // Clampeia entre 0 e 100
  const pct = Math.min(100, Math.max(0, parseFloat(v)));
  audio.volume = pct / 100;

  // Sincroniza TODOS os controles de volume em qualquer lugar da UI
  const ids = ['volSlider', 'eq-master-slider'];
  document.getElementById('volSlider')?.setAttribute('value', pct);
  document.getElementById('volSlider') && (document.getElementById('volSlider').value = pct);

  // Slider master do painel EQ
  document.querySelector('.eq-master-slider') && (document.querySelector('.eq-master-slider').value = pct);

  // Label de porcentagem
  const eqMasterVal = document.getElementById('eqMasterValue');
  if (eqMasterVal) eqMasterVal.textContent = Math.round(pct) + '%';

  // Fader master do mixer no visualizador fullscreen (se existir)
  const vizMasterFader = document.getElementById('viz-master-fader');
  if (vizMasterFader) vizMasterFader.value = pct;
  const vizMasterVal = document.getElementById('viz-master-val');
  if (vizMasterVal) vizMasterVal.textContent = Math.round(pct) + '%';
}

// ── SMART FEATURES ────────────────────────────────────────────────────────────
function preloadNextSong() {
  if (!queue.length || queueIndex >= queue.length - 1) return;
  const nextSong = queue[queueIndex + 1];
  if (isSongDownloaded(nextSong.id)) return;
  fetch(nextSong.file, { mode: 'no-cors' })
    .then(r => r.blob())
    .then(blob => {
      if (blob.size > 0) caches.open('echodome-music-v50').then(cache => cache.put(nextSong.file, new Response(blob)));
    }).catch(() => {});
}

function toggleSleepTimer() {
  const btn = document.getElementById('sleepBtn');
  if (sleepTimer) {
    clearTimeout(sleepTimer); sleepTimer = null;
    showToast('Timer cancelado');
    if (btn) btn.classList.remove('active');
  } else {
    const minutes = 30;
    sleepTimer = setTimeout(() => {
      audio.pause(); playing = false; updatePlayIcon();
      showToast('Timer encerrado - música pausada');
      sleepTimer = null;
    }, minutes * 60 * 1000);
    showToast(`Timer de ${minutes}min ativado`);
    if (btn) btn.classList.add('active');
  }
}

async function setupWakeLock() {
  if (!('wakeLock' in navigator)) return;
  audio.addEventListener('play',  requestWakeLock);
  audio.addEventListener('pause', releaseWakeLock);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && playing) requestWakeLock();
  });
}
async function requestWakeLock() {
  if (!('wakeLock' in navigator) || wakeLock) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } catch(e) {}
}
function releaseWakeLock() { if (wakeLock) { wakeLock.release(); wakeLock = null; } }

// ── LYRICS / ABOUT ────────────────────────────────────────────────────────────
function toggleLyrics() { lyricsOpen ? closeLyrics() : (currentTrack ? showLyrics(currentTrack.id) : null); }

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
  panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
  document.getElementById('lyricsBtn').classList.add('active');
  lyricsOpen = true;
}

function closeLyrics() {
  const panel = document.getElementById('lyricsPanel');
  if (!panel) return;
  panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
  document.getElementById('lyricsBtn').classList.remove('active');
  lyricsOpen = false;
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
  panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
  aboutPanelOpen = true;
}

function closeAboutPanel() {
  const panel = document.getElementById('aboutPanel');
  if (!panel) return;
  panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
  aboutPanelOpen = false;
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function handleSearch(q) {
  if (!q.trim()) { showView('home', null); return; }
  const r = songs.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('searchResults').innerHTML = r.length
    ? r.map((s, i) => songRowHTML(s, i + 1)).join('')
    : '<p style="color:var(--t2);padding:20px">Nenhum resultado.</p>';
  showView('search', null);
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
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

// ── OFFLINE ───────────────────────────────────────────────────────────────────
function offlineCheck() {
  const badge = document.getElementById('offlineBadge');
  let wasOffline = false;

  const applyGhostTheme = (isOffline) => {
    document.body.classList.toggle('offline-theme', isOffline);
    if (badge) {
      badge.style.display = isOffline ? 'flex' : 'none';
      badge.innerHTML = isOffline ? '👻 OFFLINE — Modo Fantasma' : '';
    }
  };

  const update = () => {
    const isOffline = !navigator.onLine;
    applyGhostTheme(isOffline);
    if (isOffline && !wasOffline) showToast('👻 Modo Fantasma ativado — apenas músicas baixadas disponíveis');
    else if (!isOffline && wasOffline) showToast('✓ Conexão restaurada');
    wasOffline = isOffline;
    document.querySelectorAll('.dl-btn').forEach(btn => {
      const songId = parseInt(btn.dataset.dl);
      const isDl = isSongDownloaded(songId);
      btn.disabled = isOffline && !isDl;
      btn.style.opacity = (isOffline && !isDl) ? '0.3' : '1';
      btn.title = isOffline && !isDl ? 'Indisponível offline' : (isDl ? 'Remover download' : 'Baixar para ouvir offline');
    });
  };
  update();
  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    switch(e.key) {
      case ' ':          e.preventDefault(); togglePlay();    break;
      case 'ArrowRight': if (e.ctrlKey) nextTrack();          break;
      case 'ArrowLeft':  if (e.ctrlKey) prevTrack();          break;
      case 'l': case 'L': toggleLyrics();                     break;
      case 's': case 'S': if (e.ctrlKey) { e.preventDefault(); toggleShuffle(); } break;
      case 'r': case 'R': toggleRepeat();                     break;
      case 'm': case 'M': audio.muted = !audio.muted; showToast(audio.muted ? '🔇 Mudo' : '🔊 Som ativado'); break;
      case 'ArrowUp':
        e.preventDefault();
        setVolume(Math.min(100, audio.volume * 100 + 10));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setVolume(Math.max(0, audio.volume * 100 - 10));
        break;
    }
  });
}

// ── TOUCH GESTURES ────────────────────────────────────────────────────────────
function setupTouchGestures() {
  let startX = 0, startY = 0, startTime = 0;
  document.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
    startTime = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - startX;
    const dy = e.changedTouches[0].screenY - startY;
    const dt = Date.now() - startTime;
    if (Math.abs(dx) > 80 && Math.abs(dy) < 100 && dt < 300 && !progressBarDragging) {
      if (dx > 0) { prevTrack(); showToast('⏮ Faixa anterior'); }
      else        { nextTrack(); showToast('⏭ Próxima faixa');  }
    }
  }, { passive: true });
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── DATA EXPORT ───────────────────────────────────────────────────────────────
function exportUserData() {
  const data = { playCounts, downloadedSongs, history: localStorage.getItem('echodome-history'), timestamp: Date.now() };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `echodome-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado!');
}

async function shareSong() {
  if (!currentTrack) { showToast('Nenhuma música tocando'); return; }
  const shareData = {
    title: `${currentTrack.title} - ${BAND_NAME}`,
    text:  `Ouça "${currentTrack.title}" no EchoDome`,
    url:   window.location.href
  };
  if (navigator.share) {
    try { await navigator.share(shareData); }
    catch(e) { if (e.name !== 'AbortError') _fallbackShare(shareData); }
  } else { _fallbackShare(shareData); }
}
function _fallbackShare(shareData) {
  const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('Link copiado!')).catch(() => {});
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

// ── AUDIO CONTEXT / EQUALIZER ─────────────────────────────────────────────────
function initAudioContext() {
  if (window.audioContext) return window.audioContext;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    window.audioContext = new AC();

    // Cria os 8 filtros de EQ em cadeia
    if (window.equalizerFilters.length === 0) {
      EQ_FREQUENCIES.forEach(freq => {
        const f = window.audioContext.createBiquadFilter();
        f.type = 'peaking'; f.frequency.value = freq; f.Q.value = 1.4; f.gain.value = 0;
        window.equalizerFilters.push(f);
      });
    }

    // Connecta: source -> EQ filters -> analyser -> destination
    if (!window.source) {
      window.source = window.audioContext.createMediaElementSource(audio);
      let prev = window.source;
      window.equalizerFilters.forEach(f => { prev.connect(f); prev = f; });

      window.analyser = window.audioContext.createAnalyser();
      window.analyser.fftSize = 256;
      window.analyser.smoothingTimeConstant = 0.85;

      prev.connect(window.analyser);
      window.analyser.connect(window.audioContext.destination);
    }

    console.log('[AudioContext] Inicializado');
    return window.audioContext;
  } catch(err) {
    console.error('[AudioContext] Erro:', err);
    return null;
  }
}

// ── EQUALIZER GRÁFICO ─────────────────────────────────────────────────────────
function updateEqBand(bandIndex, value) {
  const gain = parseFloat(value);
  if (!window.audioContext) initAudioContext();
  if (window.equalizerFilters[bandIndex]) {
    window.equalizerFilters[bandIndex].gain.setValueAtTime(gain, window.audioContext.currentTime);
  }
  // Atualiza UI do painel principal
  const band = document.querySelectorAll('.eq-band')[bandIndex];
  if (band) {
    const sl = band.querySelector('.eq-slider');
    const vl = band.querySelector('.eq-value');
    if (sl) sl.value = gain;
    if (vl) vl.textContent = (gain >= 0 ? '+' : '') + gain + 'dB';
  }
  // Atualiza UI do painel no fullscreen
  const vizVal = document.getElementById(`viz-eq-val-${bandIndex}`);
  if (vizVal) vizVal.textContent = (gain >= 0 ? '+' : '') + gain + 'dB';
  const vizSliders = document.querySelectorAll('#viz-eq-panel .viz-eq-slider');
  if (vizSliders[bandIndex]) vizSliders[bandIndex].value = gain;

  _updateEqButtonState();
}

function resetEqualizer() {
  EQ_FREQUENCIES.forEach((_, i) => updateEqBand(i, 0));
  const preset = document.getElementById('eqPreset');
  if (preset) preset.value = 'flat';
  showToast('↺ Equalizador resetado');
}

function applyEqPreset(preset) {
  const presets = {
    flat:  [0,  0,  0,  0,  0,  0,  0,  0],
    rock:  [4,  2, -2, -4,  2,  4,  5,  4],
    pop:   [-2,-1,  0,  2,  4,  3,  1,  0],
    jazz:  [0,  0,  2,  4,  2,  0,  2,  4],
    bass:  [6,  5,  4,  0, -2, -3, -2,  0],
    vocal: [-2,-2,  0,  3,  5,  3,  1,  0],
  };
  const vals = presets[preset] || presets.flat;
  vals.forEach((v, i) => setTimeout(() => updateEqBand(i, v), i * 40));
  showToast('Preset: ' + preset.charAt(0).toUpperCase() + preset.slice(1));
}

function toggleEqPanel() {
  const panel = document.getElementById('eqPanel');
  const btn   = document.getElementById('eqBtn');
  if (!panel) return;
  eqPanelOpen = !eqPanelOpen;
  if (eqPanelOpen) {
    if (!window.audioContext && userInteracted) initAudioContext();
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    if (btn) btn.classList.add('active');
  } else {
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    if (btn && !_hasEqChanges()) btn.classList.remove('active');
  }
}

function _hasEqChanges() { return window.equalizerFilters.some(f => f.gain.value !== 0); }
function _updateEqButtonState() {
  const btn = document.getElementById('eqBtn');
  if (!btn) return;
  if (_hasEqChanges()) btn.classList.add('active');
  else if (!eqPanelOpen) btn.classList.remove('active');
}

// ── VISUALIZADOR DE ESPECTRO (barrinhas no player) ────────────────────────────
let _eqBars = [];
let _eqAnimId = null;
let _vizBarsActive = false;

function initVisualizerBars() {
  const container = document.getElementById('equalizer');
  if (!container) return;
  container.innerHTML = '';
  _eqBars = [];
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';
    bar.style.height = '2px';
    container.appendChild(bar);
    _eqBars.push(bar);
  }
}

function _animateEqBars() {
  if (!_vizBarsActive || !window.analyser) return;
  const data = new Uint8Array(window.analyser.frequencyBinCount);
  window.analyser.getByteFrequencyData(data);
  const step = Math.floor(data.length / _eqBars.length);
  _eqBars.forEach((bar, i) => {
    const pct = (data[i * step] || 0) / 255;
    bar.style.height = Math.max(2, pct * 40) + 'px';
  });
  _eqAnimId = requestAnimationFrame(_animateEqBars);
}

function startVisualizerBars() {
  if (_vizBarsActive) return;
  _vizBarsActive = true;
  const container = document.getElementById('equalizer');
  if (container) container.classList.add('active');
  _animateEqBars();
}

function stopVisualizerBars() {
  _vizBarsActive = false;
  if (_eqAnimId) { cancelAnimationFrame(_eqAnimId); _eqAnimId = null; }
  const container = document.getElementById('equalizer');
  if (container) container.classList.remove('active');
  _eqBars.forEach(bar => { bar.style.height = '2px'; });
}

// ── VISUALIZADOR FULLSCREEN ───────────────────────────────────────────────────
function toggleVisualizer() {
  markUserInteraction();
  if (!window.Visualizer) { console.warn('[App] Visualizer não disponível'); return; }

  // Garante que o AudioContext existe antes de abrir
  if (!window.audioContext) initAudioContext();

  const isOpen = window.Visualizer.toggleFullscreen();
  const btn = document.getElementById('vizBtn');
  if (btn) btn.classList.toggle('active', isOpen);
}

// ── GLOBALS (chamados via onclick no HTML) ────────────────────────────────────
window.showView          = showView;
window.openAlbum         = openAlbum;
window.playSong          = playSong;
window.playAlbum         = playAlbum;
window.playAll           = playAll;
window.togglePlay        = togglePlay;
window.prevTrack         = prevTrack;
window.nextTrack         = nextTrack;
window.toggleShuffle     = toggleShuffle;
window.toggleRepeat      = toggleRepeat;
window.toggleLyrics      = toggleLyrics;
window.showLyrics        = showLyrics;
window.showSongAbout     = showSongAbout;
window.closeAboutPanel   = closeAboutPanel;
window.closeLyrics       = closeLyrics;
window.handleSearch      = handleSearch;
window.toggleSidebar     = toggleSidebar;
window.closeSidebar      = closeSidebar;
window.toggleDownload    = toggleDownload;
window.openGalleryLightbox  = openGalleryLightbox;
window.closeGalleryLightbox = closeGalleryLightbox;
window.setVolume         = setVolume;
window.toggleSleepTimer  = toggleSleepTimer;
window.toggleVisualizer  = toggleVisualizer;
window.exportUserData    = exportUserData;
window.shareSong         = shareSong;
window.toggleEqPanel     = toggleEqPanel;
window.updateEqBand      = updateEqBand;
window.resetEqualizer    = resetEqualizer;
window.applyEqPreset     = applyEqPreset;
window.initAudioContext  = initAudioContext;