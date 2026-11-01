/* ==========================================================================
   Studio Doug Funny — comportamento da página
   Sem dependências. Carregado com `defer` no fim do <head>.

   1. Configuração (contato, horário de funcionamento, agenda)
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
   AGENDA
   O visitante escolhe profissional, dia e período (manhã ou tarde). Dias e períodos vêm de
   OPENING_HOURS, o horário real de funcionamento: nenhum horário é inventado. O site não reserva
   nada; ele monta uma mensagem e a equipe confirma pelo WhatsApp o horário exato e se o
   profissional está disponível naquele período.
   -------------------------------------------------------------------------- */
const AGENDA_DAYS_SHOWN = 5;
const PERIOD_NAMES = ['Manhã', 'Tarde'];   // nomes dos turnos, na ordem em que aparecem em OPENING_HOURS

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

/* --------------------------------------------------------------------------
   GIRO DA MÁQUINA EM 3D (sequência renderizada)
   A máquina é um render do Blender. Para girá-la de verdade em torno do próprio eixo, o MESMO modelo,
   com a mesma luz e a mesma câmera, foi renderizado em várias posições (ferramentas/render_maquina.py
   rolls=… e montar_giro.py): duas folhas de quadros.
     imagens/maquina-giro-a   volta inteira, de 10 em 10°, leve         (abertura e rolagem)
     imagens/maquina-giro-b   só perto da pose final, de 5 em 5°, nítida (pouso e mouse)
   Aqui os quadros viram um <canvas> exatamente sob a imagem da máquina. Regras:
   - Nunca atrasa nada: as folhas são baixadas em prioridade baixa e só valem se já chegaram quando a
     máquina começa a se mover. Se não chegaram (rede lenta, Save-Data, falha), a abertura é a de sempre.
   - Termina SEMPRE no giro 0, que é a imagem da página (mesma pose, mesma luz): o pouso é uma dissolvência
     de 0,2s entre dois quadros iguais, sem pulo.
   - Movimento reduzido: nada disto roda.
   Voltas, velocidade e desaceleração foram escolhidas num laboratório com 7 candidatas (DESIGN.md §10).
   -------------------------------------------------------------------------- */
const SPIN_FILES = { a: 'imagens/maquina-giro-a', b: 'imagens/maquina-giro-b' };
const SPIN_TURNS = 1;                      // voltas da abertura
const SPIN_EASE = [0.45, 0, 0.15, 1];      // sai devagar, acelera e desacelera por bastante tempo até pousar de frente

const cubicBezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t;
  const Y = t => ((ay * t + by) * t + cy) * t;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 28; i++) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }   // bisseção: sempre converge
    return Y(t);
  };
};

