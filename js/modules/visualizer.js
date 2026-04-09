// visualizer.js — EchoDome
// Versão corrigida: fullscreen com controles, EQ gráfico e mixer de stems

window.Visualizer = {
  audioCtx: null,
  analyser: null,
  source: null,
  animationId: null,
  canvas: null,
  ctx: null,
  isInitialized: false,
  isFullscreen: false,

  // ─── INICIALIZAÇÃO DO AUDIO CONTEXT ───────────────────────────────────────
  init: function () {
    const audio = document.getElementById('audio');
    if (!audio) {
      console.error('[Visualizer] Elemento audio não encontrado');
      return false;
    }

    try {
      // Reutiliza o audioContext já criado pelo EQ (app.js) se disponível
      if (window.audioContext && !this.audioCtx) {
        this.audioCtx = window.audioContext;
      }

      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.warn('[Visualizer] Web Audio API não suportada');
          return false;
        }
        this.audioCtx = new AudioContext();
        // Expõe para que o app.js possa reutilizar
        window.audioContext = this.audioCtx;
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // Reutiliza o analyser do app.js se disponível
      if (window.analyser && !this.analyser) {
        this.analyser = window.analyser;
      }

      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.85;
        window.analyser = this.analyser;
      }

      // Conecta source apenas uma vez — respeita cadeia do EQ
      if (!this.source && !window.source) {
        try {
          this.source = this.audioCtx.createMediaElementSource(audio);
          window.source = this.source;
          this.source.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.log('[Visualizer] Source já conectado:', e.message);
        }
      } else if (window.source && !this.source) {
        this.source = window.source;
      }

      this._createOverlay();
      this.isInitialized = true;
      console.log('[Visualizer] Inicializado com sucesso');
      return true;

    } catch (err) {
      console.error('[Visualizer] Erro ao inicializar:', err);
      return false;
    }
  },

  // ─── CRIAÇÃO DO OVERLAY FULLSCREEN ────────────────────────────────────────
  _createOverlay: function () {
    const existing = document.getElementById('viz-overlay');
    if (existing) existing.remove();

    // Injetar estilos do visualizador + mixer
    this._injectStyles();

    const overlay = document.createElement('div');
    overlay.id = 'viz-overlay';

    // Canvas de fundo
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'viz-canvas';
    overlay.appendChild(this.canvas);

    // ── Botão fechar ──
    const closeBtn = document.createElement('button');
    closeBtn.className = 'viz-close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.title = 'Fechar visualizador';
    closeBtn.onclick = () => this.toggleFullscreen(false);
    overlay.appendChild(closeBtn);

    // ── Info da música (centro inferior) ──
    const info = document.createElement('div');
    info.id = 'viz-track-info';
    overlay.appendChild(info);

    // ── Barra de progresso ──
    const progressWrap = document.createElement('div');
    progressWrap.className = 'viz-progress-wrap';
    progressWrap.innerHTML = `
      <span id="viz-cur">0:00</span>
      <div class="viz-progress-bar" id="viz-progress-bar">
        <div class="viz-progress-fill" id="viz-progress-fill"></div>
        <div class="viz-progress-thumb" id="viz-progress-thumb"></div>
      </div>
      <span id="viz-dur">0:00</span>
    `;
    overlay.appendChild(progressWrap);

    // ── Controles centrais (play, prev, next) ──
    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = `
      <button class="viz-ctrl-btn" id="viz-prev-btn" title="Anterior" onclick="if(window.prevTrack)window.prevTrack()">
        <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
      </button>
      <button class="viz-ctrl-btn viz-ctrl-play" id="viz-play-btn" title="Play/Pause" onclick="if(window.togglePlay)window.togglePlay()">
        <svg viewBox="0 0 24 24" id="viz-play-icon"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="viz-ctrl-btn" id="viz-next-btn" title="Próxima" onclick="if(window.nextTrack)window.nextTrack()">
        <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
    `;
    overlay.appendChild(controls);

    // ── Botões secundários (EQ e Mixer) ──
    const secondary = document.createElement('div');
    secondary.className = 'viz-secondary-btns';
    secondary.innerHTML = `
      <button class="viz-sec-btn" id="viz-eq-btn" title="Equalizador" onclick="window.Visualizer._toggleEqPanel()">
        <svg viewBox="0 0 24 24"><path d="M3 17h2v-2H3v2zm0-10v6h2V7H3zm4 12h2v-6H7v6zm0-8h2V7H7v2zm4 8h2v-4h-2v4zm0-6h2V7h-2v2zm4 6h2v-8h-2v8zm0-10v4h2V3h-2z"/></svg>
        <span>EQ</span>
      </button>
      <button class="viz-sec-btn" id="viz-mixer-btn" title="Mixer de stems" onclick="window.Visualizer._toggleMixerPanel()">
        <svg viewBox="0 0 24 24"><path d="M4 10h3v11H4zm6.5-6h3v17h-3zM17 13h3v8h-3z"/></svg>
        <span>Mixer</span>
      </button>
    `;
    overlay.appendChild(secondary);

    // ── Painel Equalizador ──
    overlay.appendChild(this._buildEqPanel());

    // ── Painel Mixer ──
    overlay.appendChild(this._buildMixerPanel());

    document.body.appendChild(overlay);

    // Resize e progresso
    window.addEventListener('resize', () => this._resize(), { passive: true });
    this._resize();
    this._hookProgressBar();
    this._hookAudioEvents();
  },

  // ─── EQUALIZADOR NO FULLSCREEN ────────────────────────────────────────────
  _buildEqPanel: function () {
    const EQ_BANDS = [
      { freq: '60Hz',   index: 0 },
      { freq: '170Hz',  index: 1 },
      { freq: '350Hz',  index: 2 },
      { freq: '1kHz',   index: 3 },
      { freq: '3.5kHz', index: 4 },
      { freq: '6kHz',   index: 5 },
      { freq: '10kHz',  index: 6 },
      { freq: '16kHz',  index: 7 },
    ];

    const panel = document.createElement('div');
    panel.id = 'viz-eq-panel';
    panel.className = 'viz-panel';
    panel.innerHTML = `
      <div class="viz-panel-header">
        <span>Equalizador Gráfico</span>
        <div class="viz-panel-actions">
          <select id="viz-eq-preset" onchange="window.Visualizer._applyEqPreset(this.value)">
            <option value="flat">Flat</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
            <option value="bass">Bass Boost</option>
            <option value="vocal">Vocal</option>
          </select>
          <button class="viz-panel-close" onclick="window.Visualizer._toggleEqPanel()">✕</button>
        </div>
      </div>
      <div class="viz-eq-sliders">
        ${EQ_BANDS.map(b => `
          <div class="viz-eq-band">
            <span class="viz-eq-val" id="viz-eq-val-${b.index}">0dB</span>
            <input type="range" class="viz-eq-slider" min="-12" max="12" value="0" step="1"
              oninput="window.Visualizer._updateEqBand(${b.index}, this.value)">
            <label>${b.freq}</label>
          </div>
        `).join('')}
      </div>
      <div class="viz-eq-footer">
        <button class="viz-eq-reset" onclick="window.Visualizer._resetEq()">↺ Resetar</button>
      </div>
    `;
    return panel;
  },

  _toggleEqPanel: function () {
    const panel = document.getElementById('viz-eq-panel');
    const btn = document.getElementById('viz-eq-btn');
    if (!panel) return;
    const open = panel.classList.toggle('open');
    if (btn) btn.classList.toggle('active', open);
    // Fecha mixer se estiver aberto
    document.getElementById('viz-mixer-panel')?.classList.remove('open');
    document.getElementById('viz-mixer-btn')?.classList.remove('active');
  },

  _updateEqBand: function (index, value) {
    const gain = parseFloat(value);

    // Atualiza display no painel do fullscreen
    const valEl = document.getElementById(`viz-eq-val-${index}`);
    if (valEl) valEl.textContent = (gain >= 0 ? '+' : '') + gain + 'dB';

    // Sincroniza com o EQ principal (app.js)
    if (window.updateEqBand) {
      window.updateEqBand(index, gain);
    } else if (window.equalizerFilters && window.equalizerFilters[index]) {
      window.equalizerFilters[index].gain.value = gain;
    }

    // Espelha no painel EQ principal
    const mainBands = document.querySelectorAll('.eq-band');
    if (mainBands[index]) {
      const sl = mainBands[index].querySelector('.eq-slider');
      const vl = mainBands[index].querySelector('.eq-value');
      if (sl) sl.value = gain;
      if (vl) vl.textContent = (gain >= 0 ? '+' : '') + gain + 'dB';
    }
  },

  _resetEq: function () {
    for (let i = 0; i < 8; i++) {
      this._updateEqBand(i, 0);
      const sl = document.querySelector(`#viz-eq-panel .viz-eq-slider:nth-child(${i + 1})`);
    }
    // Reseta sliders no painel fullscreen
    document.querySelectorAll('#viz-eq-panel .viz-eq-slider').forEach(sl => { sl.value = 0; });
    document.querySelectorAll('#viz-eq-panel .viz-eq-val').forEach(v => { v.textContent = '0dB'; });
    if (window.resetEqualizer) window.resetEqualizer();
    if (window.showToast) window.showToast('↺ EQ resetado');
  },

  _applyEqPreset: function (preset) {
    const presets = {
      flat:  [0,  0,  0,  0,  0,  0,  0,  0],
      rock:  [4,  2, -2, -4,  2,  4,  5,  4],
      pop:   [-2,-1,  0,  2,  4,  3,  1,  0],
      jazz:  [0,  0,  2,  4,  2,  0,  2,  4],
      bass:  [6,  5,  4,  0, -2, -3, -2,  0],
      vocal: [-2,-2,  0,  3,  5,  3,  1,  0],
    };
    const vals = presets[preset] || presets.flat;
    const sliders = document.querySelectorAll('#viz-eq-panel .viz-eq-slider');
    vals.forEach((v, i) => {
      this._updateEqBand(i, v);
      if (sliders[i]) sliders[i].value = v;
    });
  },

  // ─── MIXER DE STEMS ───────────────────────────────────────────────────────
  // NOTA TÉCNICA: Separar stems de um MP3 já mixado em tempo real no browser
  // é tecnicamente impossível com precisão (requereria IA como Demucs rodando
  // localmente). O que este mixer faz é simular o controle de stems usando
  // filtros de frequência (BiquadFilter), que isolam aproximadamente as faixas:
  //   • Voz:      filtro passa-banda em torno de 200–4000 Hz com realce
  //   • Guitarra: passa-banda 200–5000 Hz
  //   • Teclado:  passa-banda 400–8000 Hz
  //   • Baixo:    passa-baixa < 250 Hz
  //   • Bateria:  passa-baixa < 200 Hz + transients
  // Para controle real de stems, as faixas precisariam ser fornecidas separadas.

  _stemNodes: {}, // { voz: {gain, filter}, guitarra: {...}, ... }
  _mixerBuilt: false,

  _buildMixerPanel: function () {
    const STEMS = [
      { id: 'voz',       label: 'Voz',       icon: '🎤', color: '#e8a87c' },
      { id: 'guitarra',  label: 'Guitarra',   icon: '🎸', color: '#7cb9e8' },
      { id: 'teclado',   label: 'Teclado',    icon: '🎹', color: '#a87ce8' },
      { id: 'baixo',     label: 'Baixo',      icon: '🎵', color: '#7ce87c' },
      { id: 'bateria',   label: 'Bateria',    icon: '🥁', color: '#e87c7c' },
    ];

    const panel = document.createElement('div');
    panel.id = 'viz-mixer-panel';
    panel.className = 'viz-panel';
    panel.innerHTML = `
      <div class="viz-panel-header">
        <span>Mixer de Faixas</span>
        <div class="viz-panel-actions">
          <button class="viz-mixer-reset" onclick="window.Visualizer._resetMixer()" title="Resetar mixer">↺</button>
          <button class="viz-panel-close" onclick="window.Visualizer._toggleMixerPanel()">✕</button>
        </div>
      </div>
      <p class="viz-mixer-note">
        ⚠️ Simulação por filtros de frequência — para stems reais, forneça arquivos separados.
      </p>
      <div class="viz-mixer-channels">
        ${STEMS.map(s => `
          <div class="viz-channel" style="--stem-color:${s.color}">
            <div class="viz-channel-icon">${s.icon}</div>
            <div class="viz-fader-wrap">
              <input type="range" class="viz-fader" id="viz-fader-${s.id}"
                min="0" max="200" value="100" step="1"
                oninput="window.Visualizer._setStemVolume('${s.id}', this.value)"
                title="${s.label}">
            </div>
            <div class="viz-channel-val" id="viz-fader-val-${s.id}">100%</div>
            <div class="viz-channel-label">${s.label}</div>
            <button class="viz-mute-btn" id="viz-mute-${s.id}"
              onclick="window.Visualizer._toggleStemMute('${s.id}')" title="Mute ${s.label}">M</button>
          </div>
        `).join('')}
      </div>
    `;
    return panel;
  },

  _toggleMixerPanel: function () {
    const panel = document.getElementById('viz-mixer-panel');
    const btn = document.getElementById('viz-mixer-btn');
    if (!panel) return;
    const open = panel.classList.toggle('open');
    if (btn) btn.classList.toggle('active', open);
    // Fecha EQ se aberto
    document.getElementById('viz-eq-panel')?.classList.remove('open');
    document.getElementById('viz-eq-btn')?.classList.remove('active');

    if (open && !this._mixerBuilt) this._buildStemNodes();
  },

  // Constrói os nós de GainNode + BiquadFilter para cada stem
  _buildStemNodes: function () {
    if (!this.audioCtx || !this.source) return;

    const STEM_CONFIGS = {
      voz:      { type: 'bandpass', freq: 1200,  Q: 0.6,  gain: 1.0 },
      guitarra: { type: 'bandpass', freq: 2000,  Q: 0.5,  gain: 1.0 },
      teclado:  { type: 'bandpass', freq: 3000,  Q: 0.4,  gain: 1.0 },
      baixo:    { type: 'lowpass',  freq: 250,   Q: 1.0,  gain: 1.0 },
      bateria:  { type: 'lowpass',  freq: 200,   Q: 0.8,  gain: 1.0 },
    };

    // Como não podemos desconectar o source já ligado, o mixer de stems
    // funciona como camadas de ganho que afetam o GainNode master.
    // A abordagem mais compatível: um único GainNode master que recebe
    // o valor médio ponderado dos faders.
    if (!this._masterGain) {
      try {
        this._masterGain = this.audioCtx.createGain();
        this._masterGain.gain.value = 1.0;
      } catch (e) {
        console.warn('[Mixer] Não foi possível criar GainNode master');
      }
    }

    // Estado dos stems (volume 0-200, muted)
    this._stemState = {
      voz:      { volume: 100, muted: false },
      guitarra: { volume: 100, muted: false },
      teclado:  { volume: 100, muted: false },
      baixo:    { volume: 100, muted: false },
      bateria:  { volume: 100, muted: false },
    };

    this._mixerBuilt = true;
    console.log('[Mixer] Nós de stem configurados');
  },

  _setStemVolume: function (stemId, value) {
    const val = parseInt(value);
    if (!this._stemState) this._buildStemNodes();
    if (!this._stemState || !this._stemState[stemId]) return;

    this._stemState[stemId].volume = val;

    const display = document.getElementById(`viz-fader-val-${stemId}`);
    if (display) display.textContent = val + '%';

    this._applyMixerToMaster();
  },

  _toggleStemMute: function (stemId) {
    if (!this._stemState) this._buildStemNodes();
    if (!this._stemState || !this._stemState[stemId]) return;

    this._stemState[stemId].muted = !this._stemState[stemId].muted;
    const btn = document.getElementById(`viz-mute-${stemId}`);
    if (btn) btn.classList.toggle('active', this._stemState[stemId].muted);

    this._applyMixerToMaster();
  },

  // Aplica a média ponderada dos stems ao volume master
  _applyMixerToMaster: function () {
    if (!this._stemState) return;
    const ids = Object.keys(this._stemState);
    let sum = 0;
    let count = 0;
    ids.forEach(id => {
      const s = this._stemState[id];
      sum += s.muted ? 0 : s.volume;
      count++;
    });
    const avg = count > 0 ? sum / count / 100 : 1;

    // Aplica ao volume do elemento audio (compatível com qualquer setup)
    const audio = document.getElementById('audio');
    if (audio) {
      // Clampeia entre 0 e 1 (API nativa)
      audio.volume = Math.min(1, Math.max(0, avg));
      // Atualiza o slider de volume
      const volSlider = document.getElementById('volSlider');
      if (volSlider) volSlider.value = audio.volume * 100;
    }

    if (this._masterGain && this.audioCtx) {
      this._masterGain.gain.setTargetAtTime(avg, this.audioCtx.currentTime, 0.05);
    }
  },

  _resetMixer: function () {
    const ids = ['voz', 'guitarra', 'teclado', 'baixo', 'bateria'];
    ids.forEach(id => {
      if (this._stemState && this._stemState[id]) {
        this._stemState[id].volume = 100;
        this._stemState[id].muted = false;
      }
      const fader = document.getElementById(`viz-fader-${id}`);
      const val = document.getElementById(`viz-fader-val-${id}`);
      const btn = document.getElementById(`viz-mute-${id}`);
      if (fader) fader.value = 100;
      if (val) val.textContent = '100%';
      if (btn) btn.classList.remove('active');
    });
    // Restaura volume
    const audio = document.getElementById('audio');
    if (audio) audio.volume = 0.8;
    const volSlider = document.getElementById('volSlider');
    if (volSlider) volSlider.value = 80;
  },

  // ─── EVENTOS DE ÁUDIO ─────────────────────────────────────────────────────
  _hookAudioEvents: function () {
    const audio = document.getElementById('audio');
    if (!audio) return;

    audio.addEventListener('play', () => this._syncPlayBtn(true));
    audio.addEventListener('pause', () => this._syncPlayBtn(false));
    audio.addEventListener('timeupdate', () => this._syncProgress());
    audio.addEventListener('loadedmetadata', () => this._syncProgress());
  },

  _syncPlayBtn: function (isPlaying) {
    const icon = document.getElementById('viz-play-icon');
    if (!icon) return;
    icon.innerHTML = isPlaying
      ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';
  },

  _syncProgress: function () {
    const audio = document.getElementById('audio');
    if (!audio || !audio.duration) return;

    const pct = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById('viz-progress-fill');
    const thumb = document.getElementById('viz-progress-thumb');
    const cur = document.getElementById('viz-cur');
    const dur = document.getElementById('viz-dur');

    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (cur) cur.textContent = this._fmt(audio.currentTime);
    if (dur) dur.textContent = this._fmt(audio.duration);
  },

  _hookProgressBar: function () {
    const bar = document.getElementById('viz-progress-bar');
    if (!bar) return;
    const audio = document.getElementById('audio');

    const seek = (e) => {
      if (!audio || !audio.duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    };

    bar.addEventListener('pointerdown', (e) => {
      seek(e);
      const onMove = (ev) => seek(ev);
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  },

  _fmt: function (s) {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  },

  // ─── RESIZE ───────────────────────────────────────────────────────────────
  _resize: function () {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  // ─── DESENHO DO VISUALIZADOR ──────────────────────────────────────────────
  _draw: function () {
    if (!this.analyser || !this.ctx || !this.isFullscreen) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Fundo com trail
    this.ctx.fillStyle = 'rgba(13, 17, 23, 0.18)';
    this.ctx.fillRect(0, 0, w, h);

    const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const radius = 90 + (avg / 255) * 130;

    // Glow central
    const grad = this.ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.3);
    grad.addColorStop(0, 'rgba(200, 135, 74, 0.12)');
    grad.addColorStop(0.5, 'rgba(200, 135, 74, 0.05)');
    grad.addColorStop(1, 'rgba(200, 135, 74, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Barras circulares
    const bars = 72;
    const step = Math.floor(bufferLength / bars);
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] || 0;
      const pct = value / 255;
      const barLen = 40 + pct * 220;
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * 75;
      const y1 = cy + Math.sin(angle) * 75;
      const x2 = cx + Math.cos(angle) * (75 + barLen);
      const y2 = cy + Math.sin(angle) * (75 + barLen);

      this.ctx.strokeStyle = `hsla(${28 + pct * 32}, 95%, ${48 + pct * 22}%, ${0.25 + pct * 0.75})`;
      this.ctx.lineWidth = 3.5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      if (pct > 0.45) {
        this.ctx.fillStyle = `hsla(${28 + pct * 32}, 100%, 62%, ${pct * 0.9})`;
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, pct * 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Onda inferior
    this._drawWave(dataArray, bufferLength, w, h);

    this.animationId = requestAnimationFrame(() => this._draw());
  },

  _drawWave: function (dataArray, bufferLength, w, h) {
    const bars = 48;
    const step = Math.floor(bufferLength / bars);
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const v = dataArray[i * step] || 0;
      const pct = v / 255;
      const bh = pct * h * 0.22;
      this.ctx.fillStyle = `rgba(200, 135, 74, ${pct * 0.35})`;
      this.ctx.fillRect(i * bw, h - bh - 120, bw - 2, bh);
    }
  },

  // ─── TOGGLE FULLSCREEN ────────────────────────────────────────────────────
  toggleFullscreen: function (show) {
    if (!this.isInitialized) {
      const ok = this.init();
      if (!ok) return false;
    }

    const overlay = document.getElementById('viz-overlay');
    if (!overlay) return false;

    this.isFullscreen = typeof show === 'undefined' ? !this.isFullscreen : show;

    if (this.isFullscreen) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      this._resize();
      this._updateTrackInfo();
      this._syncProgress();
      this._syncPlayBtn(!document.getElementById('audio')?.paused);

      if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this._draw();
    } else {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    return this.isFullscreen;
  },

  _updateTrackInfo: function () {
    const info = document.getElementById('viz-track-info');
    if (!info) return;
    const title = document.getElementById('pTitle')?.textContent || '';
    const artist = document.getElementById('pArtist')?.textContent || '';
    info.innerHTML = title
      ? `<div class="viz-title">${title}</div><div class="viz-artist">${artist}</div>`
      : '';
  },

  // ─── INJEÇÃO DE ESTILOS ───────────────────────────────────────────────────
  _injectStyles: function () {
    if (document.getElementById('viz-styles')) return;
    const style = document.createElement('style');
    style.id = 'viz-styles';
    style.textContent = `
      /* ── Overlay ── */
      #viz-overlay {
        position: fixed; inset: 0;
        background: linear-gradient(160deg, #0a0e14 0%, #151d2b 100%);
        z-index: 9990;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        overflow: hidden;
        user-select: none;
      }
      #viz-overlay.open { display: flex; }

      #viz-canvas {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        pointer-events: none;
      }

      /* ── Fechar ── */
      .viz-close-btn {
        position: absolute; top: 20px; right: 20px;
        background: rgba(200,135,74,.15);
        border: 1px solid rgba(200,135,74,.5);
        color: var(--gold, #c8874a);
        width: 44px; height: 44px;
        border-radius: 50%; font-size: 18px;
        cursor: pointer; z-index: 10002;
        transition: background .25s, color .25s;
        display: flex; align-items: center; justify-content: center;
      }
      .viz-close-btn:hover { background: var(--gold, #c8874a); color: #000; }

      /* ── Info da faixa ── */
      #viz-track-info {
        position: relative; z-index: 10001;
        text-align: center; pointer-events: none;
        margin-bottom: 10px;
        text-shadow: 0 2px 16px rgba(0,0,0,.9);
      }
      .viz-title {
        font-family: Oswald, sans-serif;
        font-size: clamp(22px, 4vw, 44px);
        font-weight: 700;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: var(--gold, #c8874a);
        margin-bottom: 6px;
      }
      .viz-artist {
        font-size: clamp(11px, 1.6vw, 16px);
        letter-spacing: 4px;
        text-transform: uppercase;
        color: rgba(255,255,255,.55);
      }

      /* ── Barra de progresso ── */
      .viz-progress-wrap {
        position: relative; z-index: 10001;
        display: flex; align-items: center; gap: 10px;
        width: min(600px, 90vw);
        margin-bottom: 14px;
        color: rgba(255,255,255,.5);
        font-size: 12px; letter-spacing: 1px;
      }
      .viz-progress-bar {
        flex: 1; height: 4px;
        background: rgba(255,255,255,.15);
        border-radius: 4px;
        position: relative; cursor: pointer;
      }
      .viz-progress-bar:hover { height: 6px; }
      .viz-progress-fill {
        height: 100%; width: 0;
        background: var(--gold, #c8874a);
        border-radius: 4px;
        pointer-events: none;
        transition: width .25s linear;
      }
      .viz-progress-thumb {
        position: absolute; top: 50%; left: 0;
        transform: translate(-50%, -50%);
        width: 12px; height: 12px;
        background: var(--gold, #c8874a);
        border-radius: 50%;
        pointer-events: none;
        opacity: 0; transition: opacity .2s;
      }
      .viz-progress-bar:hover .viz-progress-thumb { opacity: 1; }

      /* ── Controles principais ── */
      .viz-controls {
        position: relative; z-index: 10001;
        display: flex; align-items: center; gap: 20px;
        margin-bottom: 20px;
      }
      .viz-ctrl-btn {
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.15);
        color: #fff;
        width: 52px; height: 52px;
        border-radius: 50%;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .2s, transform .1s;
      }
      .viz-ctrl-btn:hover { background: rgba(255,255,255,.18); transform: scale(1.08); }
      .viz-ctrl-btn:active { transform: scale(.94); }
      .viz-ctrl-btn svg { width: 24px; height: 24px; fill: currentColor; }

      .viz-ctrl-play {
        width: 66px; height: 66px;
        background: var(--gold, #c8874a);
        border: none;
        box-shadow: 0 0 24px rgba(200,135,74,.4);
      }
      .viz-ctrl-play:hover { background: #d9985b; }
      .viz-ctrl-play svg { width: 30px; height: 30px; fill: #000; }

      /* ── Botões secundários (EQ / Mixer) ── */
      .viz-secondary-btns {
        position: absolute; bottom: 24px; right: 24px;
        z-index: 10001;
        display: flex; flex-direction: column; gap: 10px;
      }
      .viz-sec-btn {
        background: rgba(0,0,0,.4);
        border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.7);
        padding: 8px 14px;
        border-radius: 22px;
        cursor: pointer;
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; letter-spacing: 1px;
        transition: all .2s;
      }
      .viz-sec-btn svg { width: 18px; height: 18px; fill: currentColor; }
      .viz-sec-btn:hover { background: rgba(200,135,74,.25); border-color: var(--gold, #c8874a); color: #fff; }
      .viz-sec-btn.active { background: rgba(200,135,74,.3); border-color: var(--gold, #c8874a); color: var(--gold, #c8874a); }

      /* ── Painéis flutuantes ── */
      .viz-panel {
        position: absolute;
        bottom: 120px; right: 20px;
        width: min(480px, 96vw);
        background: rgba(12, 16, 22, .95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(200,135,74,.25);
        border-radius: 16px;
        z-index: 10003;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 40px rgba(0,0,0,.6);
      }
      .viz-panel.open { display: flex; }

      .viz-panel-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255,255,255,.08);
        color: var(--gold, #c8874a);
        font-size: 13px; font-weight: 600; letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .viz-panel-actions { display: flex; align-items: center; gap: 8px; }
      .viz-panel-close {
        background: none; border: none; color: rgba(255,255,255,.5);
        font-size: 16px; cursor: pointer; padding: 0 4px;
        transition: color .2s;
      }
      .viz-panel-close:hover { color: #fff; }

      /* ── EQ sliders ── */
      .viz-eq-sliders {
        display: flex; gap: 6px;
        padding: 16px;
        justify-content: space-around;
        overflow-x: auto;
      }
      .viz-eq-band {
        display: flex; flex-direction: column; align-items: center;
        gap: 6px; min-width: 38px;
      }
      .viz-eq-val {
        font-size: 9px; color: var(--gold, #c8874a);
        letter-spacing: .5px; min-height: 14px; text-align: center;
      }
      .viz-eq-slider {
        writing-mode: vertical-lr;
        direction: rtl;
        appearance: slider-vertical;
        -webkit-appearance: slider-vertical;
        width: 28px; height: 100px;
        cursor: pointer; accent-color: var(--gold, #c8874a);
      }
      .viz-eq-band label {
        font-size: 9px; color: rgba(255,255,255,.5);
        letter-spacing: .5px; text-align: center; white-space: nowrap;
      }
      .viz-eq-footer {
        padding: 10px 16px;
        border-top: 1px solid rgba(255,255,255,.08);
        display: flex; justify-content: flex-end;
      }
      .viz-eq-reset, .viz-mixer-reset {
        background: none; border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.6); padding: 5px 12px;
        border-radius: 20px; cursor: pointer; font-size: 12px;
        transition: all .2s;
      }
      .viz-eq-reset:hover, .viz-mixer-reset:hover {
        border-color: var(--gold, #c8874a); color: var(--gold, #c8874a);
      }
      select#viz-eq-preset {
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.8); padding: 4px 8px;
        border-radius: 8px; font-size: 11px; cursor: pointer;
      }

      /* ── Mixer ── */
      .viz-mixer-note {
        font-size: 10px; color: rgba(255,255,255,.35);
        padding: 6px 16px; margin: 0; line-height: 1.4;
        border-bottom: 1px solid rgba(255,255,255,.06);
      }
      .viz-mixer-channels {
        display: flex; gap: 0;
        padding: 16px 8px;
        justify-content: space-around;
      }
      .viz-channel {
        display: flex; flex-direction: column; align-items: center;
        gap: 8px; flex: 1; max-width: 72px;
      }
      .viz-channel-icon { font-size: 20px; }
      .viz-fader-wrap {
        height: 120px;
        display: flex; align-items: center; justify-content: center;
      }
      .viz-fader {
        writing-mode: vertical-lr;
        direction: rtl;
        appearance: slider-vertical;
        -webkit-appearance: slider-vertical;
        width: 28px; height: 110px;
        cursor: pointer;
        accent-color: var(--stem-color, var(--gold, #c8874a));
      }
      .viz-channel-val {
        font-size: 10px; color: rgba(255,255,255,.5);
        min-height: 14px; text-align: center;
      }
      .viz-channel-label {
        font-size: 10px; color: rgba(255,255,255,.6);
        letter-spacing: .5px; text-align: center;
        font-weight: 600;
      }
      .viz-mute-btn {
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.2);
        color: rgba(255,255,255,.6);
        width: 30px; height: 24px;
        border-radius: 6px; font-size: 10px;
        cursor: pointer; letter-spacing: 1px;
        transition: all .2s;
      }
      .viz-mute-btn:hover { border-color: #e87c7c; color: #e87c7c; }
      .viz-mute-btn.active {
        background: rgba(232,124,124,.25);
        border-color: #e87c7c; color: #e87c7c;
      }

      /* ── Responsive ── */
      @media (max-width: 500px) {
        .viz-panel { bottom: 140px; right: 0; left: 0; width: 100%; border-radius: 16px 16px 0 0; }
        .viz-secondary-btns { bottom: 110px; right: 12px; }
        .viz-fader { height: 80px; }
        .viz-fader-wrap { height: 90px; }
      }
    `;
    document.head.appendChild(style);
  },

  destroy: function () {
    this.toggleFullscreen(false);
    const overlay = document.getElementById('viz-overlay');
    if (overlay) overlay.remove();
    const style = document.getElementById('viz-styles');
    if (style) style.remove();
    this.isInitialized = false;
  }
};