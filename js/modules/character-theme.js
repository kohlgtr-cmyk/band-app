// js/modules/character-theme.js
// Seletor de personagem com troca de tema dinâmica — EchoDome

/* ===================== SVG DOS INSTRUMENTOS ===================== */

const INSTRUMENT_ICONS = {

  // Microfone — Trace (Vocalista)
  trace: (color, size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="9" y="2" width="6" height="11" rx="3" fill="${color}"/>
      <path d="M5 11a7 7 0 0 0 14 0" stroke="${color}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="9"  y1="22" x2="15" y2="22" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

  // Guitarra elétrica — OD (Guitarrista)
  od: (color, size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14.5 2.5 L17 5 L8 14 C7 15.8 5.5 16.5 4 16 C3.5 17.5 4.5 19 6 18.5 C5.5 20 7 21 8.5 20.5 C8 19 9.2 17.5 11 17 L20 8 L21.5 9.5 L22 6 Z"
            stroke="${color}" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      <circle cx="7.5" cy="17.5" r="1.5" fill="${color}"/>
      <line x1="14.5" y1="2.5" x2="17"   y2="5"   stroke="${color}" stroke-width="1.5"/>
      <line x1="16"   y1="4"   x2="18.5" y2="6.5" stroke="${color}" stroke-width="1.2" stroke-dasharray="1.5 1.5"/>
    </svg>`,

  // Baixo — Dusk (Baixista)
  dusk: (color, size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 2 L16 5 L9 12 C7.5 14 6 14.8 4.5 14.3 C4 16 5 17.5 6.5 17 C6 18.8 7.5 20 9 19.5 C8.5 18 9.5 16.5 11.5 16 L19 8.5 L20 10 L21 6 Z"
            stroke="${color}" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      <circle cx="7" cy="17" r="2" fill="none" stroke="${color}" stroke-width="1.4"/>
      <line x1="13" y1="2"   x2="16" y2="5"   stroke="${color}" stroke-width="1.6"/>
      <line x1="15" y1="3.5" x2="17" y2="5.5" stroke="${color}" stroke-width="1.2" stroke-dasharray="1.2 1.2"/>
      <line x1="14" y1="2.5" x2="16" y2="4.5" stroke="${color}" stroke-width="1"   stroke-dasharray="1 1.5" stroke-dashoffset="1"/>
    </svg>`,

  // Bateria — Ember (Baterista)
  ember: (color, size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="7"   ry="4"   stroke="${color}" stroke-width="1.6" fill="none"/>
      <ellipse cx="6"  cy="11" rx="3.5" ry="2"   stroke="${color}" stroke-width="1.4" fill="none"/>
      <ellipse cx="18" cy="11" rx="3.5" ry="2"   stroke="${color}" stroke-width="1.4" fill="none"/>
      <line x1="6"  y1="9"  x2="6"  y2="13" stroke="${color}" stroke-width="1.3"/>
      <line x1="18" y1="9"  x2="18" y2="13" stroke="${color}" stroke-width="1.3"/>
      <line x1="9"  y1="6"  x2="7"  y2="10" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="15" y1="6"  x2="17" y2="10" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="9"  cy="5.5" r="1" fill="${color}"/>
      <circle cx="15" cy="5.5" r="1" fill="${color}"/>
    </svg>`,

  // Teclado — Lyra (Tecladista)
  lyra: (color, size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="8" width="20" height="12" rx="1.5" stroke="${color}" stroke-width="1.6" fill="none"/>
      <line x1="2" y1="14" x2="22" y2="14" stroke="${color}" stroke-width="1" opacity="0.45"/>
      <rect x="5"    y="8" width="2.2" height="7" rx="0.8" fill="${color}"/>
      <rect x="9.4"  y="8" width="2.2" height="7" rx="0.8" fill="${color}"/>
      <rect x="14"   y="8" width="2.2" height="7" rx="0.8" fill="${color}"/>
      <rect x="18.4" y="8" width="2.2" height="7" rx="0.8" fill="${color}"/>
    </svg>`,
};

/* ===================== PERSONAGENS ===================== */

export const CHARACTERS = [
  {
    id: 'trace',
    name: 'Trace',
    role: 'Vocalista',
    accent: '#e8e8ff',
    accent2: '#c8c8ff',
    glow: 'rgba(232,232,255,0.15)',
    glowStrong: 'rgba(232,232,255,0.4)',
    border: 'rgba(232,232,255,0.2)',
    avatarBg: '#0f0f1e',
  },
  {
    id: 'od',
    name: 'OD',
    role: 'Guitarrista',
    accent: '#39ff14',
    accent2: '#2acc0f',
    glow: 'rgba(57,255,20,0.15)',
    glowStrong: 'rgba(57,255,20,0.4)',
    border: 'rgba(57,255,20,0.2)',
    avatarBg: '#061a03',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    role: 'Baixista',
    accent: '#ff4d2e',
    accent2: '#cc3318',
    glow: 'rgba(255,77,46,0.15)',
    glowStrong: 'rgba(255,77,46,0.4)',
    border: 'rgba(255,77,46,0.2)',
    avatarBg: '#1a0803',
  },
  {
    id: 'ember',
    name: 'Ember',
    role: 'Baterista',
    accent: '#ffe44d',
    accent2: '#ccb533',
    glow: 'rgba(255,228,77,0.15)',
    glowStrong: 'rgba(255,228,77,0.4)',
    border: 'rgba(255,228,77,0.2)',
    avatarBg: '#1a1703',
  },
  {
    id: 'lyra',
    name: 'Lyra',
    role: 'Tecladista',
    accent: '#00b4ff',
    accent2: '#007acc',
    glow: 'rgba(0,180,255,0.15)',
    glowStrong: 'rgba(0,180,255,0.4)',
    border: 'rgba(0,180,255,0.2)',
    avatarBg: '#03111a',
  },
];

/* ===================== ESTADO & API ===================== */

let _current   = CHARACTERS[0];
let _listeners = [];

/** Retorna o personagem ativo */
export function getCurrentCharacter() {
  return _current;
}

/** Registra callback chamado em cada troca de tema — fn(character) */
export function onThemeChange(fn) {
  _listeners.push(fn);
}

/**
 * Aplica o tema de um personagem no :root via CSS variables.
 * Sobrescreve --gold, --gold2, --gold-dim e --border do style.css existente.
 */
export function applyCharacterTheme(char) {
  _current = char;

  const root = document.documentElement;
  root.style.setProperty('--gold',     char.accent);
  root.style.setProperty('--gold2',    char.accent2);
  root.style.setProperty('--gold-dim', char.glow);
  root.style.setProperty('--border',   char.border);

  try { localStorage.setItem('echodome_character', char.id); } catch (_) {}

  _listeners.forEach(fn => fn(char));
}

/**
 * Monta e injeta o seletor de personagem dentro de `container`.
 * @param {HTMLElement} container - ex: document.querySelector('.topbar')
 */
export function mountCharacterPicker(container) {
  const saved   = _getSaved();
  const initial = CHARACTERS.find(c => c.id === saved) || CHARACTERS[0];

  const wrapper = document.createElement('div');
  wrapper.className = 'char-picker';
  wrapper.id        = 'charPicker';

  wrapper.innerHTML = `
    <span class="char-picker-label">Personagem</span>
    <button type="button" class="char-dropdown-btn" id="charDropdownBtn"
            aria-haspopup="listbox" aria-expanded="false">
      <div class="char-btn-icon" id="charBtnIcon"></div>
      <span class="char-btn-name" id="charBtnName">${initial.name}</span>
      <svg class="char-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>
    <div class="char-menu" id="charMenu" role="listbox" aria-label="Selecionar personagem">
      <div class="char-menu-header">// A Banda</div>
    </div>
  `;

  container.appendChild(wrapper);

  _buildMenuItems(initial);
  applyCharacterTheme(initial);
  _updateButton(initial);

  document.getElementById('charDropdownBtn').addEventListener('click', e => {
    e.stopPropagation();
    _togglePicker();
  });

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) _closePicker();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') _closePicker();
  });
}

