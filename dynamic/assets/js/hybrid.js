/* Power Plate | Dynamic (A + B) interactions
   Standalone: Direction A's main.js and Direction B's direction-b.js stay untouched.
   B behaviour: nav, Wave hero, pillar panels, one second, proof wall, science, closing, footer.
   A behaviour: statement, goals tabs, guided finder, everyday horizontal scroll. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const CDN = 'https://cdn.shopify.com/s/files/1/0362/1139/2645/';
  const img = (path, w = 800) => `${CDN}${path}?width=${w}`;
  const money = n => '$' + n.toLocaleString('en-US');
  const ICON = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const hero = $('.hero');

  /* ------------------------------------------------------------------
     Product data, names, specs and prices mirror powerplate.com
     ------------------------------------------------------------------ */
  const PRODUCTS = {
    personal: { name: 'Personal Power Plate®', tag: 'Most compact', desc: 'Gold-standard vibration in our smallest plate.', specs: ['Set 35Hz frequency', '30- or 60-second timer', 'Column-free, with travel case'], price: 1836, was: 2295, img: 'files/Personal_0fdfee51-d763-4d38-9eb6-26127b59cf2a.png', url: 'personal-power-plate' },
    move: { name: 'Power Plate® MOVE™', tag: 'Bestseller', desc: 'Compact and column-free, with more power.', specs: ['6 variable frequency modes', 'Supports up to 300 lbs', 'Timer up to 9 minutes'], price: 2976, was: 3720, img: 'files/MoveBlack_2.png', url: 'power-plate-move',
      swatches: [
        { name: 'Black', color: '#1d1e21', img: 'files/MoveBlack_2.png' },
        { name: 'Red', color: '#D8262F', img: 'files/MoveRed_2_3b8612d0-33ad-473b-907c-fe844aacd995.png' },
        { name: 'Titanium', color: '#8E9196', img: 'files/MoveTitaniumnobadge.png' },
        { name: 'Wood', color: '#B4703C', img: 'files/MOVEWoodNoBadge.png' }
      ] },
    my5: { name: 'Upgraded Power Plate® my5™', tag: 'New touchscreen', desc: 'Patented PrecisionWave™ for the home.', specs: ['30–40Hz in 1Hz increments', '5-inch LCD touchscreen', 'Quick-start programs, 300 lb max'], price: 5196, was: 6495, img: 'files/my5-2026_isolated-L45.png', url: 'upgraded-power-plate-my5' },
    my8: { name: 'Power Plate® my8™', tag: 'Most advanced at home', desc: 'Coach-led training, built in.', specs: ['30–45Hz in 1Hz increments', 'proMOTION™ resistance cables', '250+ coach-led workouts'], price: 8396, was: 10495, img: 'files/my8-_45.jpg', url: 'power-plate-my8' },
    pro5: { name: 'Power Plate® pro5™', tag: 'Commercial classic', desc: 'Proven in clubs, clinics and sport.', specs: ['25–50Hz frequency range', 'Up to 9 minutes continuous', 'Large plate surface'], price: 10396, was: 12995, img: 'files/2313-Black-pro5-1.jpg', url: 'power-plate-pro5' },
    pro5hp: { name: 'Power Plate® pro5HP™', tag: 'High performance', desc: 'Columnless, built for serious training.', specs: ['Supports up to 500 lbs', 'Full 360° range of motion', 'Integrates with a squat rack'], price: 10796, was: 13495, img: 'products/2017-hp-661.jpg', cover: true, url: 'power-plate-pro5hp' },
    pro8: { name: 'Power Plate® pro8™', tag: 'Flagship', desc: 'Our largest, most advanced platform.', specs: ['25–50Hz in 1Hz increments', 'Touchscreen + proMOTION™ cables', '250+ workouts, 1,000+ techniques'], price: 13196, was: 16495, img: 'files/pro8-_45.jpg', url: 'power-plate-pro8' },
    pro7hc: { name: 'Power Plate pro7HC', tag: 'Healthcare', desc: 'Designed for medical facilities.', specs: ['Integrated heart monitor', 'Range-of-motion tracking', 'Patient-friendly video programs'], price: 14396, was: 17995, img: 'products/pro7-hc-showcase-1_e5c648af-9c8e-4f13-afdb-d132793e2059.jpg', url: 'power-plate-pro7hc' },
    pulse: { name: 'Power Plate Pulse', tag: 'Most powerful', desc: 'Our most powerful massage gun yet.', specs: ['6 intensity levels', '6-hour battery life', '6 massage attachments'], price: 299, was: 399, img: 'files/PulseEdited.png', url: 'power-plate-pulse-3-0' },
    mini: { name: 'Power Plate Mini+', tag: 'Travel size', desc: 'Ultracompact and whisper-quiet.', specs: ['Weighs under 1 lb', '4 intensity settings', '2 attachments'], price: 199, was: 285, img: 'files/Mini_Edited.png', url: 'power-plate-mini-plus' },
    roller: { name: 'Power Plate Roller', tag: 'Vibrating foam roller', desc: 'The foam roller, taken further.', specs: ['3 vibration modes', 'Under 3 lbs', '3-hour battery'], price: 129, was: 179, img: 'files/Roller-isolated_black_2400px_ee51f9f3-d7ef-4295-82a4-ec14c6204de9.png', url: 'power-plate-roller' },
    dualsphere: { name: 'Power Plate DualSphere', tag: 'Targeted relief', desc: 'Vibrating peanut massage ball.', specs: ['4 intensity levels', 'Under 2 lbs', '3-hour battery'], price: 129, was: 179, img: 'products/DualSphere-isolated_black_2400px_1.png', url: 'power-plate-dualsphere' }
  };
  const RANGES = {
    home: ['personal', 'move', 'my5', 'my8'],
    pro: ['pro5', 'pro5hp', 'pro8', 'pro7hc'],
    recovery: ['pulse', 'mini', 'roller', 'dualsphere']
  };
  /* Concept matching logic for the guided finder (to be validated with Power Plate). */
  const MATCH = {
    home: { strength: 'my8', recovery: 'move', mobility: 'move', aging: 'my5', wellness: 'personal' },
    pro: { strength: 'pro5hp', recovery: 'pro5', mobility: 'pro8', aging: 'pro7hc', wellness: 'pro5' },
    recovery: { strength: 'pulse', recovery: 'pulse', mobility: 'roller', aging: 'dualsphere', wellness: 'mini' }
  };
  const GOAL_LABEL = { strength: 'Strength', recovery: 'Recovery', mobility: 'Mobility', aging: 'Healthy aging', wellness: 'Wellness' };
  const GOALS = [
    { img: 'files/my8-Lifestyle-2.jpg', alt: 'A woman trains a lunge on the Power Plate my8.', title: 'Get stronger, in less time.', copy: 'Vibration adds an extra challenge to the moves you already know, so every squat, lunge and push-up activates more of your muscles.', list: ['Increase strength', 'Improve core strength', 'Activate more muscles'], rec: 'my8', where: 'home', chip: 'strength' },
    { img: 'products/IMG_0059_5968f05d-f10d-4e27-b98b-43261acf6fc1.jpg', alt: 'A woman uses the Power Plate Pulse massage gun on her shoulder.', title: 'Recover faster, feel better.', copy: 'Relax tight, sore muscles, release fascia and promote blood flow, after training or after a long day.', list: ['Increase blood circulation', 'Warm up faster', 'Relieve muscle soreness'], rec: 'pulse', where: 'recovery', chip: 'recovery' },
    { img: 'products/TBA-POWER-PLATE-Web-18.jpg', alt: 'A woman holds a side plank on a red Power Plate MOVE in a bright living room.', title: 'Move more freely.', copy: 'Stretch deeper and hold positions with more control. Vibration training supports flexibility, balance and range of motion.', list: ['Improve flexibility', 'Better balance and stability', 'Greater range of motion'], rec: 'move', where: 'home', chip: 'mobility' },
    { img: 'files/my8-Lifestyle-1.jpg', alt: 'An older man steps onto a Power Plate in his home.', title: 'Strength for every decade.', copy: 'Light, low-impact sessions that support strength, balance and bone health, whatever your fitness level.', list: ['Improve bone strength', 'Low impact on joints', 'Light sessions from 10 minutes'], rec: 'my5', where: 'home', chip: 'aging' },
    { img: 'products/personal-power-plate-1448.jpg', alt: 'A woman exercises on the Personal Power Plate beside her bed.', title: 'A few minutes a day, at home.', copy: 'Compact, quiet and simple to use, so moving better becomes part of your routine instead of another chore.', list: ['Compact and easy to store', 'Remarkably quiet', 'Quick, simple sessions'], rec: 'personal', where: 'home', chip: 'wellness' }
  ];

  /* ------------------------------------------------------------------
     Navigation + mobile menu
     ------------------------------------------------------------------ */
  const nav = $('[data-nav]');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < nav.offsetHeight + 8);
    if (y > lastY + 4 && y > 720 && !nav.contains(document.activeElement)) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 720) nav.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeMenu = (refocus = true) => {
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (refocus) openBtn.focus();
  };
  openBtn.addEventListener('click', () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('[data-menu-close]').focus();
  });
  $('[data-menu-close]').addEventListener('click', () => closeMenu());
  $$('a', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });

  /* ------------------------------------------------------------------
     Hero video (Wave), autoplay when allowed, always pausable
     ------------------------------------------------------------------ */
  const videos = $$('video[data-autoplay]', hero);
  const toggle = $('[data-video-toggle]', hero);
  if (videos.length && toggle) {
    let userPaused = reduceMotion;
    const render = () => {
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
      toggle.innerHTML = ICON(userPaused ? 'i-play' : 'i-pause');
    };
    const play = () => videos.forEach(v => v.play().catch(() => {}));
    const pause = () => videos.forEach(v => v.pause());
    toggle.addEventListener('click', () => { userPaused = !userPaused; userPaused ? pause() : play(); render(); });
    render();
    if (!userPaused) { videos.forEach(v => { v.preload = 'auto'; }); play(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { if (!userPaused) en.isIntersecting ? play() : pause(); }).observe(hero);
    }
  }

  /* Wave arcs */
  $$('svg[data-arcs]').forEach((svg, k) => {
    const r0 = +(svg.dataset.arcsR || 232);
    const step = +(svg.dataset.arcsStep || 48);
    const n = +(svg.dataset.arcsN || 5);
    const h = +(svg.dataset.arcsH || 220);
    const ang = svg.dataset.arcsAngle ? (+svg.dataset.arcsAngle * Math.PI) / 180 : null;
    const falloff = +(svg.dataset.arcsFalloff || 0);
    const id = 'hy-arc-fade-' + k;
    const stops = (svg.dataset.arcsStops || '0:0,.06:.55,.2:1,.8:1,.94:.55,1:0')
      .split(',').map(p => p.split(':'))
      .map(([o, a]) => `<stop offset="${o}" stop-color="#FF3D63" stop-opacity="${a}"/>`).join('');
    let d = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>`;
    for (let i = 0; i < n; i++) {
      const r = r0 + i * step;
      const hh = ang ? r * Math.sin(ang) : h;
      const x = (ang ? r * Math.cos(ang) : Math.sqrt(Math.max(r * r - h * h, 0))).toFixed(1);
      const y = hh.toFixed(1);
      const so = Math.max(1 - i * falloff, .15).toFixed(2);
      d += `<path style="--i:${i};stroke:url(#${id});stroke-opacity:${so}" d="M${x} ${-y}A${r} ${r} 0 0 1 ${x} ${y}"/>`;
      d += `<path style="--i:${i};stroke:url(#${id});stroke-opacity:${so}" d="M${-x} ${-y}A${r} ${r} 0 0 0 ${-x} ${y}"/>`;
    }
    svg.innerHTML = d;
  });

  /* ------------------------------------------------------------------
     Accessible tabs helper (automatic activation, arrow keys)
     ------------------------------------------------------------------ */
  function initTabs(list, onSelect) {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onSelect(tab, tabs.indexOf(tab));
    };
    list.addEventListener('click', e => {
      const tab = e.target.closest('[role="tab"]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') select(tab);
    });
    list.addEventListener('keydown', e => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
    });
    return { select: (i, focus) => select(tabs[i], focus) };
  }

  /* ------------------------------------------------------------------
     Why Power Plate, statement words, photo cycle, expanding panels
     ------------------------------------------------------------------ */
  const statement = $('[data-reveal-words]');
  if (statement) {
    if (hasGsap && !reduceMotion) {
      statement.setAttribute('aria-label', statement.textContent.trim());
      statement.innerHTML = statement.textContent.trim().split(/\s+/)
        .map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    } else {
      statement.classList.add('is-static');
    }
  }

  // Photo steps squat → stretch → recovery while on screen; the chip glides to the new label's width
  const sMedia = $('[data-statement-media]');
  if (sMedia && !reduceMotion && 'IntersectionObserver' in window) {
    const sImgs = $$('img', sMedia);
    const sLabel = $('[data-statement-label]', sMedia);
    let sIdx = 0, sTimer;
    const sStep = () => {
      sIdx = (sIdx + 1) % sImgs.length;
      sImgs.forEach((im, n) => im.classList.toggle('is-active', n === sIdx));
      sLabel.classList.add('is-out');
      setTimeout(() => {
        const chip = sLabel.parentElement;
        const from = chip.offsetWidth;
        sLabel.textContent = sImgs[sIdx].dataset.label;
        chip.style.width = 'auto';
        const to = chip.offsetWidth;
        chip.style.width = from + 'px';
        void chip.offsetWidth;
        chip.style.width = to + 'px';
        sLabel.classList.remove('is-out');
      }, 240);
    };
    new IntersectionObserver(([en]) => {
      clearInterval(sTimer);
      if (en.isIntersecting) sTimer = setInterval(sStep, 2800);
    }, { threshold: .4 }).observe(sMedia);
  }

  const panels = $$('[data-b-panel]');
  const setPanel = target => panels.forEach(p => {
    const on = p === target;
    p.classList.toggle('is-active', on);
    $('.b-panel__btn', p).setAttribute('aria-expanded', String(on));
  });
  const canHover = matchMedia('(hover: hover) and (min-width: 761px)').matches;
  panels.forEach(p => {
    const btn = $('.b-panel__btn', p);
    btn.addEventListener('click', () => setPanel(p));
    btn.addEventListener('focus', () => setPanel(p));
    if (canHover) p.addEventListener('mouseenter', () => setPanel(p));
  });

  /* ------------------------------------------------------------------
     Goals
     ------------------------------------------------------------------ */
  const goalPanel = $('[data-goal-panel]');
  const goalMedia = $('.goal__media');
  const goalBody = $('[data-goal-body]');

  function renderGoal(i, animate) {
    const g = GOALS[i];
    const p = PRODUCTS[g.rec];
    const fill = () => {
      $('[data-goal-title]').textContent = g.title;
      $('[data-goal-copy]').textContent = g.copy;
      $('[data-goal-list]').innerHTML = g.list.map(t => `<li>${ICON('i-check')}${t}</li>`).join('');
      $('[data-goal-rec-name]').textContent = p.name;
      $('[data-goal-rec-price]').innerHTML = `${money(p.price)} <s>${money(p.was)}</s>`;
      const ri = $('[data-goal-rec-img]');
      ri.src = img(p.img, 240);
      ri.style.objectFit = p.cover ? 'cover' : 'contain';
      const rec = $('[data-goal-rec]');
      rec.dataset.where = g.where;
      rec.dataset.chip = g.chip;
    };
    // The new photo wipes in over the old one
    const next = new Image();
    next.src = img(g.img, 1400);
    next.alt = g.alt;
    next.width = 1400; next.height = 933;
    if (!animate || !hasGsap || reduceMotion) {
      $$('img', goalMedia).forEach(el => el.remove());
      goalMedia.appendChild(next);
      fill();
      return;
    }
    gsap.killTweensOf([goalBody, ...$$('img', goalMedia)]);
    $$('img', goalMedia).slice(0, -1).forEach(el => el.remove()); // drop stale layers from rapid clicks
    goalMedia.appendChild(next);
    gsap.fromTo(next, { clipPath: 'inset(0 0 0 100%)', scale: 1.08 }, {
      clipPath: 'inset(0 0 0 0%)', scale: 1, duration: .9, ease: 'expo.out',
      onComplete: () => $$('img', goalMedia).forEach(el => { if (el !== next) el.remove(); })
    });
    gsap.to(goalBody, {
      opacity: 0, y: -8, duration: .18, ease: 'power1.in',
      onComplete: () => { fill(); gsap.fromTo(goalBody, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: 'expo.out' }); }
    });
  }
  initTabs($('[data-tabs="goals"]'), (tab, i) => {
    goalPanel.setAttribute('aria-labelledby', tab.id);
    renderGoal(i, true);
  });
  renderGoal(0, false);

  /* ------------------------------------------------------------------
     Find your Power Plate (guided finder)
     ------------------------------------------------------------------ */
  const grid = $('[data-products]');
  const biz = $('[data-biz]');
  const status = $('[data-finder-status]');
  let where = 'home';
  let chip = null;

  const cardHTML = key => {
    const p = PRODUCTS[key];
    const sw = p.swatches ? `
      <div class="swatches" role="group" aria-label="Color">
        ${p.swatches.map((s, i) => `<button class="swatch" type="button" aria-pressed="${i === 0}" aria-label="${s.name}" data-swatch="${i}"><span style="background:${s.color}"></span></button>`).join('')}
        <span class="swatches__name" data-swatch-name>${p.swatches[0].name}</span>
      </div>` : '';
    return `
      <article class="card" data-key="${key}">
        <span class="card__match">${ICON('pp-mark')}<span data-match-label>Best match</span></span>
        <div class="card__top"><span class="tag">${p.tag}</span></div>
        <div class="card__img"><img src="${img(p.img, 700)}" ${p.cover ? 'class="is-cover"' : ''} alt="${p.name}" width="600" height="600" loading="lazy"></div>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <ul class="card__specs">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>
        ${sw}
        <div class="card__foot">
          <p class="price">
            <span class="price__now">${money(p.price)}</span>
            <span class="price__meta"><span class="price__was"><span class="sr-only">Was </span>${money(p.was)}</span><span class="price__save">Save ${money(p.was - p.price)}</span></span>
          </p>
          <a class="btn btn--primary" href="https://www.powerplate.com/products/${p.url}" aria-label="Shop ${p.name}">Shop</a>
        </div>
      </article>`;
  };

  function applyMatch() {
    const match = chip ? MATCH[where][chip] : null;
    $$('.card', grid).forEach(c => c.classList.toggle('is-match', c.dataset.key === match));
    if (match) {
      status.textContent = `Best match for ${GOAL_LABEL[chip].toLowerCase()}: ${PRODUCTS[match].name}`;
      const card = $(`.card[data-key="${match}"]`, grid);
      if (card && grid.scrollWidth > grid.clientWidth) grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else status.textContent = '';
  }

  function renderProducts(animate) {
    grid.innerHTML = RANGES[where].map(cardHTML).join('');
    grid.scrollLeft = 0;
    biz.hidden = where !== 'pro';
    applyMatch();
    if (animate && hasGsap && !reduceMotion) {
      gsap.fromTo($$('.card', grid), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .06, ease: 'expo.out', clearProps: 'transform,opacity' });
    }
    window.ScrollTrigger?.refresh();
  }

  // Color swatches (MOVE)
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-swatch]');
    if (!b) return;
    const card = b.closest('.card');
    const p = PRODUCTS[card.dataset.key];
    const s = p.swatches[+b.dataset.swatch];
    $$('[data-swatch]', card).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('[data-swatch-name]', card).textContent = s.name;
    const im = $('.card__img img', card);
    im.src = img(s.img, 700);
    im.alt = `${p.name} in ${s.name}`;
  });

  const whereTabs = initTabs($('[data-tabs="where"]'), tab => {
    where = tab.dataset.where;
    renderProducts(true);
  });

  const chipBtns = $$('[data-chip]');
  const setChip = value => {
    chip = value;
    chipBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.chip === chip));
    applyMatch();
  };
  chipBtns.forEach(b => b.addEventListener('click', () => setChip(chip === b.dataset.chip ? null : b.dataset.chip)));

  // Goals → finder handoff
  $('[data-goal-rec]').addEventListener('click', e => {
    const r = e.currentTarget;
    whereTabs.select(Object.keys(RANGES).indexOf(r.dataset.where));
    setChip(r.dataset.chip);
  });

  renderProducts(false);

  /* ------------------------------------------------------------------
     Proof wall, seamless loop. Rows alternate photo / quote and each group has an
     even count, so the rhythm holds across the loop seam. Two copies follow each
     group so a short row never runs out on wide screens.
     ------------------------------------------------------------------ */
  $$('[data-hy-wall] .b-wall__group').forEach(g => {
    for (let i = 0; i < 2; i++) {
      const clone = g.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      $$('img', clone).forEach(im => (im.alt = ''));
      g.parentElement.appendChild(clone);
    }
  });

  /* Back to top */
  $('[data-b-totop]')?.addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    nav.querySelector('a, button')?.focus({ preventScroll: true });
  });

  /* Newsletter (concept only) */
  $('[data-newsletter]')?.addEventListener('submit', e => {
    e.preventDefault();
    $('[data-nl-msg]').textContent = 'Thanks, you’re on the list.';
  });

  /* One-second counter: final state when motion is off */
  const countEl = $('[data-b-count]');
  const bSteps = $$('[data-b-step]');
  if (!hasGsap || reduceMotion) {
    countEl.textContent = '50';
    bSteps.forEach(s => s.classList.add('is-active'));
    return;
  }

  /* ------------------------------------------------------------------
     Motion (GSAP), enhancement only
     ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();

  // Hero (Wave) intro
  const heroLines = $$('.line > span', hero);
  const heroFades = $$('[data-hero-fade]', hero);
  const hz = $('[data-w4-hz]');
  const o = { v: 0 };
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.w4__circle', { scale: .6, opacity: 0, duration: 1.6 }, .1)
    .from('.w4__orb .arcs', { opacity: 0, scale: .8, duration: 1.6 }, .4)
    .from(heroLines, { yPercent: 110, duration: 1.2, stagger: .12 }, .15)
    .from(heroFades, { opacity: 0, y: 16, duration: 1, stagger: .08, clearProps: 'transform' }, .45)
    .to(o, { v: 35, duration: 1.8, ease: 'power3.out', onUpdate: () => (hz.textContent = Math.round(o.v)) }, .6);
  gsap.to('[data-w4-orb]', { yPercent: 12, scale: 1.06, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // Section heads rise in
  $$('.section-head, .b-faq__head').forEach(h => {
    gsap.from(h.children, { opacity: 0, y: 24, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });

  // Statement: words fill in as it scrolls through; panels rise
  const words = $$('.statement__text .w');
  if (words.length) {
    gsap.to(words, { color: '#101820', stagger: .5, ease: 'none', scrollTrigger: { trigger: statement, start: 'top 82%', end: 'bottom 48%', scrub: .6 } });
  }
  gsap.from('.b-panel', { opacity: 0, y: 40, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '[data-b-panels]', start: 'top 85%', once: true } });

  // Inside one second, pinned: the counter climbs to 50 and the rings speed up with it
  const rings = $$('[data-b-ring]');
  const setRingSpeed = rate => rings.forEach(r => r.getAnimations().forEach(a => { a.playbackRate = rate; }));
  const setStepState = p => {
    const idx = p < .34 ? 0 : p < .67 ? 1 : 2;
    bSteps.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.classList.toggle('is-past', i < idx); });
  };
  mm.add('(min-width: 961px)', () => {
    const c = { v: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: '[data-b-second-pin]', pin: true, start: 'top top', end: () => '+=' + innerHeight * 2,
        scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => { setStepState(self.progress); setRingSpeed(.5 + self.progress * 2.5); }
      }
    })
      .to(c, { v: 50, ease: 'none', duration: .8, onUpdate: () => (countEl.textContent = Math.round(c.v)) }, 0)
      .fromTo('.b-second__product', { '--s': .92 }, { '--s': 1.04, ease: 'none', duration: 1 }, 0);
    return () => { countEl.textContent = '50'; setRingSpeed(1); bSteps.forEach(s => s.classList.add('is-active')); };
  });
  mm.add('(max-width: 960px)', () => {
    bSteps.forEach(s => s.classList.add('is-active'));
    const c = { v: 0 };
    gsap.to(c, { v: 50, duration: 1.6, ease: 'power3.out', onUpdate: () => (countEl.textContent = Math.round(c.v)), scrollTrigger: { trigger: '.b-second__count', start: 'top 85%', once: true } });
  });

  // Goals + finder arrive
  gsap.from('.goal', { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.goal', start: 'top 85%', once: true } });
  gsap.from('.finder, .products', { opacity: 0, y: 32, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.finder', start: 'top 85%', once: true } });

  // Everyday, pinned horizontal scroll on desktop
  mm.add('(min-width: 761px)', () => {
    const pinEl = $('.everyday__pin');
    const track = $('[data-hscroll-track]');
    const bar = $('[data-hscroll-bar]');
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    // ~2px of scroll per px of travel, between 1.6 and 2.6 screen heights
    const scrollLength = () => Math.min(Math.max(distance() * 2, innerHeight * 1.6), innerHeight * 2.6);
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pinEl, pin: true, start: 'center center',
        end: () => '+=' + scrollLength(),
        scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => gsap.set(bar, { scaleX: self.progress })
      }
    });
    $$('.moment__img img', track).forEach(im => {
      gsap.fromTo(im, { xPercent: -6, scale: 1.12 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: im, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    return () => gsap.set(track, { clearProps: 'transform' });
  });

  // Science: figures count up, evidence rows rise
  $$('[data-b-countup]').forEach(el => {
    const end = +el.dataset.bCountup;
    const c = { v: 0 };
    el.textContent = '0';
    gsap.to(c, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(c.v)), scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.from('.b-evidence li', { opacity: 0, y: 24, duration: .8, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.b-evidence', start: 'top 85%', once: true } });

  // Closing: content rises
  gsap.from('.b-closing__inner > *', { opacity: 0, y: 24, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.b-closing', start: 'top 75%', once: true } });

  // Footer: statement lines rise, then the giant logo assembles letter by letter
  gsap.from('[data-b-footer-statement] span', { yPercent: 60, opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '[data-b-footer]', start: 'top 75%', once: true } });
  gsap.from('.b-flogo__letter', { y: 56, duration: 1.2, stagger: { each: .05, from: 'center' }, ease: 'expo.out', scrollTrigger: { trigger: '[data-b-flogo]', start: 'top 92%', once: true } });
  gsap.from('.b-flogo__arcs', { scale: .4, opacity: 0, transformOrigin: '151.4px 39.5px', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '[data-b-flogo]', start: 'top 92%', once: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
