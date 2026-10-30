/* ==========================================================================
   Studio Doug Funny — comportamento da página
   Sem dependências. Carregado com `defer` no fim do <head>.

   1. Configuração (contato, horário de funcionamento, agenda de exemplo)
   2. Menu e link ativo
   3. Hero: letras, profundidade e abertura
   4. Rolagem: cabeçalho e paralaxe
   5. Revelações tipográficas
   6. Agenda
   ========================================================================== */

/* ==========================================================================
   1. CONFIGURAÇÃO
   ========================================================================== */
const WHATSAPP_NUMBER = '5517991052256';

/* Horário de funcionamento (o mesmo da seção Contato e dos dados estruturados no <head>).
   Chave = getDay() do JavaScript (0 = domingo). Dias ausentes = fechado.
   Cada dia tem dois turnos: [manhã, tarde]. */
const OPENING_HOURS = {
  2: [['08:00', '12:30'], ['14:00', '19:00']],   // terça
  3: [['08:00', '12:30'], ['14:00', '19:00']],   // quarta
  4: [['08:00', '12:30'], ['14:00', '19:00']],   // quinta
  5: [['08:00', '12:30'], ['14:00', '19:00']],   // sexta
  6: [['08:00', '13:30'], ['15:00', '18:30']]    // sábado
};

/* --------------------------------------------------------------------------
   AGENDA DE DEMONSTRAÇÃO
   Os horários abaixo são EXEMPLOS fixos para mostrar como a agenda funciona.
   Eles não refletem a disponibilidade real da equipe e nada é reservado pelo site:
   o visitante só monta uma mensagem e a equipe confirma (ou não) pelo WhatsApp.

   Para ligar a uma fonte real, troque DEMO_SCHEDULE pelos dados reais (mesmo formato)
   e mude AGENDA_IS_DEMO para false: o aviso de demonstração some e os textos deixam
   de dizer "exemplo".
   Formato: profissional → dia da semana (getDay) → lista de horários "HH:MM".
   O turno (manhã/tarde) é deduzido de OPENING_HOURS.
   -------------------------------------------------------------------------- */
const AGENDA_IS_DEMO = true;
const AGENDA_DAYS_SHOWN = 5;

const DEMO_SCHEDULE = {
  Funny: {
    2: ['08:30', '09:00', '10:00', '14:30', '16:20', '17:00'],
    3: ['09:00', '10:30', '15:00', '16:00', '17:30'],
    4: ['08:30', '10:00', '14:00', '15:30', '18:00'],
    5: ['09:30', '11:00', '14:00', '16:00', '17:30'],
    6: ['08:00', '09:30', '11:00', '15:00']
  },
  Miguel: {
    2: ['09:30', '11:00', '15:30', '16:30'],
    3: ['08:00', '09:30', '14:00', '17:00'],
    4: ['10:00', '14:30', '16:30', '18:00'],
    5: ['14:00', '15:00', '17:00'],
    6: ['08:30', '10:00', '13:00']
  },
  Thaylor: {
    2: ['08:30', '16:00', '17:00'],
    3: ['10:00', '11:00', '14:30'],
    4: ['15:00', '17:00'],
    5: ['09:00', '10:30'],
    6: ['08:30', '11:00']
  }
};

/* ==========================================================================
   Utilitários
   ========================================================================== */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const toMinutes = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const whatsappUrl = message => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* Marca um botão de um grupo como escolhido (o estilo vem de aria-pressed). */
const pressOnly = (buttons, chosen) => buttons.forEach(b => b.setAttribute('aria-pressed', String(b === chosen)));

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initMenu();
  const hero = initHero(root);
  const scroll = initScroll(root, reduceMotion, hero);
  const reveals = initReveals();
  initAgenda();

  /* Ponte para motion.js (GSAP + Lenis), que roda depois deste arquivo e pode assumir partes do
     movimento. Sem motion.js, nada aqui muda: a página funciona só com este arquivo. */
  window.StudioDF = { hero, scroll, reveals };
});

/* ==========================================================================
   2. MENU E LINK ATIVO
   ========================================================================== */
function initMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('#primary-navigation');
  const links = $$('.nav-link', nav);

  const setOpen = isOpen => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', isOpen);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });

  // destaca no menu a seção que está no meio da tela
  const sections = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
  const markCurrent = id => links.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  const spy = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) markCurrent(entry.target.id);
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => spy.observe(section));
}

