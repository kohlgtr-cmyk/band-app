// ═══════════════════════════════════════════════════════════════════════════
// character-design-system.js — EchoDome
// ═══════════════════════════════════════════════════════════════════════════
//
//  SISTEMA DE DESIGN POR PERSONAGEM
//  Cada membro da banda tem uma "assinatura visual" própria.
//  Quando o usuário troca de personagem, o app inteiro muda de personalidade.
//
//  O que muda por personagem:
//  ┌─────────────────────────────────────────────────────────────────────────┐
//  │  • Fontes (--font-display, --font-body)                                │
//  │  • Letter-spacing, line-height                                         │
//  │  • Border-radius (elementos arredondados vs brutais vs etéreos)        │
//  │  • Animações de entrada (fade, glitch, slide, bloom)                   │
//  │  • Efeito de hover nos cards                                           │
//  │  • Cursor customizado                                                  │
//  │  • Textura de fundo (noise, scanlines, grain, vazio)                  │
//  │  • Modo do player (layout compacto ou expandido)                       │
//  │  • Classe temática no <body> para overrides CSS específicos            │
//  └─────────────────────────────────────────────────────────────────────────┘
//
//  COMO USAR:
//    1. Adicione este script no index.html DEPOIS do character-theme.js:
//       <script src="js/character-design-system.js"></script>
//
//    2. Em app.js, após _charApplyTheme(char), chame:
//       if (window.CharDesign) window.CharDesign.apply(char.id);
//
//    3. Adicione o CSS companion no index.html:
//       <link rel="stylesheet" href="css/character-design-system.css">
//
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── GOOGLE FONTS necessárias por personagem ─────────────────────────────
  // Carregadas sob demanda na primeira ativação de cada personagem.
  const FONT_URLS = {
    trace: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Mono:wght@300;400;500&display=swap',
    od:    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&display=swap',
    dusk:  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap',
    ember: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,400;0,700;1,400;1,700&family=Chakra+Petch:wght@400;600&display=swap',
    lyra:  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500&display=swap',
  };

  const _loadedFonts = new Set();

  function _loadFont(charId) {
    if (_loadedFonts.has(charId) || !FONT_URLS[charId]) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = FONT_URLS[charId];
    document.head.appendChild(link);
    _loadedFonts.add(charId);
  }

  // ── DEFINIÇÕES DE DESIGN POR PERSONAGEM ─────────────────────────────────

  const DESIGNS = {

    // ╔═══════════════════════════════════════════════════════╗
    // ║  TRACE — O Silêncio que Grita                        ║
    // ║  Estética: minimalismo fantasma, vazio intencional,  ║
    // ║  tipografia monospace crua, zero ornamentação        ║
    // ╚═══════════════════════════════════════════════════════╝
    trace: {
      // Tipografia
      fontDisplay:    '"Space Mono", monospace',
      fontBody:       '"DM Mono", monospace',
      letterSpacing:  '0.08em',
      lineHeight:     '1.8',
      // Forma dos elementos
      radius:         '2px',      // quase brutalist — tudo quadrado
      radiusCard:     '4px',
      radiusBtn:      '2px',
      // Atmosfera
      backgroundNoise: 'none',
      backdropFilter: 'none',
      // Efeito de entrada das seções
      enterAnimation: 'trace-enter',
      // Classe temática no body
      bodyClass:      'theme-trace',
      // Cursor
      cursor:         'crosshair',
      // Efeito hover nos cards de música
      cardHoverEffect: 'underline-scan',
      // Texto de identidade (aparece como watermark)
      watermark:      'ECHO',
      // Intensidade do glow (0 = nenhum, 1 = máximo)
      glowIntensity:  0.3,
      // Player: compacto (menos elementos decorativos)
      playerStyle:    'minimal',
      // Divisores entre seções
      dividerStyle:   'single-line',
      // Descrição interna para debugging
      _desc: 'Minimalismo monospace. Silêncio visual. Cada pixel tem propósito.',
    },

    // ╔═══════════════════════════════════════════════════════╗
    // ║  OD — Overdrive Permanente                           ║
    // ║  Estética: agressivo, uppercase forçado, bordas      ║
    // ║  que queimam, glitch constante, verde que sangra     ║
    // ╚═══════════════════════════════════════════════════════╝
    od: {
      fontDisplay:    '"Bebas Neue", "Impact", sans-serif',
      fontBody:       '"Barlow Condensed", sans-serif',
      letterSpacing:  '0.12em',
      lineHeight:     '1.3',
      radius:         '0px',      // zero radius — tudo cortante
      radiusCard:     '0px',
      radiusBtn:      '0px',
      backgroundNoise: 'od-scanlines',
      backdropFilter: 'none',
      enterAnimation: 'od-enter',
      bodyClass:      'theme-od',
      cursor:         'crosshair',
      cardHoverEffect: 'border-burn',
      watermark:      'OD',
      glowIntensity:  1.0,
      playerStyle:    'aggressive',
      dividerStyle:   'double-line',
      _desc: 'Zero bordas. Verde que queima. Uppercase sempre. Sem piedade.',
    },

    // ╔═══════════════════════════════════════════════════════╗
    // ║  DUSK — O Mecânico do Abismo                         ║
    // ║  Estética: industrial, metálico enferrujado,         ║
    // ║  tipografia condensada pesada, vermelho como óxido   ║
    // ╚═══════════════════════════════════════════════════════╝
    dusk: {
      fontDisplay:    '"Rajdhani", sans-serif',
      fontBody:       '"Share Tech Mono", monospace',
      letterSpacing:  '0.05em',
      lineHeight:     '1.5',
      radius:         '1px',
      radiusCard:     '3px',
      radiusBtn:      '1px',
      backgroundNoise: 'dusk-grid',
      backdropFilter: 'none',
      enterAnimation: 'dusk-enter',
      bodyClass:      'theme-dusk',
      cursor:         'default',
      cardHoverEffect: 'plate-lift',
      watermark:      'DSK',
      glowIntensity:  0.6,
      playerStyle:    'industrial',
      dividerStyle:   'thick-rule',
      _desc: 'Metal, ferrugem, resistência. O ritmo é mecânico mas vivo.',
    },

    // ╔═══════════════════════════════════════════════════════╗
    // ║  EMBER — A Brasa que Nunca Apaga                     ║
    // ║  Estética: energia caótica mas quente, âmbar,        ║
    // ║  tudo pulsa, itálicos, urgência constante            ║
    // ╚═══════════════════════════════════════════════════════╝
    ember: {
      fontDisplay:    '"Chakra Petch", sans-serif',
      fontBody:       '"Exo 2", sans-serif',
      letterSpacing:  '0.04em',
      lineHeight:     '1.6',
      radius:         '6px',
      radiusCard:     '10px',
      radiusBtn:      '6px',
      backgroundNoise: 'ember-sparks',
      backdropFilter: 'none',
      enterAnimation: 'ember-enter',
      bodyClass:      'theme-ember',
      cursor:         'default',
      cardHoverEffect: 'spark-flare',
      watermark:      'EMB',
      glowIntensity:  0.85,
      playerStyle:    'energetic',
      dividerStyle:   'wave-line',
      _desc: 'Tudo pulsa. Calor âmbar. Urgência de quem toca como se fosse a última vez.',
    },

    // ╔═══════════════════════════════════════════════════════╗
    // ║  LYRA — A Constelação Interior                       ║
    // ║  Estética: etéreo, espaços generosos, serif          ║
    // ║  elegante, azul cósmico, tudo flutua                 ║
    // ╚═══════════════════════════════════════════════════════╝
    lyra: {
      fontDisplay:    '"Cormorant Garamond", serif',
      fontBody:       '"Outfit", sans-serif',
      letterSpacing:  '0.06em',
      lineHeight:     '1.9',
      radius:         '12px',
      radiusCard:     '16px',
      radiusBtn:      '24px',  // pill buttons
      backgroundNoise: 'lyra-stars',
      backdropFilter: 'blur(1px)',
      enterAnimation: 'lyra-enter',
      bodyClass:      'theme-lyra',
      cursor:         'default',
      cardHoverEffect: 'float-bloom',
      watermark:      'LYR',
      glowIntensity:  0.5,
      playerStyle:    'ethereal',
      dividerStyle:   'dotted-line',
      _desc: 'Etéreo. Amplo. Cada nota é uma estrela que você sente antes de ver.',
    },
  };

  // ── ESTADO ───────────────────────────────────────────────────────────────
  let _current    = null;
  let _styleEl    = null;    // <style> injetado dinamicamente
  let _wmarkEl    = null;    // elemento watermark
  let _prevClass  = null;

  // ── APLICAÇÃO DO DESIGN ──────────────────────────────────────────────────

  function apply(charId) {
    const design = DESIGNS[charId];
    if (!design) return;

    _loadFont(charId);
    _current = { id: charId, ...design };

    _applyRootVars(design);
    _applyBodyClass(design);
    _injectDynamicCSS(charId, design);
    _updateWatermark(design);
    _triggerEnterAnimation(design);

    console.log(`[CharDesign] Tema aplicado: ${charId} — ${design._desc}`);
  }

  // Aplica variáveis CSS no :root
  function _applyRootVars(d) {
    const root = document.documentElement;
    root.style.setProperty('--char-font-display',    d.fontDisplay);
    root.style.setProperty('--char-font-body',       d.fontBody);
    root.style.setProperty('--char-letter-spacing',  d.letterSpacing);
    root.style.setProperty('--char-line-height',     d.lineHeight);
    root.style.setProperty('--char-radius',          d.radius);
    root.style.setProperty('--char-radius-card',     d.radiusCard);
    root.style.setProperty('--char-radius-btn',      d.radiusBtn);
    root.style.setProperty('--char-glow-intensity',  d.glowIntensity);
    root.style.setProperty('--char-backdrop',        d.backdropFilter || 'none');
  }

  // Troca a classe temática no <body>
  function _applyBodyClass(d) {
    if (_prevClass) document.body.classList.remove(_prevClass);
    document.body.classList.add(d.bodyClass);
    _prevClass = d.bodyClass;
  }

  // Injeta CSS dinâmico específico do personagem
  function _injectDynamicCSS(charId, d) {
    if (!_styleEl) {
      _styleEl = document.createElement('style');
      _styleEl.id = 'char-design-dynamic';
      document.head.appendChild(_styleEl);
    }

    _styleEl.textContent = _buildDynamicCSS(charId, d);
  }

  // Constrói o bloco CSS dinâmico
  function _buildDynamicCSS(charId, d) {
    return `
/* ── CharDesign: ${charId} ── */

/* TIPOGRAFIA GLOBAL */
.logo-text,
.view-title,
.section-label,
.album-title,
.song-name,
.p-title,
.member-card__name,
.member-panel__name {
  font-family: var(--char-font-display) !important;
  letter-spacing: var(--char-letter-spacing) !important;
  transition: font-family 0.4s ease, letter-spacing 0.4s ease;
}

.nav-btn span,
.p-artist,
.song-artist,
.album-artist,
.member-card__role,
.member-panel__role,
.member-panel__lore,
.member-panel__fact-text,
.lyrics-block__text,
.about-text {
  font-family: var(--char-font-body) !important;
  line-height: var(--char-line-height) !important;
  transition: font-family 0.4s ease;
}

/* BORDER-RADIUS GLOBAL */
.song-row,
.album-card,
.member-card,
.p-bar,
.p-bar-fill,
.p-bar-thumb,
.nav-btn,
.p-icon-btn,
.eq-panel,
.about-panel,
.lyrics-panel,
.member-panel {
  border-radius: var(--char-radius-card) !important;
  transition: border-radius 0.4s ease;
}

.char-dropdown-btn,
button.primary-btn {
  border-radius: var(--char-radius-btn) !important;
  transition: border-radius 0.4s ease;
}

/* EFEITO DE HOVER POR PERSONAGEM */
${_buildHoverCSS(charId, d)}

/* TEXTURAS DE FUNDO */
${_buildTextureCSS(charId, d)}

/* ESTILOS DO PLAYER POR PERSONAGEM */
${_buildPlayerCSS(charId, d)}

/* DIVISORES */
${_buildDividerCSS(charId, d)}

/* ANIMAÇÃO DE ENTRADA */
${_buildEnterCSS(charId, d)}
    `.trim();
  }

  // ── CSS de hover por personagem ─────────────────────────────────────────
  function _buildHoverCSS(charId, d) {
    const effects = {
      // TRACE: linha de scan horizontal ao passar o mouse
      'underline-scan': `
        .song-row { position: relative; overflow: hidden; }
        .song-row::after {
          content: '';
          position: absolute;
          bottom: 0; left: -100%;
          width: 100%; height: 1px;
          background: var(--gold);
          transition: left 0.3s cubic-bezier(.4,0,.2,1);
          opacity: 0.7;
        }
        .song-row:hover::after { left: 0; }
        .album-card:hover { box-shadow: 0 0 0 1px var(--gold) !important; }
      `,
      // OD: borda que queima nas pontas
      'border-burn': `
        .song-row { transition: border-color 0.15s !important; }
        .song-row:hover {
          border-color: var(--gold) !important;
          box-shadow: inset 0 0 20px rgba(57,255,20,0.05) !important;
        }
        .album-card:hover {
          box-shadow: 4px 4px 0 var(--gold), -1px -1px 0 var(--gold2) !important;
          transform: translate(-2px, -2px) !important;
        }
      `,
      // DUSK: levanta como placa metálica
      'plate-lift': `
        .song-row:hover {
          transform: translateX(4px) !important;
          border-left: 2px solid var(--gold) !important;
          padding-left: calc(var(--padding-left, 12px) - 2px);
        }
        .album-card:hover {
          transform: translateY(-4px) skewX(-1deg) !important;
          box-shadow: 0 8px 0 var(--gold2) !important;
        }
      `,
      // EMBER: faísca radial
      'spark-flare': `
        .song-row:hover {
          background: radial-gradient(ellipse at left, var(--gold-dim) 0%, transparent 70%) !important;
          border-color: var(--gold) !important;
        }
        .album-card:hover {
          box-shadow: 0 0 30px var(--gold-dim), 0 0 8px var(--gold) !important;
          transform: scale(1.03) !important;
        }
      `,
      // LYRA: flutua e brilha suavemente
      'float-bloom': `
        .song-row { transition: transform 0.5s cubic-bezier(.34,1.56,.64,1), background 0.4s !important; }
        .song-row:hover {
          transform: translateY(-2px) !important;
          background: radial-gradient(ellipse at center, rgba(0,180,255,0.06) 0%, transparent 80%) !important;
        }
        .album-card:hover {
          transform: translateY(-6px) scale(1.01) !important;
          box-shadow: 0 20px 60px rgba(0,180,255,0.15) !important;
        }
      `,
    };

    return effects[d.cardHoverEffect] || '';
  }

  // ── CSS de texturas/backgrounds ────────────────────────────────────────
  function _buildTextureCSS(charId, d) {
    const textures = {
      none: '',

      // OD: scanlines CRT agressivas
      'od-scanlines': `
        body.theme-od::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 9999;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(57,255,20,0.015) 2px,
            rgba(57,255,20,0.015) 4px
          );
          mix-blend-mode: screen;
        }
      `,

      // DUSK: grid industrial tênue
      'dusk-grid': `
        body.theme-dusk::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 9999;
          background-image:
            linear-gradient(rgba(255,77,46,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,77,46,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 50%, transparent 100%);
        }
      `,

      // EMBER: partículas estáticas (CSS puro — pontos aleatórios)
      'ember-sparks': `
        body.theme-ember::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 9999;
          background-image:
            radial-gradient(circle, rgba(255,228,77,0.25) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,228,77,0.15) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,200,50,0.1) 1px, transparent 1px);
          background-size: 120px 120px, 80px 80px, 60px 60px;
          background-position: 0 0, 40px 40px, 20px 20px;
          animation: ember-drift 12s linear infinite;
          opacity: 0.4;
        }
        @keyframes ember-drift {
          from { background-position: 0 0, 40px 40px, 20px 20px; }
          to   { background-position: 0 120px, 40px 160px, 20px 80px; }
        }
      `,

      // LYRA: estrelas tênues
      'lyra-stars': `
        body.theme-lyra::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none; z-index: 9999;
          background-image:
            radial-gradient(circle, rgba(0,180,255,0.5) 1px, transparent 1px),
            radial-gradient(circle, rgba(0,180,255,0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(100,200,255,0.2) 1px, transparent 1px);
          background-size: 200px 200px, 150px 150px, 100px 100px;
          background-position: 10px 20px, 80px 60px, 150px 110px;
          animation: lyra-drift 20s ease-in-out infinite alternate;
          opacity: 0.35;
        }
        @keyframes lyra-drift {
          from { transform: translateY(0); }
          to   { transform: translateY(-10px); }
        }
      `,
    };

    return textures[d.backgroundNoise] || textures['none'];
  }

  // ── CSS do player por estilo ────────────────────────────────────────────
  function _buildPlayerCSS(charId, d) {
    const styles = {
      // TRACE: player minimalista, sem decoração
      minimal: `
        .player { border-top: 1px solid var(--border) !important; }
        .p-bar { height: 2px !important; }
        .p-bar-thumb { width: 6px !important; height: 6px !important; }
        #playBtn { box-shadow: none !important; }
        #playBtn:hover { box-shadow: 0 0 8px var(--gold) !important; }
      `,
      // OD: player máximo glow, bordas retas, tudo uppercase
      aggressive: `
        .player {
          border-top: 2px solid var(--gold) !important;
          box-shadow: 0 -4px 20px var(--gold-dim) !important;
        }
        .p-bar { height: 4px !important; border-radius: 0 !important; }
        .p-bar-fill { border-radius: 0 !important; }
        .p-bar-thumb { border-radius: 0 !important; width: 8px !important; height: 16px !important; top: -6px !important; }
        #playBtn {
          border-radius: 0 !important;
          box-shadow: 3px 3px 0 var(--gold2) !important;
        }
        #playBtn:hover {
          transform: translate(-2px, -2px) !important;
          box-shadow: 5px 5px 0 var(--gold2) !important;
        }
        .p-title { text-transform: uppercase !important; }
      `,
      // DUSK: player mecânico, groove pesado
      industrial: `
        .player {
          border-top: 2px solid var(--border) !important;
          border-image: linear-gradient(90deg, transparent, var(--gold), transparent) 1 !important;
        }
        .p-bar { height: 3px !important; border-radius: 1px !important; }
        #playBtn { border: 1px solid var(--gold) !important; }
        .p-icon-btn { letter-spacing: 0 !important; }
      `,
      // EMBER: player com calor, pulsação, energia
      energetic: `
        .player {
          border-top: 1px solid var(--gold) !important;
          box-shadow: 0 -2px 30px rgba(255,228,77,0.1) !important;
        }
        .p-bar { height: 4px !important; border-radius: 4px !important; }
        .p-bar-fill {
          background: linear-gradient(90deg, var(--gold2), var(--gold)) !important;
          box-shadow: 0 0 8px var(--gold) !important;
        }
        #playBtn { box-shadow: 0 0 20px var(--gold-dim) !important; }
        #playBtn:hover { box-shadow: 0 0 30px var(--gold) !important; }
      `,
      // LYRA: player etéreo, fluido, silencioso
      ethereal: `
        .player {
          border-top: 1px solid rgba(0,180,255,0.1) !important;
          background: linear-gradient(to top, rgba(0,180,255,0.04), transparent) !important;
        }
        .p-bar { height: 2px !important; border-radius: 2px !important; }
        .p-bar-thumb {
          width: 10px !important; height: 10px !important;
          border-radius: 50% !important;
          box-shadow: 0 0 8px var(--gold) !important;
        }
        #playBtn {
          border-radius: 50% !important;
          box-shadow: 0 0 20px var(--gold-dim), 0 0 40px rgba(0,180,255,0.1) !important;
        }
      `,
    };

    return styles[d.playerStyle] || '';
  }

  // ── CSS dos divisores ───────────────────────────────────────────────────
  function _buildDividerCSS(charId, d) {
    const dividers = {
      'single-line': `
        .section-divider { border: none !important; border-top: 1px solid var(--border) !important; }
      `,
      'double-line': `
        .section-divider {
          border: none !important;
          border-top: 1px solid var(--gold) !important;
          position: relative;
        }
        .section-divider::after {
          content: '';
          display: block;
          height: 1px;
          background: var(--gold2);
          margin-top: 3px;
          opacity: 0.3;
        }
      `,
      'thick-rule': `
        .section-divider {
          border: none !important;
          border-top: 2px solid var(--border) !important;
          box-shadow: 0 1px 0 rgba(255,77,46,0.15) !important;
        }
      `,
      'wave-line': `
        .section-divider {
          border: none !important;
          height: 6px !important;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='6'%3E%3Cpath d='M0 3 Q5 0 10 3 Q15 6 20 3' stroke='rgba(255,228,77,0.3)' fill='none' stroke-width='1'/%3E%3C/svg%3E") repeat-x center !important;
        }
      `,
      'dotted-line': `
        .section-divider {
          border: none !important;
          border-top: 1px dotted rgba(0,180,255,0.3) !important;
        }
      `,
    };

    return dividers[d.dividerStyle] || '';
  }

  // ── CSS de animação de entrada ──────────────────────────────────────────
  function _buildEnterCSS(charId, d) {
    const anims = {
      // TRACE: fade in lento, como memória
      'trace-enter': `
        @keyframes trace-enter {
          from { opacity: 0; filter: blur(4px); }
          to   { opacity: 1; filter: blur(0); }
        }
        .char-design-enter { animation: trace-enter 0.6s ease forwards; }
      `,
      // OD: glitch de entrada
      'od-enter': `
        @keyframes od-enter {
          0%   { opacity: 0; transform: translateX(-8px) scaleX(1.02); filter: brightness(2); }
          20%  { opacity: 1; transform: translateX(3px) scaleX(0.99); }
          40%  { transform: translateX(-2px); }
          60%  { transform: translateX(1px); }
          100% { opacity: 1; transform: translateX(0) scaleX(1); filter: brightness(1); }
        }
        .char-design-enter { animation: od-enter 0.4s cubic-bezier(.4,0,.2,1) forwards; }
      `,
      // DUSK: desliza de baixo, pesado
      'dusk-enter': `
        @keyframes dusk-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .char-design-enter { animation: dusk-enter 0.5s cubic-bezier(.22,1,.36,1) forwards; }
      `,
      // EMBER: irrompe do centro
      'ember-enter': `
        @keyframes ember-enter {
          0%   { opacity: 0; transform: scale(0.96); filter: brightness(1.5) saturate(2); }
          60%  { opacity: 1; transform: scale(1.01); filter: brightness(1.1) saturate(1.2); }
          100% { opacity: 1; transform: scale(1); filter: brightness(1) saturate(1); }
        }
        .char-design-enter { animation: ember-enter 0.5s ease forwards; }
      `,
      // LYRA: flutua suavemente para dentro
      'lyra-enter': `
        @keyframes lyra-enter {
          from { opacity: 0; transform: translateY(-6px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .char-design-enter { animation: lyra-enter 0.7s cubic-bezier(.34,1.56,.64,1) forwards; }
      `,
    };

    return anims[d.enterAnimation] || '';
  }

  // ── WATERMARK ───────────────────────────────────────────────────────────
  function _updateWatermark(d) {
    if (!_wmarkEl) {
      _wmarkEl = document.createElement('div');
      _wmarkEl.id = 'char-watermark';
      document.body.appendChild(_wmarkEl);
    }

    _wmarkEl.textContent = d.watermark;

    // Aplica estilo inline por personagem
    Object.assign(_wmarkEl.style, {
      position:       'fixed',
      bottom:         '-20px',
      right:          '-10px',
      fontFamily:     d.fontDisplay,
      fontSize:       'clamp(60px, 12vw, 120px)',
      fontWeight:     '900',
      letterSpacing:  '-0.04em',
      color:          'var(--gold)',
      opacity:        '0.025',
      pointerEvents:  'none',
      userSelect:     'none',
      zIndex:         '0',
      lineHeight:     '1',
      transition:     'all 0.6s ease',
      textTransform:  'uppercase',
    });
  }

  // ── ANIMAÇÃO DE ENTRADA NAS VIEWS ───────────────────────────────────────
  // Chamado pelo app.js quando uma nova view é mostrada
  function triggerEnter(elements) {
    if (!_current) return;
    const els = elements || document.querySelectorAll('.view.active > *');
    els.forEach((el, i) => {
      el.classList.remove('char-design-enter');
      void el.offsetWidth; // force reflow
      el.style.animationDelay = `${i * 0.04}s`;
      el.classList.add('char-design-enter');
    });
  }

  function _triggerEnterAnimation(d) {
    const activeView = document.querySelector('.view.active');
    if (!activeView) return;
    const children = activeView.children;
    Array.from(children).forEach((el, i) => {
      el.classList.remove('char-design-enter');
      void el.offsetWidth;
      el.style.animationDelay = `${i * 0.05}s`;
      el.classList.add('char-design-enter');
    });
  }

  // ── UTILITÁRIOS PÚBLICOS ─────────────────────────────────────────────────

  function getCurrent() { return _current; }
  function getDesign(charId) { return DESIGNS[charId] || null; }

  // ── HOOK: integração com o sistema existente de personagem ───────────────
  // Se o onThemeChange do character-theme.js estiver disponível, registra aqui.
  // Caso contrário, o app.js deve chamar window.CharDesign.apply(char.id) manualmente.
  function _hookIntoExistingSystem() {
    // Tenta conectar ao módulo de tema existente
    if (window._charOnThemeChange) {
      window._charOnThemeChange(char => apply(char.id));
    }
  }

  // ── EXPORTA API GLOBAL ───────────────────────────────────────────────────
  window.CharDesign = {
    apply,
    triggerEnter,
    getCurrent,
    getDesign,
    DESIGNS,
  };

  // Aplica o personagem padrão (Trace) ao carregar
  document.addEventListener('DOMContentLoaded', () => {
    // Tenta ler o personagem salvo
    let savedId = 'trace';
    try { savedId = localStorage.getItem('echodome_character') || 'trace'; } catch (_) {}
    apply(savedId);
  });

})();