function createSpin({ pos, buzz, img }) {
  const conn = navigator.connection || {};
  const allowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !conn.saveData && !/^(slow-)?[23]g$/.test(conn.effectiveType || '');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const norm180 = a => { const m = ((a % 360) + 360) % 360; return m > 180 ? m - 360 : m; };
  const easing = cubicBezier(...SPIN_EASE);
  const entryRoll = p => 360 * SPIN_TURNS * (1 - easing(clamp(p, 0, 1)));

  const A = { name: 'a' }, B = { name: 'b' };   // cada folha: meta, sheet (imagem), canvas, ctx e a geometria dos quadros
  let started = false, ready = false, decided = false, engaged = false, shadow = null, hideTimer = 0;

  const fetchLayer = L => {
    const base = SPIN_FILES[L.name];
    const picture = ext => new Promise((resolve, reject) => {
      const im = new Image();
      im.decoding = 'async';
      if ('fetchPriority' in im) im.fetchPriority = 'low';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = `${base}.${ext}`;
    }).then(im => (im.decode ? im.decode().then(() => im, () => im) : im));   // decodificada antes de valer: o 1º quadro não trava
    return Promise.all([
      fetch(`${base}.json`).then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      picture('avif').catch(() => picture('webp'))
    ]).then(([meta, sheet]) => {
      const n = meta.angulos.length, step = n > 1 ? meta.angulos[1] - meta.angulos[0] : 360;
      Object.assign(L, { meta, sheet, n, step, first: meta.angulos[0], last: meta.angulos[n - 1], full: Math.abs(step * n - 360) < 1e-3, weights: new Float32Array(n) });
    });
  };
  /* Começa a baixar (idempotente). A folha leve primeiro; a nítida só depois, sem disputar banda com ela. */
  const warm = () => {
    if (started || !allowed) return;
    started = true;
    fetchLayer(A).then(() => { ready = true; return fetchLayer(B).catch(() => {}); }).catch(() => {});
  };

  const makeCanvas = L => {
    const c = document.createElement('canvas');
    c.className = L.name === 'b' ? 'clipper-giro clipper-giro-b' : 'clipper-giro';
    c.width = L.meta.larguraQuadro; c.height = L.meta.alturaQuadro;
    c.setAttribute('aria-hidden', 'true');
    buzz.insertBefore(c, img);
    L.canvas = c; L.ctx = c.getContext('2d');
    L.vis = false; L.op = L.name === 'b' ? 0 : 1;   // estado atual (o CSS começa escondido); só se escreve no estilo quando muda
  };
  const view = (L, visible, opacity) => {
    if (!L.canvas) return;
    if (L.vis !== visible) { L.canvas.style.visibility = visible ? 'visible' : 'hidden'; L.vis = visible; }
    if (opacity !== undefined && L.op !== opacity) { L.canvas.style.opacity = String(opacity); L.op = opacity; }
  };
  const makeShadow = () => {
    shadow = document.createElement('img');
    shadow.className = 'clipper-sombra';
    shadow.alt = ''; shadow.setAttribute('aria-hidden', 'true');
    shadow.decoding = 'async'; shadow.width = img.width; shadow.height = img.height;
    shadow.src = img.currentSrc || img.src;   // o mesmo arquivo da página: já está no cache
    buzz.insertBefore(shadow, A.canvas);
  };

  const blit = (L, i, alpha) => {
    const { larguraQuadro: w, alturaQuadro: h, colunas } = L.meta;
    L.ctx.globalAlpha = alpha;
    L.ctx.drawImage(L.sheet, (i % colunas) * w, Math.floor(i / colunas) * h, w, h, 0, 0, w, h);
  };
  const fractional = (L, angle) => (L.full
    ? (((angle - L.first) % 360) + 360) % 360 / L.step
    : clamp((angle - L.first) / L.step, 0, L.n - 1));
  /* Desenha o ângulo pedido como uma média ponderada dos quadros ao redor. Parado ou devagar, é a mistura
     dos dois quadros vizinhos (movimento contínuo, sem degraus). Rápido, vira borrão de movimento de graça:
     a média se espalha pelo arco que a máquina percorre durante uma exposição de obturador 180° a 60 qps.
     Cada quadro é desenhado uma vez, com alfa = peso ÷ soma dos pesos até ali (média acumulada). */
  const paint = (L, angle, speed) => {
    L.ctx.clearRect(0, 0, L.canvas.width, L.canvas.height);
    const arc = Math.abs(speed) / 120;
    const taps = clamp(Math.ceil(arc / (L.step / 2)), 1, 9);
    const w = L.weights;
    w.fill(0);
    for (let k = 0; k < taps; k++) {
      const f = fractional(L, angle + (taps > 1 ? (k / (taps - 1) - 0.5) * arc : 0)), i0 = Math.floor(f), t = f - i0;
      w[i0 % L.n] += (1 - t) / taps;
      if (t > 0.001) w[L.full ? (i0 + 1) % L.n : Math.min(i0 + 1, L.n - 1)] += t / taps;
    }
    let sum = 0;
    for (let i = 0; i < L.n; i++) if (w[i] > 0.002) { sum += w[i]; blit(L, i, w[i] / sum); }
    L.ctx.globalAlpha = 1;
  };
  /* A folha leve cobre a volta toda; a nítida entra por cima (dissolvência de 0,16s) quando a máquina chega perto
     da pose final. Depois que a nítida cobre a leve por inteiro, a leve é escondida e deixa de ser redesenhada
     (menos trabalho a cada quadro, e nenhuma borda velha aparece por baixo). */
  let bSince = 0;
  const draw = (angle, speed) => {
    if (B.sheet && !B.canvas) makeCanvas(B);
    const a = norm180(angle), inside = !!B.canvas && a >= B.first - 0.01 && a <= B.last + 0.01;
    if (inside) {
      if (!bSince) bSince = performance.now();
      view(B, true, 1);
      paint(B, a, speed);
      if (performance.now() - bSince > 240) { view(A, false); return; }
    } else {
      bSince = 0;
      view(B, true, 0);
    }
    view(A, true);
    paint(A, angle, speed);
  };

  /* Cria (uma vez) as camadas do giro: os quadros e a cópia que faz a sombra. Ficam escondidas até `engage`. */
  const build = () => {
    if (!A.canvas) makeCanvas(A);
    if (B.sheet && !B.canvas) makeCanvas(B);
    if (!shadow) makeShadow();
  };
  const engage = () => {
    if (engaged) return;
    clearTimeout(hideTimer);
    build();
    bSince = 0;
    engaged = true;
    pos.classList.add('has-spin', 'is-spinning');
  };
  const release = () => {
    if (!engaged) return;
    engaged = false;
    pos.classList.remove('is-spinning');   // a imagem volta (0,2s) por cima dos quadros, que saem depois
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      view(A, false); view(B, false, 0);
      pos.classList.remove('has-spin');
    }, 280);
  };

  /* Começo da abertura: se as folhas já chegaram, cria as camadas e faz o primeiro desenho agora, com a máquina ainda
     fora da tela, em vez de no meio do trajeto (onde um quadro mais pesado seria visto). */
  const prepare = () => { if (ready) { build(); paint(A, 0, 0); } };

  /* Abertura: chamado a cada quadro do trajeto de entrada (progress de 0 a 1). Decide uma vez, no primeiro
     quadro: a máquina nunca começa a girar no meio do caminho. */
  const entry = (progress, ms) => {
    if (!decided) { decided = true; if (!ready) return; engage(); }
    if (!engaged) return;
    const d = 0.01;
    draw(entryRoll(progress), (entryRoll(progress + d) - entryRoll(progress - d)) / (2 * d) / (ms / 1000));
  };
  const land = () => {
    if (!engaged) return;
    draw(0, 0);
    release();
  };

  /* Rolagem e mouse (motion.js): o ângulo vem de fora, depois da abertura, em partes que se somam (a viagem pela
     rolagem e a inclinação pelo ponteiro). Perto de 0 não há o que mostrar e a imagem da página fica; fora disso os
     quadros assumem (dissolvência de 0,2s) e voltam à imagem quando a máquina para perto de 0. A velocidade, para
     o borrão, sai da variação do ângulo entre uma chamada e a seguinte. */
  const parts = {};
  let lastAngle = 0, lastTime = 0, lastSpeed = 0, drawnAngle = 0, restTimer = 0;
  const set = (part, value) => {
    parts[part] = value;
    if (!ready) return false;
    const angle = Object.values(parts).reduce((sum, v) => sum + v, 0);
    const now = performance.now();
    const raw = lastTime ? (angle - lastAngle) / Math.max(8, now - lastTime) * 1000 : 0;
    const speed = lastSpeed * 0.4 + raw * 0.6;       // suaviza o ruído do intervalo entre quadros
    const near = Math.abs(norm180(angle)) < 0.35;
    lastAngle = angle; lastTime = now;
    if (!engaged) {
      if (near) { lastSpeed = 0; return true; }
      engage();
    } else if (Math.abs(angle - drawnAngle) < 0.25 && Math.abs(speed) < 40) {
      // quase igual ao que já está desenhado (a folha tem passos de 5° a 10°): redesenhar seria trabalho perdido
      if (near) { clearTimeout(restTimer); restTimer = setTimeout(release, 450); }
      return true;
    }
    lastSpeed = speed; drawnAngle = angle;
    draw(angle, speed);
    clearTimeout(restTimer);
    if (near) restTimer = setTimeout(release, 450);
    return true;
  };
  /* Volta já à imagem da página (sai da cena sem esperar) e esquece os ângulos. */
  const rest = () => { Object.keys(parts).forEach(k => { parts[k] = 0; }); clearTimeout(restTimer); lastAngle = 0; lastSpeed = 0; drawnAngle = 0; release(); };

  return { warm, prepare, entry, land, set, rest, isReady: () => ready, isEngaged: () => engaged };
}

