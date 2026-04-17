/* ═══════════════════════════════════════════════════
   gallery-nav.js — EchoDome
   Patch de navegação para o lightbox da galeria.

   Sobrescreve openGalleryLightbox() e adiciona:
   • Botões ← → com fade entre imagens
   • Contador "3 / 18"
   • Título da foto (campo `title` do galleryPhotos)
   • Teclado: ← → para navegar, Esc para fechar
   • Swipe no mobile (toque esquerda / direita)

   Insira APÓS gallery.js e APÓS o app.js no index.html.
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Referências ao DOM ─────────────────────────── */
  const lb      = document.getElementById('galleryLightbox');
  const lbImg   = document.getElementById('galleryLightboxImg');
  const lbTitle = document.getElementById('galleryLightboxTitle');
  const lbCap   = document.getElementById('galleryLightboxCaption');
  const lbCtr   = document.getElementById('galleryLightboxCounter');

  /* ── Estado ─────────────────────────────────────── */
  let _list  = [];   // array de fotos visível no momento (filtrado ou completo)
  let _index = 0;

  /* ── Render interno ─────────────────────────────── */
  function _render(idx, animate) {
    const photo = _list[idx];
    if (!photo) return;

    if (animate) {
      lbImg.classList.add('lb-fade');
      setTimeout(() => {
        _setContent(photo, idx);
        lbImg.classList.remove('lb-fade');
      }, 170);
    } else {
      _setContent(photo, idx);
    }
  }

  function _setContent(photo, idx) {
    lbImg.src          = photo.src  || '';
    lbImg.alt          = photo.alt  || '';
    lbTitle.textContent = photo.title   || photo.alt || '';
    lbCap.textContent  = photo.caption || '';
    lbCtr.textContent  = `${idx + 1} / ${_list.length}`;

    /* mostra / esconde título se vazio */
    lbTitle.style.display = lbTitle.textContent ? '' : 'none';
  }

  /* ── API pública ─────────────────────────────────── */

  /**
   * Abre o lightbox.
   * @param {object[]} photos  — array de galleryPhotos (filtrado ou completo)
   * @param {number}   index   — índice clicado
   */
  window.openGalleryLightbox = function (photos, index) {
    _list  = Array.isArray(photos) ? photos : (window.galleryPhotos || []);
    _index = typeof index === 'number' ? index : 0;

    _render(_index, false);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeGalleryLightbox = function () {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.galleryLightboxNav = function (dir) {
    _index = (_index + dir + _list.length) % _list.length;
    _render(_index, true);
  };

  /* ── Teclado ─────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  window.galleryLightboxNav(-1);
    if (e.key === 'ArrowRight') window.galleryLightboxNav(1);
    if (e.key === 'Escape')     window.closeGalleryLightbox();
  });

  /* ── Swipe mobile ────────────────────────────────── */
  let _touchX = null;
  lb.addEventListener('touchstart', (e) => { _touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (_touchX === null) return;
    const dx = e.changedTouches[0].clientX - _touchX;
    _touchX = null;
    if (Math.abs(dx) < 40) return;
    window.galleryLightboxNav(dx < 0 ? 1 : -1);
  });

  /* ── Compatibilidade retroativa ──────────────────── */
  // Se o app.js antigo chamar openGalleryLightbox(src, caption)
  // (assinatura antiga com strings em vez de array),
  // convertemos para o novo formato automaticamente.
  const _orig = window.openGalleryLightbox;
  window.openGalleryLightbox = function (photosOrSrc, indexOrCaption) {
    if (typeof photosOrSrc === 'string') {
      /* chamada antiga: openGalleryLightbox(src, caption) */
      const all = window.galleryPhotos || [];
      const idx = all.findIndex(p => p.src === photosOrSrc);
      _orig(all, idx >= 0 ? idx : 0);
    } else {
      _orig(photosOrSrc, indexOrCaption);
    }
  };

})();
