/* FilterBox website — shared behaviour for every page. */
(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get: key => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
  };

  /* Background tone follows the section in view, like a continuous canvas. */
  const TONES = { yellow: [255, 214, 0], white: [255, 255, 255], paper: [250, 247, 240] };
  const sections = [...document.querySelectorAll('.tone[data-tone]')].map(el => ({ el, rgb: TONES[el.dataset.tone] }));
  const masthead = document.querySelector('[data-masthead]');
  const smooth = t => t * t * (3 - 2 * t);
  function paint() {
    masthead?.classList.toggle('is-scrolled', scrollY > 4);
    if (!sections.length) return;
    let color = sections[0].rgb;
    const vh = innerHeight;
    for (let i = 1; i < sections.length; i++) {
      const top = sections[i].el.getBoundingClientRect().top;
      const t = smooth(Math.min(1, Math.max(0, (vh * .78 - top) / (vh * .5))));
      if (t <= 0) break;
      color = color.map((v, k) => v + (sections[i].rgb[k] - v) * t);
    }
    root.style.setProperty('--bg', `rgb(${color.map(Math.round).join(',')})`);
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; paint(); });
  }, { passive: true });
  addEventListener('resize', paint);
  paint();

  /* Reveal on scroll, staggered within each section. */
  const revealables = document.querySelectorAll('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    const counters = new Map();
    revealables.forEach(el => {
      const group = el.closest('section') ?? body;
      const n = counters.get(group) ?? 0;
      counters.set(group, n + 1);
      el.style.setProperty('--d', Math.min(n, 6));
    });
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* Phones are drawn at a fixed 436×916 size and scaled to their figure. */
  const devices = document.querySelectorAll('[data-device]');
  if (devices.length) {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) entry.target.style.setProperty('--k', (entry.contentRect.width / 436).toFixed(4));
    });
    devices.forEach(device => ro.observe(device));
  }

  /* Header download pill hides while a store button is on screen. */
  const download = document.querySelector('[data-download]');
  const storeButtons = document.querySelectorAll('.store-buttons');
  if (download && storeButtons.length) {
    const seen = new Set();
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) entry.isIntersecting ? seen.add(entry.target) : seen.delete(entry.target);
      download.classList.toggle('is-hidden', seen.size > 0);
    }, { rootMargin: '-64px 0px 0px' });
    storeButtons.forEach(el => io.observe(el));
  }

  /* Language picker */
  const picker = document.querySelector('[data-lang-picker]');
  if (picker) {
    document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape') { picker.open = false; picker.querySelector('summary').focus(); }
    });
  }
  document.querySelectorAll('[data-lang]').forEach(link => link.addEventListener('click', () => store.set('fb-lang', link.dataset.lang)));

  /* Suggest the visitor's language once, without redirecting. */
  const suggest = document.querySelector('[data-suggest]');
  const strings = document.getElementById('i18n-suggest');
  if (suggest && strings && !store.get('fb-lang')) {
    const current = root.lang;
    const wanted = (navigator.languages || [navigator.language]).map(code => {
      const c = code.toLowerCase();
      if (c.startsWith('zh')) return /hant|tw|hk|mo/.test(c) ? 'zh-Hant' : 'zh-Hans';
      if (c.startsWith('ja')) return 'ja';
      if (c.startsWith('en')) return 'en';
      return null;
    }).find(Boolean);
    const target = wanted && wanted !== current && document.querySelector(`.lang-menu [data-lang="${wanted}"]`);
    const copy = target && JSON.parse(strings.textContent)[wanted];
    if (copy) {
      setTimeout(() => {
        suggest.lang = wanted;
        suggest.innerHTML = `<span></span><a href="${target.getAttribute('href')}" hreflang="${wanted}"></a><button type="button"><svg class="i" aria-hidden="true"><use href="#i-close"/></svg></button>`;
        suggest.querySelector('span').textContent = copy.text;
        suggest.querySelector('a').textContent = copy.action;
        suggest.querySelector('button').setAttribute('aria-label', copy.close);
        suggest.querySelector('a').addEventListener('click', () => store.set('fb-lang', wanted));
        suggest.querySelector('button').addEventListener('click', () => { suggest.hidden = true; store.set('fb-lang', current); });
        suggest.hidden = false;
      }, 1500);
    }
  }

  document.addEventListener('visibilitychange', () => body.classList.toggle('page-hidden', document.hidden));

  /* Docs: copy buttons, table of contents with scroll spy, help search. */
  const prose = document.querySelector('.prose');
  if (prose) {
    const labels = document.getElementById('doc-strings');
    const text = labels ? JSON.parse(labels.textContent) : { copy: 'Copy', copied: 'Copied' };
    prose.querySelectorAll('div.highlighter-rouge, pre:not(div.highlighter-rouge pre)').forEach(block => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = text.copy;
      button.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(block.querySelector('code, pre').innerText); } catch { return; }
        button.textContent = text.copied;
        setTimeout(() => { button.textContent = text.copy; }, 1600);
      });
      block.appendChild(button);
    });
    const toc = document.querySelector('[data-toc]');
    const heads = [...prose.querySelectorAll('h2, h3')].filter(h => h.textContent.trim());
    if (toc && heads.length > 1) {
      const list = toc.querySelector('ol');
      heads.forEach((h, i) => {
        if (!h.id) h.id = `s-${i + 1}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent.trim();
        if (h.tagName === 'H3' && heads.some(x => x.tagName === 'H2')) a.className = 'sub';
        li.appendChild(a);
        list.appendChild(li);
      });
      toc.hidden = false;
      const links = [...list.querySelectorAll('a')];
      const spy = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          links.forEach(link => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
        }
      }, { rootMargin: '-20% 0px -70% 0px' });
      heads.forEach(h => spy.observe(h));
    }
  }

  const search = document.querySelector('[data-help-search]');
  if (search) {
    const items = [...document.querySelectorAll('[data-search-item]')];
    const empty = document.querySelector('[data-help-empty]');
    const fold = s => s.toLowerCase().normalize('NFKC');
    search.addEventListener('input', () => {
      const q = fold(search.value.trim());
      let shown = 0;
      for (const item of items) {
        const hit = !q || fold(item.textContent).includes(q);
        item.hidden = !hit;
        if (hit) shown++;
        if (hit && q && item.matches('details')) item.open = true;
      }
      document.querySelectorAll('[data-search-group]').forEach(group => {
        group.hidden = ![...group.querySelectorAll('[data-search-item]')].some(item => !item.hidden);
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  root.classList.toggle('reduced-motion', reduced.matches);
})();