/* ==========================================================================
   3. HERO: LETRAS, PROFUNDIDADE E ABERTURA (ver DESIGN.md §10)
   ========================================================================== */
window.StudioDFHero = true;   // avisa o <head> que este arquivo rodou (ver a segurança do intro-pending)

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';

function initHero(root) {
  const stage = $('.stage');
  const heroEl = $('.hero');
  const words = $$('[data-word]');
  words.forEach(word => {
    word.innerHTML = [...word.textContent].map(c => `<span class="ch"><i>${c}</i></span>`).join('');
    word.classList.add('is-split');
  });
  const [wordOutline, wordFill, wordFront] = words;
  const clipperPos = $('.clipper-pos');
  const mover = $('.clipper-mover');
  const buzz = $('.clipper-buzz');
  const clipperImg = $('.clipper');
  const glow = $('.clipper-glow');
  const cutline = $('.cutline');
  const script = $('.script');
  const heroDark = $('.hero-dark');
  const copyParts = $$('.hero-kicker, .hero-quote, .hero-cta, .hero-since');

  const stageVar = name => parseFloat(getComputedStyle(stage).getPropertyValue(name));
  // Pose do palco (variáveis CSS): lida uma vez e relida só quando a janela muda de tamanho,
  // porque a máscara é recalculada a cada quadro enquanto a máquina se move.
  let pose = null;
  const readPose = () => pose || (pose = { rot: stageVar('--rot') || -32, depthY: stageVar('--depth-y') });
  window.addEventListener('resize', () => { pose = null; });
  let extraRotation = 0;  // giro aplicado por cima da pose (rolagem); entra no cálculo da máscara
  const rotation = () => readPose().rot + extraRotation;
  const introPending = () => root.classList.contains('intro-pending');
  const introCallbacks = [];
  const onIntroDone = cb => (introPending() ? introCallbacks.push(cb) : cb());

  /* Parte do título que fica NA FRENTE da cauda da máquina: semiplano perpendicular ao eixo
     da máquina, a partir do ponto em que o eixo cruza a altura --depth-y (fração da palavra).
     Devolve o polígono em coordenadas da palavra, ou null se algo ainda não tem tamanho. */
  const depthPolygon = deg => {
    const wr = wordFront.getBoundingClientRect();
    const cr = clipperImg.getBoundingClientRect();
    if (!wr.width || !cr.width) return null;
    const r = deg * Math.PI / 180;
    const tail = { x: -Math.sin(r), y: Math.cos(r) };
    const head = { x: -tail.x, y: -tail.y };
    const c = { x: cr.left + cr.width / 2 - wr.left, y: cr.top + cr.height / 2 - wr.top };
    const fy = readPose().depthY;
    const ty = wr.height * (Number.isFinite(fy) ? fy : 0.36);
    const p = { x: c.x + head.x * ((ty - c.y) / head.y), y: ty };
    const rect = [[0, 0], [wr.width, 0], [wr.width, wr.height], [0, wr.height]];
    const side = ([x, y]) => (x - p.x) * tail.x + (y - p.y) * tail.y;
    const poly = [];
    rect.forEach((a, i) => {
      const b = rect[(i + 1) % 4], sa = side(a), sb = side(b);
      if (sa >= 0) poly.push(a);
      if ((sa >= 0) !== (sb >= 0)) { const t = sa / (sa - sb); poly.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    });
    return poly;
  };
  const toClip = poly => (poly && poly.length > 2
    ? `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`
    : 'inset(0 0 0 100%)');
  // corta o polígono numa linha vertical: fica só o que está à direita de minX
  const keepRightOf = (poly, minX) => {
    const out = [];
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      const inA = a[0] >= minX, inB = b[0] >= minX;
      if (inA) out.push(a);
      if (inA !== inB) out.push([minX, a[1] + (b[1] - a[1]) * ((minX - a[0]) / (b[0] - a[0]))]);
    });
    return out;
  };

  const updateDepthMask = () => {
    const poly = depthPolygon(rotation());
    if (!poly) return;
    wordFront.dataset.mask = toClip(poly);
    if (!introPending()) wordFront.style.clipPath = wordFront.dataset.mask;
  };

  /* Estado final (fim da abertura ou tempo de segurança) */
  const finishIntro = () => {
    if (!introPending()) return;
    root.classList.remove('intro-pending');
    wordFill.style.clipPath = 'none';
    cutline.style.opacity = '0';
    releaseIntroAnimations();
    updateDepthMask();
    introCallbacks.splice(0).forEach(cb => cb());
  };

  /* As animações da abertura usam fill: 'both'/'forwards' e, terminadas, continuam "segurando" os
     valores calculados no carregamento. O mais grave é o ângulo da máquina: ao girar o celular ou
     redimensionar a janela, ela ficava presa na pose antiga e a máscara de profundidade desalinhava.
     O estado final de todas elas é igual ao do CSS, então dá para cancelá-las sem mudança visual. */
  const releaseIntroAnimations = () => {
    [stage, heroDark, ...copyParts].forEach(el => el.getAnimations({ subtree: true }).forEach(animation => {
      if (animation.playState === 'finished') animation.cancel();
      else animation.finished.then(() => animation.cancel(), () => {});
    }));
  };

  /* --------------------------------------------------------------------------
     ABERTURA (≈2,9s no desktop). Todo o cronograma é feito de animações (delay + duração), sem
     setTimeout, para que a sequência inteira obedeça ao mesmo relógio.
     0,00s  a luz de cinema acende (a cortina preta .hero-dark sai)
     0,12s  "BARBEARIA" em contorno sobe da máscara, letra a letra
     0,42s  a máquina desce da direita, deitada e mais perto da câmera (maior), atravessa a palavra,
            passa um pouco do ponto e assenta na diagonal.
            Por onde a LÂMINA passa a palavra fica sólida; a cópia da frente segue a profundidade real.
     ~1,5s  o corte termina de atravessar a palavra (linha laranja)
     1,15s  rótulo, frase e botões entram em sequência
     ~1,97s a máquina pousa: vibração, brilho e a luz percorre o metal das letras
     1,60s  "Doug Funny" é pintado com borda de pincel
     -------------------------------------------------------------------------- */
  let started = false;
  const runIntro = () => {
    started = true;
    const chars = words.map(w => $$('.ch > i', w));
    const vw = window.innerWidth, vh = window.innerHeight, mobile = vw <= 760;
    const rot = rotation();
    const T = { letters: 120, machine: 420, travel: mobile ? 1400 : 1550, copy: 1150, script: 1600 };
    const startRot = mobile ? -80 : -88;
    const startScale = mobile ? 1.12 : 1.22;
    updateDepthMask();

    // de onde a máquina parte: totalmente fora da tela, à direita e acima (nada aparece parado na borda)
    const home = clipperImg.getBoundingClientRect();
    const length = clipperImg.offsetHeight * startScale;
    const dx = vw + length * 0.52 - (home.left + home.width / 2);
    const dy = -vh * (mobile ? 0.07 : 0.15);

    // 0. luz de cinema: a cortina preta sai (só opacidade de uma camada sólida)
    heroDark.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, easing: 'cubic-bezier(0.33, 0, 0.2, 1)', fill: 'both' });

    // 1. letras sobem da máscara
    chars.forEach(list => list.forEach((el, i) => el.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 750, delay: T.letters + i * 40, easing: EASE_OUT, fill: 'both' })));

    // 2. a máquina: entra deitada e maior (mais perto), arqueia, passa um pouco do ponto e assenta
    clipperPos.style.opacity = '1';
    const travel = mover.animate([
      { transform: `translate(${dx}px, ${dy}px) rotate(${startRot}deg) scale(${startScale})`, easing: 'cubic-bezier(0.3, 0.55, 0.3, 1)' },
      { transform: `translate(${dx * 0.15}px, ${dy * 0.18}px) rotate(${(startRot + rot) / 2 - 6}deg) scale(${1 + (startScale - 1) * 0.3})`, offset: 0.58, easing: 'cubic-bezier(0.25, 0.6, 0.3, 1)' },
      { transform: `translate(${-vw * 0.005}px, ${vh * 0.007}px) rotate(${rot - 2.5}deg) scale(0.992)`, offset: 0.86, easing: EASE_IO },
      { transform: `translate(0px, 0px) rotate(${rot}deg) scale(1)` }
    ], { duration: T.travel, delay: T.machine, fill: 'both' });

    // 3. o corte acompanha a ponta da lâmina (alto da imagem), não o centro da máquina
    const livePose = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(mover).transform);
      return { deg: Math.atan2(m.b, m.a) * 180 / Math.PI, scale: Math.hypot(m.a, m.b) };
    };
    let raf = 0, cutDone = false, edge = Infinity;
    const finishCut = () => {
      if (cutDone) return;
      cutDone = true;
      const wr = wordFill.getBoundingClientRect();
      const startPct = Math.min(100, (Math.min(edge, wr.width) / wr.width) * 100);
      const startLeft = wr.left + wr.width * startPct / 100;
      wordFill.animate([{ clipPath: `inset(0 0 0 ${startPct}%)` }, { clipPath: 'inset(0 0 0 0%)' }], { duration: 480, easing: EASE_IO, fill: 'forwards' });
      cutline.animate([{ left: `${startLeft}px`, opacity: 1 }, { left: `${wr.left}px`, opacity: 1, offset: 0.85 }, { left: `${wr.left}px`, opacity: 0 }], { duration: 560, easing: EASE_IO, fill: 'forwards' });
    };
    const track = () => {
      const { deg, scale } = livePose();
      const wr = wordFill.getBoundingClientRect();
      const cr = clipperImg.getBoundingClientRect();
      const bladeX = cr.left + cr.width / 2 + Math.sin(deg * Math.PI / 180) * clipperImg.offsetHeight * scale * 0.47;
      if (!cutDone) {
        edge = Math.min(edge, Math.max(0, Math.min(wr.width, bladeX - wr.left)));   // o corte nunca volta
        const pct = (edge / wr.width) * 100;
        wordFill.style.clipPath = `inset(0 0 0 ${pct.toFixed(2)}%)`;
        cutline.style.left = `${wr.left + edge}px`;
        cutline.style.opacity = pct < 99.5 ? '1' : '0';
      }
      // a cópia da frente: só onde a lâmina já passou, com a profundidade do ângulo atual
      const poly = depthPolygon(deg + extraRotation);
      if (poly) wordFront.style.clipPath = toClip(keepRightOf(poly, Number.isFinite(edge) ? edge : wr.width));
      const progress = travel.effect.getComputedTiming().progress || 0;
      if (!cutDone && progress > 0.7 && travel.currentTime > T.machine) finishCut();  // 4. o corte termina de atravessar
      if (travel.playState !== 'finished') raf = requestAnimationFrame(track);
    };
    wordFront.style.clipPath = 'inset(0 0 0 100%)';
    // o acompanhamento começa junto com a máquina (atraso feito por uma animação vazia, no mesmo relógio)
    mover.animate([{}, {}], { duration: 1, delay: T.machine }).finished.then(() => { raf = requestAnimationFrame(track); });

    // 5. ao pousar, a máquina "liga": vibração curta, brilho e a luz percorre o metal das letras
    travel.finished.then(() => {
      cancelAnimationFrame(raf);
      finishCut();
      buzz.animate([0, 1, -1, 1, -1, 0.5, 0].map(v => ({ transform: `translate(${v * 1.6}px, ${-v}px)` })), { duration: 320, easing: 'linear' });
      glow.animate([{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }], { duration: 700, easing: 'ease-out' });
      [wordFill, wordFront].forEach(word => $$('.ch > i', word).forEach((el, i) => el.animate(
        [{ backgroundPosition: '105% 0, 0 0' }, { backgroundPosition: '-5% 0, 0 0' }],
        { duration: 700, delay: 140 + i * 38, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' })));
    });

    // 6. textos em sequência e assinatura pintada
    const copyAnims = copyParts.map((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: T.copy + i * 80, easing: EASE_OUT, fill: 'both' }));
    const paint = script.animate([
      { clipPath: 'polygon(-20% 0%, -20% 0%, -32% 100%, -32% 100%)' },
      { clipPath: 'polygon(-20% 0%, 120% 0%, 108% 100%, -32% 100%)' }
    ], { duration: 750, delay: T.script, easing: EASE_IO, fill: 'both' });

    Promise.all([travel.finished, paint.finished, ...copyAnims.map(a => a.finished)]).then(finishIntro, finishIntro);
  };

  // espera a imagem da máquina (e as fontes) para medir o cruzamento certo
  const imageReady = clipperImg.complete ? Promise.resolve() : new Promise(resolve => {
    clipperImg.addEventListener('load', resolve, { once: true });
    clipperImg.addEventListener('error', resolve, { once: true });
  });
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 350))]);
  Promise.all([imageReady, fontsReady]).then(() => (introPending() ? runIntro() : updateDepthMask()));

  // tempo de segurança: se a abertura não começar (imagem travada), mostra tudo no estado final
  setTimeout(() => { if (introPending() && !started) finishIntro(); }, 4000);

  return {
    el: heroEl, stage, clipperPos, clipperImg, wordFront, updateDepthMask, introPending, onIntroDone,
    setExtraRotation: deg => { extraRotation = deg; }
  };
}

