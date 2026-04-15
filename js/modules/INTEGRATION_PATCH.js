// ═══════════════════════════════════════════════════════════════════════════
// PATCH DE INTEGRAÇÃO — character-design-system no app.js existente
// ═══════════════════════════════════════════════════════════════════════════
//
// Cole esses trechos nos locais indicados do seu app.js.
// NÃO substitua o arquivo inteiro — apenas adicione/modifique onde indicado.
//
// ═══════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════
// PASSO 1 — No index.html, adicione ANTES do </head>:
// ══════════════════════════════════════════════════════
/*
  <link rel="stylesheet" href="css/character-design-system.css">
*/
// E ANTES do </body>, depois dos outros scripts:
/*
  <script src="js/character-design-system.js"></script>
*/


// ══════════════════════════════════════════════════════
// PASSO 2 — Em app.js, encontre a função _charApplyTheme
// e adicione a chamada ao CharDesign ao final dela:
// ══════════════════════════════════════════════════════

// ANTES (trecho existente no seu app.js):
function _charApplyTheme_ORIGINAL(char) {
  const root    = document.documentElement;
  const sidebar = document.getElementById('sidebar');

  root.style.setProperty('--gold',     char.accent);
  root.style.setProperty('--gold2',    char.accent2);
  root.style.setProperty('--gold-dim', char.glow);
  root.style.setProperty('--border',   char.border);

  // ... resto da função ...
}

// DEPOIS — adicione esta linha no FINAL de _charApplyTheme, antes do fechamento }:
//
//   // Aplica sistema de design completo (tipografia, radius, texturas, etc.)
//   if (window.CharDesign) window.CharDesign.apply(char.id);
//


// ══════════════════════════════════════════════════════
// PASSO 3 — Em app.js, encontre a função showView
// e adicione trigger de animação de entrada:
// ══════════════════════════════════════════════════════

// No final de showView(), após a view ser exibida, adicione:
//
//   // Anima entrada da nova view com o estilo do personagem ativo
//   if (window.CharDesign) {
//     requestAnimationFrame(() => window.CharDesign.triggerEnter());
//   }
//


// ══════════════════════════════════════════════════════
// PASSO 4 (OPCIONAL) — Glitch no logo para OD
// ══════════════════════════════════════════════════════
// Se quiser o efeito de glitch no logo quando OD está ativo e música toca,
// adicione ao _charApplyTheme:
//
//   const logoEl = document.querySelector('.logo-text');
//   if (logoEl) {
//     logoEl.classList.toggle('glitch-active', char.id === 'od');
//   }
//


// ══════════════════════════════════════════════════════
// RESUMO DO QUE CADA PERSONAGEM FAZ NO DESIGN:
// ══════════════════════════════════════════════════════
/*
  TRACE  → Space Mono monospace · zero radius · scanlines suaves · watermark "ECHO"
           Tudo quadrado, branco fantasma, silêncio visual absoluto.

  OD     → Bebas Neue uppercase · zero radius · scanlines CRT verdes · watermark "OD"
           Agressivo, sem bordas arredondadas, glitch no logo, cartas que "saltam".

  DUSK   → Rajdhani condensado · radius mínimo · grid industrial tênue · watermark "DSK"
           Metal enferrujado, vermelho oxidado, barra lateral técnica.

  EMBER  → Chakra Petch · radius médio · partículas âmbar animadas · watermark "EMB"
           Pulsação constante, calor, itálicos, músicas pulsam enquanto tocam.

  LYRA   → Cormorant Garamond serif itálico · radius grande/pill · estrelas sutis · watermark "LYR"
           Etéreo, espaçoso, serifado elegante, botões em pílula, flutuação suave.
*/
