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
    interval: 4500
  });

  initFlexSlider({
    selector: 'opisy',
    viewport: '.opisy-viewport',
    track: '.opisy-track',
    item: '.opis',
    navPrev: '.opisy-nav .prev-button',
    navNext: '.opisy-nav .next-button',
    desktop: 3, tablet: 2, mobile: 1,
    interval: 5000
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
});