/* ==========================================================================
   4. ROLAGEM: CABEÇALHO E PARALAXE (só enquanto o hero está visível)
   ========================================================================== */
function initScroll(root, reduceMotion, hero) {
  const header = $('.header');
  let heroVisible = true, ticking = false, parallax = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero.el);

  const onScroll = () => {
    header.classList.toggle('is-solid', window.scrollY > 40);
    if (reduceMotion || !parallax || !heroVisible || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, hero.el.offsetHeight);
      hero.clipperPos.style.setProperty('--py', `${y * 0.42}px`);
      hero.clipperPos.style.setProperty('--px', `${y * 0.1}px`);
      hero.clipperPos.style.setProperty('--pr', `${y * 0.012}deg`);
      hero.el.style.setProperty('--wy', `${y * -0.14}px`);
      if (!hero.introPending()) hero.updateDepthMask();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', hero.updateDepthMask);
  onScroll();

  return {
    header,
    /* motion.js assume a paralaxe: desliga a daqui e zera o que ela deixou aplicado */
    disableParallax() {
      parallax = false;
      ['--px', '--py', '--pr'].forEach(v => hero.clipperPos.style.removeProperty(v));
      hero.el.style.removeProperty('--wy');
    }
  };
}

/* ==========================================================================
   5. REVELAÇÕES TIPOGRÁFICAS E LINHA DE CORTE
   ========================================================================== */
