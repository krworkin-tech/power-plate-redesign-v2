/* Dynamic V2 page additions: header backdrop, hero, goals section (V1) and the Classic quiz */
// Header gets its dark backdrop as soon as the page leaves the top
(() => {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const set = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', set, { passive: true });
  set();
})();

// Scenes: each tab owns one shot of the film; its line fills as that stretch plays, then the next scene takes over
(() => {
  const v = document.querySelector('.hero--scenes .hero__video'), tabs = [...document.querySelectorAll('[data-scenes] .scene')];
  if (!v || !tabs.length) return;
  const words = [...document.querySelectorAll('[data-scene-words] > span')], lede = document.querySelector('[data-lede]');
  const toggle = document.querySelector('.hero--scenes [data-video-toggle]');
  const label = document.getElementById('hk-title');
  const starts = tabs.map(t => +t.dataset.at); // each scene starts at a cut in the film
  const sceneAt = t => { let k = 0; starts.forEach((s, n) => { if (t >= s) k = n; }); return k; };
  const endOf = k => k + 1 < starts.length ? starts[k + 1] : (v.duration || 11.8);
  let cur = 0;
  const select = (k, seek) => {
    if (k !== cur) {
      words[cur].classList.add('out'); words[cur].setAttribute('aria-hidden', 'true');
      const old = words[cur]; setTimeout(() => old.classList.remove('out'), 600);
      words[k].removeAttribute('aria-hidden');
      lede.style.opacity = 0;
      setTimeout(() => { lede.textContent = tabs[k].dataset.copy; lede.style.opacity = 1; }, 250);
      label.setAttribute('aria-label', 'More from every ' + words[k].textContent);
    }
    cur = k;
    tabs.forEach((t, n) => { t.setAttribute('aria-selected', String(n === k)); t.tabIndex = n === k ? 0 : -1; if (n !== k) t.querySelector('i').style.transform = n < k ? 'scaleX(1)' : 'scaleX(0)'; });
    if (seek) {
      v.classList.add('dip');
      setTimeout(() => { v.currentTime = +tabs[k].dataset.at; v.classList.remove('dip'); }, 250);
    }
  };
  // The film's clock drives the progress lines and moves to the next scene on its own
  const tick = () => {
    const t = v.currentTime, k = sceneAt(t);
    if (k !== cur && !v.classList.contains('dip')) select(k, false);
    const p = Math.max(0, Math.min(1, (t - starts[k]) / (endOf(k) - starts[k])));
    tabs[cur].querySelector('i').style.transform = `scaleX(${p})`;
    requestAnimationFrame(tick);
  };
  tabs.forEach((t, n) => {
    t.addEventListener('click', () => { select(n, true); if (v.paused && !(toggle && toggle.matches('[aria-pressed=true]'))) v.play().catch(() => {}); });
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); const m = (n + d + tabs.length) % tabs.length; select(m, true); tabs[m].focus(); }
    });
  });
  requestAnimationFrame(tick);

  // Chat launcher: hidden while the hero fills most of the screen (unless the guide is open)
  const hero = document.querySelector('.hero--scenes'), chat = document.querySelector('.ppchat');
  if (hero && chat && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const open = chat.querySelector('[aria-expanded=true]');
      chat.classList.toggle('is-away', e.isIntersecting && !open);
    }, { rootMargin: '-60% 0px 0px 0px' }).observe(hero); // the hero still reaches the lower 40% of the screen
  }
})();

