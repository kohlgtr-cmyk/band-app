// ---- STATE ----
let currentTrack = null;
let currentQueue = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentAlbum = null;
let lyricsOpen = false;

const audio = document.getElementById('audioPlayer');

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedAlbums();
  renderRecentSongs();
  renderAllAlbums();
  renderAllSongs();
  setupAudioEvents();
  checkOffline();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});

// ---- RENDER ----
function renderFeaturedAlbums() {
  document.getElementById('featuredAlbums').innerHTML = albums.map(albumCard).join('');
}

function renderAllAlbums() {
  document.getElementById('allAlbumsGrid').innerHTML = albums.map(albumCard).join('');
}

function albumCard(album) {
  const coverHTML = album.cover
    ? `<img src="${album.cover}" alt="${album.name}" />`
    : `<div class="album-cover-placeholder">${album.coverEmoji || '🎵'}</div>`;
  return `
    <div class="album-card" onclick="openAlbum('${album.id}')">
      <div class="album-card-cover">
        ${coverHTML}
        <button class="album-play-btn" onclick="event.stopPropagation(); playAlbum('${album.id}')">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <div class="album-card-name">${album.name}</div>
      <div class="album-card-year">${album.year}</div>
    </div>`;
}

function renderRecentSongs() {
  const recent = [...songs].slice(0, 8);
  document.getElementById('recentSongs').innerHTML = recent.map((s, i) => songRow(s, i + 1)).join('');
}

function renderAllSongs() {
  document.getElementById('allSongsList').innerHTML = songs.map((s, i) => songRow(s, i + 1)).join('');
}

function songRow(song, index) {
  const album = albums.find(a => a.id === song.albumId);
  const thumbHTML = album && album.cover
    ? `<img src="${album.cover}" alt="" />`
    : (album ? album.coverEmoji || '🎵' : '🎵');
  const isCurrentPlaying = currentTrack && currentTrack.id === song.id;
  const lyricsBtn = song.lyrics
    ? `<button class="song-lyrics-btn" onclick="event.stopPropagation(); showLyrics(${song.id})" title="Ver letra">
        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
       </button>`
    : '<div></div>';
  return `
    <div class="song-row ${isCurrentPlaying ? 'playing' : ''}" onclick="playSong(${song.id})">
      <div class="song-num">${isCurrentPlaying ? '▶' : index}</div>
      <div class="song-thumb">${thumbHTML}</div>
      <div class="song-info">
        <div class="song-name">${song.title}</div>
        <div class="song-album">${album ? album.name : ''}</div>
      </div>
      ${lyricsBtn}
      <div class="song-duration">${song.duration || ''}</div>
    </div>`;
}

// ---- NAVIGATION ----
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
  closeSidebar();
}

function openAlbum(albumId) {
  const album = albums.find(a => a.id === albumId);
  const albumSongs = songs.filter(s => s.albumId === albumId);
  currentAlbum = albumId;

  const coverEl = document.getElementById('detailCover');
  coverEl.innerHTML = album.cover
    ? `<img src="${album.cover}" alt="${album.name}" />`
    : album.coverEmoji || '🎵';

  document.getElementById('detailTitle').textContent = album.name;
  document.getElementById('detailMeta').textContent = `${album.year} • ${albumSongs.length} músicas`;
  document.getElementById('detailSongs').innerHTML = albumSongs.map((s, i) => songRow(s, i + 1)).join('');

  showView('album-detail');
}

// ---- PLAYBACK ----
function playSong(songId, queue) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;

  currentTrack = song;
  currentQueue = queue || songs;
  currentIndex = currentQueue.findIndex(s => s.id === songId);

  audio.src = song.file;
  audio.volume = document.getElementById('volumeSlider').value / 100;
  audio.play().catch(() => {});
  isPlaying = true;

  updatePlayerUI(song);
  refreshSongRows();
}

function playAlbum(albumId) {
  const albumSongs = songs.filter(s => s.albumId === albumId);
  if (albumSongs.length) playSong(albumSongs[0].id, albumSongs);
}

function playAll() {
  const albumSongs = songs.filter(s => s.albumId === currentAlbum);
  if (albumSongs.length) playSong(albumSongs[0].id, albumSongs);
}