function initReveals() {
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
  }), { threshold: 0.35 });
  $$('.reveal, .cut-divider').forEach(el => io.observe(el));
  /* motion.js pode assumir um elemento (ex.: título dividido em letras): para de observá-lo aqui */
  return { release: el => io.unobserve(el) };
}

/* ==========================================================================
   6. AGENDA
   O site não reserva nada: monta uma mensagem de consulta para o WhatsApp.
   ========================================================================== */
function initAgenda() {
  const notice = $('#agenda-notice');
  const barberButtons = $$('.barber-tab');
  const dayStrip = $('.day-strip');
  const periodLists = [$('#slots-morning'), $('#slots-afternoon')];
  const summaryBarber = $('#summary-barber');
  const summaryDay = $('#summary-day');
  const summaryTime = $('#summary-time');
  const whatsappLink = $('#agenda-whatsapp-link');
  if (!dayStrip || !whatsappLink) return;

  if (notice) notice.hidden = !AGENDA_IS_DEMO;
  const slotLabel = AGENDA_IS_DEMO ? 'horário de exemplo' : 'horário';

  const weekdayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = n => String(n).padStart(2, '0');
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

  const state = { barber: barberButtons[0]?.dataset.barber || 'Funny', day: null, time: '' };

  /* Próximos dias de funcionamento. Hoje só entra se o Studio ainda não fechou. */
  const upcomingDays = () => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let offset = 0; days.length < AGENDA_DAYS_SHOWN && offset < 21; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const hours = OPENING_HOURS[date.getDay()];
      if (!hours) continue;
      if (offset === 0 && nowMinutes() >= toMinutes(hours[hours.length - 1][1])) continue;
      days.push(date);
    }
    return days;
  };

  const renderDays = () => {
    dayStrip.replaceChildren(...upcomingDays().map((date, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'day-card';
      button.setAttribute('aria-pressed', String(i === 0));
      button.dataset.date = date.toISOString();
      const isToday = sameDay(date, new Date());
      const name = document.createElement('span');
      name.className = 'day-card-name';
      name.textContent = isToday ? 'Hoje' : capitalize(weekdayName.format(date).replace('-feira', ''));
      const label = document.createElement('span');
      label.className = 'day-card-date';
      label.textContent = `${date.getDate()} ${monthName.format(date).replace('.', '')}`;
      button.append(name, label);
      button.addEventListener('click', () => { state.day = date; state.time = ''; pressOnly($$('.day-card', dayStrip), button); render(); });
      return button;
    }));
    state.day = new Date(dayStrip.firstElementChild.dataset.date);
  };

  const dayLabel = date => `${capitalize(weekdayName.format(date))}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  /* Horários do profissional no dia, separados por turno, sem os que já passaram (se for hoje). */
  const slotsByPeriod = () => {
    const weekday = state.day.getDay();
    const hours = OPENING_HOURS[weekday] || [];
    const all = (DEMO_SCHEDULE[state.barber] || {})[weekday] || [];
    const isToday = sameDay(state.day, new Date());
    const now = nowMinutes();
    return hours.map(([open, close]) => {
      const inPeriod = all.filter(t => toMinutes(t) >= toMinutes(open) && toMinutes(t) < toMinutes(close));
      const upcoming = isToday ? inPeriod.filter(t => toMinutes(t) > now) : inPeriod;
      return { times: upcoming, allPassed: inPeriod.length > 0 && upcoming.length === 0 };
    });
  };

  /* Só refaz a lista quando o conteúdo muda (profissional, dia ou horários). Escolher um horário
     apenas marca o botão (syncSelection): o botão focado continua existindo, então o foco do
     teclado não se perde, e a atualização de minuto em minuto não mexe em nada se nada mudou. */
  const renderSlots = (container, { times, allPassed }) => {
    if (!container) return;
    const signature = `${state.barber}|${state.day.toDateString()}|${times.join(',')}|${allPassed}`;
    if (container.dataset.signature === signature) return;
    container.dataset.signature = signature;
    if (!times.length) {
      const empty = document.createElement('span');
      empty.className = 'slot-empty';
      empty.textContent = allPassed
        ? 'Os horários deste período já passaram.'
        : `Nenhum ${slotLabel} neste período.`;
      container.replaceChildren(empty);
      return;
    }
    container.replaceChildren(...times.map(time => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot';
      button.textContent = time;
      button.setAttribute('aria-label', `${time}, ${slotLabel}`);
      button.setAttribute('aria-pressed', String(state.time === time));
      button.addEventListener('click', () => { state.time = time; render(); });
      return button;
    }));
  };

  const syncSelection = () => periodLists.forEach(list => list && $$('.slot', list).forEach(button => {
    button.setAttribute('aria-pressed', String(button.textContent === state.time));
  }));
  const setText = (el, text) => { if (el.textContent !== text) el.textContent = text; };

  const render = () => {
    const periods = slotsByPeriod();
    if (state.time && !periods.some(p => p.times.includes(state.time))) state.time = '';
    periods.forEach((period, i) => renderSlots(periodLists[i], period));
    syncSelection();

    const day = dayLabel(state.day);
    setText(summaryBarber, state.barber);
    setText(summaryDay, day);
    setText(summaryTime, state.time || 'Selecione um horário');
    summaryTime.classList.toggle('is-empty', !state.time);   // só estilo: texto de ajuda fica discreto

    const when = state.time ? `às ${state.time}` : 'em qualquer horário disponível';
    whatsappLink.href = whatsappUrl(`Olá! Gostaria de consultar a disponibilidade para ${day}, ${when}, com ${state.barber}.`);
  };

  barberButtons.forEach(button => button.addEventListener('click', () => {
    pressOnly(barberButtons, button);
    state.barber = button.dataset.barber;
    state.time = '';
    render();
  }));

  renderDays();
  render();

  // Com a página aberta por muito tempo: horários de hoje que passam saem da lista e, quando o
  // Studio fecha (ou vira o dia), a faixa de dias é refeita a partir do próximo dia aberto.
  setInterval(() => {
    const first = upcomingDays()[0];
    if (first && !sameDay(first, new Date(dayStrip.firstElementChild.dataset.date))) {
      state.time = '';
      renderDays();
    }
    render();
  }, 60 * 1000);
}
