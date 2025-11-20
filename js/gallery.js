// gallery.js
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('portfolioGrid');
  const filters = document.getElementById('portfolioFilters');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

  /* ---------------- lazy load ---------------- */
  const lazyImgs = Array.from(document.querySelectorAll('img.lazy'));
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "120px 0px" });

    lazyImgs.forEach(i => obs.observe(i));
  } else {
    // fallback: load all
    lazyImgs.forEach(i => { i.src = i.dataset.src; i.classList.remove('lazy'); });
  }

  /* ---------------- filters ---------------- */
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;

    // active class
    filterButtons.forEach(b => b.classList.toggle('active', b === btn));

    // show/hide
    const items = Array.from(grid.querySelectorAll('.portfolio-item'));
    items.forEach(it => {
      const cat = it.dataset.category || 'all';
      if (filter === 'all' || cat === filter) {
        it.style.display = ''; // show
      } else {
        it.style.display = 'none'; // hide
      }
    });
  });

  /* ---------------- lightbox ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lightboxImage');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');

  let currentIndex = -1;
  function openLightbox(index) {
    const items = visibleItems();
    if (!items.length) return;
    currentIndex = index;
    const img = items[currentIndex].querySelector('img');
    lbImage.src = img.src || img.dataset.src;
    lbImage.alt = img.alt || '';
    lbCaption.textContent = img.alt || '';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
    document.body.style.overflow = '';
  }
  function visibleItems() {
    return Array.from(grid.querySelectorAll('.portfolio-item'))
      .filter(it => it.style.display !== 'none');
  }

  // Open on click
  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    const items = visibleItems();
    const index = items.indexOf(item);
    if (index >= 0) openLightbox(index);
  });

  // controls
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lbPrev.addEventListener('click', () => {
    const items = visibleItems();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    openLightbox(currentIndex);
  });
  lbNext.addEventListener('click', () => {
    const items = visibleItems();
    currentIndex = (currentIndex + 1) % items.length;
    openLightbox(currentIndex);
  });

  // keyboard nav
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrev.click();
      if (e.key === 'ArrowRight') lbNext.click();
    }
  });

  /* ---------------- dynamic load helper (S3) ----------------
    Example: if you maintain a JSON manifest in S3 listing images and categories,
    you can call `loadFromS3('https://.../manifest.json')` to populate the grid.

    manifest.json example:
    [
      {"url":"https://.../retratos1.jpg","category":"retratos","alt":"Retrato 1"},
      {"url":"https://.../casamento1.jpg","category":"casamentos","alt":"Casamento"}
    ]
  -----------------------------------------------------------*/
  async function loadFromS3(manifestUrl) {
    try {
      const res = await fetch(manifestUrl);
      if (!res.ok) throw new Error('Manifest fetch failed');
      const list = await res.json();
      // clear existing dynamic items (keep static ones if you want)
      // grid.innerHTML = '';
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.dataset.category = item.category || 'all';
        const img = document.createElement('img');
        img.dataset.src = item.url; // lazy loader will pick this up
        img.alt = item.alt || '';
        img.className = 'lazy';
        div.appendChild(img);
        grid.appendChild(div);
      });
      // re-run lazy observer for new images
      const newLazy = Array.from(grid.querySelectorAll('img.lazy'));
      newLazy.forEach(i => {
        if (i.src) return;
        if ('IntersectionObserver' in window) {
          // simple observer re-attach: create a new observer or reuse above if exported
          const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
              }
            });
          }, { rootMargin: "120px 0px" });
          obs.observe(i);
        } else {
          i.src = i.dataset.src;
          i.classList.remove('lazy');
        }
      });
    } catch (err) {
      // optionally show user-friendly message
      console.error('Erro ao carregar manifest:', err);
    }
  }

  // If you want to auto-load from S3 manifest, call:
  // loadFromS3('https://portfolio.drypstudio.com.br/manifest.json');

});
