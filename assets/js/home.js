/* FilterBox website — interactive app demos on the home page.
   Demos animate only while on screen. Every app, person and message is fictional sample data. */
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('demo-data').textContent);
  const ui = data.ui;
  const lang = document.documentElement.lang;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NOW = new Date(2026, 9, 12, 10, 8);

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
  const svg = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;
  const make = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const appName = key => key === 'others' ? data.analytics.others : (data.apps[key] ?? key);
  const ico = (key, extra = '') => key === 'filterbox'
    ? `<span class="ico ico--fb ${extra}">${svg('i-bell')}</span>`
    : `<span class="ico ${extra}" style="--c:${APPS[key].icon}">${svg(`g-${key}`)}</span>`;
  const scaleOf = node => parseFloat(getComputedStyle(node.closest('[data-device]') ?? node).getPropertyValue('--k')) || 1;
  const num = new Intl.NumberFormat(lang);
  const statusBar = () => `<div class="sb"><span>${data.clock}</span><span class="sb-icons">${svg('i-wifi')}${svg('i-signal')}${svg('i-battery')}</span></div>`;
  const copyText = async text => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };

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
  const SOFT = spring(170, 26);

  /* Runs a demo only while it is visible, the tab is active and the visitor is not interacting with it. */
  class Gate {
    constructor(target, threshold = .3) {
      this.on = false;
      this.hold = 0;
      this.waiting = [];
      this.seen = false;
      this.firstSeen = new Promise(resolve => { this.resolveSeen = resolve; });
      new IntersectionObserver(([entry]) => {
        this.on = entry.isIntersecting;
        if (this.on && !this.seen) { this.seen = true; this.resolveSeen(); }
        this.flush();
      }, { threshold }).observe(target);
      document.addEventListener('visibilitychange', () => this.flush());
      target.addEventListener('pointerdown', () => this.pause(6000), { passive: true });
    }
    get open() { return this.on && !document.hidden; }
    pause(ms) { this.hold = Math.max(this.hold, performance.now() + ms); }
    flush() { if (this.open) this.waiting.splice(0).forEach(resolve => resolve()); }
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

  function flip(container, mutate, duration = 460) {
    const before = new Map([...container.children].map(child => [child, child.getBoundingClientRect().top]));
    mutate();
    if (reduced) return;
    const k = scaleOf(container);
    for (const child of container.children) {
      if (!before.has(child)) continue;
      const dy = (before.get(child) - child.getBoundingClientRect().top) / k;
      if (Math.abs(dy) > .5) child.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
  }

  function toast(host, text) {
    host.querySelector(':scope > .toast')?.remove();
    const node = make('div', 'toast', esc(text));
    host.append(node);
    node.animate([{ opacity: 0, transform: 'translate(-50%, 12px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 260, easing: 'ease-out' });
    setTimeout(() => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => node.remove()), 1900);
  }

  function ncard(n, time = ui.now) {
    const card = make('div', 'ncard', `<div class="ncard-head">${ico(n.app)}<b>${esc(appName(n.app))}</b><span>· ${esc(time)}</span></div><div class="ncard-title">${esc(n.title)}</div><div class="ncard-text">${esc(n.text)}</div><span class="ncard-chip"></span>`);
    card.data = n;
    return card;
  }

  function arrive(node) {
    if (reduced) return;
    node.animate([{ opacity: 0, transform: 'translateY(-26px) scale(.96)' }, { opacity: 1, transform: 'none' }], SP);
  }

  /* Horizontal swipe to dismiss, shared by the shade and the Dismissal Recall card. */
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
      const dt = Math.max(1, event.timeStamp - drag.t);
      drag.v = (dx - drag.dx) / dt;
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
        dismissCard(card, Math.sign(local || v), from).then(() => onDismiss(card));
      } else {
        card.style.transform = '';
        card.style.opacity = '';
        card.animate([from, { transform: 'none', opacity: 1 }], SP);
      }
    };
    container.addEventListener('pointerup', end);
    container.addEventListener('pointercancel', end);
  }
  function dismissCard(card, dir = 1, from = { transform: 'none', opacity: 1 }) {
    return card.animate([from, { transform: `translateX(${dir * 470}px) rotate(${dir * 9}deg)`, opacity: 0 }], { duration: reduced ? 1 : 300, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).finished;
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

  /* ---------- Hero: the notification shade ---------- */
  function Shade(screen) {
    const qs = ui.qs;
    screen.innerHTML = `${statusBar()}
      <div class="shade">
        <div class="shade-head"><div><div class="shade-clock">${data.clock}</div><div class="shade-date">${esc(data.date)}</div></div><span class="shade-gear">${svg('i-gear')}</span></div>
        <div class="qs">
          <div class="qs-tile on"><i>${svg('i-wifi', '')}</i>${esc(qs[0])}</div>
          <div class="qs-tile on"><i>${svg('i-bluetooth')}</i>${esc(qs[1])}</div>
          <div class="qs-tile"><i>${svg('i-dnd')}</i>${esc(qs[2])}</div>
          <div class="qs-tile"><i>${svg('i-torch')}</i>${esc(qs[3])}</div>
        </div>
        <div class="bright">${svg('g-weather')}</div>
        <div class="nlist"></div>
        <div class="nsect">${esc(ui.silent)}</div>
        <div class="nsum"><div class="nsum-head">${ico('filterbox')}<b>${esc(appName('filterbox'))}</b><span data-sum></span><i class="chev">${svg('i-chevron')}</i></div><div class="nsum-list"><div data-sumlist></div></div></div>
        <div class="shade-foot"><span>${esc(ui.manage)}</span><span>${esc(ui.clear)}</span></div>
      </div>
      <div class="heads"></div><div class="gbar"></div>`;
    screen.querySelector('.qs-tile svg').setAttribute('data-fill', '');
    const list = screen.querySelector('.nlist');
    const sum = screen.querySelector('.nsum');
    const sumText = screen.querySelector('[data-sum]');
    const sumList = screen.querySelector('[data-sumlist]');
    const heads = screen.querySelector('.heads');
    const device = screen.closest('[data-device]');
    const hint = document.querySelector('[data-hint]');
    const gate = new Gate(device);
    const filtered = data.hero.filtered.map(n => ({ ...n }));
    let restoredId = 0;

    data.hero.start.forEach((n, i) => list.append(ncard(n, fmt(ui.min, { n: i ? 12 : 3 }))));

    function renderSum(bump) {
      sumText.textContent = `· ${fmt(ui.filtered, { n: filtered.length })}`;
      sumList.innerHTML = filtered.slice(0, 4).map((n, i) => `<div class="nsum-item">${ico(n.app)}<p><b>${esc(appName(n.app))}</b> ${esc(n.title)}</p><button type="button" data-restore="${i}">${esc(ui.restore)}</button></div>`).join('');
      if (bump && !reduced) { sum.classList.remove('bump'); void sum.offsetWidth; sum.classList.add('bump'); }
    }
    renderSum();

    function trim() {
      const cards = [...list.children].filter(card => !card.leaving);
      while (cards.length > 3) {
        const last = cards.pop();
        last.leaving = true;
        last.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.97)' }], { duration: reduced ? 1 : 260, fill: 'forwards' }).finished.then(() => flip(list, () => last.remove()));
      }
    }
    function add(n, time) {
      const card = ncard(n, time);
      flip(list, () => list.prepend(card));
      arrive(card);
      trim();
      return card;
    }
    function chip(card, text, ok) {
      const node = card.querySelector('.ncard-chip');
      node.textContent = text;
      node.classList.toggle('ok', ok);
      node.classList.add('show');
    }
    function addCopy(card, code) {
      const row = make('div', 'ncard-actions', `<button type="button">${svg('i-copy')}${esc(fmt(ui.copy, { code }))}</button>`);
      card.append(row);
      if (!reduced) row.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
      row.querySelector('button').addEventListener('click', async () => { await copyText(code); toast(screen, fmt(ui.copied, { code })); });
    }
    async function filterOut(card) {
      const k = scaleOf(card);
      const a = card.getBoundingClientRect(), b = sum.getBoundingClientRect();
      const dx = (b.left + b.width / 2 - a.left - a.width / 2) / k, dy = (b.top + b.height / 2 - a.top - a.height / 2) / k;
      card.style.zIndex = 4;
      card.leaving = true;
      await card.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0 }], { duration: reduced ? 1 : 620, easing: 'cubic-bezier(.55, 0, .75, .2)', fill: 'forwards' }).finished;
      flip(list, () => card.remove());
      filtered.unshift(card.data);
      renderSum(true);
    }
    function recall(n) {
      heads.innerHTML = '';
      const hu = make('div', 'hu', `${ico(n.app)}<p>${esc(fmt(ui.dismissed, { app: appName(n.app) }))}<small>${esc(appName('filterbox'))}</small></p><button type="button">${svg('i-undo')}${esc(ui.undo)}</button><span class="hu-bar"></span>`);
      heads.append(hu);
      if (!reduced) hu.animate([{ transform: 'translateY(-130%)' }, { transform: 'none' }], SP);
      const timer = hu.querySelector('.hu-bar').animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 5000, fill: 'forwards' });
      const close = () => hu.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-130%)', opacity: 0 }], { duration: reduced ? 1 : 280, fill: 'forwards' }).finished.then(() => hu.remove());
      timer.finished.then(() => { if (hu.isConnected) close(); }).catch(() => {});
      hu.querySelector('button').addEventListener('click', () => {
        timer.cancel();
        close();
        chip(add(n, ui.now), ui.restored, true);
      });
    }

    swipeable(list, '.ncard', card => {
      flip(list, () => card.remove());
      recall(card.data);
      hint?.classList.add('done');
      gate.pause(5000);
    });
    sum.addEventListener('click', event => {
      const restore = event.target.closest('[data-restore]');
      if (restore) {
        const [n] = filtered.splice(+restore.dataset.restore, 1);
        renderSum(true);
        chip(add({ ...n, restored: ++restoredId }, ui.now), ui.restored, true);
        gate.pause(5000);
        return;
      }
      sum.classList.toggle('open');
    });

    if (reduced) return;
    (async () => {
      let i = 0;
      await gate.ready(1200);
      for (;;) {
        const n = data.hero.stream[i++ % data.hero.stream.length];
        const card = add(n, ui.now);
        await gate.ready(800);
        if (!card.isConnected) continue;
        card.classList.add('scan');
        await gate.ready(950);
        card.classList.remove('scan');
        if (!card.isConnected) continue;
        const spam = n.s >= 80;
        chip(card, `${spam ? ui.spam : ui.normal} ${n.s}%`, !spam);
        if (n.code) addCopy(card, n.code);
        await gate.ready(spam ? 1000 : 1700);
        if (!card.isConnected) continue;
        if (spam) await filterOut(card);
        else card.querySelector('.ncard-chip').classList.remove('show');
        await gate.ready(1500);
      }
    })();
  }

  /* ---------- History: the FilterBox timeline ---------- */
  function Timeline(screen) {
    const items = [...data.timeline.showing.map(n => ({ ...n, showing: true })), ...data.timeline.history];
    const day = new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' });
    const when = m => new Date(NOW.getTime() - m * 60000);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const yesterday = new Date(NOW.getTime() - 86400000);
    const rel = m => {
      const d = when(m);
      if (m < 60) return fmt(ui.min, { n: Math.max(1, Math.round(m)) });
      if (sameDay(d, NOW)) return fmt(ui.hour, { n: Math.round(m / 60) });
      if (sameDay(d, yesterday)) return ui.yesterday;
      return day.format(d);
    };
    const score = (n, i) => n.state === 'ai' ? 90 + (i * 7) % 9 + .4 : (i * 3) % 7 + .6;
    const chips = n => n.state === 'ai' ? `<div class="tl-chips"><span>${esc(ui.ai_filtered)}</span></div>` : n.state === 'rule' ? `<div class="tl-chips"><span>${esc(ui.by_rule)}</span></div>` : '';
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
        <div class="search-chips"></div>
        <div class="search-sugg"><span>${esc(ui.search_hint)}</span>${data.timeline.suggest.map(w => `<button type="button" data-q="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      </div>
      <div class="detail"></div>
    </div><div class="gbar"></div>`;
    screen.querySelector('.search-chips').innerHTML = ui.chips.map(t => `<span>${esc(t)} ${svg('i-chevron')}</span>`).join('');

    const list = screen.querySelector('.tl');
    const axis = screen.querySelector('.tl-axis');
    const thumb = screen.querySelector('.tl-thumb');
    const bubble = screen.querySelector('.tl-bubble');
    const search = screen.querySelector('.search');
    const input = search.querySelector('input');
    const detail = screen.querySelector('.detail');
    const empty = screen.querySelector('.tl-empty');
    const rows = [...list.querySelectorAll('.tl-row')];
    const device = screen.closest('[data-device]');
    const gate = new Gate(device, .4);
    const TOP = 132;
    let touched = false;

    const maxScroll = () => Math.max(1, list.scrollHeight - list.clientHeight);
    const axisH = () => axis.clientHeight;
    function layoutAxis() {
      axis.querySelectorAll('.tl-tick').forEach(t => t.remove());
      let lastY = -99, lastDay = '', lastBucket = '';
      for (const r of rows) {
        const n = items[+r.dataset.i];
        if (n.showing) continue;
        const d = when(n.m);
        const dayKey = d.toDateString(), bucket = `${dayKey}-${Math.floor(d.getHours() / 4)}`;
        const y = Math.min(1, Math.max(0, (r.offsetTop - TOP) / maxScroll())) * axisH();
        if (bucket === lastBucket && dayKey === lastDay) continue;
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
      thumb.style.top = `${(list.scrollTop / maxScroll()) * axisH()}px`;
      bubble.style.top = thumb.style.top;
      const n = items[+topRow().dataset.i];
      const d = when(n.m), h = Math.floor(d.getHours() / 2) * 2;
      const same = items.filter(x => { const e = when(x.m); return sameDay(e, d) && Math.floor(e.getHours() / 2) * 2 === h; });
      bubble.innerHTML = `<b>${esc(day.format(d))}, ${String(h).padStart(2, '0')}:00 – ${String(h + 2).padStart(2, '0')}:00</b>${esc(fmt(ui.window, { n: same.length, f: same.filter(x => x.state).length }))}`;
    }
    let idle = 0;
    function flash() {
      axis.classList.add('active');
      clearTimeout(idle);
      idle = setTimeout(() => axis.classList.remove('active'), 900);
    }
    list.addEventListener('scroll', () => { sync(); if (touched) flash(); }, { passive: true });
    list.addEventListener('pointerdown', () => { touched = true; }, { passive: true });
    list.addEventListener('wheel', () => { touched = true; }, { passive: true });
    let scrubbing = false;
    const scrubTo = event => {
      const r = axis.getBoundingClientRect();
      list.scrollTop = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height)) * maxScroll();
      flash();
    };
    axis.addEventListener('pointerdown', event => { touched = true; scrubbing = true; axis.setPointerCapture(event.pointerId); scrubTo(event); });
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
    function openSearch(open) {
      search.classList.toggle('open', open);
      if (open && matchMedia('(pointer: fine)').matches) setTimeout(() => input.focus({ preventScroll: true }), 350);
      if (!open) { input.value = ''; filter(''); input.blur(); }
    }
    screen.querySelector('.fab').addEventListener('click', () => openSearch(!search.classList.contains('open')));
    search.querySelector('.search-input button').addEventListener('click', () => openSearch(false));
    input.addEventListener('input', () => filter(input.value));
    input.addEventListener('keydown', event => { if (event.key === 'Escape') openSearch(false); });
    search.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.q; filter(b.dataset.q); }));

    /* Detail popup */
    function openDetail(i) {
      const n = items[i], a = APPS[n.app], s = score(n, i);
      const orig = n.recalled ? `<div class="detail-orig"><b>${esc(ui.earlier)}</b>${esc(n.recalled)}</div>` : '';
      const meta = n.count ? fmt(ui.updated, { n: n.count }) : fmt(ui.posted, { t: `${String(when(n.m).getHours()).padStart(2, '0')}:${String(when(n.m).getMinutes()).padStart(2, '0')}` });
      detail.innerHTML = `<div class="detail-card${a.dark ? ' dark' : ''}" style="--c:${a.card}"><h4>${ico(n.app)}${esc(appName(n.app))}</h4><p><b>${esc(n.title)}</b></p><p>${esc(n.text)}</p>${orig}<small>${esc(meta)}</small></div>
        <div class="detail-open">${esc(fmt(ui.open_app, { app: appName(n.app) }))}</div>
        <div class="detail-actions"><span>${svg('i-dismiss')}${esc(ui.dismiss)}</span><span>${svg('i-plus')}${esc(ui.rule)}</span><span>${svg('i-more')}${esc(ui.more_btn)}</span></div>
        <div class="detail-ai"><b>${esc(fmt(ui.ai, { s: s.toFixed(1) }))}</b><button type="button" data-v="spam">${esc(ui.is_spam)}</button><button type="button" data-v="normal">${esc(ui.is_normal)}</button></div>`;
      const pick = n.fed && detail.querySelector(`[data-v="${n.fed}"]`);
      pick?.classList.add('sel');
      detail.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', event => {
        event.stopPropagation();
        n.fed = b.dataset.v;
        detail.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('sel', x === b));
        rows.find(r => +r.dataset.i === i).querySelector('[data-chips]').innerHTML = `<div class="tl-chips"><span>${esc(n.fed === 'spam' ? ui.marked_spam : ui.marked_normal)}</span></div>`;
      }));
      detail.classList.add('open');
    }
    list.addEventListener('click', event => {
      const card = event.target.closest('.tl-card');
      if (card) { touched = true; openDetail(+card.closest('.tl-row').dataset.i); }
    });
    detail.addEventListener('click', event => { if (!event.target.closest('.detail-card, .detail-ai, .detail-actions')) detail.classList.remove('open'); });
    screen.addEventListener('keydown', event => { if (event.key === 'Escape') detail.classList.remove('open'); });

    layoutAxis();
    sync();
    if (reduced) return;
    gate.firstSeen.then(async () => {
      await gate.ready(1300);
      if (touched) return;
      const glide = (to, ms) => new Promise(resolve => {
        const from = list.scrollTop, t0 = performance.now();
        const step = now => {
          if (touched) return resolve();
          const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          list.scrollTop = from + (to - from) * e;
          axis.classList.add('active');
          t < 1 ? requestAnimationFrame(step) : resolve();
        };
        requestAnimationFrame(step);
      });
      await glide(maxScroll() * .62, 1800);
      await gate.ready(1100);
      await glide(0, 1300);
      axis.classList.remove('active');
    });
  }

  /* ---------- Rules: action playground ---------- */
  function Rules(root) {
    const R = data.rules;
    const buttons = [...root.querySelectorAll('[data-action]')];
    const ruleCard = root.querySelector('[data-rule-card]');
    const screen = root.querySelector('[data-lock]');
    const stageBox = root.querySelector('.pg-stage');
    const soundButton = root.querySelector('[data-sound]');
    const ICONS = { dismiss: 'i-dismiss', mute: 'i-mute', snooze: 'i-snooze', replace: 'i-replace', sound: 'i-note', tts: 'i-speak', call: 'i-call', tap: 'i-tap', open: 'i-open', webhook: 'i-webhook' };
    const ORDER = ['dismiss', 'mute', 'replace', 'call', 'tts', 'snooze', 'webhook', 'tap', 'open', 'sound'];
    screen.innerHTML = `${statusBar()}<div class="lock"><div class="lock-wall"></div><div class="lock-date">${esc(data.date)}</div><div class="lock-clock">${data.clock}</div><div class="lock-stack"></div><div class="lock-foot"><span>${svg('i-torch')}</span><em>${svg('i-lock')}</em><span>${svg('i-camera')}</span></div></div><div class="gbar"></div>`;
    const stack = screen.querySelector('.lock-stack');
    const lock = screen.querySelector('.lock');
    const server = make('div', 'server', `${svg('i-server')}<span>example.com</span><b></b>`);
    stageBox.append(server);
    const gate = new Gate(root, .35);
    let token = 0, auto = !reduced, soundOn = true;

    soundButton.addEventListener('click', () => {
      soundOn = !soundOn;
      soundButton.setAttribute('aria-pressed', String(soundOn));
      if (!soundOn && 'speechSynthesis' in window) speechSynthesis.cancel();
    });

    const field = (label, value) => `<div class="rc-row"><span>${esc(label)}</span><div class="rc-chips">${value}</div></div>`;
    function renderCard(action) {
      const sc = R.scenarios[action];
      let html = `<div class="rc-head"><div><small>${esc(R.labels.name)}</small><strong>${esc(sc.name)}</strong></div></div>`;
      if (sc.apps) html += field(R.labels.apps, sc.apps.map(a => `<span class="rc-chip">${ico(a)}${esc(appName(a))}</span>`).join(''));
      if (sc.keywords) html += field(R.labels.keywords, sc.keywords.map(k => `<span class="rc-chip">${esc(k)}</span>`).join(''));
      html += field(R.labels.time, `<span class="rc-chip">${esc(sc.time || R.labels.all_day)}</span>`);
      html += field(R.labels.then, `<span class="rc-then">${svg(ICONS[action], 'i')}${esc(R.actions[action])}</span>`);
      html += `<div class="rc-foot"><button type="button" class="rc-test">${svg('i-playtri')}${esc(R.labels.test)}</button><span class="rc-result"></span></div>`;
      ruleCard.innerHTML = html;
      ruleCard.querySelector('.rc-test').addEventListener('click', () => {
        const out = ruleCard.querySelector('.rc-result');
        const t0 = performance.now();
        const step = now => {
          const t = Math.min(1, (now - t0) / 900);
          out.innerHTML = esc(R.labels.result).replace('{n}', `<b>${num.format(Math.round(sc.hits * (1 - (1 - t) ** 3)))}</b>`);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }
    function reset() {
      stack.innerHTML = '';
      lock.querySelectorAll('.call, .appview, .fx-snooze, .hand').forEach(n => n.remove());
      screen.querySelector('.sb').classList.remove('sb--light');
      root.querySelectorAll('.packet').forEach(n => n.remove());
      server.classList.remove('show');
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    }
    const fxChip = (icon, text) => `<span class="fx-chip">${svg(icon)}${esc(text)}</span>`;

    async function play(action, my, user) {
      const sc = R.scenarios[action];
      const loud = user && soundOn;
      const alive = () => my === token;
      reset();
      await sleep(260);
      if (!alive()) return;
      const card = ncard(sc.n, ui.now);
      stack.append(card);
      arrive(card);
      if (action !== 'mute' && !reduced) card.animate([{ transform: 'none' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 360, delay: 420 });
      await sleep(reduced ? 200 : 1100);
      if (!alive()) return;
      switch (action) {
        case 'dismiss': {
          card.append(make('span', 'fx-burst'));
          await card.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], { duration: 420, easing: 'ease-in', fill: 'forwards', delay: 300 }).finished;
          if (!alive()) return;
          stack.innerHTML = `<div style="text-align:center">${fxChip('i-dismiss', sc.result)}</div>`;
          break;
        }
        case 'mute':
          card.insertAdjacentHTML('beforeend', fxChip('i-mute', sc.result));
          break;
        case 'snooze': {
          const clock = make('div', 'fx-snooze', `${svg('i-snooze')}<b>${esc(sc.result)}</b>`);
          lock.append(clock);
          const k = scaleOf(card), a = card.getBoundingClientRect(), b = clock.getBoundingClientRect();
          await card.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${(b.left + b.width / 2 - a.left - a.width / 2) / k}px, ${(b.top + b.height / 2 - a.top - a.height / 2) / k}px) scale(.2)`, opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.55, 0, .75, .2)', fill: 'forwards' }).finished;
          if (!alive()) return;
          await clock.querySelector('svg').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(720deg)' }], { duration: 1500, easing: 'cubic-bezier(.6, 0, .3, 1)' }).finished;
          if (!alive()) return;
          clock.remove();
          const back = ncard(sc.n, (sc.time || '').split('–').pop()?.trim() || ui.now);
          stack.innerHTML = '';
          stack.append(back);
          arrive(back);
          back.insertAdjacentHTML('beforeend', fxChip('i-snooze', sc.result));
          break;
        }
        case 'replace': {
          const title = card.querySelector('.ncard-title'), text = card.querySelector('.ncard-text');
          const glyphs = '▒░▓█#*%';
          const t0 = performance.now();
          await new Promise(resolve => {
            const step = now => {
              const t = (now - t0) / 650;
              if (t >= 1 || !alive()) return resolve();
              title.textContent = sc.n.title.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
              text.textContent = sc.n.text.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
              requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
          if (!alive()) return;
          title.textContent = sc.replaced.title;
          text.textContent = sc.replaced.text;
          card.insertAdjacentHTML('beforeend', fxChip('i-replace', sc.result));
          break;
        }
        case 'sound':
          card.insertAdjacentHTML('beforeend', `${fxChip('i-note', sc.result)}<div class="fx-wave">${Array.from({ length: 18 }, (_, i) => `<i style="--n:${i}"></i>`).join('')}</div>`);
          if (loud) Sound.marimba();
          setTimeout(() => alive() && card.querySelector('.fx-wave')?.remove(), 2600);
          break;
        case 'tts':
          card.insertAdjacentHTML('beforeend', `${fxChip('i-speak', sc.result)}<div class="fx-wave">${Array.from({ length: 18 }, (_, i) => `<i style="--n:${i}"></i>`).join('')}</div>`);
          if (loud) Sound.speak(sc.speech);
          setTimeout(() => alive() && card.querySelector('.fx-wave')?.remove(), 4200);
          break;
        case 'call': {
          const call = make('div', 'call', `${ico(sc.n.app)}<h4>${esc(sc.n.title)}</h4><p>${esc(sc.n.text)}</p><small>${esc(appName(sc.n.app))} · ${esc(R.actions.call)}</small><div class="call-btns"><span><i>${svg('i-call')}</i>${esc(sc.decline)}</span><span><i>${svg('i-call')}</i>${esc(sc.answer)}</span></div>`);
          lock.append(call);
          screen.querySelector('.sb').classList.add('sb--light');
          if (loud) Sound.ring();
          call.addEventListener('click', () => { call.remove(); screen.querySelector('.sb').classList.remove('sb--light'); });
          setTimeout(() => { if (alive() && call.isConnected) { call.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 350, easing: 'ease-in', fill: 'forwards' }).finished.then(() => { call.remove(); screen.querySelector('.sb').classList.remove('sb--light'); }); } }, 5200);
          break;
        }
        case 'tap': {
          const row = make('div', 'ncard-actions', sc.buttons.map(b => `<button type="button" tabindex="-1">${esc(b)}</button>`).join(''));
          card.append(row);
          const target = [...row.children].find(b => b.textContent === sc.button);
          const hand = make('div', 'hand', svg('i-hand'));
          Object.assign(hand.style, { position: 'absolute', zIndex: 20, width: '46px', height: '46px', color: '#1c1b1a', pointerEvents: 'none', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.25))' });
          hand.firstElementChild.style.cssText = 'width:46px;height:46px;fill:#fff;stroke:#1c1b1a;stroke-width:1.6';
          lock.append(hand);
          const k = scaleOf(card), L = lock.getBoundingClientRect(), b = target.getBoundingClientRect();
          const x = (b.left - L.left + b.width / 2) / k - 14, y = (b.top - L.top + b.height / 2) / k - 6;
          await hand.animate([{ transform: `translate(${x + 60}px, ${y + 160}px)`, opacity: 0 }, { transform: `translate(${x}px, ${y}px)`, opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' }).finished;
          if (!alive()) return;
          hand.animate([{ transform: `translate(${x}px, ${y}px) scale(1)` }, { transform: `translate(${x}px, ${y}px) scale(.86)` }, { transform: `translate(${x}px, ${y}px) scale(1)` }], { duration: 260, fill: 'forwards' });
          target.style.background = '#ffcd38';
          await sleep(500);
          if (!alive()) return;
          hand.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
          await card.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.94)' }], { duration: 380, fill: 'forwards' }).finished;
          if (!alive()) return;
          hand.remove();
          stack.innerHTML = `<div style="text-align:center">${fxChip('i-tap', sc.result)}</div>`;
          break;
        }
        case 'open': {
          const view = make('div', 'appview', `<div class="appview-bar">${ico(sc.n.app)}${esc(appName(sc.n.app))}</div><div class="appview-map"></div><h4>${esc(sc.screen.title)}</h4><p>${esc(sc.screen.text)}</p><div class="appview-code">${[...sc.screen.code].map(c => `<b>${esc(c)}</b>`).join('')}</div>`);
          lock.append(view);
          setTimeout(() => { if (alive() && view.isConnected) view.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 320, fill: 'forwards' }).finished.then(() => view.remove()); }, 4800);
          break;
        }
        case 'webhook': {
          const packet = make('div', 'packet', esc(`POST ${sc.url}\n{ "title": "${sc.n.title}",\n  "text": "${sc.n.text}" }`));
          stageBox.append(packet);
          const S = stageBox.getBoundingClientRect(), a = card.getBoundingClientRect();
          server.querySelector('b').textContent = '';
          server.classList.add('show');
          const b = server.getBoundingClientRect();
          const from = `translate(${a.left - S.left + 10}px, ${a.top - S.top}px) scale(.7)`;
          const to = `translate(${b.left - S.left - packet.offsetWidth * .3}px, ${b.top - S.top + b.height / 2 - packet.offsetHeight / 2}px) scale(.55)`;
          await packet.animate([{ transform: from, opacity: 0 }, { transform: from, opacity: 1, offset: .15 }, { transform: to, opacity: 1, offset: .85 }, { transform: to, opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;
          if (!alive()) return;
          packet.remove();
          server.querySelector('b').textContent = '200 OK';
          card.insertAdjacentHTML('beforeend', fxChip('i-webhook', sc.result));
          break;
        }
      }
    }
    function select(action, user) {
      if (user) auto = false;
      const my = ++token;
      buttons.forEach(b => b.setAttribute('aria-checked', String(b.dataset.action === action)));
      renderCard(action);
      play(action, my, user);
    }
    buttons.forEach(b => b.addEventListener('click', () => select(b.dataset.action, true)));
    root.addEventListener('keydown', event => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0 || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const next = buttons[(i + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length];
      next.focus();
      select(next.dataset.action, true);
    });
    renderCard('dismiss');
    buttons[0].setAttribute('aria-checked', 'true');
    gate.firstSeen.then(async () => {
      let i = 0;
      while (auto) {
        select(ORDER[i++ % ORDER.length], false);
        await gate.ready(6500);
      }
    });
  }

  /* ---------- AI: the sieve ---------- */
  function Sieve(fig) {
    const A = data.ai, L = A.labels;
    const stage = fig.querySelector('[data-stage]');
    const canvas = fig.querySelector('canvas'), ctx = canvas.getContext('2d');
    const cloud = fig.querySelector('[data-cloud]');
    const dotsBox = fig.querySelector('[data-dots]');
    const input = fig.querySelector('[data-threshold]');
    const zone = fig.querySelector('[data-zone]');
    const line = fig.querySelector('[data-line]');
    const tag = fig.querySelector('[data-tag]');
    const pop = fig.querySelector('[data-pop]');
    const out = { kept: fig.querySelector('[data-kept]'), filtered: fig.querySelector('[data-filtered]'), learned: fig.querySelector('[data-learned]') };
    const W = 600, H = 640, S = 6.3, CX = 300, Y0 = 150;
    const X = x => CX + (x - 54.5) * S, Y = y => Y0 + (y - 30) * S;
    const BELL = new Path2D('M72.36,66.42C73.72,67.79 72.77,70.13 70.83,70.13L38.15,70.13C36.23,70.13 35.28,67.79 36.64,66.42L39.42,63.62L39.42,50.61C39.42,43.34 44.5,37.27 51.27,35.79L51.27,33.25C51.27,31.45 52.71,30 54.5,30C56.29,30 57.73,31.45 57.73,33.25L57.73,35.79C64.5,37.27 69.58,43.34 69.58,50.61L69.58,63.62L72.36,66.42Z'.replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${X(+x).toFixed(2)},${Y(+y).toFixed(2)}`));
    const CLAPPER = { x: X(54.99), y: Y(72.09), w: (59.37 - 50.61) * S / 2 };
    const BARS = [[44.48, 64.52, 46.01, 49.63], [47.65, 61.35, 52.73, 56.08], [51.42, 57.58, 58.93, 62.54]].map(([x1, x2, y1, y2]) => ({ x1: X(x1), x2: X(x2), y1: Y(y1), y2: Y(y2), glow: 0 }));
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const logit = p => Math.log(clamp(p, .01, .99) / (1 - clamp(p, .01, .99)));
    const sigmoid = z => 1 / (1 + Math.exp(-z));
    const mix = (a, b, t) => a + (b - a) * t;
    const samples = A.samples.map((s, i) => ({ ...s, i, base: s.s / 100, score: s.s / 100, fed: null }));
    const weights = {};
    const particles = Array.from({ length: 70 }, (_, i) => ({ x: (i * 37 % 100) / 100, p: (i * 53 % 100) / 100, v: .08 + (i * 29 % 10) / 100, len: 6 + i % 9 }));
    const gate = new Gate(fig, .25);
    let threshold = .8, learned = 0, traveler = null, pulse = 0, rings = [], pills = [], dots = new Map(), queue = 0, selected = null;
    let scale = 1, dpr = 1, last = performance.now(), frame = 0;

    const tint = p => { const t = clamp((p - .3) / .7); return `rgb(${Math.round(mix(169, 255, t))},${Math.round(mix(156, 143, t))},${Math.round(mix(134, 0, t))})`; };
    function resize() {
      const r = stage.getBoundingClientRect();
      scale = r.width / W;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      placePills();
      draw(performance.now());
    }
    function setThreshold(v) {
      threshold = v / 100;
      const pct = `${v}%`;
      zone.style.left = pct;
      line.style.left = pct;
      tag.textContent = fmt(L.threshold, { n: v });
      classify();
    }
    function classify() {
      let kept = 0, filtered = 0;
      for (const [s, dot] of dots) {
        const spam = s.score >= threshold;
        dot.classList.toggle('spam', spam);
        spam ? filtered++ : kept++;
      }
      const set = (node, value) => { if (node.textContent !== String(value)) { node.textContent = value; const st = node.parentElement; st.classList.remove('bump'); void st.offsetWidth; st.classList.add('bump'); } };
      set(out.kept, kept);
      set(out.filtered, filtered);
      set(out.learned, learned);
    }
    function layoutDots() {
      const width = dotsBox.clientWidth || 1;
      const placed = [];
      for (const [s, dot] of dots) {
        const x = s.score * width;
        let row = 0;
        while (placed.some(p => p.row === row && Math.abs(p.x - x) < 15)) row++;
        placed.push({ x, row });
        dot.style.left = `${s.score * 100}%`;
        dot.style.bottom = `${row * 15}px`;
        dot.setAttribute('aria-label', `${appName(s.app)}: ${s.text} · ${Math.round(s.score * 100)}%`);
      }
    }
    function land(s, animate) {
      dots.get(s)?.remove();
      const dot = make('button', `dot${animate && !reduced ? ' new' : ''}${s.fed ? ' fed' : ''}`);
      dot.type = 'button';
      dot.addEventListener('click', event => { event.stopPropagation(); openPop(s, dot); });
      dots.delete(s);
      dots.set(s, dot);
      dotsBox.append(dot);
      layoutDots();
      classify();
    }
    function rescore() {
      for (const s of samples) s.score = s.fed ? (s.fed === 'spam' ? .992 : .008) : sigmoid(logit(s.base) + s.t.reduce((z, t) => z + (weights[t] || 0) * .8, 0));
      for (const [s, dot] of dots) dot.classList.toggle('fed', !!s.fed);
      layoutDots();
      classify();
    }

    /* Pills float in the cloud above the bell. */
    const SLOTS = [[0, .03, .02], [1, .018, .03], [0, .1, .1], [1, .088, .06], [0, .17, .01], [1, .158, .1]];
    function pill(s, slot) {
      const node = make('button', 'pill', `${ico(s.app)}<span>${esc(s.text)}</span>`);
      node.type = 'button';
      node.addEventListener('click', event => { event.stopPropagation(); openPop(s, node); });
      cloud.append(node);
      const p = { s, node, slot, phase: Math.random() * 6.28, born: performance.now() };
      pills.push(p);
      if (!reduced) node.animate([{ opacity: 0, scale: .8 }, { opacity: 1, scale: 1 }], { duration: 500, easing: 'ease-out' });
      return p;
    }
    function placePills(time = performance.now()) {
      const width = stage.clientWidth;
      for (const p of pills) {
        const [col, sy, jitter] = SLOTS[p.slot];
        const bob = reduced ? 0 : Math.sin(time / 1000 * .9 + p.phase) * 4;
        const half = width / 2;
        const x = col * half + Math.min(jitter * width, half - p.node.offsetWidth - 6);
        p.node.style.transform = `translate(${x}px, ${sy * width * (H / W) + bob}px)`;
      }
    }
    function nextSample() {
      const used = new Set([...pills.map(p => p.s), traveler?.s]);
      for (let n = 0; n < samples.length; n++) {
        const s = samples[queue++ % samples.length];
        if (!used.has(s)) return s;
      }
      return samples[0];
    }
    function send(p) {
      if (traveler) return;
      pills = pills.filter(x => x !== p);
      const r = p.node.getBoundingClientRect(), st = stage.getBoundingClientRect();
      const start = { x: (r.left - st.left + r.width / 2) / scale, y: (r.top - st.top + r.height / 2) / scale };
      p.node.animate([{ opacity: 1, transform: p.node.style.transform }, { opacity: 0, transform: `translate(${CX * scale - r.width / 2}px, ${(Y0 - 18) * scale}px) scale(.2)` }], { duration: reduced ? 1 : 560, easing: 'cubic-bezier(.5, 0, .7, .4)', fill: 'forwards' }).finished.then(() => p.node.remove());
      traveler = { s: p.s, start, t0: performance.now(), shown: 0, passed: 0 };
      setTimeout(() => pill(nextSample(), p.slot), 1400);
    }
    function target(s) {
      const box = dotsBox.getBoundingClientRect(), st = stage.getBoundingClientRect();
      return { x: (box.left - st.left + s.score * box.width) / scale, y: (box.bottom - st.top - 7) / scale };
    }

    /* Teaching popover */
    function openPop(s, anchor) {
      selected?.classList.remove('sel');
      selected = anchor.classList.contains('dot') ? anchor : null;
      selected?.classList.add('sel');
      const pct = Math.round(s.score * 100);
      pop.innerHTML = `<div class="sieve-pop-head">${ico(s.app)}<div><b>${esc(appName(s.app))}</b>${esc(s.text)}</div><button type="button" class="sieve-pop-close" aria-label="${esc(ui.dismiss)}">${svg('i-close', 'i')}</button></div>
        <div class="sieve-pop-score"><span>${esc(L.score)}</span><b>${pct}%</b></div><div class="sieve-pop-meter"><i style="width:${pct}%"></i></div>
        <div class="sieve-pop-btns"><button type="button" class="yes${s.fed === 'spam' ? ' sel' : ''}">${esc(ui.is_spam)}</button><button type="button" class="no${s.fed === 'normal' ? ' sel' : ''}">${esc(ui.is_normal)}</button></div>`;
      pop.hidden = false;
      const st = stage.getBoundingClientRect(), r = anchor.getBoundingClientRect();
      const w = pop.offsetWidth, h = pop.offsetHeight;
      let left = r.left - st.left + r.width / 2 - w / 2;
      left = Math.min(st.width - w, Math.max(0, left));
      let top = r.top - st.top - h - 12;
      if (top < 0) top = r.bottom - st.top + 12;
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.querySelector('.sieve-pop-close').addEventListener('click', closePop);
      pop.querySelector('.yes').addEventListener('click', () => teach(s, true));
      pop.querySelector('.no').addEventListener('click', () => teach(s, false));
      gate.pause(8000);
    }
    function closePop() {
      pop.hidden = true;
      selected?.classList.remove('sel');
      selected = null;
    }
    function teach(s, spam) {
      const was = s.fed;
      s.fed = spam ? 'spam' : 'normal';
      if (was !== s.fed) {
        for (const t of s.t) weights[t] = (weights[t] || 0) + (spam ? 1.4 : -1.4) - (was ? (was === 'spam' ? 1.4 : -1.4) : 0);
        if (!was) learned++;
      }
      rescore();
      if (!dots.has(s)) land(s, true);
      pulse = 1;
      closePop();
      stage.querySelector('.sieve-toast')?.remove();
      const t = make('div', 'sieve-toast', esc(spam ? L.teach_spam : L.teach_normal));
      stage.append(t);
      setTimeout(() => t.remove(), 2200);
    }
    document.addEventListener('click', event => { if (!pop.hidden && !pop.contains(event.target)) closePop(); });
    input.addEventListener('input', () => setThreshold(+input.value));

    /* Canvas */
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
        for (const p of particles) {
          p.p = (p.p + p.v * dt) % 1;
          const y = mix(Y(33), Y(70), p.p);
          const squeeze = 1 - .62 * p.p;
          const x = CX + (p.x - .5) * 230 * squeeze + Math.sin(now / 900 + p.x * 9) * 4;
          ctx.strokeStyle = `rgba(255, 150, 20, ${(.08 + .18 * Math.sin(p.p * Math.PI)) * (1 + pulse)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, y - p.len);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.restore();
      }
      for (const b of BARS) {
        const g = Math.max(b.glow, pulse * .7);
        const r = (b.y2 - b.y1) / 2;
        ctx.save();
        if (g > .02) { ctx.shadowColor = `rgba(255, 143, 0, ${g * .8})`; ctx.shadowBlur = 24 * g; }
        ctx.fillStyle = `rgba(255, 143, 0, ${.2 + g * .8})`;
        ctx.beginPath();
        ctx.roundRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1, r);
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
      pulse = Math.max(0, pulse - dt * 1.2);
      if (traveler) drawTraveler(now);
    }
    function drawTraveler(now) {
      const tr = traveler, s = tr.s;
      const t = (now - tr.t0) / 1000;
      const IN = .55, DOWN = 2.3, FALL = .55;
      let x, y, r = 7;
      if (t < IN) {
        const e = 1 - (1 - t / IN) ** 3;
        x = mix(tr.start.x, CX, e);
        y = mix(tr.start.y, Y(31), e);
        r = mix(12, 7, e);
      } else if (t < IN + DOWN) {
        const p = (t - IN) / DOWN, e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
        y = mix(Y(31), CLAPPER.y + 8, e);
        x = CX + Math.sin(e * Math.PI * 2) * 22 * (1 - e);
        BARS.forEach((b, i) => {
          if (tr.passed <= i && y >= (b.y1 + b.y2) / 2) {
            tr.passed = i + 1;
            b.glow = 1;
            rings.push({ y: (b.y1 + b.y2) / 2, w: b.x2 - b.x1, t0: now });
          }
        });
        tr.shown = s.score * [0, .42, .78, 1][tr.passed];
      } else if (t < IN + DOWN + FALL) {
        const p = (t - IN - DOWN) / FALL, end = target(s);
        x = mix(CX, end.x, p);
        y = mix(CLAPPER.y + 8, end.y, p * p) - Math.sin(p * Math.PI) * 30;
        tr.shown = s.score;
      } else {
        traveler = null;
        land(s, true);
        return;
      }
      const color = tint(tr.shown || .05);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      if (tr.passed > 0 || t > IN + DOWN) {
        ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(tr.shown * 100)}%`, x + 14, y + 5);
      }
    }

    function loop(now) {
      frame = 0;
      draw(now);
      placePills(now);
      if (gate.open && !reduced) frame = requestAnimationFrame(loop);
    }
    function start() {
      if (!frame && gate.open && !reduced) { last = performance.now(); frame = requestAnimationFrame(loop); }
    }
    new IntersectionObserver(([entry]) => { if (entry.isIntersecting) start(); }, { threshold: 0 }).observe(fig);
    document.addEventListener('visibilitychange', start);
    new ResizeObserver(resize).observe(stage);

    SLOTS.forEach((_, slot) => pill(samples[(slot * 5 + 3) % samples.length], slot));
    queue = 7;
    [0, 1, 2, 4, 5, 7, 9, 11, 13, 14, 15, 17].forEach(i => land(samples[i], false));
    setThreshold(80);
    resize();
    if (reduced) return;
    (async () => {
      await gate.firstSeen;
      for (;;) {
        await gate.ready(traveler ? 600 : 2600);
        if (traveler || !pills.length) continue;
        const p = pills.reduce((a, b) => (SLOTS[a.slot][1] < SLOTS[b.slot][1] ? b : a));
        send(p);
        start();
      }
    })();
  }

  /* ---------- Enhancers ---------- */
  function Enhancers() {
    const E = data.enhancers;
    document.querySelectorAll('[data-enh]').forEach(card => {
      const stage = card.querySelector('[data-stage]');
      const toggle = card.querySelector('[data-switch]');
      const on = () => toggle.checked;
      let run = 0;
      const setups = {
        recall() {
          const my = ++run;
          stage.innerHTML = `<div class="enh-row"><span class="enh-note">${esc(E.recall.hint)}</span><button type="button" class="enh-btn">${svg('i-hand')}${esc(ui.swipe)}</button></div><div data-slot></div>`;
          const slot = stage.querySelector('[data-slot]');
          const put = () => { slot.innerHTML = ''; const c = ncard(E.recall.n, ui.now); slot.append(c); arrive(c); return c; };
          put();
          const after = () => {
            if (my !== run) return;
            slot.innerHTML = '';
            if (!on()) { setTimeout(() => my === run && put(), 1500); return; }
            const bar = make('div', 'enh-undo', `<span class="ring"><svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" stroke="rgba(255,255,255,.2)"/><circle cx="13" cy="13" r="10" stroke="#ffd600" stroke-dasharray="62.8" data-arc/></svg><b>5</b></span><p>${esc(fmt(ui.dismissed, { app: appName(E.recall.n.app) }))}</p><button type="button">${svg('i-undo')}${esc(ui.undo)}</button>`);
            slot.append(bar);
            if (!reduced) bar.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], SP);
            const arc = bar.querySelector('[data-arc]'), sec = bar.querySelector('b');
            const timer = arc.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 62.8 }], { duration: 5000, fill: 'forwards' });
            const tick = setInterval(() => { sec.textContent = Math.max(0, 5 - Math.floor(timer.currentTime / 1000)); }, 200);
            timer.finished.then(() => { clearInterval(tick); if (my === run && bar.isConnected) { bar.remove(); setTimeout(() => my === run && put(), 900); } }).catch(() => clearInterval(tick));
            bar.querySelector('button').addEventListener('click', () => { timer.cancel(); put(); });
          };
          swipeAll(slot, after);
          stage.querySelector('.enh-btn').addEventListener('click', () => {
            const c = slot.querySelector('.ncard');
            if (c) dismissCard(c, 1).then(after);
          });
        },
        shh() {
          const my = ++run;
          stage.innerHTML = `<div class="enh-row"><span class="enh-note">${esc(E.shh.rule)}</span></div><div class="chat-stack"></div><button type="button" class="enh-btn" style="margin-top:12px">${svg('i-crew')}${esc(E.shh.try)}</button>`;
          const stack = stage.querySelector('.chat-stack');
          const btn = stage.querySelector('.enh-btn');
          btn.querySelector('svg use').setAttribute('href', '#g-crew');
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.style.opacity = .5;
            stack.innerHTML = '';
            for (let i = 0; i < E.shh.messages.length; i++) {
              if (my !== run) return;
              const muted = on() && i >= 3;
              if (muted && i === 3) stage.querySelector('.enh-row').innerHTML = `<span class="shh-banner">${svg('i-mute')}${esc(E.shh.muted)}</span>`;
              const bub = make('div', `bub${muted ? ' muted' : ' ring'}`, `${ico('crew')}<p>${esc(E.shh.messages[i])}</p><em>${svg(muted ? 'i-mute' : 'i-speak')}</em>`);
              stack.append(bub);
              while (stack.children.length > 4) stack.firstElementChild.remove();
              await sleep(650);
            }
            await sleep(2600);
            if (my === run) setups.shh();
          });
        },
        captcha() {
          ++run;
          let hidden = false;
          const code = E.captcha.code;
          const text = () => esc(E.captcha.n.text).replace(code, `<span class="code-big">${hidden ? '••••••' : code}</span>`);
          stage.innerHTML = `<div class="enh-row"><span class="enh-note"></span><button type="button" class="enh-btn" data-hide aria-pressed="false">${svg('i-lock')}${esc(E.captcha.hide)}</button></div>`;
          const c = ncard(E.captcha.n, ui.now);
          c.querySelector('.ncard-text').innerHTML = text();
          c.style.cursor = 'default';
          stage.append(c);
          if (on()) {
            const row = make('div', 'ncard-actions', `<button type="button">${svg('i-copy')}<span>${esc(fmt(ui.copy, { code }))}</span></button>`);
            c.append(row);
            const btn = row.querySelector('button');
            btn.addEventListener('click', async () => {
              await copyText(code);
              btn.querySelector('span').textContent = fmt(ui.copied, { code });
              btn.querySelector('use').setAttribute('href', '#i-check');
              setTimeout(() => { btn.querySelector('span').textContent = fmt(ui.copy, { code }); btn.querySelector('use').setAttribute('href', '#i-copy'); }, 1800);
            });
          }
          const hide = stage.querySelector('[data-hide]');
          hide.addEventListener('click', () => {
            hidden = !hidden;
            hide.setAttribute('aria-pressed', String(hidden));
            hide.style.background = hidden ? '#fff' : '';
            hide.style.boxShadow = hidden ? 'inset 0 0 0 2px #0277bd' : '';
            c.querySelector('.ncard-text').innerHTML = text();
          });
        },
        webhook() {
          const my = ++run;
          const W = E.webhook, n = W.n;
          const template = `<span class="k">POST</span> ${esc(W.url)}\n{\n  "app": <span class="s" data-v="${esc(appName(n.app))}">"{filterbox.field.APP_NAME}"</span>,\n  "title": <span class="s" data-v="${esc(n.title)}">"{android.title}"</span>,\n  "text": <span class="s" data-v="${esc(n.text)}">"{android.text}"</span>\n}`;
          stage.innerHTML = `<div class="enh-row"><span class="enh-note">${esc(W.rule)}</span><button type="button" class="enh-btn">${svg('i-webhook')}${esc(W.send)}</button></div><div class="hook-box">${template}</div>`;
          const btn = stage.querySelector('.enh-btn');
          btn.addEventListener('click', async () => {
            if (!on()) { btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 }); return; }
            btn.disabled = true;
            btn.style.opacity = .5;
            for (const span of stage.querySelectorAll('[data-v]')) {
              const value = `"${span.dataset.v}"`;
              span.classList.add('typing');
              for (let i = 1; i <= value.length; i++) {
                if (my !== run) return;
                span.textContent = value.slice(0, i);
                await sleep(18);
              }
              span.classList.remove('typing');
              await sleep(160);
            }
            stage.querySelector('.hook-box').insertAdjacentHTML('beforeend', `\n<span class="ok">→ ${esc(W.ok)}</span>`);
            await sleep(3200);
            if (my === run) setups.webhook();
          });
        },
      };
      const swipeAll = (slot, after) => swipeable(slot, '.ncard', after);
      const kind = card.dataset.enh;
      toggle.addEventListener('change', () => { card.classList.toggle('off', !on()); setups[kind](); });
      setups[kind]();
    });
  }

  /* ---------- Analytics ---------- */
  function Analytics(screen) {
    const A = data.analytics;
    const total = A.apps.reduce((s, a) => s + a.n, 0), filtered = A.apps.reduce((s, a) => s + a.f, 0);
    screen.innerHTML = `${statusBar()}<div class="ana"><div class="ana-bar">${svg('i-arrow')}<span>${esc(appName('filterbox'))}</span><em>Pro</em></div>
      <div class="ana-sheet"><div class="ana-tabs"><button type="button" class="on" data-tab="0">${esc(A.title)}</button><button type="button" data-tab="1">${esc(A.daily)}</button></div><div class="ana-title"></div><div class="ana-chart"></div><div class="ana-sum"></div><div class="ana-list"></div></div></div>
      <div class="app-nav"><span>${svg('i-bulb')}${esc(ui.intelligence)}</span><span class="on">${svg('i-bars')}${esc(ui.analytics)}</span><span>${svg('i-gear')}${esc(ui.settings)}</span></div><div class="gbar"></div>`;
    screen.querySelector('.app-nav span:last-child svg').style.cssText = 'fill:currentColor;stroke:none';
    const title = screen.querySelector('.ana-title'), chart = screen.querySelector('.ana-chart'), sumLine = screen.querySelector('.ana-sum'), list = screen.querySelector('.ana-list');
    const tabs = [...screen.querySelectorAll('[data-tab]')];
    const gate = new Gate(screen.closest('[data-device]'), .4);
    const top = A.apps.filter(a => a.app !== 'others').slice(0, 4);
    const R = 96, C = 2 * Math.PI * R;
    let tab = 0, hot = -1, drawn = false;
    list.innerHTML = top.map((a, i) => `<div class="ana-row" data-i="${i}">${ico(a.app)}<p>${esc(appName(a.app))}<small>${esc(fmt(A.summary, { n: num.format(a.n), f: num.format(a.f) }))}</small></p>${svg('i-chevron', 'chev')}</div>`).join('');
    function overview(animate) {
      title.textContent = A.title;
      let offset = 0;
      chart.innerHTML = `<svg class="ana-donut" viewBox="0 0 236 236">${A.apps.map((a, i) => {
        const len = a.n / total * C;
        const html = `<circle cx="118" cy="118" r="${R}" stroke="${APPS[a.app].icon}" stroke-dasharray="${len - 2} ${C - len + 2}" stroke-dashoffset="${-offset}" data-i="${i}"/>`;
        offset += len;
        return html;
      }).join('')}</svg><div class="ana-center"><b data-total>${esc(fmt(A.total, { n: num.format(total) }))}</b><span data-sub></span></div>`;
      sumLine.textContent = fmt(A.summary, { n: num.format(total), f: num.format(filtered) });
      if (animate && !reduced) {
        chart.querySelectorAll('circle').forEach((c, i) => {
          const [len] = c.getAttribute('stroke-dasharray').split(' ').map(Number);
          c.animate([{ strokeDasharray: `0 ${C}` }, { strokeDasharray: `${len} ${C - len}` }], { duration: 700, delay: i * 70, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' });
        });
        const node = chart.querySelector('[data-total]'), t0 = performance.now();
        const step = now => { const t = Math.min(1, (now - t0) / 1100); node.textContent = fmt(A.total, { n: num.format(Math.round(total * (1 - (1 - t) ** 3))) }); if (t < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
      chart.querySelectorAll('circle').forEach(c => c.addEventListener('click', () => highlight(+c.dataset.i)));
      highlight(hot);
    }
    function daily() {
      title.textContent = `${A.daily} · ${new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' }).format(new Date(NOW.getTime() - 86400000))}`;
      const max = Math.max(...A.week);
      const wd = new Intl.DateTimeFormat(lang, { weekday: 'short' });
      chart.innerHTML = `<div class="ana-bars">${A.week.map((v, i) => `<div><b>${v}</b><i style="height:${v / max * 78}%;--n:${i}${i === 6 ? ';background:#ffb300' : ''}"></i>${esc(wd.format(new Date(NOW.getTime() - (7 - i) * 86400000)))}</div>`).join('')}</div>`;
      sumLine.textContent = fmt(A.summary, { n: num.format(A.week[6]), f: num.format(Math.round(A.week[6] * filtered / total)) });
    }
    function highlight(i) {
      hot = i;
      chart.querySelectorAll('circle').forEach(c => { c.classList.toggle('hot', +c.dataset.i === i); c.classList.toggle('dim', i >= 0 && +c.dataset.i !== i); });
      list.querySelectorAll('.ana-row').forEach(r => r.classList.toggle('hot', +r.dataset.i === i));
      const sub = chart.querySelector('[data-sub]'), totalNode = chart.querySelector('[data-total]');
      if (!sub) return;
      if (i >= 0) {
        const a = A.apps[i];
        totalNode.textContent = num.format(a.n);
        sub.textContent = appName(a.app);
      } else {
        totalNode.textContent = fmt(A.total, { n: num.format(total) });
        sub.textContent = '';
      }
    }
    function show(t, animate) {
      tab = t;
      tabs.forEach((b, i) => b.classList.toggle('on', i === t));
      t ? daily() : overview(animate);
    }
    tabs.forEach((b, i) => b.addEventListener('click', () => show(i, true)));
    list.addEventListener('pointerover', event => { const r = event.target.closest('.ana-row'); if (r && tab === 0) highlight(+r.dataset.i); });
    list.addEventListener('click', event => { const r = event.target.closest('.ana-row'); if (r) { if (tab) show(0, false); highlight(+r.dataset.i); } });
    list.addEventListener('pointerleave', () => tab === 0 && highlight(-1));
    show(0, false);
    if (reduced) return;
    gate.firstSeen.then(async () => {
      show(0, true);
      drawn = true;
      for (let n = 0; ; n++) {
        await gate.ready(2300);
        if (n % 6 === 5) { show(1, true); await gate.ready(3600); show(0, false); continue; }
        if (tab === 0) highlight(n % 6 < 4 ? n % 6 : -1);
      }
    });
    return drawn;
  }

  /* ---------- Closing bell ---------- */
  function Bell(button) {
    const ring = () => { button.classList.remove('ring'); void button.offsetWidth; button.classList.add('ring'); };
    button.addEventListener('click', () => { ring(); Sound.ding(); });
    new IntersectionObserver(([entry], io) => { if (entry.isIntersecting) { setTimeout(ring, 400); io.disconnect(); } }, { threshold: .6 }).observe(button);
  }

  document.querySelectorAll('.device-screen').forEach(quiet);
  const shade = document.querySelector('[data-shade]');
  if (shade) Shade(shade);
  const timeline = document.querySelector('[data-timeline]');
  if (timeline) Timeline(timeline);
  const rules = document.querySelector('[data-rules]');
  if (rules) Rules(rules);
  const sieve = document.querySelector('[data-sieve]');
  if (sieve) Sieve(sieve);
  Enhancers();
  const analytics = document.querySelector('[data-analytics]');
  if (analytics) Analytics(analytics);
  const bell = document.querySelector('[data-bell]');
  if (bell) Bell(bell);
})();
