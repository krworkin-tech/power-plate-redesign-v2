// Power Plate product guide chat (Dynamic direction): four taps to a recommendation.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
  const IMG = 'assets/img/';
  const SHOP = 'https://www.powerplate.com/products/';

  const mark = '<span class="ppmark" aria-hidden="true"><span><img src="' + IMG + 'chat-mark.svg" width="114" height="30" alt=""></span></span>';

  const launcher = document.createElement('div');
  launcher.className = 'ppchat';
  launcher.innerHTML = `
    <div class="ppchat__offer" data-pp-offer>
      <button class="ppchat__offer-text" type="button" data-pp-open>Get 20% off today</button>
      <button class="ppchat__offer-close" type="button" aria-label="Dismiss offer message" data-pp-dismiss>×</button>
    </div>
    <button class="ppchat__btn" type="button" aria-label="Ask Power Plate, open the Power Plate product guide" aria-expanded="false" aria-controls="pp-guide" data-pp-open>
      ${mark}<span class="ppchat__label">Ask Power Plate</span>
    </button>`;

  const panel = document.createElement('section');
  panel.className = 'pppanel';
  panel.id = 'pp-guide';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'pp-guide-title');
  panel.innerHTML = `
    <header class="pppanel__head">
      ${mark}
      <h2 id="pp-guide-title">Power Plate</h2>
      <button class="pppanel__restart" type="button" hidden data-pp-restart>Start over</button>
      <button class="pppanel__close" type="button" aria-label="Close the Power Plate guide" data-pp-close>×</button>
    </header>
    <div class="pppanel__log" role="log" aria-live="polite" data-pp-log></div>`;

  document.body.append(launcher, panel);

  const log = panel.querySelector('[data-pp-log]');
  const restartBtn = panel.querySelector('[data-pp-restart]');
  const openBtn = launcher.querySelector('.ppchat__btn');

  // Prices match the Dynamic page (20% off, was-price struck through)
  const PRODUCTS = {
    personal: { name: 'Personal Power Plate®', price: '$1,836', was: '$2,295', img: 'prod-personal.webp', url: 'personal-power-plate', alt: 'Personal Power Plate, compact black platform' },
    move: { name: 'Power Plate® MOVE™', price: '$2,976', was: '$3,720', img: 'prod-move.webp', url: 'power-plate-move', alt: 'Power Plate MOVE in red' },
    my8: { name: 'Power Plate® my8™', price: '$8,396', was: '$10,495', img: 'prod-my8.webp', url: 'power-plate-my8', alt: 'Power Plate my8 with column and console' },
    pulse: { name: 'Power Plate Pulse', price: '$299', was: '$399', img: 'prod-pulse.webp', url: 'power-plate-pulse-3-0', alt: 'Power Plate Pulse handheld massager in red' }
  };

  const STEPS = [
    { key: 'goal', ask: 'Hi! I’m your Power Plate guide. What would you like to improve?', options: ['Strength', 'Recovery', 'Mobility', 'Healthy aging', 'Other'] },
    { key: 'place', ask: 'Where will it live?', options: ['A spot at home', 'A gym or studio', 'A clinic'] },
    { key: 'handles', ask: 'Handles for balance?', options: ['Yes, handles', 'No, floor level'] },
    { key: 'budget', ask: 'Any budget in mind?', options: ['Under $2,500', '$2,500 to $5,000', 'Over $5,000', 'Not sure yet'] }
  ];

  let answers = {};
  let run = 0;

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
    p.className = 'ppmsg ppmsg--' + who;
    p.textContent = text;
    return add(p);
  };
  const botSay = async (text, id) => {
    const typing = document.createElement('p');
    typing.className = 'ppmsg ppmsg--bot ppmsg--typing';
    typing.setAttribute('aria-label', 'Power Plate is typing');
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
    wrap.className = 'ppchips';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', step.ask);
    step.options.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ppchip';
      b.textContent = opt;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (wrap.classList.contains('is-done')) return;
        b.setAttribute('aria-pressed', 'true');
        wrap.classList.add('is-done');
        wrap.querySelectorAll('.ppchip').forEach(c => { c.disabled = true; });
        answers[step.key] = opt;
        bubble(opt, 'user');
        restartBtn.hidden = false;
        if (i + 1 < STEPS.length) askStep(i + 1, id);
        else showPick(id);
      });
      wrap.appendChild(b);
    });
    add(wrap);
    if (i > 0 || panel.contains(document.activeElement)) wrap.querySelector('.ppchip').focus({ preventScroll: true });
  };

  const showPick = async id => {
    const rec = recommend(answers);
    const p = PRODUCTS[rec.id];
    if (!(await botSay(`My pick for you: ${p.name.replace(/[®™]/g, '')}. It’s 20% off right now.`, id))) return;
    const card = document.createElement('div');
    card.className = 'pppick';
    card.innerHTML = `
      <div class="pppick__media"><img src="${IMG + p.img}" width="160" height="160" alt="${p.alt}"></div>
      <div>
        <p class="pppick__name">${p.name}</p>
        <p class="pppick__price">${p.price} <s aria-label="was ${p.was}">${p.was}</s></p>
      </div>
      <p class="pppick__why">${rec.why}</p>
      <a class="pppick__cta" href="${SHOP + p.url}" target="_blank" rel="noopener">Shop ${p.name}</a>
      ${rec.pro ? '<a class="pppick__alt" href="#faq">Talk to our pro team</a>' : ''}`;
    add(card);
    card.querySelector('.pppick__cta').focus({ preventScroll: true });
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
    panel.querySelector('[data-pp-close]').focus({ preventScroll: true });
  };
  const close = () => {
    panel.hidden = true;
    launcher.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus({ preventScroll: true });
  };

  launcher.querySelectorAll('[data-pp-open]').forEach(b => b.addEventListener('click', open));
  launcher.querySelector('[data-pp-dismiss]').addEventListener('click', () => { launcher.querySelector('[data-pp-offer]').hidden = true; });
  panel.querySelector('[data-pp-close]').addEventListener('click', close);
  restartBtn.addEventListener('click', start);
  panel.addEventListener('click', e => { const a = e.target.closest('.pppick__alt'); if (a) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
})();
