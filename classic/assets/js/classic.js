// Power Plate — Classic direction
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const menuBtn = $('[data-menu]');
  const mobileNav = $('#mobile-nav');
  if (menuBtn && mobileNav) {
    const setMenu = open => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.hidden = !open;
    };
    menuBtn.addEventListener('click', () => setMenu(mobileNav.hidden));
    $$('a', mobileNav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuBtn.focus(); } });
  }

  // FAQ accordion: one open at a time, like the Figma "expand" state
  const faq = $('[data-faq]');
  if (faq) {
    const buttons = $$('button[aria-controls]', faq);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      buttons.forEach(b => {
        const isThis = b === btn;
        b.setAttribute('aria-expanded', String(isThis && open));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !(isThis && open);
      });
    }));
  }

  // Chat offer dismiss
  const dismiss = $('[data-chat-dismiss]');
  if (dismiss) dismiss.addEventListener('click', () => { $('[data-chat-offer]').hidden = true; });

  // Hertz product guide: four taps to a recommendation (goal, place, handles, budget)
  const panel = $('#hertz');
  const launcher = $('[data-chat]');
  if (panel && launcher) {
    const log = $('[data-hertz-log]', panel);
    const restartBtn = $('[data-hertz-restart]', panel);
    const openBtn = $('.chat__btn', launcher);
    const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));

    const PRODUCTS = {
      personal: { name: 'Personal Power Plate®', price: '$2,295', img: 'assets/img/prod-personal.webp', alt: 'Personal Power Plate, compact black platform' },
      move: { name: 'Power Plate® MOVE™', price: '$3,720', img: 'assets/img/prod-move.webp', alt: 'Power Plate MOVE in red' },
      my8: { name: 'Power Plate® my8™', price: '$10,495', img: 'assets/img/prod-my8.webp', alt: 'Power Plate my8 with column and console', soldOut: true },
      pulse: { name: 'Power Plate Pulse', price: '$399', img: 'assets/img/prod-pulse.webp', alt: 'Power Plate Pulse handheld massager in red' }
    };

    const STEPS = [
      { key: 'goal', ask: 'Hi, I’m Hertz! What would you like to improve?', options: ['Strength', 'Recovery', 'Mobility', 'Healthy aging', 'Other'] },
      { key: 'place', ask: 'Where will it live?', options: ['A spot at home', 'A gym or studio', 'A clinic'] },
      { key: 'handles', ask: 'Handles for balance?', options: ['Yes, handles', 'No, floor level'] },
      { key: 'budget', ask: 'Any budget in mind?', options: ['Under $2,500', '$2,500 to $5,000', 'Over $5,000', 'Not sure yet'] }
    ];

    let answers = {};
    let run = 0; // guards against stale timers after "Start over"

    const recommend = a => {
      const pro = a.place !== 'A spot at home';
      const low = a.budget === 'Under $2,500';
      if (pro || a.handles === 'Yes, handles' || a.budget === 'Over $5,000') {
        return { id: 'my8', pro, why: pro
          ? 'Built for heavier daily use, with handles and a console. Our team can also price commercial models for you.'
          : 'Handles for balance, a touchscreen and coach-led workouts built in.' };
      }
      if (a.goal === 'Recovery' && low) return { id: 'pulse', why: 'Targeted vibration for sore muscles, light enough to take anywhere.' };
      if (low) return { id: 'personal', why: 'Our most compact plate, with gold-standard vibration for small spaces.' };
      return { id: 'move', why: 'Compact and column-free, with six frequency modes. Our bestseller for home.' };
    };

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };
    const add = el => { log.appendChild(el); scrollDown(); return el; };
    const bubble = (text, who) => {
      const p = document.createElement('p');
      p.className = 'msg msg--' + who;
      p.textContent = text;
      return add(p);
    };
    const botSay = async (text, id) => {
      const typing = document.createElement('p');
      typing.className = 'msg msg--bot msg--typing';
      typing.setAttribute('aria-label', 'Hertz is typing');
      typing.innerHTML = '<span></span><span></span><span></span>';
      add(typing);
      await wait(650);
      typing.remove();
      if (id !== run) return false;
      bubble(text, 'bot');
      return true;
    };

    const askStep = async (i, id) => {
      const step = STEPS[i];
      if (!(await botSay(step.ask, id))) return;
      const wrap = document.createElement('div');
      wrap.className = 'chips';
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', step.ask);
      step.options.forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = opt;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          if (wrap.classList.contains('is-done')) return;
          b.setAttribute('aria-pressed', 'true');
          wrap.classList.add('is-done');
          $$('.chip', wrap).forEach(c => { c.disabled = true; });
          answers[step.key] = opt;
          bubble(opt, 'user');
          restartBtn.hidden = false;
          if (i + 1 < STEPS.length) askStep(i + 1, id);
          else showPick(id);
        });
        wrap.appendChild(b);
      });
      add(wrap);
      if (i > 0 || panel.contains(document.activeElement)) $('.chip', wrap).focus({ preventScroll: true });
    };

    const showPick = async id => {
      const rec = recommend(answers);
      const p = PRODUCTS[rec.id];
      const intro = p.soldOut
        ? `My pick for you: ${p.name.replace(/[®™]/g, '')}. It’s sold out right now, but I can tell you when it’s back.`
        : `My pick for you: ${p.name.replace(/[®™]/g, '')}. It’s 20% off right now.`;
      if (!(await botSay(intro, id))) return;
      const card = document.createElement('div');
      card.className = 'pick';
      card.innerHTML = `
        <div class="pick__media"><img src="${p.img}" width="160" height="160" alt="${p.alt}"></div>
        <div>
          <p class="pick__name">${p.name}</p>
          <p class="pick__price">${p.price}${p.was ? ` <s aria-label="was ${p.was}">${p.was}</s>` : ''}</p>
        </div>
        <p class="pick__why">${rec.why}</p>
        ${p.soldOut
          ? '<button class="btn btn--dark btn--block" type="button" data-notify>Notify me when it’s back</button>'
          : '<a class="btn btn--red btn--block" href="#bestsellers">Add to cart</a>'}
        ${rec.pro ? '<a class="pick__alt" href="#home-pro">Talk to our pro team</a>' : ''}`;
      add(card);
      const notify = $('[data-notify]', card);
      if (notify) notify.addEventListener('click', () => { notify.textContent = 'Thanks, we’ll let you know'; notify.disabled = true; });
      $('.btn', card).focus({ preventScroll: true });
      scrollDown();
    };

    const start = () => {
      run += 1;
      answers = {};
      log.innerHTML = '';
      restartBtn.hidden = true;
      askStep(0, run);
    };

    const open = () => {
      panel.hidden = false;
      launcher.classList.add('is-open');
      openBtn.setAttribute('aria-expanded', 'true');
      if (!log.childElementCount) start();
      $('[data-hertz-close]', panel).focus({ preventScroll: true });
    };
    const close = () => {
      panel.hidden = true;
      launcher.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus({ preventScroll: true });
    };

    $$('[data-chat-open]', launcher).forEach(b => b.addEventListener('click', open));
    $('[data-hertz-close]', panel).addEventListener('click', close);
    restartBtn.addEventListener('click', start);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  }

  // Newsletter (concept only, nothing is sent)
  const form = $('[data-newsletter]');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    $('.footer__msg', form).textContent = 'Thanks, you’re on the list.';
    form.reset();
  });

  // "50 vibrations per second" wave: two sine lines, the red one building in amplitude
  const wave = $('[data-wave]');
  if (wave) {
    const grey = $('.stat__wave-grey', wave);
    const red = $('.stat__wave-red', wave);
    const W = 257, H = 50, mid = H / 2;
    const build = (phase, amp, freq, grow) => {
      let d = '';
      for (let x = 0; x <= W; x += 2) {
        const env = grow ? 0.25 + 0.75 * (x / W) : 1 - 0.35 * Math.abs(x / W - 0.5);
        const y = mid + Math.sin(x * freq + phase) * amp * env;
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(2);
      }
      return d;
    };
    const draw = t => {
      grey.setAttribute('d', build(t * 0.0022 + 1.2, 11, 0.052, false));
      red.setAttribute('d', build(-t * 0.0035, 21, 0.058, true));
    };
    if (reduceMotion) { draw(0); }
    else {
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(wave);
      const loop = t => { if (visible) draw(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

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
      move: { name: 'Power Plate® MOVE™', short: 'Power Plate® MOVE™', price: '$3,720', img: 'assets/img/quiz-move.webp', w: 970, h: 565,
        blurb: 'Whole body, for home. 20% off and free shipping for a limited time.', extra: 'Guided classes in the Power Plate app' },
      personal: { name: 'Personal Power Plate®', short: 'Personal Power Plate®', price: '$2,295', img: 'assets/img/prod-personal.webp', w: 566, h: 566,
        blurb: 'Compact, for home. 20% off and free shipping for a limited time.', extra: 'Our most compact plate, easy to store' },
      my8: { name: 'Power Plate® my8™', short: 'my8™', price: '$10,495', img: 'assets/img/prod-my8.webp', w: 566, h: 566, soldOut: true,
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
      $('[data-specialist]', main).addEventListener('click', () => { close(); document.querySelector('.faq').scrollIntoView({ behavior: 'smooth' }); });
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
      state = { i: 0, answers: [], alt: 0 };
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