function togglePlay() {
  if (!currentTrack) return;
  if (isPlaying) { audio.pause(); isPlaying = false; }
  else { audio.play(); isPlaying = true; }
  updatePlayBtn();
}

function prevTrack() {
  if (!currentQueue.length) return;
  currentIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
  playSong(currentQueue[currentIndex].id, currentQueue);
}

function nextTrack() {
  if (!currentQueue.length) return;
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * currentQueue.length);
  } else {
    currentIndex = (currentIndex + 1) % currentQueue.length;
  }
  playSong(currentQueue[currentIndex].id, currentQueue);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  document.getElementById('repeatBtn').classList.toggle('active', isRepeat);
}

function seek(e) {
  if (!audio.duration) return;
  const bar = document.getElementById('progressBar');
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}

function setVolume(val) { audio.volume = val / 100; }

// ---- AUDIO EVENTS ----
function setupAudioEvents() {
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressThumb').style.left = pct + '%';
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('totalTime').textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (isRepeat) { audio.play(); }
    else { nextTrack(); }
  });

  audio.addEventListener('play', () => { isPlaying = true; updatePlayBtn(); });
  audio.addEventListener('pause', () => { isPlaying = false; updatePlayBtn(); });
}

// ---- UI UPDATES ----
function updatePlayerUI(song) {
  const album = albums.find(a => a.id === song.albumId);
  document.getElementById('playerTitle').textContent = song.title;
  document.getElementById('playerArtist').textContent = album ? album.name : BAND_NAME;

  const coverEl = document.getElementById('playerCover');
  if (album && album.cover) {
    coverEl.innerHTML = `<img src="${album.cover}" alt="" />`;
  } else {
    coverEl.innerHTML = `<span>${album ? album.coverEmoji || '🎵' : '🎵'}</span>`;
  }
  updatePlayBtn();
}

function updatePlayBtn() {
  document.getElementById('playIcon').innerHTML = isPlaying
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
}

function refreshSongRows() {
  // Rerender active views to show playing state
  const activeView = document.querySelector('.view.active');
  if (!activeView) return;
  if (activeView.id === 'view-home') { renderRecentSongs(); }
  if (activeView.id === 'view-all-songs') { renderAllSongs(); }
  if (activeView.id === 'view-album-detail') {
    const albumSongs = songs.filter(s => s.albumId === currentAlbum);
    document.getElementById('detailSongs').innerHTML = albumSongs.map((s, i) => songRow(s, i + 1)).join('');
  }
}

// ---- LYRICS ----
function toggleLyrics() {
  lyricsOpen ? closeLyrics() : (currentTrack ? showLyrics(currentTrack.id) : null);
}

function showLyrics(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  const panel = document.getElementById('lyricsPanel');
  const content = document.getElementById('lyricsContent');
  document.getElementById('lyricsSongTitle').textContent = song.title;

  if (song.lyrics) {
    content.className = 'lyrics-content';
    content.textContent = song.lyrics;
  } else {
    content.className = 'lyrics-content no-lyrics';
    content.textContent = 'Letra não disponível';
  }

  panel.classList.add('open');
  document.querySelector('.lyrics-btn').classList.add('active');
  lyricsOpen = true;
}

function closeLyrics() {
  document.getElementById('lyricsPanel').classList.remove('open');
  document.querySelector('.lyrics-btn').classList.remove('active');
  lyricsOpen = false;
}

// ---- SEARCH ----
function handleSearch(query) {
  if (!query.trim()) { showView('home'); return; }
  const q = query.toLowerCase();
  const results = songs.filter(s =>
    s.title.toLowerCase().includes(q) ||
    (albums.find(a => a.id === s.albumId)?.name || '').toLowerCase().includes(q)
  );
  document.getElementById('searchResults').innerHTML =
    results.length
      ? results.map((s, i) => songRow(s, i + 1)).join('')
      : '<p style="color: var(--text2); padding: 20px">Nenhum resultado encontrado.</p>';
  showView('search');
}

// ---- SIDEBAR (MOBILE) ----
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ---- OFFLINE ----
function checkOffline() {
  const badge = document.getElementById('offlineBadge');
  const update = () => badge.style.display = navigator.onLine ? 'none' : 'flex';
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

// ---- UTILS ----
function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}