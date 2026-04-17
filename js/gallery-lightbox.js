/* ═══════════════════════════════════════════════
   GALLERY LIGHTBOX + FILTER
   ═══════════════════════════════════════════════
   Depende de: gallery.js (galleryPhotos array)
   Insira após gallery.js no HTML.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── 1. Injetar HTML do lightbox ─────────────────── */
  const lbHTML = `
    <div id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visualizador de imagem">
      <div class="lb-container">
        <button id="lb-close" aria-label="Fechar">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="lb-counter" id="lb-counter"></span>

        <button class="lb-btn" id="lb-prev" aria-label="Anterior">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="lb-image-wrap">
          <img id="lb-img" src="" alt="" />
          <div class="lb-info">
            <p class="lb-title" id="lb-title"></p>
            <p class="lb-caption" id="lb-caption"></p>
          </div>
        </div>

        <button class="lb-btn" id="lb-next" aria-label="Próxima">
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', lbHTML);

  /* ─── 2. Referências ───────────────────────────────── */
  const lb       = document.getElementById('gallery-lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbTitle  = document.getElementById('lb-title');
  const lbCap    = document.getElementById('lb-caption');
  const lbCtr    = document.getElementById('lb-counter');
  const btnClose = document.getElementById('lb-close');
  const btnPrev  = document.getElementById('lb-prev');
  const btnNext  = document.getElementById('lb-next');

  /* ─── 3. Estado ────────────────────────────────────── */
  let currentList  = [];   // fotos da categoria atual (ou todas)
  let currentIndex = 0;

  /* ─── 4. Abrir / fechar ────────────────────────────── */
  function openLightbox(photos, index) {
    currentList  = photos;
    currentIndex = index;
    render();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function render() {
    const photo = currentList[currentIndex];
    if (!photo) return;

    /* troca com micro-fade */
    lbImg.style.opacity = '0';
    lbImg.style.transform = 'scale(0.97)';
    lbImg.style.transition = 'opacity 0.18s, transform 0.18s';

    setTimeout(() => {
      lbImg.src = photo.src;
      lbImg.alt = photo.alt || '';
      lbTitle.textContent  = photo.title   || photo.alt || '';
      lbCap.textContent    = photo.caption || '';
      lbCtr.textContent    = `${currentIndex + 1} / ${currentList.length}`;

      lbImg.style.opacity   = '1';
      lbImg.style.transform = 'scale(1)';
    }, 180);
  }

  function prev() {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    render();
  }

  function next() {
    currentIndex = (currentIndex + 1) % currentList.length;
    render();
  }

  /* ─── 5. Eventos do lightbox ───────────────────────── */
  btnClose.addEventListener('click', closeLightbox);
  btnPrev .addEventListener('click', prev);
  btnNext .addEventListener('click', next);

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     closeLightbox();
  });

  /* ─── 6. Montar galeria com filtros ────────────────── */
  const ORDER = ['album', 'single', 'estudio', 'arte', 'show'];
  const LABELS = {
    album:   'Álbum',
    single:  'Singles',
    estudio: 'Estúdio',
    arte:    'Arte',
    show:    'Show',
  };

  function buildGallery() {
    const container = document.querySelector('.gallery-container, #gallery, .gallery, [data-gallery]');
    if (!container) {
      console.warn('[Gallery] Nenhum container encontrado. Adicione class="gallery-container" ao seu elemento.');
      return;
    }

    /* agrupar por tipo */
    const groups = {};
    ORDER.forEach(t => { groups[t] = []; });
    galleryPhotos.forEach(p => {
      const t = p.type || 'estudio';
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    });

    /* filtros */
    const filterBar = document.createElement('div');
    filterBar.className = 'gallery-filters';

    const allPhotos = ORDER.flatMap(t => groups[t]);

    /* botão "Todos" */
    const allBtn = document.createElement('button');
    allBtn.className = 'gallery-filter-btn active';
    allBtn.textContent = 'Todos';
    allBtn.dataset.filter = 'all';
    filterBar.appendChild(allBtn);

    ORDER.forEach(type => {
      if (!groups[type].length) return;
      const btn = document.createElement('button');
      btn.className = 'gallery-filter-btn';
      btn.textContent = LABELS[type];
      btn.dataset.filter = type;
      filterBar.appendChild(btn);
    });

    container.insertAdjacentElement('beforebegin', filterBar);

    /* grid de imagens */
    container.innerHTML = '';
    let visiblePhotos = allPhotos;

    function renderGrid(photos) {
      container.innerHTML = '';
      photos.forEach((photo, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item' + (photo.featured ? ' gallery-item--featured' : '');
        item.dataset.type = photo.type || 'estudio';

        const img = document.createElement('img');
        img.src     = photo.src;
        img.alt     = photo.alt || '';
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'gallery-item__overlay';
        overlay.innerHTML = `
          <span class="gallery-item__title">${photo.title || photo.alt || ''}</span>
          <span class="gallery-item__caption">${photo.caption || ''}</span>`;

        item.appendChild(img);
        item.appendChild(overlay);

        item.addEventListener('click', () => {
          openLightbox(photos, idx);
        });

        container.appendChild(item);
      });
    }

    renderGrid(visiblePhotos);

    /* filtro click */
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.filter;
      visiblePhotos = f === 'all' ? allPhotos : groups[f];
      renderGrid(visiblePhotos);
    });
  }

  /* Aguarda DOM pronto */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGallery);
  } else {
    buildGallery();
  }

})();