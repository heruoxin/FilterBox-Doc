/* FilterBox website — animated app demos on the home page.
   Demos play only while on screen. Every app, person and message is fictional sample data. */
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('demo-data').textContent);
  const ui = data.ui;
  const lang = document.documentElement.lang;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOW = new Date(2026, 9, 12, 10, 8);
  const YESTERDAY = new Date(NOW.getTime() - 86400000);

  const APPS = {
    chirp: { icon: '#2e9e4f', card: '#4caf6a' },
    postbox: { icon: '#e2574c', card: '#ef7568' },
    shoploop: { icon: '#ff7043', card: '#ff8a65' },
    newsdrop: { icon: '#5c6bc0', card: '#7986cb' },
    parcelo: { icon: '#f9a825', card: '#ffd54f', dark: true },
    bank: { icon: '#1e88e5', card: '#5d9fe8' },
    messages: { icon: '#039be5', card: '#4fc3f7', dark: true },
    melodia: { icon: '#ab47bc', card: '#ba68c8' },
    calendar: { icon: '#7e57c2', card: '#9575cd' },
    crew: { icon: '#00897b', card: '#26a69a' },
    kingdom: { icon: '#e53935', card: '#ef5350' },
    cliptv: { icon: '#d81b60', card: '#ec407a' },
    yumm: { icon: '#fb8c00', card: '#ffb74d', dark: true },
    weather: { icon: '#00acc1', card: '#4dd0e1', dark: true },
    system: { icon: '#607d8b', card: '#90a4ae', dark: true },
    others: { icon: '#a8a29a', card: '#cfc9bf', dark: true },
  };

  /* ---------- helpers ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = (s, v) => String(s).replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const svg = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;
  const make = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const appName = key => key === 'others' ? data.analytics.others : (data.apps[key] ?? key);
  const ico = key => key === 'filterbox'
    ? `<span class="ico ico--fb">${svg('i-bell')}</span>`
    : `<span class="ico" style="--c:${APPS[key].icon}">${svg(`g-${key}`)}</span>`;
  const scaleOf = node => parseFloat(getComputedStyle(node.closest('[data-device]') ?? node).getPropertyValue('--k')) || 1;
  const num = new Intl.NumberFormat(lang);
  const statusBar = (time = true) => `<div class="sb"><span>${time ? data.clock : ''}</span><span class="sb-icons">${svg('i-wifi')}${svg('i-signal')}${svg('i-battery')}</span></div>`;
  const EASE = 'cubic-bezier(.2, .8, .2, 1)';
  const ENTER = 'cubic-bezier(.05, .7, .1, 1)';
  const EXIT = 'cubic-bezier(.3, 0, .8, .15)';

  function spring(stiffness, damping) {
    if (!CSS.supports('animation-timing-function', 'linear(0, 1)')) return { easing: 'cubic-bezier(.2, .9, .25, 1.08)', duration: 560 };
    const w0 = Math.sqrt(stiffness), zeta = damping / (2 * w0), wd = w0 * Math.sqrt(1 - zeta * zeta);
    const x = t => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
    let end = 0;
    for (let t = 0; t < 4; t += .005) if (Math.abs(x(t) - 1) > .002) end = t;
    const points = Array.from({ length: 49 }, (_, i) => +x(end * i / 48).toFixed(4));
    points[48] = 1;
    return { easing: `linear(${points.join(', ')})`, duration: Math.round(end * 1000) };
  }
  const SP = spring(240, 22);

  /* Runs a demo only while it is visible, the tab is active and the visitor is not interacting with it. */
  class Gate {
    constructor(target, threshold = .3, hold = 6000) {
      this.on = false;
      this.hold = 0;
      this.waiting = [];
      this.watchers = [];
      this.firstSeen = new Promise(resolve => { this.seen = resolve; });
      new IntersectionObserver(([entry]) => {
        this.on = entry.isIntersecting;
        if (this.on) this.seen();
        this.flush();
      }, { threshold }).observe(target);
      document.addEventListener('visibilitychange', () => this.flush());
      if (hold) target.addEventListener('pointerdown', () => this.pause(hold), { passive: true });
    }
    get open() { return this.on && !document.hidden; }
    pause(ms) { this.hold = Math.max(this.hold, performance.now() + ms); }
    watch(fn) { this.watchers.push(fn); }
    flush() {
      const open = this.open;
      this.watchers.forEach(fn => fn(open));
      if (open) this.waiting.splice(0).forEach(resolve => resolve());
    }
    async ready(ms = 0) {
      let left = ms;
      for (;;) {
        if (!this.open) await new Promise(resolve => this.waiting.push(resolve));
        const pause = this.hold - performance.now();
        if (pause > 0) { await sleep(Math.min(pause, 400)); continue; }
        if (left <= 0) return;
        const step = Math.min(left, 100);
        await sleep(step);
        if (this.open) left -= step;
      }
    }
  }

  /* Animates vertical reflow of the given nodes around a DOM change. */
  function flip(nodes, mutate, duration = 460) {
    const before = new Map(nodes().map(node => [node, node.getBoundingClientRect().top]));
    mutate();
    if (reduced) return;
    for (const node of nodes()) {
      if (!before.has(node)) continue;
      const dy = (before.get(node) - node.getBoundingClientRect().top) / scaleOf(node);
      if (Math.abs(dy) > .5) node.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration, easing: EASE });
    }
  }

  /* One notification layout everywhere: header, title, text, optional actions. */
  function ncard(n, time = ui.now, { actions, bar } = {}) {
    const card = make('div', 'ncard', `<div class="ncard-head">${ico(n.app)}<b>${esc(appName(n.app))}</b><span>· ${esc(time)}</span></div><div class="ncard-title">${esc(n.title)}</div><div class="ncard-text">${esc(n.text)}</div>${actions ? `<div class="ncard-actions">${actions.map(a => `<span>${a}</span>`).join('')}</div>` : ''}${bar ? '<i class="ncard-bar"></i>' : ''}`);
    card.data = n;
    return card;
  }
  function arrive(node) {
    if (!reduced) node.animate([{ opacity: 0, transform: 'translateY(-24px) scale(.96)' }, { opacity: 1, transform: 'none' }], SP);
  }
  function leave(node, dy = 0) {
    return node.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${dy}px) scale(.94)` }], { duration: reduced ? 1 : 260, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).finished;
  }
  /* Material-style press feedback. */
  function ripple(el) {
    const k = scaleOf(el), r = el.getBoundingClientRect();
    const w = r.width / k, h = r.height / k, size = Math.hypot(w, h) * 1.1;
    const dot = make('span', 'rip');
    Object.assign(dot.style, { width: `${size}px`, height: `${size}px`, left: `${(w - size) / 2}px`, top: `${(h - size) / 2}px` });
    el.append(dot);
    el.classList.add('press');
    setTimeout(() => el.classList.remove('press'), 320);
    return dot.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: reduced ? 1 : 560, easing: 'cubic-bezier(.2, .6, .35, 1)' }).finished.then(() => dot.remove());
  }

  /* Horizontal swipe to dismiss. */
  function swipeable(container, selector, onDismiss) {
    let drag = null;
    container.addEventListener('pointerdown', event => {
      const card = event.target.closest(selector);
      if (!card || event.button !== 0 || event.target.closest('button')) return;
      drag = { card, x: event.clientX, y: event.clientY, dx: 0, t: event.timeStamp, v: 0, active: false, id: event.pointerId, k: scaleOf(card) };
    });
    container.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.active) {
        if (Math.abs(dx) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.active = true;
        drag.card.setPointerCapture(event.pointerId);
        drag.card.classList.add('is-drag');
      }
      drag.v = (dx - drag.dx) / Math.max(1, event.timeStamp - drag.t);
      drag.dx = dx;
      drag.t = event.timeStamp;
      const local = dx / drag.k;
      drag.card.style.transform = `translateX(${local}px) rotate(${local / 50}deg)`;
      drag.card.style.opacity = String(1 - Math.min(.85, Math.abs(local) / 420));
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const { card, active, dx, v, k } = drag;
      drag = null;
      if (!active) return;
      card.classList.remove('is-drag');
      const local = dx / k;
      const from = { transform: card.style.transform, opacity: card.style.opacity };
      if (Math.abs(local) > 110 || Math.abs(v) > .6) {
        const dir = Math.sign(local || v);
        card.animate([from, { transform: `translateX(${dir * 470}px) rotate(${dir * 9}deg)`, opacity: 0 }], { duration: reduced ? 1 : 300, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).finished.then(() => onDismiss(card));
      } else {
        card.style.transform = '';
        card.style.opacity = '';
        card.animate([from, { transform: 'none', opacity: 1 }], SP);
      }
    };
    container.addEventListener('pointerup', end);
    container.addEventListener('pointercancel', end);
  }

  /* Short synthesized sounds and speech, only after a click. */
  const Sound = {
    ctx: null,
    audio() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx ??= new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq, start, length, type = 'sine', gain = .16) {
      const ctx = this.audio();
      if (!ctx) return;
      const t = ctx.currentTime + start, osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(gain, t + .012);
      amp.gain.exponentialRampToValueAtTime(.0001, t + length);
      osc.connect(amp).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + length + .05);
    },
    marimba() { [[784, 0], [988, .15], [1175, .3], [1568, .45], [1175, .62]].forEach(([f, s]) => { this.tone(f, s, .5, 'sine', .15); this.tone(f * 4, s, .1, 'sine', .025); }); },
    ring() { [0, 1.25].forEach(s => { this.tone(440, s, 1, 'sine', .06); this.tone(480, s, 1, 'sine', .06); }); },
    ding() { this.tone(1319, 0, 1.8, 'sine', .13); this.tone(2637, 0, .9, 'sine', .035); this.tone(1976, .01, 1.2, 'triangle', .025); },
    speak(text) {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = { en: 'en-US', 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW', ja: 'ja-JP' }[lang] ?? 'en-US';
      const voice = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').toLowerCase() === utter.lang.toLowerCase());
      if (voice) utter.voice = voice;
      speechSynthesis.speak(utter);
    },
  };

  /* Phone screens are decorative for assistive tech; keep their controls out of the tab order. */
  function quiet(screen) {
    const apply = root => root.querySelectorAll?.('button, input, a[href], [tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
    apply(screen);
    new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches('button, input')) n.setAttribute('tabindex', '-1'); apply(n); } }))).observe(screen, { childList: true, subtree: true });
  }

  /* ---------- Hero: spam folds away in the notification shade ---------- */
  function Shade(screen) {
    const qs = ui.qs;
    screen.innerHTML = `${statusBar(false)}
      <div class="shade">
        <div class="shade-head"><div><div class="shade-clock">${data.clock}</div><div class="shade-date">${esc(data.date)}</div></div><span class="shade-gear">${svg('i-gear')}</span></div>
        <div class="qs">
          <div class="qs-tile on"><i>${svg('i-wifi')}</i>${esc(qs[0])}</div>
          <div class="qs-tile on"><i>${svg('i-bluetooth')}</i>${esc(qs[1])}</div>
          <div class="qs-tile"><i>${svg('i-dnd')}</i>${esc(qs[2])}</div>
          <div class="qs-tile"><i>${svg('i-torch')}</i>${esc(qs[3])}</div>
        </div>
        <div class="bright">${svg('g-weather')}</div>
        <div class="nlist"></div>
        <div class="nsect">${esc(ui.silent)}</div>
        <div class="nsum">
          <div class="ncard-head">${ico('filterbox')}<b>${esc(appName('filterbox'))}</b><span>· ${esc(ui.now)}</span><i class="chev">${svg('i-chevron')}</i></div>
          <div class="nsum-row"><div class="ncard-title" data-sum></div><span class="nsum-stack" data-stack></span></div>
          <div class="nsum-list"><div data-sumlist></div></div>
        </div>
        <div class="shade-foot"><span>${esc(ui.manage)}</span><span>${esc(ui.clear)}</span></div>
      </div>
      <div class="heads"></div><div class="gbar"></div>`;
    const device = screen.closest('[data-device]');
    const art = device.parentElement;
    const scores = art.querySelector('[data-scores]');
    const list = screen.querySelector('.nlist');
    const sect = screen.querySelector('.nsect');
    const sum = screen.querySelector('.nsum');
    const sumText = sum.querySelector('[data-sum]');
    const sumStack = sum.querySelector('[data-stack]');
    const sumList = sum.querySelector('[data-sumlist]');
    const heads = screen.querySelector('.heads');
    const gate = new Gate(device);
    const filtered = data.hero.filtered.map(n => ({ ...n }));
    const labels = new Map();
    const moving = () => [...list.children, sect, sum];
    let raf = 0;

    function renderSum(bump) {
      sumText.textContent = fmt(ui.filtered, { n: filtered.length });
      sumStack.innerHTML = [...new Set(filtered.map(n => n.app))].slice(0, 3).map(key => ico(key)).join('');
      sumList.innerHTML = filtered.slice(0, 3).map((n, i) => `<div class="nsum-item">${ico(n.app)}<p><b>${esc(appName(n.app))}</b> ${esc(n.title)}</p><button type="button" data-restore="${i}">${esc(ui.restore)}</button></div>`).join('');
      if (bump && !reduced) { sum.classList.remove('bump'); void sum.offsetWidth; sum.classList.add('bump'); }
    }

    /* Score labels live outside the phone and follow their notification. */
    function sync() {
      const a = art.getBoundingClientRect(), d = device.getBoundingClientRect();
      const x = d.right - a.left + 14;
      for (const [card, label] of labels) {
        if (!card.isConnected) { unscore(card); continue; }
        const r = card.getBoundingClientRect();
        label.style.transform = `translate(${x}px, ${r.top + r.height / 2 - a.top}px)`;
      }
    }
    function follow() {
      if (raf) return;
      const loop = () => { sync(); raf = labels.size && gate.open ? requestAnimationFrame(loop) : 0; };
      raf = requestAnimationFrame(loop);
    }
    function score(card, s) {
      const label = make('div', 'score', `<div class="score-in"><i class="score-line"></i><span class="score-pill"><i></i><span>${esc(ui.spam)}</span><b>${reduced ? s : 0}%</b></span></div>`);
      scores.append(label);
      labels.set(card, label);
      sync();
      follow();
      if (reduced) return;
      label.firstElementChild.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], SP);
      const out = label.querySelector('b'), t0 = performance.now();
      const count = now => {
        const t = Math.min(1, (now - t0) / 700);
        out.textContent = `${Math.round(s * (1 - (1 - t) ** 3))}%`;
        if (t < 1) requestAnimationFrame(count);
      };
      requestAnimationFrame(count);
    }
    function unscore(card) {
      const label = labels.get(card);
      if (!label) return;
      labels.delete(card);
      label.firstElementChild.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-10px) scale(.94)' }], { duration: reduced ? 1 : 240, easing: 'ease-in', fill: 'forwards' }).finished.then(() => label.remove());
    }
    gate.watch(open => open && follow());
    new ResizeObserver(sync).observe(art);

    function add(n) {
      const card = ncard(n, ui.now);
      flip(moving, () => list.prepend(card));
      arrive(card);
      for (const old of [...list.children].filter(c => !c.leaving).slice(4)) {
        old.leaving = true;
        unscore(old);
        leave(old).then(() => flip(moving, () => old.remove()));
      }
      return card;
    }
    async function fold(card) {
      if (!card.isConnected || card.leaving) return;
      card.leaving = true;
      unscore(card);
      const k = scaleOf(card), a = card.getBoundingClientRect(), b = sumStack.getBoundingClientRect();
      const dx = (b.left + b.width / 2 - a.left - a.width / 2) / k, dy = (b.top + b.height / 2 - a.top - a.height / 2) / k;
      card.style.zIndex = 4;
      await card.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.16)`, opacity: 0 }], { duration: reduced ? 1 : 620, easing: 'cubic-bezier(.55, 0, .7, .3)', fill: 'forwards' }).finished;
      flip(moving, () => card.remove());
      filtered.unshift(card.data);
      renderSum(true);
    }
    function recall(n) {
      heads.innerHTML = '';
      const hu = make('div', 'hu', `${ico(n.app)}<p>${esc(fmt(ui.dismissed, { app: appName(n.app) }))}<small>${esc(appName('filterbox'))}</small></p><button type="button">${svg('i-undo')}${esc(ui.undo)}</button><span class="hu-bar"></span>`);
      heads.append(hu);
      if (!reduced) hu.animate([{ transform: 'translateY(-130%)' }, { transform: 'none' }], SP);
      const timer = hu.querySelector('.hu-bar').animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 5000, fill: 'forwards' });
      const close = () => hu.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-130%)', opacity: 0 }], { duration: reduced ? 1 : 260, easing: EXIT, fill: 'forwards' }).finished.then(() => hu.remove());
      timer.finished.then(() => hu.isConnected && close(), () => {});
      hu.querySelector('button').addEventListener('click', () => { timer.cancel(); close(); add(n); });
    }

    swipeable(list, '.ncard', card => {
      unscore(card);
      flip(moving, () => card.remove());
      recall(card.data);
      gate.pause(6000);
    });
    sum.addEventListener('click', event => {
      const restore = event.target.closest('[data-restore]');
      if (restore) {
        const [n] = filtered.splice(+restore.dataset.restore, 1);
        renderSum(true);
        add(n);
        gate.pause(6000);
        return;
      }
      sum.classList.toggle('open');
    });

    renderSum();
    if (reduced) {
      data.hero.stream.slice(0, 3).reverse().forEach(n => score(add(n), n.s));
      return;
    }
    (async () => {
      let i = 0;
      await gate.ready(500);
      for (;;) {
        const batch = [];
        for (let j = 0; j < 3; j++) {
          const n = data.hero.stream[i++ % data.hero.stream.length];
          const card = add(n);
          batch.push(card);
          await gate.ready(450);
          if (card.isConnected && !card.leaving) score(card, n.s);
          await gate.ready(550);
        }
        await gate.ready(1200);
        for (const card of batch) { fold(card); await gate.ready(260); }
        await gate.ready(1900);
      }
    })();
  }

  /* ---------- History: the FilterBox timeline ---------- */
  function Timeline(screen) {
    const items = [...data.timeline.showing.map(n => ({ ...n, showing: true })), ...data.timeline.history.map(n => ({ ...n }))];
    const day = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
    const when = m => new Date(NOW.getTime() - m * 60000);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const rel = m => {
      const d = when(m);
      if (m < 60) return fmt(ui.min, { n: Math.max(1, Math.round(m)) });
      if (sameDay(d, NOW)) return fmt(ui.hour, { n: Math.round(m / 60) });
      if (sameDay(d, YESTERDAY)) return ui.yesterday;
      return day.format(d);
    };
    const score = (n, i) => n.state === 'ai' ? 90 + (i * 7) % 9 + .4 : (i * 3) % 7 + .6;
    const chips = n => n.fed ? `<div class="tl-chips"><span>${esc(n.fed === 'spam' ? ui.marked_spam : ui.marked_normal)}</span></div>`
      : n.state === 'ai' ? `<div class="tl-chips"><span>${esc(ui.ai_filtered)}</span></div>`
      : n.state === 'rule' ? `<div class="tl-chips"><span>${esc(ui.by_rule)}</span></div>` : '';
    const row = (n, i) => {
      const a = APPS[n.app];
      return `<div class="tl-row" data-i="${i}">${ico(n.app)}<div class="tl-card${a.dark ? ' dark' : ''}" style="--c:${a.card}"><div class="tl-top"><span>${esc(appName(n.app))}</span><span>${esc(rel(n.m))}</span></div><div class="tl-title" data-f>${esc(n.title)}</div><div class="tl-text" data-f>${esc(n.text)}</div><div data-chips>${chips(n)}</div>${n.count ? `<span class="tl-count">${n.count}</span>` : ''}</div></div>`;
    };
    screen.innerHTML = `${statusBar()}<div class="app">
      <div class="app-top"><div class="app-title">${esc(appName('filterbox'))}</div>${svg('i-gear', 'app-gear')}</div>
      <div class="tl">
        <div class="tl-sec" data-sec="showing">${esc(ui.showing)}${svg('i-chevron')}</div>
        ${items.map((n, i) => n.showing ? row(n, i) : '').join('')}
        <div class="tl-sec" data-sec="history">${esc(ui.history)}${svg('i-chevron')}</div>
        ${items.map((n, i) => n.showing ? '' : row(n, i)).join('')}
        <div class="tl-empty" hidden>${esc(ui.no_results)}</div>
      </div>
      <div class="tl-axis"><div class="tl-thumb"></div><div class="tl-bubble"></div></div>
      <div class="app-nav"><span>${svg('i-bulb')}${esc(ui.intelligence)}</span><button class="fab" type="button" aria-label="${esc(ui.search)}">${svg('i-search')}</button><span>${svg('i-bars')}${esc(ui.analytics)}</span></div>
      <div class="search">
        <div class="search-input">${svg('i-search')}<input type="search" placeholder="${esc(ui.search)}" aria-label="${esc(ui.search)}" enterkeyhint="search"><button type="button" aria-label="${esc(ui.dismiss)}">${svg('i-close')}</button></div>
        <div class="search-chips">${ui.chips.map(t => `<span>${esc(t)} ${svg('i-chevron')}</span>`).join('')}</div>
      </div>
      <div class="scrim"></div><div class="sheet"></div>
    </div><div class="gbar"></div>`;

    const device = screen.closest('[data-device]');
    const list = screen.querySelector('.tl');
    const axis = screen.querySelector('.tl-axis');
    const thumb = screen.querySelector('.tl-thumb');
    const bubble = screen.querySelector('.tl-bubble');
    const fab = screen.querySelector('.fab');
    const search = screen.querySelector('.search');
    const input = search.querySelector('input');
    const scrim = screen.querySelector('.scrim');
    const sheet = screen.querySelector('.sheet');
    const empty = screen.querySelector('.tl-empty');
    const rows = [...list.querySelectorAll('.tl-row')];
    const gate = new Gate(device, .4, 0);
    const TOP = 132;
    let epoch = 0;
    const interrupt = () => { epoch++; gate.pause(12000); };
    device.addEventListener('pointerdown', interrupt, { passive: true });
    list.addEventListener('wheel', interrupt, { passive: true });

    /* Timeline axis */
    const maxScroll = () => Math.max(1, list.scrollHeight - list.clientHeight);
    function layoutAxis() {
      axis.querySelectorAll('.tl-tick').forEach(t => t.remove());
      let lastY = -99, lastDay = '', lastBucket = '';
      for (const r of rows) {
        const n = items[+r.dataset.i];
        if (n.showing || r.classList.contains('miss')) continue;
        const d = when(n.m);
        const dayKey = d.toDateString(), bucket = `${dayKey}-${Math.floor(d.getHours() / 4)}`;
        const y = clamp((r.offsetTop - TOP) / maxScroll()) * axis.clientHeight;
        if (bucket === lastBucket) continue;
        const isDay = dayKey !== lastDay && !sameDay(d, NOW);
        lastDay = dayKey;
        lastBucket = bucket;
        if (y - lastY < 26) continue;
        lastY = y;
        const tick = make('span', `tl-tick${isDay ? ' day' : ''}`, isDay ? esc(day.format(d)) : `${String(d.getHours()).padStart(2, '0')}:00`);
        tick.style.top = `${y}px`;
        axis.append(tick);
      }
    }
    function topRow() {
      const y = list.scrollTop + TOP + 4;
      return rows.find(r => !r.classList.contains('miss') && r.offsetTop + r.offsetHeight > y) ?? rows[0];
    }
    function sync() {
      thumb.style.top = `${(list.scrollTop / maxScroll()) * axis.clientHeight}px`;
      bubble.style.top = thumb.style.top;
      const d = when(items[+topRow().dataset.i].m), h = Math.floor(d.getHours() / 2) * 2;
      const same = items.filter(x => { const e = when(x.m); return sameDay(e, d) && Math.floor(e.getHours() / 2) * 2 === h; });
      bubble.innerHTML = `<b>${esc(day.format(d))}, ${String(h).padStart(2, '0')}:00 – ${String(h + 2).padStart(2, '0')}:00</b>${esc(fmt(ui.window, { n: same.length, f: same.filter(x => x.state).length }))}`;
    }
    let idle = 0;
    function flash() {
      axis.classList.add('active');
      clearTimeout(idle);
      idle = setTimeout(() => axis.classList.remove('active'), 900);
    }
    list.addEventListener('scroll', () => { sync(); flash(); }, { passive: true });
    let scrubbing = false;
    const scrubTo = event => {
      const r = axis.getBoundingClientRect();
      list.scrollTop = clamp((event.clientY - r.top) / r.height) * maxScroll();
    };
    axis.addEventListener('pointerdown', event => { scrubbing = true; axis.setPointerCapture(event.pointerId); scrubTo(event); });
    axis.addEventListener('pointermove', event => { if (scrubbing) scrubTo(event); });
    axis.addEventListener('pointerup', () => { scrubbing = false; });
    axis.addEventListener('pointercancel', () => { scrubbing = false; });
    new ResizeObserver(() => { layoutAxis(); sync(); }).observe(list);

    /* Search */
    const mark = (text, q) => {
      if (!q) return esc(text);
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      return i < 0 ? esc(text) : `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
    };
    function filter(q) {
      q = q.trim();
      let shown = 0;
      for (const r of rows) {
        const n = items[+r.dataset.i];
        const hit = !q || `${appName(n.app)} ${n.title} ${n.text}`.toLowerCase().includes(q.toLowerCase());
        r.classList.toggle('miss', !hit);
        const [title, text] = r.querySelectorAll('[data-f]');
        title.innerHTML = mark(n.title, q);
        text.innerHTML = mark(n.text, q);
        if (hit) shown++;
      }
      list.querySelectorAll('.tl-sec').forEach(sec => {
        const showing = sec.dataset.sec === 'showing';
        sec.hidden = !rows.some(r => !r.classList.contains('miss') && !!items[+r.dataset.i].showing === showing);
      });
      empty.hidden = shown > 0;
      list.scrollTop = 0;
      layoutAxis();
      sync();
    }
    function openSearch(open, focus) {
      search.classList.toggle('open', open);
      if (open && focus && matchMedia('(pointer: fine)').matches) setTimeout(() => input.focus({ preventScroll: true }), 380);
      if (!open && (input.value || document.activeElement === input)) { input.value = ''; filter(''); input.blur(); }
    }
    fab.addEventListener('click', () => { ripple(fab); openSearch(!search.classList.contains('open'), true); });
    search.querySelector('.search-input button').addEventListener('click', () => openSearch(false));
    input.addEventListener('input', () => filter(input.value));
    input.addEventListener('keydown', event => { if (event.key === 'Escape') openSearch(false); });

    /* Details: a modal bottom sheet */
    const HIDDEN = 'translateY(105%)';
    let sheetOpen = false, current = -1;
    function slide(to, duration, easing) {
      const from = getComputedStyle(sheet).transform;
      sheet.getAnimations().forEach(a => a.cancel());
      sheet.style.transform = to;
      if (reduced) return Promise.resolve();
      return sheet.animate([{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: to }], { duration, easing }).finished.catch(() => {});
    }
    function fill(i) {
      const n = items[i], a = APPS[n.app], s = score(n, i);
      const meta = n.count ? fmt(ui.updated, { n: n.count }) : fmt(ui.posted, { t: hhmm(when(n.m)) });
      sheet.innerHTML = `<div class="sheet-handle"></div>
        <div class="sheet-card${a.dark ? ' dark' : ''}" style="--c:${a.card}"><h4>${ico(n.app)}${esc(appName(n.app))}</h4><div class="t">${esc(n.title)}</div><p>${esc(n.text)}</p>${n.recalled ? `<div class="sheet-orig"><b>${esc(ui.earlier)}</b>${esc(n.recalled)}</div>` : ''}<small>${esc(meta)}</small></div>
        <div class="sheet-open">${esc(fmt(ui.open_app, { app: appName(n.app) }))}</div>
        <div class="sheet-actions"><span>${svg('i-dismiss')}${esc(ui.dismiss)}</span><span>${svg('i-plus')}${esc(ui.rule)}</span><span>${svg('i-more')}${esc(ui.more_btn)}</span></div>
        <div class="sheet-ai"><b>${esc(fmt(ui.ai, { s: s.toFixed(1) }))}</b><button type="button" data-v="spam"${n.fed === 'spam' ? ' class="sel"' : ''}>${esc(ui.is_spam)}</button><button type="button" data-v="normal"${n.fed === 'normal' ? ' class="sel"' : ''}>${esc(ui.is_normal)}</button></div>`;
    }
    function openSheet(i) {
      current = i;
      fill(i);
      scrim.classList.add('open');
      if (!sheetOpen) sheet.style.transform = HIDDEN;
      sheetOpen = true;
      return slide('none', 420, ENTER);
    }
    function closeSheet() {
      if (!sheetOpen) return Promise.resolve();
      sheetOpen = false;
      scrim.classList.remove('open');
      return slide(HIDDEN, 250, EXIT);
    }
    list.addEventListener('click', event => {
      const card = event.target.closest('.tl-card');
      if (!card) return;
      ripple(card);
      openSheet(+card.closest('.tl-row').dataset.i);
    });
    scrim.addEventListener('click', closeSheet);
    screen.addEventListener('keydown', event => { if (event.key === 'Escape') closeSheet(); });
    sheet.addEventListener('click', event => {
      const b = event.target.closest('[data-v]');
      if (!b || current < 0) return;
      const n = items[current];
      n.fed = b.dataset.v;
      ripple(b);
      sheet.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('sel', x === b));
      rows.find(r => +r.dataset.i === current).querySelector('[data-chips]').innerHTML = chips(n);
    });
    let drag = null;
    sheet.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || event.button > 0) return;
      drag = { y: event.clientY, id: event.pointerId, dy: 0, t: event.timeStamp, v: 0, k: scaleOf(sheet) };
      sheet.setPointerCapture(event.pointerId);
      sheet.getAnimations().forEach(a => a.cancel());
    });
    sheet.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dy = (event.clientY - drag.y) / drag.k;
      drag.v = (dy - drag.dy) / Math.max(1, event.timeStamp - drag.t);
      drag.dy = dy;
      drag.t = event.timeStamp;
      sheet.style.transform = `translateY(${dy > 0 ? dy : dy / 5}px)`;
      scrim.style.opacity = String(1 - clamp(dy / sheet.offsetHeight));
    });
    const release = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const { dy, v } = drag;
      drag = null;
      scrim.style.opacity = '';
      if (dy > 110 || v > .5) closeSheet();
      else slide('none', SP.duration, SP.easing);
    };
    sheet.addEventListener('pointerup', release);
    sheet.addEventListener('pointercancel', release);

    layoutAxis();
    sync();
    if (reduced) return;

    /* A short tour: scrub the timeline, open a recalled message, search. */
    const glide = (to, ms, alive) => new Promise(resolve => {
      const from = list.scrollTop, t0 = performance.now();
      const step = now => {
        if (!alive()) return resolve();
        const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        list.scrollTop = from + (to - from) * e;
        t < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });
    const type = async (text, alive) => {
      for (const ch of text) {
        if (!alive()) return;
        input.value += ch;
        filter(input.value);
        await sleep(150);
      }
    };
    const recalled = items.findIndex(n => n.recalled);
    (async () => {
      await gate.firstSeen;
      for (;;) {
        await gate.ready(1500);
        const my = epoch, alive = () => my === epoch && gate.open;
        await closeSheet();
        openSearch(false);
        const steps = [
          () => glide(maxScroll() * .58, 2000, alive),
          () => gate.ready(800),
          () => glide(0, 1400, alive),
          () => gate.ready(800),
          async () => { ripple(rows[recalled].querySelector('.tl-card')); await sleep(140); await openSheet(recalled); },
          () => gate.ready(3400),
          () => closeSheet(),
          () => gate.ready(1100),
          async () => { ripple(fab); await sleep(140); openSearch(true); await sleep(650); },
          () => type(data.timeline.query, alive),
          () => gate.ready(2600),
          () => openSearch(false),
          () => gate.ready(1500),
        ];
        for (const step of steps) {
          if (!alive()) break;
          await step();
        }
      }
    })();
  }

  /* ---------- Rules: one effect at a time ---------- */
  function Rules(root) {
    const R = data.rules;
    const items = [...root.querySelectorAll('[data-action]')];
    const bars = items.map(b => b.querySelector('.fx-progress i'));
    const screen = root.querySelector('[data-lock]');
    const side = root.querySelector('[data-side]');
    const device = screen.closest('[data-device]');
    screen.innerHTML = `${statusBar()}<div class="lock"><div class="lock-wall"></div><div class="lock-date">${esc(data.date)}</div><div class="lock-clock">${data.clock}</div><div class="lock-stack"></div><div class="lock-foot"><span>${svg('i-torch')}</span><em>${svg('i-lock')}</em><span>${svg('i-camera')}</span></div></div><div class="gbar"></div>`;
    const lock = screen.querySelector('.lock');
    const stack = screen.querySelector('.lock-stack');
    const clock = screen.querySelector('.lock-clock');
    const sb = screen.querySelector('.sb');
    const gate = new Gate(root, .35);
    const DURATION = 6500;
    let token = 0, current = 0, elapsed = 0, raf = 0, last = 0;

    function reset() {
      stack.innerHTML = '';
      lock.querySelectorAll('.call, .appview').forEach(n => n.remove());
      sb.classList.remove('sb--light');
      clock.getAnimations().forEach(x => x.cancel());
      clock.textContent = data.clock;
      side.innerHTML = '';
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    }
    function sideItem(icon, extra = '', cls = '') {
      const node = make('div', `side-item${cls ? ` ${cls}` : ''}`, `<span class="disc">${svg(icon)}</span>${extra}`);
      side.append(node);
      if (!reduced) node.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], SP);
      return node;
    }
    const eq = () => `<span class="eq">${Array.from({ length: 9 }, (_, i) => `<i style="--n:${i}"></i>`).join('')}</span>`;
    const shake = card => { if (!reduced) card.animate([{ transform: 'none' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 380 }); };

    async function play(action, user) {
      const my = ++token;
      const alive = () => my === token;
      const wait = async ms => { await sleep(ms); return alive(); };
      const sc = R.scenarios[action];
      reset();
      if (!await wait(240)) return;
      const card = ncard(sc.n, ui.now, action === 'tap' ? { actions: sc.buttons.map(esc) } : {});
      stack.append(card);
      arrive(card);
      if (!await wait(reduced ? 60 : 1000)) return;
      switch (action) {
        case 'dismiss':
          await leave(card);
          card.remove();
          break;
        case 'mute': {
          const node = sideItem('i-mute', '<b class="side-label" data-left>5s</b>');
          node.querySelector('.disc').insertAdjacentHTML('beforeend', '<svg class="ring" viewBox="0 0 86 86" aria-hidden="true"><circle cx="43" cy="43" r="40"/></svg>');
          if (!reduced) node.querySelector('.ring circle').animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 251.3 }], { duration: 5000, fill: 'forwards' });
          const left = node.querySelector('[data-left]');
          for (let s = 4; s >= 0; s--) {
            if (!await wait(1000)) return;
            left.textContent = `${s}s`;
          }
          break;
        }
        case 'snooze': {
          sideItem('i-snooze', `<b class="side-label">${esc(sc.until)}</b>`);
          await leave(card, -16);
          card.remove();
          if (!await wait(1400)) return;
          const fade = clock.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
          await fade.finished;
          fade.cancel();
          if (!alive()) return;
          clock.textContent = sc.until;
          clock.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: ENTER });
          if (!await wait(500)) return;
          const back = ncard(sc.n, sc.until);
          stack.append(back);
          arrive(back);
          shake(back);
          break;
        }
        case 'replace': {
          const title = card.querySelector('.ncard-title'), text = card.querySelector('.ncard-text');
          const glyphs = '▒░▓#*%';
          const t0 = performance.now();
          await new Promise(resolve => {
            const step = now => {
              if (now - t0 >= 650 || !alive() || reduced) return resolve();
              title.textContent = sc.n.title.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
              text.textContent = sc.n.text.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
              requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
          if (!alive()) return;
          title.textContent = sc.replaced.title;
          text.textContent = sc.replaced.text;
          break;
        }
        case 'sound':
          shake(card);
          sideItem('i-note', eq(), 'wave');
          if (user) Sound.marimba();
          break;
        case 'tts':
          sideItem('i-speak', eq(), 'wave');
          if (user) Sound.speak(sc.speech);
          break;
        case 'call': {
          sideItem('i-call', '', 'wave');
          const call = make('div', 'call', `${ico(sc.n.app)}<h4>${esc(sc.n.title)}</h4><p>${esc(sc.n.text)}</p><small>${esc(appName(sc.n.app))}</small><div class="call-btns"><span><i>${svg('i-call')}</i>${esc(sc.decline)}</span><span><i>${svg('i-call')}</i>${esc(sc.answer)}</span></div>`);
          lock.append(call);
          sb.classList.add('sb--light');
          if (!reduced) call.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 480, easing: ENTER });
          if (user) Sound.ring();
          if (!await wait(4200)) return;
          await call.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: reduced ? 1 : 300, easing: EXIT, fill: 'forwards' }).finished;
          if (!alive()) return;
          call.remove();
          sb.classList.remove('sb--light');
          side.innerHTML = '';
          break;
        }
        case 'tap': {
          const target = [...card.querySelectorAll('.ncard-actions span')].find(b => b.textContent === sc.button);
          if (!await wait(300)) return;
          await ripple(target);
          if (!alive()) return;
          await leave(card);
          card.remove();
          break;
        }
        case 'open': {
          ripple(card);
          if (!await wait(240)) return;
          const view = make('div', 'appview', `<div class="appview-bar">${ico(sc.n.app)}${esc(appName(sc.n.app))}</div><div class="appview-map"></div><h4>${esc(sc.screen.title)}</h4><p>${esc(sc.screen.text)}</p><div class="appview-code">${[...sc.screen.code].map(c => `<b>${esc(c)}</b>`).join('')}</div>`);
          const k = scaleOf(card), l = lock.getBoundingClientRect(), c = card.getBoundingClientRect();
          lock.append(view);
          if (!reduced) view.animate([
            { clipPath: `inset(${(c.top - l.top) / k}px ${(l.right - c.right) / k}px ${(l.bottom - c.bottom) / k}px ${(c.left - l.left) / k}px round 26px)` },
            { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
          ], { duration: 460, easing: ENTER });
          if (!await wait(480)) return;
          card.remove();
          if (!await wait(3600)) return;
          await view.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 1 : 300, fill: 'forwards' }).finished;
          if (alive()) view.remove();
          break;
        }
        case 'webhook': {
          const node = sideItem('i-server', `<span class="side-label mono">${esc(sc.host)}</span><b class="side-label ok" data-ok>&nbsp;</b>`);
          if (!await wait(450)) return;
          const s = side.getBoundingClientRect(), d = device.getBoundingClientRect(), c = card.getBoundingClientRect(), disc = node.querySelector('.disc').getBoundingClientRect();
          const ex = disc.left - s.left + disc.width / 2, ey = disc.top - s.top + disc.height / 2;
          const below = s.top >= d.bottom - 1;
          const [x0, y0] = below ? [ex, 0] : [0, clamp(c.top + c.height / 2 - s.top, 0, s.height)];
          const control = below ? `${ex} ${ey / 2}` : `${ex} ${y0}`;
          const wire = make('div', 'side-wire', `<svg viewBox="0 0 ${s.width} ${s.height}" preserveAspectRatio="none" aria-hidden="true"><path d="M${x0} ${y0} Q${control} ${ex} ${ey}"/><circle r="4.5" cx="${x0}" cy="${y0}"/></svg>`);
          side.prepend(wire);
          const path = wire.querySelector('path'), dot = wire.querySelector('circle'), length = path.getTotalLength();
          if (!reduced) {
            wire.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
            await new Promise(resolve => {
              const t0 = performance.now();
              const step = now => {
                const t = Math.min(1, (now - t0) / 1000), e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
                const p = path.getPointAtLength(e * length);
                dot.setAttribute('cx', p.x);
                dot.setAttribute('cy', p.y);
                t < 1 && alive() ? requestAnimationFrame(step) : resolve();
              };
              requestAnimationFrame(step);
            });
          }
          if (!alive()) return;
          dot.remove();
          node.querySelector('[data-ok]').textContent = data.enhancers.webhook.ok;
          node.classList.add('done');
          break;
        }
      }
    }

    function select(i, user) {
      current = i;
      elapsed = 0;
      items.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      bars.forEach(b => { b.style.transform = 'scaleX(0)'; });
      play(items[i].dataset.action, user);
    }
    items.forEach((b, i) => b.addEventListener('click', () => select(i, true)));

    function tick(now) {
      raf = 0;
      const dt = Math.min(64, now - last);
      last = now;
      if (performance.now() >= gate.hold) elapsed += dt;
      bars[current].style.transform = `scaleX(${Math.min(1, elapsed / DURATION)})`;
      if (elapsed >= DURATION) select((current + 1) % items.length, false);
      if (gate.open) raf = requestAnimationFrame(tick);
    }
    const run = () => { if (!raf && gate.open && !reduced) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    gate.watch(open => open && run());
    items[0].setAttribute('aria-pressed', 'true');
    gate.firstSeen.then(() => { select(0, false); run(); });
  }

  /* ---------- AI: the sieve ---------- */
  function Sieve(fig) {
    const A = data.ai, L = A.labels;
    const stage = fig.querySelector('[data-stage]');
    const canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    const cloud = fig.querySelector('[data-cloud]');
    const rail = fig.querySelector('[data-scale]');
    const dotsBox = fig.querySelector('[data-dots]');
    const stats = fig.querySelector('[data-stats]');
    const W = 600, H = 640, S = 6.3, CX = 300, Y0 = 150, CUT = .8;
    const X = x => CX + (x - 54.5) * S, Y = y => Y0 + (y - 30) * S;
    const BELL = new Path2D('M72.36,66.42C73.72,67.79 72.77,70.13 70.83,70.13L38.15,70.13C36.23,70.13 35.28,67.79 36.64,66.42L39.42,63.62L39.42,50.61C39.42,43.34 44.5,37.27 51.27,35.79L51.27,33.25C51.27,31.45 52.71,30 54.5,30C56.29,30 57.73,31.45 57.73,33.25L57.73,35.79C64.5,37.27 69.58,43.34 69.58,50.61L69.58,63.62L72.36,66.42Z'.replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${X(+x).toFixed(2)},${Y(+y).toFixed(2)}`));
    const CLAPPER = { x: X(54.99), y: Y(72.09), w: (59.37 - 50.61) * S / 2 };
    const BARS = [[44.48, 64.52, 46.01, 49.63], [47.65, 61.35, 52.73, 56.08], [51.42, 57.58, 58.93, 62.54]].map(([x1, x2, y1, y2]) => ({ x1: X(x1), x2: X(x2), y1: Y(y1), y2: Y(y2), glow: 0 }));
    const STOPS = [Y(31), ...BARS.map(b => (b.y1 + b.y2) / 2), CLAPPER.y];
    const T1 = .6, T2 = 2.1, G = 2300, KICK = -260, BOUNCE = .3;
    const logit = p => Math.log(clamp(p, .01, .99) / (1 - clamp(p, .01, .99)));
    const sigmoid = z => 1 / (1 + Math.exp(-z));
    const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const tintRgb = p => { const t = clamp((p - .3) / .7); return [mix(169, 255, t), mix(156, 143, t), mix(134, 0, t)]; };
    const mixRgb = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
    const css = (c, a = 1) => `rgba(${c.map(Math.round).join(', ')}, ${a})`;
    const tint = p => css(tintRgb(p));
    const samples = A.samples.map(s => ({ ...s, base: s.s / 100, score: s.s / 100, fed: null, row: 0 }));
    const weights = {};
    const particles = Array.from({ length: 70 }, (_, i) => ({ x: (i * 37 % 100) / 100, p: (i * 53 % 100) / 100, v: .08 + (i * 29 % 10) / 100, len: 6 + i % 9 }));
    const dots = new Map();
    const gate = new Gate(fig, .25, 9000);
    let learned = 0, traveler = null, pulse = 0, rings = [], puffs = [], pills = [], queue = 0, drag = null, peek = 0;
    let scale = 1, dpr = 1, last = performance.now(), frame = 0;

    stage.setAttribute('aria-hidden', 'true');
    fig.querySelectorAll('[data-zone], [data-line]').forEach(n => { n.style.left = `${CUT * 100}%`; });
    fig.querySelector('[data-tag]').textContent = fmt(L.threshold, { n: CUT * 100 });
    const card = make('div', 'dot-card');
    card.hidden = true;
    stage.append(card);

    /* Counts, as one line of coloured text */
    const parts = L.stats.split(' · ');
    function renderStats() {
      let k = 0, f = 0;
      for (const s of dots.keys()) s.score >= CUT ? f++ : k++;
      const v = { k, f, l: learned };
      stats.innerHTML = parts.map(part => {
        const key = (part.match(/\{(\w+)\}/) || [])[1] || '';
        return `<span class="${key}">${esc(part).replace(/\{(\w+)\}/, (_, x) => `<b>${num.format(v[x])}</b>`)}</span>`;
      }).join('<span class="sep">·</span>');
    }

    /* Landed dots on the scale */
    function rowsFor(list, width) {
      const placed = [];
      return list.map(s => {
        const x = s.score * width;
        let row = 0;
        while (placed.some(p => p.row === row && Math.abs(p.x - x) < 15)) row++;
        placed.push({ x, row });
        return row;
      });
    }
    function layoutDots() {
      const list = [...dots.keys()], rows = rowsFor(list, dotsBox.clientWidth || 1);
      list.forEach((s, i) => {
        const dot = dots.get(s);
        s.row = rows[i];
        dot.style.left = `${s.score * 100}%`;
        dot.style.bottom = `${s.row * 15}px`;
        dot.classList.toggle('spam', s.score >= CUT);
        dot.classList.toggle('fed', !!s.fed);
      });
      renderStats();
    }
    function landing(s) {
      const box = dotsBox.getBoundingClientRect(), st = stage.getBoundingClientRect();
      const row = rowsFor([...dots.keys()].filter(x => x !== s).concat(s), box.width).pop();
      return { x: (box.left - st.left + s.score * box.width) / scale, y: (box.bottom - st.top - 7 - row * 15) / scale };
    }
    function land(s) {
      if (drag?.s === s) return;
      dots.get(s)?.remove();
      dots.delete(s);
      const dot = make('span', 'dot');
      dot.s = s;
      dots.set(s, dot);
      dotsBox.append(dot);
      layoutDots();
    }
    function rescore() {
      for (const s of samples) s.score = s.fed ? (s.fed === 'spam' ? .992 : .008) : sigmoid(logit(s.base) + s.t.reduce((z, t) => z + (weights[t] || 0) * .8, 0));
      layoutDots();
    }
    function teach(s, spam) {
      const was = s.fed, now = spam ? 'spam' : 'normal';
      const w = v => (v === 'spam' ? 1.4 : v === 'normal' ? -1.4 : 0);
      if (was !== now) {
        for (const t of s.t) weights[t] = (weights[t] || 0) + w(now) - w(was);
        if (!was) learned++;
        s.fed = now;
      }
      rescore();
      pulse = 1;
      wake();
      stage.querySelector('.sieve-toast')?.remove();
      const toast = make('div', 'sieve-toast', esc(spam ? L.teach_spam : L.teach_normal));
      stage.append(toast);
      if (!reduced) toast.animate([{ opacity: 0, transform: 'translate(-50%, -6px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 260, easing: 'ease-out' });
      setTimeout(() => toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => toast.remove()), 2200);
    }

    /* Notification details unfold from a dot while it is held or dragged. */
    function placeCard(cx, cy) {
      const w = card.offsetWidth, h = card.offsetHeight, left = clamp(cx - w / 2, 0, stage.clientWidth - w);
      card.style.left = `${left}px`;
      card.style.top = `${cy - h - 22}px`;
      card.style.setProperty('--ax', `${clamp(cx - left, 18, w - 18)}px`);
    }
    function paintCard(p) {
      card.style.setProperty('--tint', tint(Math.max(p, .02)));
      card.querySelector('[data-label]').textContent = p >= CUT ? L.spam : L.normal;
      card.querySelector('[data-pct]').textContent = `${Math.round(p * 100)}%`;
    }
    function openCard(s, cx, cy) {
      clearTimeout(peek);
      card.getAnimations().forEach(a => a.cancel());
      card.innerHTML = `<div class="dot-card-head">${ico(s.app)}<b>${esc(appName(s.app))}</b></div><p>${esc(s.text)}</p><div class="dot-card-score"><span data-label></span><b data-pct></b></div>`;
      card.hidden = false;
      paintCard(s.score);
      placeCard(cx, cy);
      if (!reduced) card.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'none' }], SP);
    }
    function closeCard() {
      clearTimeout(peek);
      if (card.hidden) return;
      card.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.3)' }], { duration: reduced ? 1 : 200, easing: 'ease-in', fill: 'forwards' }).finished.then(() => {
        card.hidden = true;
        card.getAnimations().forEach(a => a.cancel());
      }, () => {});
    }
    const centerOf = el => { const r = el.getBoundingClientRect(), st = stage.getBoundingClientRect(); return { x: r.left - st.left + r.width / 2, y: r.top - st.top + r.height / 2 }; };
    dotsBox.addEventListener('pointerdown', event => {
      const dot = event.target.closest('.dot');
      if (!dot || event.button > 0 || drag) return;
      event.preventDefault();
      const c = centerOf(dot);
      drag = { s: dot.s, dot, id: event.pointerId, x0: event.clientX, y0: event.clientY, c, moved: false, p: dot.s.score };
      dot.setPointerCapture(event.pointerId);
      dot.classList.add('held');
      dot.style.transition = 'transform .3s cubic-bezier(.34, 1.42, .64, 1), background .2s';
      dot.style.transform = 'scale(1.5)';
      openCard(dot.s, c.x, c.y);
      gate.pause(10000);
    });
    dotsBox.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0, dy = event.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      const st = stage.getBoundingClientRect(), r = rail.getBoundingClientRect();
      const x = clamp(drag.c.x + dx, r.left - st.left, r.right - st.left);
      const y = clamp(drag.c.y + dy, st.height * .4, r.top - st.top - 14);
      drag.p = clamp((x - (r.left - st.left)) / r.width);
      drag.dot.style.transition = 'background .15s';
      drag.dot.style.transform = `translate(${x - drag.c.x}px, ${y - drag.c.y}px) scale(1.6)`;
      drag.dot.style.background = tint(Math.max(drag.p, .02));
      paintCard(drag.p);
      placeCard(x, y);
      gate.pause(10000);
    });
    const drop = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const { s, dot, moved, p } = drag;
      drag = null;
      dot.classList.remove('held');
      if (!moved) {
        dot.style.transform = '';
        setTimeout(() => { dot.style.transition = ''; }, 320);
        peek = setTimeout(closeCard, 2200);
        return;
      }
      closeCard();
      const before = dot.getBoundingClientRect();
      teach(s, p >= CUT);
      dot.style.transform = '';
      dot.style.background = '';
      const after = dot.getBoundingClientRect();
      if (!reduced) dot.animate([
        { transform: `translate(${before.left + before.width / 2 - after.left - after.width / 2}px, ${before.top + before.height / 2 - after.top - after.height / 2}px) scale(1.6)`, background: tint(Math.max(p, .02)) },
        { transform: 'none' },
      ], { duration: SP.duration, easing: SP.easing });
      requestAnimationFrame(() => { dot.style.transition = ''; });
    };
    dotsBox.addEventListener('pointerup', drop);
    dotsBox.addEventListener('pointercancel', drop);

    /* Notifications waiting above the bell */
    const SLOTS = [[0, .03, .02], [1, .018, .03], [0, .1, .1], [1, .088, .06], [0, .17, .01], [1, .158, .1]];
    function pill(s, slot) {
      const node = make('span', 'pill', `${ico(s.app)}<span>${esc(s.text)}</span>`);
      cloud.append(node);
      pills.push({ s, node, slot, phase: slot * 1.7 });
      placePills(performance.now());
      if (!reduced) node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
    }
    /* Narrow stages show two rows of notifications instead of three. */
    const narrow = () => stage.clientWidth < 480;
    function placePills(time) {
      const width = stage.clientWidth, half = width / 2, tight = narrow();
      for (const p of pills) {
        const [col, sy, jitter] = SLOTS[p.slot];
        const bob = reduced ? 0 : Math.sin(time / 1000 * .9 + p.phase) * (tight ? 2 : 4);
        const x = col * half + Math.min(jitter * width, half - p.node.offsetWidth - 6);
        const y = tight ? Math.floor(p.slot / 2) * 38 + (col ? 6 : 0) : sy * width * (H / W);
        p.node.classList.toggle('off', tight && p.slot > 3);
        p.node.style.transform = `translate(${x}px, ${y + bob}px)`;
      }
    }
    function nextSample() {
      const busy = new Set([...pills.map(p => p.s), traveler?.s, drag?.s]);
      for (let n = 0; n < samples.length; n++) {
        const s = samples[queue++ % samples.length];
        if (!busy.has(s)) return s;
      }
      return samples[0];
    }
    function send(p) {
      if (traveler) return false;
      pills = pills.filter(x => x !== p);
      setTimeout(() => pill(nextSample(), p.slot), reduced ? 0 : 1600);
      if (reduced) { p.node.remove(); land(p.s); return true; }
      const st = stage.getBoundingClientRect(), icon = p.node.querySelector('.ico').getBoundingClientRect();
      const start = { x: (icon.left - st.left + icon.width / 2) / scale, y: (icon.top - st.top + icon.height / 2) / scale };
      p.node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' }).finished.then(() => p.node.remove());
      traveler = { s: p.s, start, t0: performance.now(), passed: 0, shown: 0, flight: null, from: rgbOf(APPS[p.s.app].icon) };
      wake();
      return true;
    }
    cloud.addEventListener('click', event => {
      const node = event.target.closest('.pill');
      const p = node && pills.find(x => x.node === node);
      if (p && send(p)) gate.pause(6000);
    });

    /* Canvas: the bell, its three bars and the travelling notification */
    function resize() {
      const r = stage.getBoundingClientRect();
      scale = r.width / W || 1;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      placePills(performance.now());
      layoutDots();
      draw(performance.now());
    }
    function descend(p) {
      const span = STOPS[STOPS.length - 1] - STOPS[0];
      for (let i = 1; i < STOPS.length; i++) {
        const b = (STOPS[i] - STOPS[0]) / span;
        if (p <= b || i === STOPS.length - 1) {
          const a = (STOPS[i - 1] - STOPS[0]) / span, q = clamp((p - a) / (b - a));
          return mix(STOPS[i - 1], STOPS[i], .62 * (.5 - Math.cos(Math.PI * q) / 2) + .38 * q);
        }
      }
      return STOPS[STOPS.length - 1];
    }
    function launch(tr, now) {
      const end = landing(tr.s);
      const T = (-KICK + Math.sqrt(KICK * KICK + 2 * G * (end.y - CLAPPER.y))) / G;
      tr.flight = { t0: now, x0: CLAPPER.x, y0: CLAPPER.y, vx: (end.x - CLAPPER.x) / T, T, end, impact: KICK + G * T, puffed: false };
      rings.push({ y: CLAPPER.y, w: CLAPPER.w * 2, t0: now });
      pulse = Math.max(pulse, .5);
    }
    function draw(now) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.shadowColor = 'rgba(160, 100, 0, .16)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#fffdf7';
      ctx.fill(BELL);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(CLAPPER.x, CLAPPER.y, CLAPPER.w, CLAPPER.w * .62, 0, 0, Math.PI);
      ctx.fillStyle = '#fffdf7';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(230, 130, 0, ${.38 + pulse * .4})`;
      ctx.stroke(BELL);
      ctx.stroke();
      if (!reduced) {
        ctx.save();
        ctx.clip(BELL);
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.2;
        for (const p of particles) {
          p.p = (p.p + p.v * dt) % 1;
          const y = mix(Y(33), Y(70), p.p);
          const x = CX + (p.x - .5) * 230 * (1 - .62 * p.p) + Math.sin(now / 900 + p.x * 9) * 4;
          ctx.strokeStyle = `rgba(255, 150, 20, ${(.08 + .18 * Math.sin(p.p * Math.PI)) * (1 + pulse)})`;
          ctx.beginPath();
          ctx.moveTo(x, y - p.len);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.restore();
      }
      for (const b of BARS) {
        const g = Math.max(b.glow, pulse * .7);
        ctx.save();
        if (g > .02) { ctx.shadowColor = `rgba(255, 143, 0, ${g * .8})`; ctx.shadowBlur = 24 * g; }
        ctx.fillStyle = `rgba(255, 143, 0, ${.2 + g * .8})`;
        ctx.beginPath();
        ctx.roundRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1, (b.y2 - b.y1) / 2);
        ctx.fill();
        ctx.restore();
        b.glow = Math.max(0, b.glow - dt * 1.6);
      }
      rings = rings.filter(r => now - r.t0 < 900);
      for (const r of rings) {
        const t = (now - r.t0) / 900;
        ctx.strokeStyle = `rgba(255, 143, 0, ${(1 - t) * .5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(CX, r.y, r.w / 2 + t * 46, 9 + t * 16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      puffs = puffs.filter(p => now - p.t0 < 480);
      for (const p of puffs) {
        const t = (now - p.t0) / 480;
        ctx.strokeStyle = css(p.c, (1 - t) * .55);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 7 / scale + t * 22, 2 + t * 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      pulse = Math.max(0, pulse - dt * 1.2);
      if (traveler) drawTraveler(now, dt);
    }
    function drawTraveler(now, dt) {
      const tr = traveler, s = tr.s, t = (now - tr.t0) / 1000, r0 = 7 / scale;
      let x, y, r = r0, sx = 1, sy = 1, color, alpha = 1, label = 0;
      if (t < T1) {
        const q = t / T1, e = q < .5 ? 4 * q ** 3 : 1 - (-2 * q + 2) ** 3 / 2;
        x = (1 - e) ** 2 * tr.start.x + 2 * (1 - e) * e * CX + e * e * CX;
        y = (1 - e) ** 2 * tr.start.y + 2 * (1 - e) * e * tr.start.y + e * e * STOPS[0];
        r = mix(10 / scale, r0, e);
        alpha = Math.min(1, t / .12);
        color = tr.from;
      } else if (t < T1 + T2) {
        const p = (t - T1) / T2;
        y = descend(p);
        x = mix(CX, CLAPPER.x, p) + Math.sin((t - T1) * 6.5) * 14 * (1 - p);
        BARS.forEach((b, i) => {
          if (tr.passed <= i && y >= (b.y1 + b.y2) / 2) {
            tr.passed = i + 1;
            b.glow = 1;
            rings.push({ y: (b.y1 + b.y2) / 2, w: b.x2 - b.x1, t0: now });
          }
        });
        tr.shown += (s.score * [0, .45, .8, 1][tr.passed] - tr.shown) * Math.min(1, dt * 7);
        color = mixRgb(tr.from, tintRgb(tr.shown), Math.min(1, (t - T1) / .4));
        label = tr.passed ? 1 : 0;
      } else {
        if (!tr.flight) launch(tr, now);
        const f = tr.flight, ft = (now - f.t0) / 1000;
        tr.shown += (s.score - tr.shown) * Math.min(1, dt * 10);
        color = tintRgb(tr.shown);
        label = 1;
        if (ft < f.T) {
          x = f.x0 + f.vx * ft;
          y = f.y0 + KICK * ft + G * ft * ft / 2;
        } else {
          const tb = ft - f.T, vb = -f.impact * BOUNCE, Tb = -2 * vb / G;
          x = f.end.x;
          y = f.end.y;
          if (!f.puffed) { f.puffed = true; puffs.push({ x, y: y + r0, t0: now, c: tintRgb(s.score) }); }
          if (tb < Tb) {
            y = f.end.y + vb * tb + G * tb * tb / 2;
            const k = clamp(1 - tb / .09);
            sx = 1 + .35 * k;
            sy = 1 - .3 * k;
          } else if (tb < Tb + .12) {
            const k = clamp(1 - (tb - Tb) / .1);
            sx = 1 + .14 * k;
            sy = 1 - .12 * k;
          } else {
            traveler = null;
            land(s);
            return;
          }
          label = clamp(1 - tb / .3);
        }
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = css(color);
      ctx.beginPath();
      ctx.ellipse(x, y + r * (1 - sy), r * sx, r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, .7)';
      ctx.beginPath();
      ctx.arc(x - r * .3, y - r * .3 + r * (1 - sy), r * .28, 0, Math.PI * 2);
      ctx.fill();
      if (label > .01) {
        ctx.globalAlpha = label;
        ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = css(color);
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(tr.shown * 100)}%`, x + r + 8, y + 5);
      }
      ctx.restore();
    }
    function loop(now) {
      frame = 0;
      draw(now);
      placePills(now);
      if (gate.open && !reduced) frame = requestAnimationFrame(loop);
    }
    function wake() { if (!frame && gate.open && !reduced) { last = performance.now(); frame = requestAnimationFrame(loop); } }
    gate.watch(open => open && wake());
    new ResizeObserver(resize).observe(stage);

    SLOTS.forEach((_, slot) => pill(samples[(slot * 5 + 3) % samples.length], slot));
    queue = 7;
    [0, 1, 2, 4, 5, 7, 9, 11, 13, 14, 15, 17].forEach(i => land(samples[i]));
    resize();
    if (reduced) return;
    (async () => {
      await gate.firstSeen;
      for (;;) {
        await gate.ready(traveler ? 500 : 2400);
        const ready = pills.filter(p => !p.node.classList.contains('off'));
        if (traveler || drag || !ready.length) continue;
        send(ready.reduce((a, b) => (SLOTS[a.slot][1] < SLOTS[b.slot][1] ? b : a)));
      }
    })();
  }

  /* ---------- Enhancers: looping scenes with one notification style ---------- */
  function Enhancers() {
    const E = data.enhancers;
    const own = (title, text) => ({ app: 'filterbox', title, text });
    const scenes = {
      async recall(stage, gate) {
        const n = E.recall.n;
        let card = ncard(n);
        stage.append(card);
        if (reduced) return;
        await gate.firstSeen;
        for (;;) {
          await gate.ready(1900);
          await card.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(115%) rotate(5deg)', opacity: .5 }], { duration: 420, easing: 'cubic-bezier(.45, 0, .8, .4)', fill: 'forwards' }).finished;
          card.remove();
          const undo = ncard(own(fmt(ui.dismissed, { app: appName(n.app) }), `${n.title}: ${n.text}`), ui.now, { actions: [`${svg('i-undo')}${esc(ui.undo)}`], bar: true });
          stage.append(undo);
          arrive(undo);
          const timer = undo.querySelector('.ncard-bar').animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 5000, fill: 'forwards' });
          await gate.ready(1700);
          await ripple(undo.querySelector('.ncard-actions span'));
          timer.pause();
          await leave(undo);
          undo.remove();
          card = ncard(n);
          stage.append(card);
          arrive(card);
        }
      },
      async shh(stage, gate) {
        const S = E.shh;
        stage.innerHTML = `<span class="scene-sound">${svg('i-note')}</span><div class="scene-stack"></div>`;
        const sound = stage.querySelector('.scene-sound'), use = sound.querySelector('use'), stack = stage.querySelector('.scene-stack');
        const layout = () => [...stack.children].reverse().forEach((c, depth) => {
          c.style.translate = `0 ${-depth * 13}px`;
          c.style.scale = String(1 - depth * .05);
          c.style.opacity = depth > 2 ? '0' : '1';
          c.style.zIndex = String(10 - depth);
          c.classList.toggle('back', depth > 0);
          c.classList.toggle('back2', depth > 1);
        });
        const put = (n, behind) => {
          const c = ncard(n);
          if (behind && stack.lastElementChild) {
            stack.insertBefore(c, stack.lastElementChild);
            c.classList.add('back');
            c.style.zIndex = '9';
            void c.offsetWidth;
          } else stack.append(c);
          layout();
          if (!reduced && !behind) c.animate([{ transform: 'translateY(40px) scale(.94)' }, { transform: 'none' }], SP);
          while (stack.children.length > 4) stack.firstElementChild.remove();
        };
        const ring = () => { sound.classList.remove('ring'); void sound.offsetWidth; sound.classList.add('ring'); };
        const mute = on => use.setAttribute('href', on ? '#i-mute' : '#i-note');
        if (reduced) {
          S.messages.slice(0, 3).forEach(m => put(m));
          put(own(S.muting.title, S.muting.text));
          mute(true);
          return;
        }
        await gate.firstSeen;
        for (;;) {
          mute(false);
          await gate.ready(700);
          for (let i = 0; i < S.messages.length; i++) {
            if (i === 3) {
              put(own(S.muting.title, S.muting.text));
              mute(true);
              await gate.ready(1000);
            }
            put(S.messages[i], i >= 3);
            if (i < 3) ring();
            await gate.ready(i < 3 ? 700 : 900);
          }
          await gate.ready(2300);
          await Promise.all([...stack.children].map(c => leave(c)));
          stack.innerHTML = '';
        }
      },
      async captcha(stage, gate) {
        const C = E.captcha;
        const build = () => {
          const c = ncard(C.n);
          c.insertAdjacentHTML('beforeend', `<div class="ncard-more"><div><div class="ncard-actions"><span>${svg('i-copy')}<em>${esc(fmt(ui.copy, { code: C.code }))}</em></span></div></div></div>`);
          stage.append(c);
          return c;
        };
        let card = build();
        if (reduced) { card.classList.add('more'); return; }
        await gate.firstSeen;
        for (;;) {
          await gate.ready(1100);
          card.classList.add('more');
          await gate.ready(1500);
          const chip = card.querySelector('.ncard-actions span');
          ripple(chip);
          await sleep(160);
          chip.querySelector('use').setAttribute('href', '#i-check');
          chip.querySelector('em').textContent = fmt(ui.copied, { code: C.code });
          await gate.ready(2200);
          await leave(card);
          card.remove();
          await gate.ready(450);
          card = build();
          arrive(card);
        }
      },
      async webhook(stage, gate) {
        const H = E.webhook;
        stage.innerHTML = `<div class="scene-server"><span>${esc(H.host)}<b></b></span><i>${svg('i-server')}</i></div><i class="scene-path"></i>`;
        const server = stage.querySelector('.scene-server'), status = server.querySelector('b'), icon = server.querySelector('i'), path = stage.querySelector('.scene-path');
        let card = ncard(H.n);
        stage.append(card);
        const fit = () => { path.style.height = `${Math.max(0, stage.clientHeight - card.offsetHeight - 60)}px`; };
        new ResizeObserver(fit).observe(stage);
        fit();
        if (reduced) { status.textContent = H.ok; return; }
        await gate.firstSeen;
        for (;;) {
          await gate.ready(1200);
          const packet = make('span', 'packet', 'POST · JSON');
          stage.append(packet);
          const st = stage.getBoundingClientRect(), ic = icon.getBoundingClientRect(), c = card.getBoundingClientRect();
          const x = ic.left - st.left + ic.width / 2 - packet.offsetWidth / 2;
          const y0 = c.top - st.top - packet.offsetHeight / 2, y1 = ic.top - st.top + ic.height / 2 - packet.offsetHeight / 2;
          await packet.animate([
            { transform: `translate(${x}px, ${y0 + 10}px) scale(.6)`, opacity: 0 },
            { transform: `translate(${x}px, ${y0}px)`, opacity: 1, offset: .18 },
            { transform: `translate(${x}px, ${y1}px) scale(.5)`, opacity: 1, offset: .88 },
            { transform: `translate(${x}px, ${y1}px) scale(.3)`, opacity: 0 },
          ], { duration: 1200, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;
          packet.remove();
          status.textContent = H.ok;
          server.classList.add('ok');
          await gate.ready(2300);
          server.classList.remove('ok');
          status.textContent = '';
          await leave(card);
          card.remove();
          await gate.ready(400);
          card = ncard(H.n);
          stage.append(card);
          arrive(card);
          fit();
        }
      },
    };
    document.querySelectorAll('[data-enh]').forEach(el => scenes[el.dataset.enh]?.(el.querySelector('[data-stage]'), new Gate(el, .5, 0)));
  }

  /* ---------- Analytics ---------- */
  function Analytics(screen) {
    const A = data.analytics;
    const total = A.apps.reduce((s, a) => s + a.n, 0), filtered = A.apps.reduce((s, a) => s + a.f, 0);
    const R = 96, C = 2 * Math.PI * R;
    const shortDay = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
    const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short' });
    const max = Math.max(...A.week);
    let offset = 0;
    const donut = A.apps.map(a => {
      const len = a.n / total * C;
      const html = `<circle cx="118" cy="118" r="${R}" stroke="${APPS[a.app].icon}" stroke-dasharray="${len - 2} ${C - len + 2}" stroke-dashoffset="${-offset}"/>`;
      offset += len;
      return html;
    }).join('');
    const top = A.apps.filter(a => a.app !== 'others').slice(0, 4);
    screen.innerHTML = `${statusBar()}<div class="ana"><div class="ana-bar">${svg('i-arrow')}<span>${esc(appName('filterbox'))}</span><em>Pro</em></div>
      <div class="ana-sheet">
        <div class="ana-pager"><div class="ana-pages">
          <section class="ana-page"><div class="ana-title">${esc(A.title)}</div><div class="ana-chart"><svg class="ana-donut" viewBox="0 0 236 236" aria-hidden="true">${donut}</svg><div class="ana-center"><b data-total>${esc(fmt(A.total, { n: num.format(total) }))}</b></div></div><div class="ana-sum">${esc(fmt(A.summary, { n: num.format(total), f: num.format(filtered) }))}</div></section>
          <section class="ana-page"><div class="ana-title">${esc(A.daily)} · ${esc(shortDay.format(YESTERDAY))}</div><div class="ana-chart"><div class="ana-bars">${A.week.map((v, i) => `<div><b>${v}</b><i style="height:${v / max * 78}%${i === 6 ? ';background:#ffb300' : ''}"></i>${esc(weekday.format(new Date(NOW.getTime() - (7 - i) * 86400000)))}</div>`).join('')}</div></div><div class="ana-sum">${esc(fmt(A.summary, { n: num.format(A.week[6]), f: num.format(Math.round(A.week[6] * filtered / total)) }))}</div></section>
        </div></div>
        <div class="ana-dots"><button type="button" class="on" aria-label="1"></button><button type="button" aria-label="2"></button></div>
        <div class="ana-list">${top.map(a => `<div class="ana-row">${ico(a.app)}<p>${esc(appName(a.app))}<small>${esc(fmt(A.summary, { n: num.format(a.n), f: num.format(a.f) }))}</small></p>${svg('i-chevron', 'chev')}</div>`).join('')}</div>
      </div></div>
      <div class="app-nav"><span>${svg('i-bulb')}${esc(ui.intelligence)}</span><span class="on">${svg('i-bars')}${esc(ui.analytics)}</span><span>${svg('i-gear')}${esc(ui.settings)}</span></div><div class="gbar"></div>`;
    const pager = screen.querySelector('.ana-pager');
    const pages = screen.querySelector('.ana-pages');
    const dots = [...screen.querySelectorAll('.ana-dots button')];
    const circles = [...screen.querySelectorAll('.ana-donut circle')];
    const bars = [...screen.querySelectorAll('.ana-bars i')];
    const totalNode = screen.querySelector('[data-total]');
    const gate = new Gate(screen.closest('[data-device]'), .4);
    let page = 0;
    function drawDonut() {
      if (reduced) return;
      circles.forEach((c, i) => {
        const len = parseFloat(c.getAttribute('stroke-dasharray'));
        c.animate([{ strokeDasharray: `0 ${C}` }, { strokeDasharray: `${len} ${C - len}` }], { duration: 700, delay: i * 60, easing: EASE, fill: 'backwards' });
      });
      const t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / 1100);
        totalNode.textContent = fmt(A.total, { n: num.format(Math.round(total * (1 - (1 - t) ** 3))) });
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function growBars() {
      if (!reduced) bars.forEach((b, i) => b.animate([{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 700, delay: 140 + i * 50, easing: EASE, fill: 'backwards' }));
    }
    function go(p) {
      if (p === page) return;
      page = p;
      pages.style.transform = `translateX(${-50 * p}%)`;
      dots.forEach((d, i) => d.classList.toggle('on', i === p));
      p ? growBars() : drawDonut();
    }
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    let startX = null;
    pager.addEventListener('pointerdown', event => { startX = event.clientX; });
    pager.addEventListener('pointerup', event => {
      if (startX == null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 30) go(dx < 0 ? 1 : 0);
    });
    pager.addEventListener('pointercancel', () => { startX = null; });
    if (reduced) return;
    gate.firstSeen.then(async () => {
      drawDonut();
      for (;;) {
        await gate.ready(4800);
        go(page ? 0 : 1);
      }
    });
  }

  /* ---------- Closing bell ---------- */
  function Bell(button) {
    const ring = () => { button.classList.remove('ring'); void button.offsetWidth; button.classList.add('ring'); };
    button.addEventListener('click', () => { ring(); Sound.ding(); });
    new IntersectionObserver(([entry], io) => { if (entry.isIntersecting) { setTimeout(ring, 400); io.disconnect(); } }, { threshold: .6 }).observe(button);
  }

  document.querySelectorAll('.device-screen').forEach(quiet);
  const start = (selector, demo) => { const el = document.querySelector(selector); if (el) demo(el); };
  start('[data-shade]', Shade);
  start('[data-timeline]', Timeline);
  start('[data-rules]', Rules);
  start('[data-sieve]', Sieve);
  Enhancers();
  start('[data-analytics]', Analytics);
  start('[data-bell]', Bell);
})();