/* ===================== INTERNOS ===================== */

function _buildMenuItems(selected) {
  const menu = document.getElementById('charMenu');
  const hdr  = menu.querySelector('.char-menu-header');
  menu.innerHTML = '';
  menu.appendChild(hdr);

  CHARACTERS.forEach(char => {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'char-option' + (char.id === selected.id ? ' selected' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', char.id === selected.id ? 'true' : 'false');
    btn.dataset.charId = char.id;
    btn.style.setProperty('--opt-glow', char.glow);

    btn.innerHTML = `
      <div class="char-opt-icon" style="background:${char.avatarBg};border:1px solid ${char.border}">
        ${INSTRUMENT_ICONS[char.id](char.accent, 22)}
      </div>
      <div class="char-opt-info">
        <div class="char-opt-name" style="color:${char.accent}">${char.name}</div>
        <div class="char-opt-role">${char.role}</div>
      </div>
      <div class="char-opt-dot" style="background:${char.accent};box-shadow:0 0 5px ${char.accent}"></div>
    `;

    btn.addEventListener('click', () => {
      applyCharacterTheme(char);
      _updateButton(char);
      _buildMenuItems(char);
      _closePicker();
    });

    menu.appendChild(btn);
  });
}

function _updateButton(char) {
  const icon = document.getElementById('charBtnIcon');
  const name = document.getElementById('charBtnName');
  if (!icon || !name) return;

  icon.innerHTML        = INSTRUMENT_ICONS[char.id](char.accent, 18);
  icon.style.background = char.avatarBg;
  icon.style.border     = `1px solid ${char.border}`;
  name.textContent      = char.name;
  name.style.color      = char.accent;
}

function _togglePicker() {
  const picker = document.getElementById('charPicker');
  const btn    = document.getElementById('charDropdownBtn');
  const isOpen = picker.classList.contains('open');
  picker.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function _closePicker() {
  const picker = document.getElementById('charPicker');
  const btn    = document.getElementById('charDropdownBtn');
  if (!picker) return;
  picker.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
}

function _getSaved() {
  try { return localStorage.getItem('echodome_character'); } catch (_) { return null; }
}

/* Exporta os ícones para outros módulos usarem (visualizer, cards de álbum, etc.) */
export { INSTRUMENT_ICONS };