function initHero(root) {
  const stage = $('.stage');
  const heroEl = $('.hero');
  const words = $$('[data-word]');
  words.forEach(word => {
    word.innerHTML = [...word.textContent].map(c => `<span class="ch"><i>${c}</i></span>`).join('');
    word.classList.add('is-split');
  });
  const [, wordFill, wordFront] = words;   // a 1ª cópia (contorno) não precisa de nome: anima junto com as outras por `words`
  const clipperPos = $('.clipper-pos');
  const mover = $('.clipper-mover');
  const buzz = $('.clipper-buzz');
  const clipperImg = $('.clipper');
  const glow = $('.clipper-glow');
  const cutline = $('.cutline');
  const script = $('.script');
  const heroDark = $('.hero-dark');
  const copyParts = $$('.hero-kicker, .hero-quote, .hero-cta, .hero-since');
  const spin = createSpin({ pos: clipperPos, buzz, img: clipperImg });

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
  /* Folhas do giro (ver o bloco do giro, acima), em prioridade baixa. No desktop começam já, para a máquina poder
     girar na abertura; no celular só depois da abertura e em ociosidade, para não disputar banda com a imagem do hero. */
  if (window.matchMedia('(max-width: 760px)').matches) {
    onIntroDone(() => (window.requestIdleCallback || (cb => setTimeout(cb, 800)))(() => spin.warm(), { timeout: 4000 }));
  } else {
    spin.warm();
  }

  /* A perspectiva do palco (styles.css, .has-depth .stage) inclina TUDO junto, então o recorte continua certo
     se for calculado no plano do palco. Medido com a inclinação ligada, o retângulo do navegador seria a
     caixa do quadrilátero projetado e o corte erraria até ~20px. Por isso a inclinação é desligada só
     durante a leitura (sem pintar nada entre as duas trocas) e só quando existe alguma. */
  const tilt = () => (heroEl.classList.contains('no-tilt') ? 0
    : Math.abs(parseFloat(heroEl.style.getPropertyValue('--mx')) || 0) + Math.abs(parseFloat(heroEl.style.getPropertyValue('--my')) || 0));
  const measureFlat = () => {
    const flat = tilt() > 0.0005;
    if (flat) stage.style.transform = 'none';
    const rects = [wordFront.getBoundingClientRect(), clipperImg.getBoundingClientRect()];
    if (flat) stage.style.transform = '';
    return rects;
  };
  /* Parte do título que fica NA FRENTE da cauda da máquina: semiplano perpendicular ao eixo
     da máquina, a partir do ponto em que o eixo cruza a altura --depth-y (fração da palavra).
     Devolve o polígono em coordenadas da palavra, ou null se algo ainda não tem tamanho. */
  const depthPolygon = deg => {
    const [wr, cr] = measureFlat();
    if (!wr.width || !cr.width) return null;
    /* Com a rolagem a palavra recua (--ws < 1, styles.css). O recorte é escrito em px do PRÓPRIO elemento,
       então as medidas da tela (já reduzidas) voltam ao tamanho dele; com --ws = 1 nada muda. */
    const s = parseFloat(heroEl.style.getPropertyValue('--ws')) || 1;
    const W = wr.width / s, H = wr.height / s;
    const r = deg * Math.PI / 180;
    const tail = { x: -Math.sin(r), y: Math.cos(r) };
    const head = { x: -tail.x, y: -tail.y };
    const c = { x: (cr.left + cr.width / 2 - wr.left) / s, y: (cr.top + cr.height / 2 - wr.top) / s };
    const fy = readPose().depthY;
    const ty = H * (Number.isFinite(fy) ? fy : 0.36);
    const p = { x: c.x + head.x * ((ty - c.y) / head.y), y: ty };
    const rect = [[0, 0], [W, 0], [W, H], [0, H]];
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

  /* Brilho especular: no pouso uma faixa de luz atravessa o metal da cabeça à base, junto da luz que percorre as
     letras. É uma camada criada na hora e removida ao terminar (a máscara usa a própria imagem da máquina). */
  const glint = () => {
    const shine = document.createElement('span');
    shine.className = 'clipper-brilho';
    shine.setAttribute('aria-hidden', 'true');
    const band = document.createElement('i');
    shine.appendChild(band);
    buzz.appendChild(shine);
    const sweep = band.animate(
      [{ transform: 'translateY(-130%) skewY(-10deg)' }, { transform: 'translateY(440%) skewY(-10deg)' }],
      { duration: 950, delay: 150, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
    sweep.finished.then(() => shine.remove(), () => shine.remove());
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
    spin.prepare();   // se as folhas do giro já chegaram, monta as camadas agora (a máquina ainda está fora da tela)

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
      spin.entry(progress, T.travel);                                                 // o giro segue o mesmo relógio da máquina
      if (!cutDone && progress > 0.7 && travel.currentTime > T.machine) finishCut();  // 4. o corte termina de atravessar
      if (travel.playState !== 'finished') raf = requestAnimationFrame(track);
    };
    wordFront.style.clipPath = 'inset(0 0 0 100%)';
    // o acompanhamento começa junto com a máquina (atraso feito por uma animação vazia, no mesmo relógio)
    mover.animate([{}, {}], { duration: 1, delay: T.machine }).finished.then(() => { raf = requestAnimationFrame(track); });

    // 5. ao pousar, a máquina "liga": vibração curta, brilho e a luz percorre o metal das letras
    travel.finished.then(() => {
      cancelAnimationFrame(raf);
      spin.land();   // o giro termina no quadro 0, igual à imagem da página, e a imagem volta por cima
      finishCut();
      buzz.animate([0, 1, -1, 1, -1, 0.5, 0].map(v => ({ transform: `translate(${v * 1.6}px, ${-v}px)` })), { duration: 320, easing: 'linear' });
      glow.animate([{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }], { duration: 700, easing: 'ease-out' });
      glint();
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
    el: heroEl, stage, clipperPos, clipperImg, wordFront, updateDepthMask, introPending, onIntroDone, spin,
    setExtraRotation: deg => { extraRotation = deg; }
  };
}

/* ==========================================================================
   4. ROLAGEM: CABEÇALHO E PARALAXE (só enquanto o hero está visível)
   ========================================================================== */
function initScroll(root, reduceMotion, hero) {
  const header = $('.header');
  let heroVisible = true, ticking = false, parallax = true;

  /* Cabeçalho: .is-solid depois de 40px de rolagem (fundo sólido) e .is-over-hero enquanto o hero
     estiver atrás dele (no tema claro, esse trecho mantém o cabeçalho escuro: styles.css §10).
     O IntersectionObserver diz se o hero está na tela; só então se mede onde ele termina. */
  const updateHeader = () => {
    const overHero = heroVisible && hero.el.getBoundingClientRect().bottom > header.offsetHeight;
    header.classList.toggle('is-solid', window.scrollY > 40);
    header.classList.toggle('is-over-hero', overHero);
  };
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; updateHeader(); }).observe(hero.el);

  const onScroll = () => {
    updateHeader();
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
  const barberButtons = $$('.barber-tab');
  const dayStrip = $('.day-strip');
  const periodLists = [$('#slots-morning'), $('#slots-afternoon')];   // uma coluna por turno
  const summaryBarber = $('#summary-barber');
  const summaryDay = $('#summary-day');
  const summaryPeriod = $('#summary-period');
  const whatsappLink = $('#agenda-whatsapp-link');
  if (!dayStrip || !whatsappLink) return;

  const weekdayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = n => String(n).padStart(2, '0');
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

  // period = índice do turno em OPENING_HOURS do dia (0 = manhã, 1 = tarde); -1 = nenhum escolhido
  const state = { barber: barberButtons[0]?.dataset.barber || 'Funny', day: null, period: -1 };

  /* Turnos do dia. Só aceita o formato documentado (um intervalo por nome em PERIOD_NAMES): um dia com
     outro formato não é oferecido, em vez de adivinhar qual intervalo é manhã ou tarde. */
  const turnsOf = date => {
    const hours = OPENING_HOURS[date.getDay()];
    if (!hours) return null;
    if (hours.length !== PERIOD_NAMES.length) {
      console.warn(`OPENING_HOURS[${date.getDay()}] precisa de ${PERIOD_NAMES.length} turnos (${PERIOD_NAMES.join(', ')}); o dia ficou de fora da agenda.`);
      return null;
    }
    return hours;
  };

  /* Próximos dias de funcionamento. Hoje só entra se o Studio ainda não fechou. */
  const upcomingDays = () => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let offset = 0; days.length < AGENDA_DAYS_SHOWN && offset < 21; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const turns = turnsOf(date);
      if (!turns) continue;
      if (offset === 0 && nowMinutes() >= toMinutes(turns[turns.length - 1][1])) continue;
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
      button.addEventListener('click', () => { state.day = date; pressOnly($$('.day-card', dayStrip), button); render(); });
      return button;
    }));
    state.day = new Date(dayStrip.firstElementChild.dataset.date);
  };

  const dayLabel = date => `${capitalize(weekdayName.format(date))}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  /* Turnos do dia escolhido, com o intervalo real; hoje, um turno que já terminou fica indisponível. */
  const periodsOf = date => {
    const isToday = sameDay(date, new Date());
    const now = nowMinutes();
    return (turnsOf(date) || []).map(([open, close], i) => ({
      name: PERIOD_NAMES[i], open, close, ended: isToday && now >= toMinutes(close)
    }));
  };

  /* Só refaz um turno quando o conteúdo dele muda (outro intervalo, ou o turno de hoje terminou):
     escolher um período só marca o botão (syncSelection), então o foco do teclado não se perde, e a
     atualização de minuto em minuto não mexe em nada se nada mudou. */
  const renderPeriod = (container, period, i) => {
    if (!container) return;
    const signature = period ? `${period.open}|${period.close}|${period.ended}` : 'none';
    if (container.dataset.signature === signature) return;
    container.dataset.signature = signature;
    if (!period || period.ended) {
      const empty = document.createElement('span');
      empty.className = 'slot-empty';
      empty.textContent = period ? `A ${period.name.toLowerCase()} de hoje já terminou.` : 'Sem atendimento neste período.';
      container.replaceChildren(empty);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot period-slot';
    button.dataset.period = String(i);
    button.textContent = `${period.open} às ${period.close}`;
    button.setAttribute('aria-label', `${period.name}, das ${period.open} às ${period.close}`);
    button.setAttribute('aria-pressed', String(state.period === i));
    button.addEventListener('click', () => { state.period = i; render(); });
    container.replaceChildren(button);
  };

  const syncSelection = () => periodLists.forEach(list => list && $$('.period-slot', list).forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.period) === state.period));
  }));
  const setText = (el, text) => { if (el.textContent !== text) el.textContent = text; };

  const render = () => {
    const periods = periodsOf(state.day);
    const chosenOk = periods[state.period] && !periods[state.period].ended;
    if (!chosenOk) state.period = -1;   // o turno escolhido não existe neste dia ou já terminou hoje
    periodLists.forEach((list, i) => renderPeriod(list, periods[i], i));
    syncSelection();

    const day = dayLabel(state.day);
    const chosen = periods[state.period];
    setText(summaryBarber, state.barber);
    setText(summaryDay, day);
    // espaços não separáveis no intervalo: se quebrar a linha, quebra depois do nome, nunca no meio do horário
    setText(summaryPeriod, chosen ? `${chosen.name}, ${chosen.open}\u00a0às\u00a0${chosen.close}` : 'Selecione um período');
    summaryPeriod.classList.toggle('is-empty', !chosen);   // só estilo: texto de ajuda fica discreto

    const when = chosen ? `no período da ${chosen.name.toLowerCase()} (${chosen.open} às ${chosen.close})` : 'em qualquer período';
    whatsappLink.href = whatsappUrl(`Olá! Gostaria de consultar a disponibilidade para ${day}, ${when}, com ${state.barber}.`);
  };

  barberButtons.forEach(button => button.addEventListener('click', () => {
    pressOnly(barberButtons, button);
    state.barber = button.dataset.barber;
    render();
  }));

  renderDays();
  render();

  // Com a página aberta por muito tempo: um turno de hoje que termina sai da escolha e, quando o
  // Studio fecha (ou vira o dia), a faixa de dias é refeita a partir do próximo dia aberto.
  setInterval(() => {
    const first = upcomingDays()[0];
    if (first && !sameDay(first, new Date(dayStrip.firstElementChild.dataset.date))) renderDays();
    render();
  }, 60 * 1000);
}
