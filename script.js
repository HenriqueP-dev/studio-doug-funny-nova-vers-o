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
function initHero(root) {
  const stage = $('.stage');
  const words = $$('[data-word]');
  words.forEach(word => { word.innerHTML = [...word.textContent].map(c => `<span class="ch"><i>${c}</i></span>`).join(''); });
  const [wordOutline, wordFill, wordFront] = words;
  const clipperPos = $('.clipper-pos');
  const mover = $('.clipper-mover');
  const buzz = $('.clipper-buzz');
  const clipperImg = $('.clipper');
  const glow = $('.clipper-glow');
  const cutline = $('.cutline');
  const script = $('.script');
  const heroCopy = $$('.hero-copy, .hero-since');

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
     da máquina, a partir do ponto em que o eixo cruza a altura --depth-y (fração da palavra). */
  const updateDepthMask = () => {
    const wr = wordFront.getBoundingClientRect();
    const cr = clipperImg.getBoundingClientRect();
    if (!wr.width || !cr.width) return;
    const r = rotation() * Math.PI / 180;
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
    wordFront.dataset.mask = poly.length > 2
      ? `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`
      : 'inset(0 0 0 100%)';
    if (!introPending()) wordFront.style.clipPath = wordFront.dataset.mask;
  };

  /* Estado final (fim da abertura ou tempo de segurança) */
  const finishIntro = () => {
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
    [stage, ...heroCopy].forEach(el => el.getAnimations({ subtree: true }).forEach(animation => {
      if (animation.playState === 'finished') animation.cancel();
      else animation.finished.then(() => animation.cancel(), () => {});
    }));
  };

  const runIntro = () => {
    const chars = words.map(w => $$('.ch > i', w));
    const vw = window.innerWidth, mobile = vw <= 760;
    const rot = rotation();
    const startRot = mobile ? -78 : -86;
    const dx = vw * (mobile ? 0.95 : 0.78), dy = -window.innerHeight * 0.06;
    updateDepthMask();

    // 1. letras sobem da máscara
    chars.forEach(list => list.forEach((el, i) => el.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
      { duration: 700, delay: 80 + i * 45, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' })));

    // 2. a máquina entra deitada pela direita e se endireita na diagonal
    clipperPos.style.opacity = '1';
    const travel = mover.animate([
      { transform: `translate(${dx}px, ${dy}px) rotate(${startRot}deg) scale(1.08)`, offset: 0 },
      { transform: `translate(${dx * 0.18}px, ${dy * 0.4}px) rotate(${(startRot + rot) / 2 - 8}deg) scale(1.03)`, offset: 0.62 },
      { transform: `translate(0px, 0px) rotate(${rot}deg) scale(1)`, offset: 1 }
    ], { duration: 1500, delay: 450, easing: 'cubic-bezier(0.22, 0.8, 0.2, 1)', fill: 'both' });

    // 3. por onde a máquina passa, a palavra fica sólida; a linha de corte acompanha a borda
    let raf = 0, cutDone = false;
    const finishCut = () => {
      if (cutDone) return;
      cutDone = true;
      cancelAnimationFrame(raf);
      const wr = wordFill.getBoundingClientRect();
      const startPct = parseFloat((wordFill.style.clipPath.match(/([\d.]+)%/) || [0, 0])[1]);
      const startLeft = wr.left + wr.width * startPct / 100;
      wordFill.animate([{ clipPath: `inset(0 0 0 ${startPct}%)` }, { clipPath: 'inset(0 0 0 0%)' }], { duration: 480, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
      cutline.animate([{ left: `${startLeft}px`, opacity: 1 }, { left: `${wr.left}px`, opacity: 1, offset: 0.85 }, { left: `${wr.left}px`, opacity: 0 }], { duration: 560, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
    };
    const track = () => {
      const cr = clipperImg.getBoundingClientRect();
      const wr = wordFill.getBoundingClientRect();
      const edge = Math.max(0, Math.min(wr.width, cr.left + cr.width * 0.5 - wr.left));
      const pct = (edge / wr.width) * 100;
      wordFill.style.clipPath = `inset(0 0 0 ${pct.toFixed(2)}%)`;
      wordFront.style.clipPath = wordFront.dataset.mask;
      cutline.style.left = `${wr.left + edge}px`;
      cutline.style.opacity = pct < 99.5 ? '1' : '0';
      const progress = travel.effect.getComputedTiming().progress || 0;
      if (progress > 0.8 && travel.currentTime > 450) { finishCut(); return; }  // 4. o corte termina de atravessar
      if (!cutDone) raf = requestAnimationFrame(track);
    };
    wordFront.style.clipPath = 'inset(0 0 0 100%)';
    setTimeout(() => { raf = requestAnimationFrame(track); }, 450);

    // 5. ao pousar, a máquina "liga": vibração curta e brilho
    travel.finished.then(() => {
      finishCut();
      buzz.animate([0, 1, -1, 1, -1, 0.5, 0].map(v => ({ transform: `translate(${v * 1.6}px, ${-v}px)` })), { duration: 320, easing: 'linear' });
      glow.animate([{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }], { duration: 700, easing: 'ease-out' });
    });

    // 6. assinatura e chamadas
    script.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 650, delay: 1500, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' });
    heroCopy.forEach(el => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 1050, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }));

    setTimeout(finishIntro, 2700);
  };

  // espera a imagem da máquina (e as fontes) para medir o cruzamento certo
  const imageReady = clipperImg.complete ? Promise.resolve() : new Promise(resolve => {
    clipperImg.addEventListener('load', resolve, { once: true });
    clipperImg.addEventListener('error', resolve, { once: true });
  });
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 350))]);
  Promise.all([imageReady, fontsReady]).then(() => (introPending() ? runIntro() : updateDepthMask()));

  // tempo de segurança: se algo falhar, mostra tudo no estado final
  setTimeout(() => { if (introPending() && !wordFill.getAnimations().length) finishIntro(); }, 4000);

  return {
    el: $('.hero'), stage, clipperPos, clipperImg, wordFront, updateDepthMask, introPending, onIntroDone,
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

  const renderSlots = (container, { times, allPassed }) => {
    if (!container) return;
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

  const render = () => {
    const periods = slotsByPeriod();
    if (state.time && !periods.some(p => p.times.includes(state.time))) state.time = '';
    periods.forEach((period, i) => renderSlots(periodLists[i], period));

    const day = dayLabel(state.day);
    summaryBarber.textContent = state.barber;
    summaryDay.textContent = day;
    summaryTime.textContent = state.time || 'Selecione um horário';
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