(() => {
// Goal content and picks come from the Dynamic page; photos and titles from Classic
const CDN = 'https://cdn.shopify.com/s/files/1/0362/1139/2645/';
const PRODUCTS = {
  my8: { name: 'Power Plate® my8™', price: 8396, was: 10495, img: 'files/my8-_45.jpg', url: 'power-plate-my8' },
  pulse: { name: 'Power Plate Pulse', price: 299, was: 399, img: 'files/PulseEdited.png', url: 'power-plate-pulse-3-0' },
  move: { name: 'Power Plate® MOVE™', price: 2976, was: 3720, img: 'files/MoveBlack_2.png', url: 'power-plate-move' },
  my5: { name: 'Upgraded Power Plate® my5™', price: 5196, was: 6495, img: 'files/my5-2026_isolated-L45.png', url: 'upgraded-power-plate-my5' },
  personal: { name: 'Personal Power Plate®', price: 1836, was: 2295, img: 'files/Personal_0fdfee51-d763-4d38-9eb6-26127b59cf2a.png', url: 'personal-power-plate' }
};
const GOALS = [
  { title: 'Strength', sub: 'Build power, faster', img: 'assets/img/goals/goal-strength.jpg', pos: '22% 50%', alt: 'A woman does a knee drive beside a Power Plate my8',
    head: 'Get stronger, in less time.', copy: 'Vibration adds an extra challenge to the moves you already know, so every squat, lunge and push-up activates more of your muscles.', list: ['Increase strength', 'Improve core strength', 'Activate more muscles'], rec: 'my8' },
  { title: 'Recovery', sub: 'Bounce back sooner', img: 'assets/img/goals/goal-recovery.jpg', pos: '50% 40%', alt: 'A man uses a Pulse massager while seated on a Power Plate',
    head: 'Recover faster, feel better.', copy: 'Relax tight, sore muscles, release fascia and promote blood flow, after training or after a long day.', list: ['Increase blood circulation', 'Warm up faster', 'Relieve muscle soreness'], rec: 'pulse' },
  { title: 'Mobility', sub: 'Move with ease', img: 'assets/img/goals/goal-mobility.jpg', pos: '45% 50%', alt: 'A woman holds a side stretch on a Power Plate',
    head: 'Move more freely.', copy: 'Stretch deeper and hold positions with more control. Vibration training supports flexibility, balance and range of motion.', list: ['Improve flexibility', 'Better balance and stability', 'Greater range of motion'], rec: 'move' },
  { title: 'Healthy aging', sub: 'Stay strong for life', img: 'assets/img/goals/goal-aging.jpg', pos: '55% 50%', alt: 'An older man trains with resistance cables on a Power Plate',
    head: 'Strength for every decade.', copy: 'Light, low-impact sessions that support strength, balance and bone health, whatever your fitness level.', list: ['Improve bone strength', 'Low impact on joints', 'Light sessions from 10 minutes'], rec: 'my5' },
  { title: 'Everyday wellness', sub: 'A few minutes a day', img: CDN + 'products/personal-power-plate-1448.jpg?width=1400', pos: '40% 50%', alt: 'A woman exercises on the Personal Power Plate beside her bed',
    head: 'A few minutes a day, at home.', copy: 'Compact, quiet and simple to use, so moving better becomes part of your routine instead of another chore.', list: ['Compact and easy to store', 'Remarkably quiet', 'Quick, simple sessions'], rec: 'personal' }
];
const money = n => '$' + n.toLocaleString('en-US');
const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
// Product photos load up front and are trimmed to the product itself, so every one sits centred at the same size
const PRELOAD = {};
const trim = im => {
  try {
    const w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(im, 0, 0);
    const px = ctx.getImageData(0, 0, w, h), d = px.data;
    // Clear a white photo backdrop: flood from the edges through near-white pixels, so white parts inside the product stay
    const white = k => d[k + 3] > 0 && d[k] > 236 && d[k + 1] > 236 && d[k + 2] > 236;
    const seen = new Uint8Array(w * h), stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const p = stack.pop();
      if (seen[p]) continue;
      seen[p] = 1;
      if (!white(p * 4)) continue;
      d[p * 4 + 3] = 0;
      const x = p % w;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (p >= w) stack.push(p - w);
      if (p < w * (h - 1)) stack.push(p + w);
    }
    ctx.putImageData(px, 0, 0);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
      const k = (y * w + x) * 4;
      // Product pixel: not transparent and not the photo's white backdrop
      if (d[k + 3] > 24 && (d[k] < 240 || d[k + 1] < 240 || d[k + 2] < 240)) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return { src: im.src, ratio: w / h };
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch);
    return { src: out.toDataURL('image/png'), ratio: cw / ch };
  } catch (e) { return { src: im.src, ratio: im.naturalWidth / im.naturalHeight }; } // canvas blocked: keep the original photo
};
GOALS.forEach(g => {
  if (PRELOAD[g.rec]) return;
  const im = new Image();
  im.crossOrigin = 'anonymous';
  const entry = { src: CDN + PRODUCTS[g.rec].img + '?width=600' };
  entry.ready = new Promise(res => { im.onload = () => { Object.assign(entry, trim(im)); res(); }; im.onerror = res; });
  im.src = entry.src;
  PRELOAD[g.rec] = entry;
});
const pick = document.querySelector('[data-gpick]'), detail = document.querySelector('[data-gdetail]');
const $ = sel => detail.querySelector(sel);
pick.innerHTML = GOALS.map((g, i) => `<button class="gcard" type="button" role="tab" id="gtab-${i}" aria-controls="gdetail" aria-selected="${!i}" tabindex="${i ? -1 : 0}">
    <img src="${g.img}" alt="" style="object-position:${g.pos}" loading="lazy">
    <span class="gcard__check" aria-hidden="true">${icon('i-check')}</span>
    <span class="gcard__text"><span class="gcard__title">${g.title}</span><span class="gcard__sub">${g.sub}</span></span>
  </button>`).join('');
