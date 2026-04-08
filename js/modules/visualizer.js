// js/visualizer-simple.js
// Visualizador Fullscreen - Versão Simples (não modular)

window.Visualizer = {
  audioCtx: null,
  analyser: null,
  source: null,
  animationId: null,
  canvas: null,
  ctx: null,
  isInitialized: false,
  isFullscreen: false,

  init: function() {
    const audio = document.getElementById('audio');
    if (!audio) {
      console.error('[Visualizer] Elemento audio não encontrado');
      return false;
    }

    try {
      // Cria AudioContext se não existir
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.warn('[Visualizer] Web Audio API não suportada');
          return false;
        }
        this.audioCtx = new AudioContext();
      }

      // Tenta resumir (necessário após interação do usuário)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(e => {
          console.warn('[Visualizer] Aguardando interação do usuário');
        });
      }

      // Configura analyser
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.85;
      }

      // Conecta o áudio (só uma vez)
      if (!this.source) {
        try {
          this.source = this.audioCtx.createMediaElementSource(audio);
          this.source.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.log('[Visualizer] Áudio já conectado ou erro:', e.message);
        }
      }

      this.createElements();
      this.isInitialized = true;
      console.log('[Visualizer] Inicializado com sucesso');
      return true;

    } catch (err) {
      console.error('[Visualizer] Erro ao inicializar:', err);
      return false;
    }
  },

  createElements: function() {
    // Remove existente se houver
    const existing = document.getElementById('visualizer-overlay');
    if (existing) existing.remove();
  
    // Cria overlay
    const overlay = document.createElement('div');
    overlay.id = 'visualizer-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0d1117 0%, #1c2530 100%);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `;
  
    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'visualizer-canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    overlay.appendChild(this.canvas);
  
    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(200, 135, 74, 0.2);
      border: 1px solid var(--gold);
      color: var(--gold);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      z-index: 10000;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onmouseenter = function() {
      this.style.background = 'var(--gold)';
      this.style.color = '#000';
    };
    closeBtn.onmouseleave = function() {
      this.style.background = 'rgba(200, 135, 74, 0.2)';
      this.style.color = 'var(--gold)';
    };
    closeBtn.onclick = () => this.toggleFullscreen(false);
    overlay.appendChild(closeBtn);
  
    // CONTROLES FLUTUANTES (apenas no fullscreen)
    const floatingControls = document.createElement('div');
    floatingControls.className = 'visualizer-controls';
    floatingControls.style.cssText = `
      position: absolute;
      bottom: 60px;
      right: 40px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 10000;
    `;
  
    // Botão Anterior
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
    prevBtn.className = 'viz-control-btn viz-prev';
    prevBtn.onclick = () => { if(window.prevTrack) window.prevTrack(); };
    prevBtn.title = 'Faixa anterior';
    
    // Botão Play/Pause
    const playBtn = document.createElement('button');
    playBtn.id = 'vizPlayBtn';
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    playBtn.className = 'viz-control-btn viz-play';
    playBtn.onclick = () => { if(window.togglePlay) window.togglePlay(); };
    playBtn.title = 'Play/Pause';
    
    // Botão Próxima
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
    nextBtn.className = 'viz-control-btn viz-next';
    nextBtn.onclick = () => { if(window.nextTrack) window.nextTrack(); };
    nextBtn.title = 'Próxima faixa';
    
    // Botão Equalizador
    const eqBtn = document.createElement('button');
    eqBtn.id = 'vizEqBtn';
    eqBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:currentColor"><path d="M3 17h2v-2H3v2zm0-10v6h2V7H3zm4 12h2v-6H7v6zm0-8h2V7H7v2zm4 8h2v-4h-2v4zm0-6h2V7h-2v2zm4 6h2v-8h-2v8zm0-10v4h2V3h-2z"/></svg>';
    eqBtn.className = 'viz-control-btn viz-eq';
    eqBtn.onclick = () => { if(window.toggleEqualizer) window.toggleEqualizer(); };
    eqBtn.title = 'Ativar/Desativar equalizador';
  
    floatingControls.appendChild(prevBtn);
    floatingControls.appendChild(playBtn);
    floatingControls.appendChild(nextBtn);
    floatingControls.appendChild(document.createElement('div')).style.height = '10px'; // espaçador
    floatingControls.appendChild(eqBtn);
    
    overlay.appendChild(floatingControls);
  
    // Info da música
    const info = document.createElement('div');
    info.id = 'viz-info';
    info.style.cssText = `
      position: absolute;
      bottom: 140px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: var(--t);
      z-index: 10000;
      pointer-events: none;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
    `;
    overlay.appendChild(info);
  
    document.body.appendChild(overlay);
  
    // Resize handler
    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.resize();
  },

  resize: function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  draw: function() {
    if (!this.analyser || !this.ctx || !this.isFullscreen) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Fundo com fade
    this.ctx.fillStyle = 'rgba(13, 17, 23, 0.15)';
    this.ctx.fillRect(0, 0, w, h);

    // Círculo central pulsante
    const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const radius = 100 + (avg / 255) * 150;

    // Gradiente radial
    const gradient = this.ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(200, 135, 74, 0.1)');
    gradient.addColorStop(0.5, 'rgba(200, 135, 74, 0.05)');
    gradient.addColorStop(1, 'rgba(200, 135, 74, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Barras circulares
    const bars = 60;
    const step = Math.floor(bufferLength / bars);
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] || 0;
      const percent = value / 255;
      const barHeight = 50 + percent * 200;
      
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * 80;
      const y1 = cy + Math.sin(angle) * 80;
      const x2 = cx + Math.cos(angle) * barHeight;
      const y2 = cy + Math.sin(angle) * barHeight;

      this.ctx.strokeStyle = `hsla(${30 + (percent * 30)}, 100%, ${50 + percent * 20}%, ${0.3 + percent * 0.7})`;
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = 'round';
      
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      // Pontos nas pontas
      if (percent > 0.5) {
        this.ctx.fillStyle = `hsla(${30 + (percent * 30)}, 100%, 60%, ${percent})`;
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, percent * 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Ondas na parte inferior
    this.drawWaves(dataArray, bufferLength, w, h);

    this.animationId = requestAnimationFrame(() => this.draw());
  },

  drawWaves: function(dataArray, bufferLength, w, h) {
    const bars = 40;
    const step = Math.floor(bufferLength / bars);
    const barWidth = w / bars;

    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step] || 0;
      const percent = value / 255;
      const barHeight = percent * h * 0.25;

      this.ctx.fillStyle = `rgba(200, 135, 74, ${percent * 0.3})`;
      this.ctx.fillRect(i * barWidth, h - barHeight, barWidth - 2, barHeight);
    }
  },

  toggleFullscreen: function(show) {
    if (!this.isInitialized) {
      const ok = this.init();
      if (!ok) return false;
    }

    const overlay = document.getElementById('visualizer-overlay');
    if (!overlay) return false;

    if (typeof show === 'undefined') {
      this.isFullscreen = !this.isFullscreen;
    } else {
      this.isFullscreen = show;
    }

    if (this.isFullscreen) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.resize();
      
      // Atualiza info
      const title = document.getElementById('pTitle')?.textContent || 'Nenhuma música';
      const artist = document.getElementById('pArtist')?.textContent || '';
      const info = document.getElementById('viz-info');
      if (info) {
        info.innerHTML = `
          <div style="font-family: Oswald, sans-serif; font-size: 42px; font-weight: 700; margin-bottom: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold);">${title}</div>
          <div style="font-size: 18px; letter-spacing: 4px; text-transform: uppercase; color: var(--t2);">${artist}</div>
        `;
      }

      // Inicia animação
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.draw();

    } else {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    return this.isFullscreen;
  },

  destroy: function() {
    this.toggleFullscreen(false);
    this.isInitialized = false;
  }
};