// ---- STATE ----
let currentTrack = null;
let queue = [];
let queueIndex = 0;
let playing = false;
let shuffle = false;
let repeat = false;
let currentAlbumId = null;
let lyricsOpen = false;

const audio = document.getElementById('audio');

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderHomeAlbums();
  renderHomeSongs();
  renderAllAlbumsGrid();
  renderAllSongs();
  audioEvents();
  offlineCheck();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
});

// ---- RENDER HELPERS ----
function coverHTML(album, big) {
  if (album && album.cover) return `<img src="${album.cover}" alt="${album.name}" />`;
  return album ? (album.coverEmoji || '🎵') : '🎵';
}

function albumCardHTML(album) {
  return `
  <div class="album-card" onclick="openAlbum('${album.id}')">
    <div class="album-card-cover">
      ${coverHTML(album)}
      <button class="album-play-over" onclick="event.stopPropagation();playAlbum('${album.id}')">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="album-card-name">${album.name}</div>
    <div class="album-card-year">${album.year}</div>
  </div>`;
}

function songRowHTML(song, num) {
  const album = albums.find(a => a.id === song.albumId);
  const isPlaying = currentTrack && currentTrack.id === song.id;
  const thumb = album && album.cover
    ? `<img src="${album.cover}" alt="" />`
    : (album ? album.coverEmoji || '🎵' : '🎵');
  const lyrBtn = song.lyrics
    ? `<button class="song-lbtn" onclick="event.stopPropagation();showLyrics(${song.id})"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></button>`
    : `<span></span>`;
  return `
  <div class="song-row ${isPlaying ? 'playing' : ''}" onclick="playSong(${song.id})">
    <div class="song-num">${isPlaying ? '▶' : num}</div>
    <div class="song-thumb">${thumb}</div>
    <div class="song-info">
      <div class="song-name">${song.title}</div>
      <div class="song-sub">${album ? album.name : ''}</div>
    </div>
    ${lyrBtn}
    <div class="song-dur">${song.duration || ''}</div>
  </div>`;
}

// ---- RENDERS ----
function renderHomeAlbums() {
  document.getElementById('homeAlbums').innerHTML = albums.map(albumCardHTML).join('');
}
function renderHomeSongs() {
  document.getElementById('homeSongs').innerHTML = songs.slice(0,8).map((s,i) => songRowHTML(s, i+1)).join('');
}
function renderAllAlbumsGrid() {
  document.getElementById('allAlbums').innerHTML = albums.map(albumCardHTML).join('');
}
function renderAllSongs() {
  document.getElementById('allSongsList').innerHTML = songs.map((s,i) => songRowHTML(s, i+1)).join('');
}

// ---- NAVIGATION ----
function showView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  closeSidebar();
}

function openAlbum(albumId) {
  const album = albums.find(a => a.id === albumId);
  const albumSongs = songs.filter(s => s.albumId === albumId);
  currentAlbumId = albumId;

  document.getElementById('detailCover').innerHTML = coverHTML(album, true);
  document.getElementById('detailTitle').textContent = album.name;
  document.getElementById('detailMeta').textContent = `${album.year} · ${albumSongs.length} músicas`;
  document.getElementById('detailSongs').innerHTML = albumSongs.map((s,i) => songRowHTML(s, i+1)).join('');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  showView('album-detail', null);
}

// ---- PLAYBACK ----
function playSong(songId, q) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
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
  if (!queue.length) return;
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
  document.getElementById('shuffleBtn').classList.toggle('active', shuffle);
}
function toggleRepeat() {
  repeat = !repeat;
  document.getElementById('repeatBtn').classList.toggle('active', repeat);
}
function seek(e) {
  if (!audio.duration) return;
  const bar = document.getElementById('pBar');
  const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
  audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
}
function setVolume(v) { audio.volume = v / 100; }

// ---- AUDIO EVENTS ----
function audioEvents() {
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('pFill').style.width = pct + '%';
    document.getElementById('pThumb').style.left = pct + '%';
    document.getElementById('pCurrent').textContent = fmt(audio.currentTime);
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
  if (album && album.cover) coverEl.innerHTML = `<img src="${album.cover}" alt="" />`;
  else coverEl.innerHTML = `<span>${album ? album.coverEmoji || '🎵' : '🎵'}</span>`;
  updatePlayIcon();
    if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: BAND_NAME,
      album: album ? album.name : '',
      artwork: album && album.cover ? [
        { src: album.cover, sizes: '512x512', type: 'image/jpeg' }
      ] : []
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audio.play();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime) audio.currentTime = details.seekTime;
    });
  }
}

function updatePlayIcon() {
  document.getElementById('playIcon').innerHTML = playing
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
}

function refreshRows() {
  const active = document.querySelector('.view.active');
  if (!active) return;
  if (active.id === 'view-home') renderHomeSongs();
  if (active.id === 'view-all-songs') renderAllSongs();
  if (active.id === 'view-album-detail') {
    const s = songs.filter(x => x.albumId === currentAlbumId);
    document.getElementById('detailSongs').innerHTML = s.map((x,i) => songRowHTML(x, i+1)).join('');
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
  const body = document.getElementById('lyricsBody');
  body.textContent = song.lyrics || 'Letra não disponível.';
  body.style.fontStyle = song.lyrics ? 'normal' : 'italic';
  document.getElementById('lyricsPanel').classList.add('open');
  document.getElementById('lyricsBtn').classList.add('active');
  lyricsOpen = true;
}
function closeLyrics() {
  document.getElementById('lyricsPanel').classList.remove('open');
  document.getElementById('lyricsBtn').classList.remove('active');
  lyricsOpen = false;
}

// ---- SEARCH ----
function handleSearch(q) {
  if (!q.trim()) { showView('home', null); return; }
  const r = songs.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('searchResults').innerHTML =
    r.length ? r.map((s,i) => songRowHTML(s,i+1)).join('')
             : '<p style="color:var(--t2);padding:20px">Nenhum resultado.</p>';
  showView('search', null);
}

// ---- SIDEBAR ----
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
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
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}