const tabs = [...pick.children];
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
let cur = -1, swapT;
const fill = i => {
  const g = GOALS[i], p = PRODUCTS[g.rec];
  $('[data-k]').textContent = g.title;
  $('[data-h]').textContent = g.head;
  $('[data-c]').textContent = g.copy;
  $('[data-l]').innerHTML = g.list.map(t => `<li>${icon('i-check')}${t}</li>`).join('');
  $('[data-p]').href = 'https://powerplate.com/products/' + p.url;
  $('[data-p]').setAttribute('aria-label', 'Shop ' + p.name);
  const pic = PRELOAD[g.rec], img = $('[data-pimg]'), r = pic.ratio || 1, side = Math.min(1, Math.sqrt(.5 * r));
  img.src = pic.src;
  img.style.width = (side * 100).toFixed(1) + '%';
  img.style.height = Math.min(100, side / r * 100).toFixed(1) + '%';
  $('[data-pname]').textContent = p.name;
  $('[data-pprice]').innerHTML = money(p.price) + '<s>' + money(p.was) + '</s>';
  $('[data-psave]').textContent = 'Save ' + money(p.was - p.price);
  detail.setAttribute('aria-labelledby', 'gtab-' + i);
  $('.gdetail__more').dataset.quizGoal = ['strength', 'recovery', 'mobility', 'aging', 'wellness'][i];
};
// The notch on the panel's top edge lines up with the picked card
const notch = () => {
  const r = tabs[cur].getBoundingClientRect(), d = detail.getBoundingClientRect();
  detail.style.setProperty('--x', (r.left + r.width / 2 - d.left) + 'px');
};
const select = (i, focus) => {
  if (i === cur) return;
  const first = cur < 0;
  cur = i;
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
  if (focus) tabs[i].focus();
  notch();
  if (first) { fill(i); PRELOAD[GOALS[i].rec].ready.then(() => { if (cur === i) $("[data-pimg]").src = PRELOAD[GOALS[i].rec].src; }); return; }
  clearTimeout(swapT);
  detail.classList.add('is-out');
  const ready = PRELOAD[GOALS[i].rec].ready;
  swapT = setTimeout(() => ready.then(() => { if (cur !== i) return; fill(i); detail.classList.remove('is-out'); }), 220);
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => { select(i); if (innerWidth <= 900) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); });
  // Mouse: hovering a card swaps the panel; a short pause means sweeping across the row doesn't flicker. Touch and keyboard keep tap/click
  let hoverT;
  t.addEventListener('mouseenter', () => { if (canHover.matches) hoverT = setTimeout(() => select(i), 120); });
  t.addEventListener('mouseleave', () => clearTimeout(hoverT));
  // Arrow keys move between goals, as in a tab list
  t.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); select((i + d + tabs.length) % tabs.length, true); }
  });
});
addEventListener('resize', notch);
pick.addEventListener('scroll', notch, { passive: true });
select(0);
const equalize = () => {
  detail.style.minHeight = '';
  let max = 0;
  GOALS.forEach((g, i) => { fill(i); max = Math.max(max, detail.offsetHeight); });
  fill(cur);
  detail.style.minHeight = max + 'px';
};
equalize();
if (document.fonts) document.fonts.ready.then(equalize); // text wraps differently once the fonts arrive
let eqT;
addEventListener('resize', () => { clearTimeout(eqT); eqT = setTimeout(equalize, 150); });
Promise.all(Object.values(PRELOAD).map(p => p.ready)).then(() => fill(cur));

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // 60-second quiz: three questions, then a match (Figma "Quiz modal")
  const quiz = $('[data-quiz]');
  if (quiz) {
    const main = $('[data-quiz-main]', quiz);
    const steps = $$('[data-quiz-steps] li', quiz);
    const modal = $('.quiz__modal', quiz);
    let opener = null;
    let state = { i: 0, answers: [], alt: 0 };

    const QUESTIONS = [
      { q: 'What’s your main goal?', options: [
        ['strength', 'Strength & performance', 'Build power, train smarter'],
        ['recovery', 'Recovery', 'Bounce back sooner'],
        ['mobility', 'Mobility & balance', 'Move with ease'],
        ['aging', 'Healthy aging', 'Stay strong for life'],
        ['wellness', 'Everyday wellness', 'A simple daily routine']] },
      { q: 'Where will you use it?', options: [
        ['home', 'At home', 'A platform for your daily routine'],
        ['studio', 'In a studio or clinic', 'For regular use with clients'],
        ['business', 'For a team or business', 'Get advice from a specialist']] },
      { q: 'How would you describe your training?', options: [
        ['new', 'Just getting started', 'Short, simple sessions'],
        ['regular', 'I train regularly', 'Add variety to my routine'],
        ['athlete', 'Athlete or coach', 'High-performance programming']] }
    ];

    const PRODUCTS = {
      move: { name: 'Power Plate® MOVE™', short: 'Power Plate® MOVE™', price: '$3,720', img: 'assets/img/goals/quiz-move.png', w: 970, h: 565,
        blurb: 'Whole body, for home. 20% off and free shipping for a limited time.', extra: 'Guided classes in the Power Plate app' },
      personal: { name: 'Personal Power Plate®', short: 'Personal Power Plate®', price: '$2,295', img: 'assets/img/goals/prod-personal.png', w: 566, h: 566,
        blurb: 'Compact, for home. 20% off and free shipping for a limited time.', extra: 'Our most compact plate, easy to store' },
      my8: { name: 'Power Plate® my8™', short: 'my8™', price: '$10,495', img: 'assets/img/goals/prod-my8.png', w: 566, h: 566, soldOut: true,
        blurb: 'Performance studio with handles and a touchscreen. Back in stock soon.', extra: 'Touchscreen with coach-led workouts built in' }
    };

    const rank = ([goal, place, level]) => {
      if (place !== 'home' || level === 'athlete') return ['my8', 'move', 'personal'];
      if (goal === 'recovery' && level === 'new') return ['personal', 'move', 'my8'];
      return ['move', 'personal', 'my8'];
    };
    const reasons = ([, place, level], id) => [
      { home: 'Whole-body routines you can do at home', studio: 'Built for regular use with clients', business: 'A sturdy platform for teams and busy spaces' }[place],
      { new: 'Simple, short sessions for getting started', regular: 'Adds variety to the training you already do', athlete: 'Room to push high-performance programming' }[level],
      PRODUCTS[id].extra
    ];

    const setSteps = i => steps.forEach((li, k) => {
      li.classList.toggle('is-done', k < i);
      li.classList.toggle('is-current', k === i);
      li.classList.toggle('is-match', k === 3);
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });

    const renderQuestion = () => {
      const { i, answers } = state;
      const item = QUESTIONS[i];
      setSteps(i);
      main.innerHTML = `
        <div class="quiz__body">
          <div class="quiz__progress">
            <p>Question ${i + 1} of ${QUESTIONS.length}</p>
            <div class="quiz__bars" aria-hidden="true">${QUESTIONS.map((_, k) => `<span class="${k <= i ? 'is-on' : ''}"></span>`).join('')}</div>
          </div>
          <h2 class="quiz__q" id="quiz-q">${item.q}</h2>
          <div class="quiz__options" role="radiogroup" aria-labelledby="quiz-q">
            ${item.options.map(([v, t, s]) => `
              <button class="quiz__opt" type="button" role="radio" aria-checked="${answers[i] === v}" data-v="${v}">
                <span class="quiz__opt-text"><span class="quiz__opt-title">${t}</span><span class="quiz__opt-sub">${s}</span></span>
                <span class="quiz__radio" aria-hidden="true"></span>
              </button>`).join('')}
          </div>
        </div>
        <div class="quiz__foot">
          ${i > 0 ? '<button class="quiz__back" type="button" data-back>← Back</button>' : '<span></span>'}
          <button class="btn btn--dark quiz__next" type="button" data-next ${answers[i] ? '' : 'disabled'}>${i === QUESTIONS.length - 1 ? 'See my match' : 'Continue'}</button>
        </div>`;
      const opts = $$('.quiz__opt', main);
      const next = $('[data-next]', main);
      const choose = btn => {
        opts.forEach(o => o.setAttribute('aria-checked', String(o === btn)));
        state.answers[i] = btn.dataset.v;
        next.disabled = false;
      };
      opts.forEach((btn, k) => {
        btn.addEventListener('click', () => choose(btn));
        btn.addEventListener('dblclick', () => { choose(btn); next.click(); });
        btn.addEventListener('keydown', e => {
          const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
          if (!d) return;
          e.preventDefault();
          const to = opts[(k + d + opts.length) % opts.length];
          to.focus(); choose(to);
        });
      });
      next.addEventListener('click', () => {
        state.i += 1; state.alt = 0;
        state.i < QUESTIONS.length ? renderQuestion() : renderMatch();
      });
      const back = $('[data-back]', main);
      if (back) back.addEventListener('click', () => { state.i -= 1; renderQuestion(); });
      (opts.find(o => o.getAttribute('aria-checked') === 'true') || opts[0]).focus({ preventScroll: true });
      main.scrollTop = 0;
    };

    const renderMatch = () => {
      setSteps(3);
      const order = rank(state.answers);
      const id = order[state.alt % order.length];
      const p = PRODUCTS[id];
      main.innerHTML = `
        <div class="quiz__body">
          <h2 class="quiz__q">${p.name}</h2>
          <div class="quiz__card">
            <div class="quiz__card-media"><img src="${p.img}" width="${p.w}" height="${p.h}" alt="${p.name.replace(/[®™]/g, '')}"></div>
            <div class="quiz__card-info">
              <p class="quiz__rating"><span class="stars" aria-label="5 out of 5 stars">★★★★★</span>510+ verified reviews</p>
              <p class="quiz__price">${p.price}<span class="badge ${p.soldOut ? 'badge--muted' : ''}">${p.soldOut ? 'Out of stock' : 'Save 20%'}</span></p>
              <p class="quiz__blurb">${p.blurb}</p>
            </div>
          </div>
          <div class="quiz__why">
            <p>Why it fits you:</p>
            <ul>${reasons(state.answers, id).map(r => `<li>${r}</li>`).join('')}</ul>
          </div>
          <div class="quiz__actions">
            ${p.soldOut
              ? '<button class="btn btn--red" type="button" data-notify>Notify me when it’s back</button>'
              : `<a class="btn btn--red" href="#bestsellers" data-shop>Shop ${p.short}</a>`}
            <button class="btn btn--outline" type="button" data-other>See other matches</button>
          </div>
          <form class="quiz__email" data-email novalidate>
            <label class="sr-only" for="quiz-email">Email me my results</label>
            <input id="quiz-email" type="email" placeholder="Email me my results" autocomplete="email" required>
            <button class="btn btn--dark" type="submit">Send</button>
          </form>
          <p class="quiz__email-msg" role="status" aria-live="polite"></p>
        </div>
        <div class="quiz__links">
          <button type="button" data-retake>Retake the quiz</button>
          <button type="button" data-specialist>Not ready? Talk to a specialist</button>
        </div>`;
      $('[data-other]', main).addEventListener('click', () => { state.alt += 1; renderMatch(); });
      $('[data-retake]', main).addEventListener('click', () => { state = { i: 0, answers: [], alt: 0 }; renderQuestion(); });
      $('[data-specialist]', main).addEventListener('click', () => { close(); const faq = document.querySelector('.faq'); if (faq) faq.scrollIntoView({ behavior: 'smooth' }); });
      const shop = $('[data-shop]', main);
      if (shop) shop.addEventListener('click', () => close(false));
      const notify = $('[data-notify]', main);
      if (notify) notify.addEventListener('click', () => { notify.textContent = 'Thanks, we’ll let you know'; notify.disabled = true; });
      const form = $('[data-email]', main);
      const msg = $('.quiz__email-msg', main);
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = $('input', form);
        if (!input.checkValidity()) { msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
        msg.textContent = 'Sent. Check your inbox for your match.';
        form.reset();
      });
      $('.quiz__q', main).setAttribute('tabindex', '-1');
      $('.quiz__q', main).focus({ preventScroll: true });
      main.scrollTop = 0;
    };

    const open = e => {
      opener = e && e.currentTarget;
      if (e) e.preventDefault();
      // A goal card starts the quiz with that goal picked, on question 2
      const goal = opener && opener.dataset.quizGoal;
      state = goal ? { i: 1, answers: [goal], alt: 0 } : { i: 0, answers: [], alt: 0 };
      quiz.hidden = false;
      document.body.classList.add('quiz-open');
      renderQuestion();
    };
    const close = (restore = true) => {
      quiz.hidden = true;
      document.body.classList.remove('quiz-open');
      if (restore && opener) opener.focus({ preventScroll: true });
    };

    $$('[data-quiz-open]').forEach(b => b.addEventListener('click', open));
    $$('[data-quiz-close]', quiz).forEach(b => b.addEventListener('click', () => close()));
    document.addEventListener('keydown', e => {
      if (quiz.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      // keep focus inside the modal
      const f = $$('button:not(:disabled), a[href], input', modal).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})();

})();
