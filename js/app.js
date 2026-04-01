// ---- STATE ----
let currentTrack = null;
let queue = [];
let queueIndex = 0;
let playing = false;
let shuffle = false;
let repeat = false;
let currentAlbumId = null;
let lyricsOpen = false;
let galleryLightboxOpen = false;
let progressBarDragging = false;

/** Se a faixa já passou deste ponto, “voltar” reinicia do zero; se já estiver no início, vai à faixa anterior. */
const PREV_AT_START_SEC = 0.5;

// ---- OFFLINE / DOWNLOAD STATE ----
let downloadedSongs = JSON.parse(localStorage.getItem('echodome-downloads') || '[]');

function saveDownloadState() {
  localStorage.setItem('echodome-downloads', JSON.stringify(downloadedSongs));
}
function isSongDownloaded(songId) {
  return downloadedSongs.includes(songId);
}

// ---- PLAY COUNTS (persistido no dispositivo) ----
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
}

/** Ordem da home: mais reproduzidas primeiro; empate pelo id da faixa. */
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
document.addEventListener('DOMContentLoaded', () => {
  renderHomeAlbums();
  renderHomeSongs();
  renderAllAlbumsGrid();
  renderAllSongs();
  audioEvents();
  offlineCheck();
  registerSW();
  syncMenuAria();
  setupProgressBar();
  renderGallery();
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (galleryLightboxOpen) closeGalleryLightbox();
    else if (lyricsOpen) closeLyrics();
  });
});

function syncMenuAria() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;
  menuBtn.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
}

// ---- SERVICE WORKER ----
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.addEventListener('message', e => {
      const { type, songId } = e.data;
      if (type === 'DOWNLOAD_DONE') {
        if (!downloadedSongs.includes(songId)) downloadedSongs.push(songId);
        saveDownloadState();
        updateAllDownloadBtns(songId, 'downloaded');
        refreshRows();
      }
      if (type === 'DOWNLOAD_ERROR') {
        updateAllDownloadBtns(songId, 'error');
        setTimeout(() => updateAllDownloadBtns(songId, 'none'), 3000);
      }
      if (type === 'DELETE_DONE') {
        downloadedSongs = downloadedSongs.filter(id => id !== songId);
        saveDownloadState();
        updateAllDownloadBtns(songId, 'none');
        refreshRows();
      }
    });
  } catch (err) {
    console.warn('SW nao registrado:', err);
  }
}

function sendSWMessage(data) {
  if (!('serviceWorker' in navigator)) return;
  const send = (sw) => {
    try {
      sw.postMessage(data);
    } catch (e) {
      console.warn('echodome: postMessage SW falhou', e);
    }
  };
  if (navigator.serviceWorker.controller) {
    send(navigator.serviceWorker.controller);
    return;
  }
  navigator.serviceWorker.ready.then((reg) => {
    const sw = reg.active || reg.waiting;
    if (sw) send(sw);
  });
}

