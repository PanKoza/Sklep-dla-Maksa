document.addEventListener('DOMContentLoaded', () => {
  /* ROTACJA INFO (zostaw jeśli już jest) */
  const info = document.querySelector('info');
  if (info) {
    const h1s = Array.from(info.querySelectorAll('h1'));
    if (h1s.length > 1) {
      const msgs = h1s.map(h=>h.textContent.trim()).filter(Boolean);
      const display = h1s[0];
      for (let i=1;i<h1s.length;i++) h1s[i].remove();
      let idx=0;
      setInterval(()=>{
        display.classList.add('fade-out');
        setTimeout(()=>{
          idx = (idx+1)%msgs.length;
          display.textContent = msgs[idx];
          display.classList.remove('fade-out');
          display.classList.add('fade-in');
          setTimeout(()=>display.classList.remove('fade-in'),600);
        },500);
      },4000);
    }
  }

  /* HERO SLIDER (zostaw swój jeśli już istnieje) */
  (function initHero(){
    const hero = document.querySelector('hero');
    if (!hero) return;
    const contentSlides = Array.from(hero.querySelectorAll('.hero-content > div'));
    const imageSlides   = Array.from(hero.querySelectorAll('.hero-image img'));
    const prevBtn = hero.querySelector('.prev-button');
    const nextBtn = hero.querySelector('.next-button');
    const total = Math.min(contentSlides.length, imageSlides.length);
    if (!total) return;
    let index=0, timer=null, INT=5000;
    function show(i){
      index = (i+total)%total;
      contentSlides.forEach((c,ci)=>{
        const act = ci===index;
        c.classList.toggle('is-active', act);
        c.hidden = !act;
      });
      imageSlides.forEach((im,ci)=>{
        const act = ci===index;
        im.classList.toggle('is-active', act);
        im.hidden = !act;
      });
    }
    function next(){ show(index+1); }
    function prev(){ show(index-1); }
    function start(){ stop(); timer=setInterval(next,INT); }
    function stop(){ if(timer) clearInterval(timer); timer=null; }
    if (nextBtn) nextBtn.addEventListener('click', ()=>{ next(); start(); });
    if (prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); start(); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('keydown', e=>{
      if (e.key==='ArrowRight'){ next(); start(); }
      if (e.key==='ArrowLeft'){ prev(); start(); }
    });
    hero.setAttribute('tabindex','0');
    show(0); start();
  })();

  /* Uniwersalny slider (kategorie + opisy) */
  function initFlexSlider(cfg){
    const root = document.querySelector(cfg.selector);
    if (!root) return;
    const viewport = root.querySelector(cfg.viewport);
    const track = root.querySelector(cfg.track);
    const items = track ? Array.from(track.querySelectorAll(cfg.item)) : [];
    const prevBtn = root.querySelector(cfg.navPrev);
    const nextBtn = root.querySelector(cfg.navNext);
    if (!viewport || !track || !items.length) return;

    root.setAttribute('tabindex','0');
    root.setAttribute('aria-roledescription','carousel');

    function visible(){
      const w = viewport.clientWidth;
      if (w >= 1100) return cfg.desktop;
      if (w >= 700) return cfg.tablet;
      return cfg.mobile;
    }

    let v = visible();
    let index = 0;
    const AUTO = cfg.interval;
    let timer = null;

    function maxIndex(){ return Math.max(0, items.length - v); }

    function setFlex(){
      v = visible();
      items.forEach(el => el.style.flex = `0 0 calc(100% / ${v})`);
    }

    function update(){
      const shiftPct = index * (100 / v);
      track.style.transform = `translateX(-${shiftPct}%)`;
      items.forEach((el,i)=>{
        const vis = i >= index && i < index + v;
        el.setAttribute('aria-hidden', vis ? 'false':'true');
      });
      if (prevBtn) prevBtn.classList.toggle('is-hidden', false); // pętla – nie ukrywamy
      if (nextBtn) nextBtn.classList.toggle('is-hidden', false);
    }

    function show(i){
      const mx = maxIndex();
      // pętla
      if (i > mx) index = 0;
      else if (i < 0) index = mx;
      else index = i;
      update();
    }

    function next(){ show(index + 1); }
    function prev(){ show(index - 1); }

    function start(){ stop(); timer = setInterval(next, AUTO); }
    function stop(){ if (timer) clearInterval(timer); timer=null; }

    if (nextBtn) nextBtn.addEventListener('click', ()=>{ next(); start(); });
    if (prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('keydown', e=>{
      if (e.key==='ArrowRight'){ next(); start(); }
      if (e.key==='ArrowLeft'){ prev(); start(); }
    });

    window.addEventListener('resize', ()=>{
      const oldV = v;
      setFlex();
      if (visible() !== oldV) index = 0;
      show(index);
    }, { passive:true });

    setFlex();
    show(0);
    start();
  }

  // Inicjalizacje
  initFlexSlider({
    selector: 'kategorie',
    viewport: '.kategorie-viewport',
    track: '.kategorie-track',
    item: '.kategoria',
    navPrev: '.kategorie-nav .prev-button',
    navNext: '.kategorie-nav .next-button',
    desktop: 3, tablet: 2, mobile: 1,
    interval: 2500
  });

  initFlexSlider({
    selector: 'opisy',
    viewport: '.opisy-viewport',
    track: '.opisy-track',
    item: '.opis',
    navPrev: '.opisy-nav .prev-button',
    navNext: '.opisy-nav .next-button',
    desktop: 3, tablet: 2, mobile: 1,
    interval: 2500
  });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* COOKIE BANNER */
  const banner = document.getElementById('cookieBanner');
  const btnAccept = document.getElementById('cookieAccept');
  const btnDecline = document.getElementById('cookieDecline');
  const btnClose = document.getElementById('cookieClose');
  const STORAGE_KEY = 'cookieConsent'; // values: accepted | declined

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(()=> banner.hidden = true, 400);
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(()=> banner.classList.add('is-visible'));
  }

  function saveChoice(val) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch(e){}
  }

  if (banner) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      showBanner();
      // Accessibility: move focus
      setTimeout(()=> btnAccept?.focus(), 600);
    } else {
      banner.hidden = true;
    }

    btnAccept?.addEventListener('click', () => {
      saveChoice('accepted');
      hideBanner();
    });

    btnDecline?.addEventListener('click', () => {
      saveChoice('declined');
      hideBanner();
    });

    btnClose?.addEventListener('click', () => {
      // Zamknięcie traktujemy jak decline, ale możesz zmienić na 'accepted'
      saveChoice('declined');
      hideBanner();
    });

    // ESC zamyka (brak wyboru => decline)
    banner.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        saveChoice('declined');
        hideBanner();
      }
    });
  }

  // Sekcja opisu produktów – uruchamiaj tylko gdy obecna
  const panel = document.querySelector('.product-description-panel');
  const productSource = document.querySelector('.prod_description');
  const list = document.querySelector('.product-list');
  if (panel && productSource && list) {
    const btnTemplate = panel.querySelector('.buy-button');
    const titleEl = panel.querySelector('h2');
    const textPara = panel.querySelector('p');
    const priceEl = panel.querySelector('.price-placeholder');

    function loadProduct(ref) {
      const source = productSource.querySelector('.' + ref);
      if (!source) return;
      const title = source.dataset.title || source.querySelector('h2')?.textContent || 'Produkt';
      const price = source.dataset.price || '';
      const descP = source.querySelector('p')?.textContent || '';
      titleEl.textContent = title;
      textPara.textContent = descP;
      priceEl.textContent = price ? 'Cena: ' + price : '';
      btnTemplate.classList.remove('hidden');
      btnTemplate.setAttribute('data-product', ref);
    }

    function clearActive() {
      list.querySelectorAll('.product-item.is-active').forEach(i=>i.classList.remove('is-active'));
    }

    list.addEventListener('mouseover', e => {
      const card = e.target.closest('.product-item');
      if (!card || !list.contains(card)) return;
      const ref = card.dataset.ref;
      if (!ref) return;
      clearActive();
      card.classList.add('is-active');
      loadProduct(ref);
    });

    list.addEventListener('focusin', e => {
      const card = e.target.closest('.product-item');
      if (!card) return;
      const ref = card.dataset.ref;
      clearActive();
      card.classList.add('is-active');
      loadProduct(ref);
    });

    // Domyślnie pierwszy
    const first = list.querySelector('.product-item');
    if (first) {
      first.classList.add('is-active');
      loadProduct(first.dataset.ref);
    }

    btnTemplate?.addEventListener('click', () => {
      const ref = btnTemplate.getAttribute('data-product');
      if (ref) console.log('Kup:', ref);
    });
  }

  // Klik na .prod_description .product1 -> przejście do prod1.html
  const prodDiv = document.querySelector('.prod_description .product1');
  if (prodDiv) {
    const targetUrl = prodDiv.dataset.href || 'prod1.html';
    prodDiv.style.cursor = 'pointer';

    const navigate = () => { window.location.href = targetUrl; };

    prodDiv.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      navigate();
    });

    prodDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });
  }

  // Klikalność kart produktów (kat1): .product-item -> przejście na stronę produktu
  const productList = document.querySelector('.product-list');
  if (productList) {
    const routeMap = {
      product1: 'prod1.html',
      product2: 'prod2.html',
      product3: 'prod3.html'
    };

    const getTargetUrl = (card) => {
      const href = card.dataset.href;
      if (href) return href;
      const ref = card.dataset.ref;
      return routeMap[ref] || (ref ? `${ref}.html` : null);
    };

    const navigate = (card) => {
      const url = getTargetUrl(card);
      if (url) window.location.href = url;
    };

    productList.addEventListener('click', (e) => {
      const card = e.target.closest('.product-item');
      if (!card) return;
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      navigate(card);
    });

    productList.addEventListener('keydown', (e) => {
      const card = e.target.closest('.product-item');
      if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(card);
      }
    });

    // Wskazówka kursora
    productList.querySelectorAll('.product-item').forEach(c => c.style.cursor = 'pointer');
  }

  // Klikalność kategorii -> katX.html
  const catSection = document.querySelector('kategorie');
  if (catSection) {
    const track = catSection.querySelector('.kategorie-track') || catSection;
    const items = Array.from(track.querySelectorAll('.kategoria'));

    function getUrl(card) {
      if (card?.dataset.href) return card.dataset.href;
      const idx = Math.max(0, items.indexOf(card)) + 1;
      return `kat${idx}.html`;
    }
    function navigate(card) {
      const url = getUrl(card);
      if (url) window.location.href = url;
    }

    track.addEventListener('click', (e) => {
      const card = e.target.closest('.kategoria');
      if (!card) return;
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      navigate(card);
    });

    track.addEventListener('keydown', (e) => {
      const card = e.target.closest('.kategoria');
      if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(card);
      }
    });

    // Wskazówka kursora i dostępność
    items.forEach(c => {
      c.style.cursor = 'pointer';
      if (!c.hasAttribute('role')) c.setAttribute('role', 'link');
      if (!c.hasAttribute('tabindex')) c.tabIndex = 0;
    });
  }

  // Klikalność kart produktów (#products .product)
  const productsContainer = document.getElementById('products');
  if (productsContainer) {
    const getCardUrl = (card) =>
      card.dataset.href
      || card.querySelector('.prod-cta[href]')?.getAttribute('href')
      || card.querySelector('a[href]')?.getAttribute('href');

    productsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.product');
      if (!card || !productsContainer.contains(card)) return;
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      const url = getCardUrl(card);
      if (url) window.location.href = url;
    });

    productsContainer.addEventListener('keydown', (e) => {
      const card = e.target.closest('.product');
      if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const url = getCardUrl(card);
        if (url) window.location.href = url;
      }
    });

    productsContainer.querySelectorAll('.product').forEach(card => {
      card.style.cursor = 'pointer';
      if (!card.hasAttribute('role')) card.setAttribute('role', 'link');
      if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
    });
  }

  // Klikalność kart w OPISY (.opis -> prodX.html lub data-href)
  const opisyTrack = document.querySelector('opisy .opisy-track');
  if (opisyTrack) {
    const items = Array.from(opisyTrack.querySelectorAll('.opis'));

    const guessUrl = (item, idx) => {
      if (item.dataset.href) return item.dataset.href;
      const title = item.querySelector('h3')?.textContent?.trim() || '';
      const m = title.match(/produkt\s*(\d+)/i);
      if (m && m[1]) return `prod${m[1]}.html`;
      return `prod${idx + 1}.html`;
    };

    const navigate = (item) => {
      const idx = items.indexOf(item);
      const url = guessUrl(item, Math.max(0, idx));
      if (url) window.location.href = url;
    };

    opisyTrack.addEventListener('click', (e) => {
      const card = e.target.closest('.opis');
      if (!card) return;
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      navigate(card);
    });

    opisyTrack.addEventListener('keydown', (e) => {
      const card = e.target.closest('.opis');
      if (!card) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(card);
      }
    });

    items.forEach(card => {
      card.style.cursor = 'pointer';
      if (!card.hasAttribute('role')) card.setAttribute('role', 'link');
      if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
    });
  }

  // Wyszukiwarka: datalist -> przekierowanie do odpowiedniej podstrony
  const searchInput = document.getElementById('search-input');
  const dataList = document.getElementById('search-suggestions');

  if (searchInput && dataList) {
    const options = Array.from(dataList.querySelectorAll('option'));
    const map = new Map(
      options.map(o => [o.value.trim().toLowerCase(), o.dataset.href || ''])
    );

    function findHref(val) {
      const key = (val || '').trim().toLowerCase();
      if (!key) return null;
      if (map.has(key)) return map.get(key);
      const matches = options.filter(o => o.value.trim().toLowerCase() === key);
      if (matches[0]?.dataset.href) return matches[0].dataset.href;
      const starts = options.filter(o => o.value.trim().toLowerCase().startsWith(key));
      return starts.length === 1 ? (starts[0].dataset.href || null) : null;
    }

    function navigateFromInput() {
      const href = findHref(searchInput.value);
      if (href) window.location.href = href;
    }

    searchInput.addEventListener('change', navigateFromInput);
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateFromInput();
      }
    });
  }

  // Product detail: qty controls + add to cart
  const pd = document.querySelector('.product-detail');
  if (pd) {
    const qtyInput = pd.querySelector('.qty-input');
    const minus = pd.querySelector('.qty-btn.minus');
    const plus = pd.querySelector('.qty-btn.plus');
    const addBtn = pd.querySelector('.add-to-cart');
    const priceEl = pd.querySelector('.product-price .price');

    const clamp = (v) => {
      const min = Number(qtyInput.min || 1);
      const max = Number(qtyInput.max || 99);
      v = Number.isFinite(+v) ? +v : min;
      return Math.min(Math.max(v, min), max);
    };

    function setQty(v) {
      qtyInput.value = clamp(v);
    }

    minus?.addEventListener('click', () => setQty((+qtyInput.value || 1) - 1));
    plus?.addEventListener('click', () => setQty((+qtyInput.value || 1) + 1));
    qtyInput?.addEventListener('input', () => setQty(qtyInput.value));

    addBtn?.addEventListener('click', () => {
      const qty = clamp(qtyInput?.value || 1);
      const id = addBtn.dataset.productId || 'product1';
      const unit = Number(priceEl?.dataset.price || 0);
      const total = (unit * qty).toFixed(2);
      console.log('Dodano do koszyka:', { id, qty, unit, total });
      // TODO: integracja z koszykiem
    });
  }

  // Galeria: lightbox
  const gallery = document.querySelector('.product-media-gallery .gallery-grid');
  const lb = document.getElementById('lightboxGallery');
  if (gallery && lb) {
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    const imgEl = lb.querySelector('.lb-image');
    const btnPrev = lb.querySelector('.lb-prev');
    const btnNext = lb.querySelector('.lb-next');
    const btnClose = lb.querySelector('.lb-close');
    let index = 0;

    function show(i) {
      index = (i + items.length) % items.length;
      const url = items[index].dataset.full || items[index].getAttribute('href');
      imgEl.src = url;
      imgEl.alt = items[index].querySelector('img')?.alt || '';
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
    }
    function hide() {
      lb.setAttribute('aria-hidden', 'true');
      setTimeout(() => { lb.hidden = true; imgEl.src = ''; }, 200);
    }
    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    gallery.addEventListener('click', (e) => {
      const a = e.target.closest('.gallery-item');
      if (!a) return;
      e.preventDefault();
      const i = items.indexOf(a);
      if (i >= 0) show(i);
    });

    btnClose?.addEventListener('click', hide);
    btnNext?.addEventListener('click', next);
    btnPrev?.addEventListener('click', prev);

    lb.addEventListener('click', (e) => {
      if (e.target === lb) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }
});