// ---- DOWNLOAD ----
async function toggleDownload(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song || !song.file) return;
  if (isSongDownloaded(songId)) {
    updateAllDownloadBtns(songId, 'deleting');
    sendSWMessage({ type: 'DELETE_SONG', url: song.file, songId });
  } else {
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
  if (album && album.cover) return '<img src="' + album.cover + '" alt="' + (album.name||'') + '" />';
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

function songRowHTML(song, num, opts) {
  opts = opts || {};
  const showPlayCount = !!opts.showPlayCount;
  const album = albums.find(a => a.id === song.albumId);
  const isPlaying = currentTrack && currentTrack.id === song.id;
  const isDownloaded = isSongDownloaded(song.id);

  const thumb = album && album.cover
    ? '<img src="' + album.cover + '" alt="" />'
    : (album ? album.coverEmoji || '🎵' : '🎵');

  const hasLyrics = typeof song.lyrics === 'string' && song.lyrics.trim().length > 0;
  const hasAbout = typeof song.about === 'string' && song.about.trim().length > 0;
  const lyrBtn = (hasLyrics || hasAbout)
    ? '<button type="button" class="song-lbtn" onclick="event.stopPropagation();showLyrics(' + song.id + ')" title="Letra e sobre a música"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></button>'
    : '<span style="width:32px;flex-shrink:0;"></span>';

  const dlState = isDownloaded ? 'downloaded' : 'none';
  const dlTitle = isDownloaded ? 'Remover download' : 'Baixar para ouvir offline';
  const dlBtn = song.file
    ? '<button class="dl-btn" data-dl="' + song.id + '" data-dl-state="' + dlState + '" title="' + dlTitle + '" onclick="event.stopPropagation();toggleDownload(' + song.id + ')">' + dlIconSVG(dlState) + '</button>'
    : '<span></span>';

  const plays = getPlayCount(song.id);
  const playsLabel = plays === 1 ? '1 reprodução neste aparelho' : plays + ' reproduções neste aparelho';
  const durClass = showPlayCount ? 'song-dur song-dur--with-plays' : 'song-dur';
  const durInner = showPlayCount
    ? (
        '<span class="song-plays" title="Reproduções neste aparelho" aria-label="' + playsLabel + '">' + plays + '×</span>' +
        '<span class="song-dur-time">' + (song.duration || '—') + '</span>'
      )
    : (song.duration || '');

  return (
    '<div class="song-row' + (isPlaying ? ' playing' : '') + (showPlayCount ? ' song-row--plays' : '') + '" onclick="playSong(' + song.id + ')">' +
      '<div class="song-num">' + (isPlaying ? '▶' : num) + '</div>' +
      '<div class="song-thumb">' + thumb + '</div>' +
      '<div class="song-info">' +
        '<div class="song-name">' + song.title + '</div>' +
        '<div class="song-sub">' + (album ? album.name : '') + (isDownloaded ? ' · <span style="color:var(--gold);font-size:10px;letter-spacing:1px;">OFFLINE</span>' : '') + '</div>' +
      '</div>' +
      lyrBtn +
      dlBtn +
      '<div class="' + durClass + '">' + durInner + '</div>' +
    '</div>'
  );
}

// Injeta keyframe de animação uma vez
(function injectSpinKeyframe() {
  if (document.getElementById('echodl-style')) return;
  const s = document.createElement('style');
  s.id = 'echodl-style';
  s.textContent = '@keyframes echodl-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
})();

// ---- RENDERS ----
function renderHomeAlbums() {
  document.getElementById('homeAlbums').innerHTML = albums.map(albumCardHTML).join('');
}
function renderHomeSongs() {
  const list = getHomeSongList();
  document.getElementById('homeSongs').innerHTML = list.map((s, i) => songRowHTML(s, i + 1, { showPlayCount: true })).join('');
}
function renderAllAlbumsGrid() {
  document.getElementById('allAlbums').innerHTML = albums.map(albumCardHTML).join('');
}
function renderAllSongs() {
  document.getElementById('allSongsList').innerHTML = songs.map((s, i) => songRowHTML(s, i + 1)).join('');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderGallery() {
  const root = document.getElementById('galleryGrid');
  if (!root) return;
  const list = typeof galleryPhotos !== 'undefined' && Array.isArray(galleryPhotos) ? galleryPhotos : [];
  if (!list.length) {
    root.innerHTML =
      '<p class="gallery-empty">Nenhuma foto na galeria. Coloque imagens em <strong>assets/imagens/gallery/</strong> e cadastre-as em <strong>js/gallery.js</strong>.</p>';
    return;
  }
  root.innerHTML = list
    .map((item, i) => {
      const src = escapeHtml(item.src);
      const alt = escapeHtml(item.alt || item.caption || 'Foto da galeria');
      const cap = item.caption
        ? '<span class="gallery-item__caption">' + escapeHtml(item.caption) + '</span>'
        : '';
      return (
        '<button type="button" class="gallery-item" onclick="openGalleryLightbox(' +
        i +
        ')" aria-label="' +
        alt +
        '">' +
        '<span class="gallery-item__frame"><img src="' +
        src +
        '" alt="' +
        alt +
        '" loading="lazy" decoding="async" /></span>' +
        cap +
        '</button>'
      );
    })
    .join('');
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
function playSong(songId, q) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  recordPlay(songId);
  currentTrack = song;
  queue = q || songs;
  queueIndex = queue.findIndex(s => s.id === songId);
  audio.src = song.file;
  audio.volume = document.getElementById('volSlider').value / 100;
  audio.play().catch(() => {});
  playing = true;
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
  audio.addEventListener('ended', () => repeat ? audio.play() : nextTrack());
  audio.addEventListener('play',  () => { playing = true;  updatePlayIcon(); });
  audio.addEventListener('pause', () => { playing = false; updatePlayIcon(); });
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

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: BAND_NAME,
      album: album ? album.name : '',
      artwork: album && album.cover ? [{ src: album.cover, sizes: '512x512', type: 'image/jpeg' }] : []
    });
    navigator.mediaSession.setActionHandler('play',          () => audio.play());
    navigator.mediaSession.setActionHandler('pause',         () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack',     () => nextTrack());
    navigator.mediaSession.setActionHandler('seekto',        (d) => { if (d.seekTime) audio.currentTime = d.seekTime; });
  }
}

function updatePlayIcon() {
  document.getElementById('playIcon').innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  document.getElementById('playBtn').setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
}

function refreshRows() {
  // Home pode estar em segundo plano: sempre atualiza plays e ordem ao tocar música
  renderHomeSongs();
  const active = document.querySelector('.view.active');
  if (!active) return;
  if (active.id === 'view-all-songs') renderAllSongs();
  if (active.id === 'view-album-detail') {
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
  document.getElementById('lyricsTitle').textContent = song.title;
  const hasLyrics = typeof song.lyrics === 'string' && song.lyrics.trim().length > 0;
  const hasAbout = typeof song.about === 'string' && song.about.trim().length > 0;
  const body = document.getElementById('lyricsBody');
  const aboutEl = document.getElementById('lyricsAbout');
  body.textContent = hasLyrics ? song.lyrics : 'Letra não disponível.';
  body.classList.toggle('is-empty', !hasLyrics);
  aboutEl.textContent = hasAbout
    ? song.about
    : 'Nenhuma informação cadastrada para esta faixa.';
  aboutEl.classList.toggle('is-empty', !hasAbout);
  const panel = document.getElementById('lyricsPanel');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.getElementById('lyricsBtn').classList.add('active');
  lyricsOpen = true;
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
  const b = document.getElementById('offlineBadge');
  const update = () => b.style.display = navigator.onLine ? 'none' : 'flex';
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

// ---- UTILS ----
function fmt(s) {
  if (isNaN(s)) return '0:00';
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}