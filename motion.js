/* ==========================================================================
   Studio Doug Funny — camada de movimento (GSAP + ScrollTrigger + SplitText + Lenis)

   Este arquivo é OPCIONAL. Ele roda depois de script.js e só melhora o que já existe:
   - sem GSAP/Lenis (arquivo de vendor/ ausente ou bloqueado), ele não faz nada e o site
     funciona só com script.js;
   - com movimento reduzido, nada daqui é criado (tudo aparece no estado final);
   - cada parte verifica a própria dependência, então a falta de uma não derruba as outras.

   1. Rolagem suave (Lenis)
   2. A máquina conduz do hero até Serviços (desktop) / paralaxe leve (celular)
   3. Títulos revelados letra por letra (SplitText)
   4. Poste de barbeiro girando com a rolagem (sprite de 24 quadros)
   5. Retratos da equipe com efeito de cortina
   6. Botões magnéticos (só com mouse)
   7. Profundidade pelo ponteiro no hero (só com mouse, desktop)
   8. Entradas das seções (papéis por tipo de conteúdo)
   9. Agenda: retorno visual ao trocar de profissional, dia e horário
   ========================================================================== */
(() => {
  'use strict';

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const MOTION = '(prefers-reduced-motion: no-preference)';
  const DESKTOP = `${MOTION} and (min-width: 761px)`;
  const MOBILE = `${MOTION} and (max-width: 760px)`;
  const clamp = (min, max, v) => Math.min(max, Math.max(min, v));

  document.addEventListener('DOMContentLoaded', () => {
    const app = window.StudioDF;
    if (!app) return;

    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);
    const mm = gsap.matchMedia();

    mm.add(MOTION, () => smoothScroll(app));
    mm.add(DESKTOP, ctx => clipperTravel(app, ctx));
    mm.add(MOBILE, ctx => clipperParallax(app, ctx));
    mm.add(MOTION, ctx => splitTitles(app, ctx));
    mm.add(MOTION, () => spinPole());
    mm.add(MOTION, () => curtainTeam());
    mm.add(`${MOTION} and (hover: hover) and (pointer: fine)`, () => magneticButtons());
    mm.add(`${DESKTOP} and (hover: hover) and (pointer: fine)`, ctx => pointerDepth(app, ctx));
    mm.add(DESKTOP, () => sectionEntrances(false));
    mm.add(MOBILE, () => sectionEntrances(true));
    mm.add(MOTION, () => agendaFeedback());

    // posições dependem das fontes (títulos mudam de largura quando a Anton carrega)
    fontsReady.then(() => ScrollTrigger.refresh());
  });

  // fontes carregadas (com limite de tempo, para nunca travar o site se o Google Fonts falhar)
  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(resolve => setTimeout(resolve, 2500))
  ]);

  /* Espera a abertura do hero terminar (classe intro-pending sair) antes de criar algo no hero.
     ctx.add() registra o que for criado no contexto do matchMedia, para ser desfeito junto. */
  function afterIntro(app, ctx, build) {
    let alive = true;
    app.hero.onIntroDone(() => { if (alive) ctx.add(build); });
    return () => { alive = false; };
  }

  /* ==========================================================================
     1. ROLAGEM SUAVE (Lenis)
     Só a roda do mouse/trackpad fica suave. No toque, a Lenis mantém a rolagem nativa
     (padrão syncTouch: false). Teclado e barra de rolagem continuam nativos.
     ========================================================================== */
  function smoothScroll(app) {
    const { Lenis } = window;
    if (!Lenis) return undefined;

    const lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = time => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // A seção para logo abaixo do cabeçalho fixo. A Lenis já desconta o scroll-padding-top do <html>
    // (mantido no CSS para o foco por Tab), então o deslocamento compensa essa parte.
    const headerOffset = () => {
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      return padding - app.scroll.header.offsetHeight;
    };

    // Links âncora (menu, rodapé, hero, marca): rolagem suave até a seção, descontando o cabeçalho.
    // "Pular para o conteúdo" fica de fora de propósito: o salto nativo é o que move o foco.
    const onClick = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.classList.contains('skip-link')) return;
      const hash = link.getAttribute('href');
      const target = hash.length > 1 && document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, {
        offset: headerOffset(),
        onComplete: () => {
          // como num salto nativo: o próximo Tab continua a partir da seção escolhida
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
      if (location.hash !== hash) history.pushState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }

  /* ==========================================================================
     2. A MÁQUINA CONDUZ DO HERO ATÉ SERVIÇOS

     Técnica: a máquina continua sendo o MESMO elemento dentro do palco do hero. Durante a
     viagem o hero fica com overflow visível (.is-traveling) e o recorte da luz de cinema passa
     para o .hero-bg. Assim não há clone nem troca de elemento no meio do caminho, e a máscara
     de profundidade (updateDepthMask) e a ordem das camadas (palavra-fundo → máquina →
     palavra-frente) continuam funcionando sem nenhuma passagem de bastão.
     O movimento é aplicado pelas variáveis --px/--py/--pr/--ps de .clipper-pos (as mesmas
     da paralaxe antiga) e por opacity, ou seja, só transform e opacity.
     ========================================================================== */
  const EXTRA_ROTATION = -16;   // "gira um pouco" ao descer (graus, somados à pose)
  const MAX_SCALE = 0.35;       // tamanho máximo ao pousar
  const MIN_SCALE = 0.16;

  /* Onde a máquina pousa: no espaço livre à direita do texto do título "Serviços & procedimentos",
     acima da nota lateral (desktop) ou ao lado do título (quando a nota vai para baixo dele).
     Tudo em coordenadas do documento. Lido só ao criar e a cada refresh do ScrollTrigger. */
  function measureLanding(app, els) {
    const { hero } = app;
    const sy = window.scrollY;
    const cs = getComputedStyle(hero.stage);
    const heroBox = hero.el.getBoundingClientRect();
    const baseX = heroBox.left + heroBox.width * (parseFloat(cs.getPropertyValue('--cx')) / 100);
    const baseY = heroBox.top + sy + heroBox.height * (parseFloat(cs.getPropertyValue('--cy')) / 100);

    const h = hero.clipperPos.offsetHeight;
    const w = hero.clipperImg.offsetWidth || h * 513 / 1635;
    const r = ((parseFloat(cs.getPropertyValue('--rot')) || -32) + EXTRA_ROTATION) * Math.PI / 180;
    const boxW = w * Math.abs(Math.cos(r)) + h * Math.abs(Math.sin(r));
    const boxH = w * Math.abs(Math.sin(r)) + h * Math.abs(Math.cos(r));

    // largura real do texto (as linhas são blocos de largura total)
    let textRight = 0;
    els.title.querySelectorAll('.line > span').forEach(span => {
      const range = document.createRange();
      range.selectNodeContents(span);
      textRight = Math.max(textRight, range.getBoundingClientRect().right);
    });
    const head = els.head.getBoundingClientRect();
    const titleBox = els.title.getBoundingClientRect();
    const wrap = els.head.parentElement.getBoundingClientRect();
    // a nota pode estar no meio (ou antes) da própria entrada (seção 8): mede a posição de repouso
    const noteBox = els.note && els.note.getBoundingClientRect();
    const note = noteBox && {
      left: noteBox.left - (parseFloat(gsap.getProperty(els.note, 'x')) || 0),
      top: noteBox.top - (parseFloat(gsap.getProperty(els.note, 'y')) || 0)
    };
    const gap = 32;

    const left = textRight + gap;
    const right = wrap.right;
    const top = head.top;
    const noteBeside = note && note.left > textRight;
    const bottom = noteBeside ? note.top - gap / 2 : titleBox.bottom;

    const scale = clamp(MIN_SCALE, MAX_SCALE, Math.min((right - left) / boxW, (bottom - top) / boxH) * 0.92);
    return {
      dx: (left + right) / 2 - baseX,
      dy: (top + bottom) / 2 + sy - baseY,
      scale,
      rot: EXTRA_ROTATION
    };
  }

  function clipperTravel(app, ctx) {
    const { hero } = app;
    const title = document.getElementById('servicos-title');
    const head = title && title.closest('.section-head');
    if (!head) return undefined;
    const els = { title, head, note: head.querySelector('.section-note') };
    const divider = document.querySelector('#servicos .cut-divider');

    app.scroll.disableParallax();
    if (divider) {
      app.reveals.release(divider);
      divider.classList.add('is-driven');
      gsap.set(divider, { scaleX: 0 });
    }

    const stopWaiting = afterIntro(app, ctx, () => {
      hero.el.classList.add('is-traveling');
      const heroBottom = () => hero.el.offsetTop + hero.el.offsetHeight;
      let landing = measureLanding(app, els);
      let maskLimit = heroBottom();
      const state = { travel: 0, fade: 0 };

      const apply = () => {
        const t = state.travel;
        const pos = hero.clipperPos.style;
        pos.setProperty('--px', `${(landing.dx * t).toFixed(1)}px`);
        pos.setProperty('--py', `${(landing.dy * t).toFixed(1)}px`);
        pos.setProperty('--pr', `${(landing.rot * t).toFixed(2)}deg`);
        pos.setProperty('--ps', (1 + (landing.scale - 1) * t).toFixed(4));
        pos.opacity = String(1 - state.fade);
        hero.setExtraRotation(landing.rot * t);
        // a máscara só importa enquanto a palavra está na tela
        if (window.scrollY < maskLimit) hero.updateDepthMask();
      };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onUpdate: apply,
        scrollTrigger: {
          trigger: hero.el,
          start: 'top top',
          endTrigger: title,
          end: 'center 40%',
          scrub: 0.6,
          onRefresh: () => { landing = measureLanding(app, els); maskLimit = heroBottom(); apply(); },
          onToggle: self => { hero.clipperPos.style.willChange = self.isActive ? 'transform, opacity' : ''; }
        }
      });
      tl.to(state, { travel: 1, duration: 0.8 }, 0)             // desce na diagonal, gira e diminui
        .to(state, { fade: 1, duration: 0.2, ease: 'power1.in' }, 0.8);  // pousa e some
      if (divider) tl.to(divider, { scaleX: 1, duration: 0.35 }, 0.45);  // a linha termina quando ela chega

      // "BARBEARIA" sobe mais devagar que a página (paralaxe)
      gsap.fromTo(hero.el, { '--wy': '0px' }, {
        '--wy': () => `${hero.el.offsetHeight * 0.22}px`,
        ease: 'none',
        scrollTrigger: { trigger: hero.el, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      // saída em camadas: o texto e os botões sobem mais rápido que a página e perdem força,
      // enquanto a palavra fica para trás e a máquina segue para Serviços
      gsap.to(['.hero-copy', '.hero-since'], {
        y: -90, opacity: 0.3, ease: 'none',
        scrollTrigger: { trigger: hero.el, start: 'top top', end: 'bottom top', scrub: true }
      });
      apply();
    });

    return () => {
      stopWaiting();
      gsap.set(['.hero-copy', '.hero-since'], { clearProps: 'transform,opacity' });
      hero.el.classList.remove('is-traveling');
      ['--px', '--py', '--pr', '--ps', 'will-change'].forEach(p => hero.clipperPos.style.removeProperty(p));
      hero.clipperPos.style.opacity = '1';
      hero.el.style.removeProperty('--wy');
      hero.setExtraRotation(0);
      if (divider) { divider.classList.remove('is-driven'); divider.classList.add('is-in'); }
      hero.updateDepthMask();
    };
  }

  /* ==========================================================================
     3. TÍTULOS REVELADOS LETRA POR LETRA (SplitText)
     Substitui a revelação por máscara de linha do script.js (não soma as duas).
     Acessibilidade: o <h2> recebe aria-label com o texto completo e as letras ficam aria-hidden
     (aria: 'hidden' do SplitText), então o leitor de tela lê o título inteiro, uma vez.
     Só se divide depois das fontes; autoSplit refaz a divisão se a fonte trocar, e as quebras
     de linha continuam nativas (as palavras quebram normalmente no resize).
     ========================================================================== */
  function splitTitles(app, ctx) {
    const { SplitText } = window;
    if (!SplitText) return undefined;
    const titles = gsap.utils.toArray('.title.reveal');
    let alive = true;

    titles.forEach(title => {
      app.reveals.release(title);   // continua escondido pela máscara de linha até ser dividido
      if (!title.hasAttribute('aria-label')) title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    });

    fontsReady.then(() => {
      if (!alive) return;
      ctx.add(() => {
        titles.forEach(title => {
          SplitText.create(title.querySelectorAll('.line > span'), {
            type: 'words,chars',
            mask: 'chars',
            charsClass: 'title-char',
            aria: 'hidden',
            autoSplit: true,
            onSplit(self) {
              const tl = gsap.timeline({ scrollTrigger: { trigger: title, start: 'top 82%', once: true } });
              // linha 1 primeiro; a linha em itálico/contorno entra 0,1s depois
              title.querySelectorAll('.line').forEach((line, i) => {
                const chars = self.chars.filter(c => line.contains(c));
                if (chars.length) tl.from(chars, { yPercent: 110, duration: 0.7, stagger: 0.02, ease: 'expo.out' }, i * 0.1);
              });
              // letras já posicionadas embaixo da máscara: agora a máscara de linha pode sair
              title.classList.add('is-split', 'is-in');
              return tl;
            }
          });
        });
        ScrollTrigger.refresh();   // a divisão muda um pouco a largura do texto (pouso da máquina)
      });
    });

    return () => {
      alive = false;
      titles.forEach(title => title.classList.remove('is-split'));
    };
  }

  /* ==========================================================================
     4. POSTE DE BARBEIRO GIRANDO COM A ROLAGEM
     A foto é estática, então girá-la em CSS ficaria falso: usamos 24 quadros renderizados
     (meia volta = um ciclo das listras) e avançamos o quadro conforme a rolagem, em passos
     inteiros. O sprite só é baixado quando a galeria se aproxima; até ficar pronto (e com
     movimento reduzido, quando nada disto roda) a foto original, que é o quadro 0, aparece.
     ========================================================================== */
  const POLE_SPRITE = 'imagens/poste-sprite.webp';
  const POLE_FRAMES = 24;
  const POLE_CYCLES = 3;   // ciclos completos das listras enquanto o poste atravessa a tela

  function spinPole() {
    const tile = document.querySelector('.g-pole');
    if (!tile) return undefined;
    const sprite = document.createElement('span');
    sprite.className = 'pole-sprite';
    sprite.setAttribute('aria-hidden', 'true');
    tile.querySelector('img').after(sprite);

    let frame = -1;
    const show = progress => {
      const next = Math.floor(progress * POLE_CYCLES * POLE_FRAMES) % POLE_FRAMES;
      if (next === frame) return;   // só escreve quando o quadro muda
      frame = next;
      sprite.style.backgroundPosition = `${(frame * 100 / (POLE_FRAMES - 1)).toFixed(4)}% 0`;
    };

    // baixa e decodifica o sprite antes de mostrá-lo (sem pisca e sem baixar à toa)
    const load = ScrollTrigger.create({
      trigger: tile,
      start: 'top bottom+=600',
      once: true,
      onEnter: () => {
        const img = new Image();
        img.src = POLE_SPRITE;
        (img.decode ? img.decode() : Promise.resolve()).then(() => {
          sprite.style.backgroundImage = `url("${POLE_SPRITE}")`;
          show(spin.progress);
          sprite.classList.add('is-ready');
        }).catch(() => sprite.remove());   // sem o sprite, a foto estática continua
      }
    });
    const spin = ScrollTrigger.create({
      trigger: tile,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: self => show(self.progress)
    });

    return () => { load.kill(); spin.kill(); sprite.remove(); };
  }

  /* ==========================================================================
     5. RETRATOS DA EQUIPE COM EFEITO DE CORTINA
     Cada .member-stage se revela de baixo para cima (clip-path); a foto sobe de leve e o nome em
     contorno desliza no sentido oposto. Foto e nome usam a propriedade CSS `translate` (via
     variáveis), então o transform do hover e o filtro P&B continuam intactos.
     batch: no desktop os três entram juntos (stagger 0,12s); no celular, um de cada vez.
     ========================================================================== */
  function curtainTeam() {
    const stages = gsap.utils.toArray('.member-stage');
    if (!stages.length) return undefined;
    const parts = stage => [stage.querySelector('img'), stage.querySelector('.member-ghost')];

    gsap.set(stages, { clipPath: 'inset(100% 0% 0% 0%)' });
    stages.forEach(stage => {
      const [photo, ghost] = parts(stage);
      if (photo) gsap.set(photo, { '--photo-shift': '8%' });
      if (ghost) gsap.set(ghost, { '--ghost-shift': '-35%' });
    });

    const batch = ScrollTrigger.batch(stages, {
      start: 'top 85%',
      once: true,
      onEnter: entered => {
        const photos = entered.map(s => parts(s)[0]).filter(Boolean);
        const ghosts = entered.map(s => parts(s)[1]).filter(Boolean);
        const common = { duration: 0.9, ease: 'power4.out', stagger: 0.12 };
        gsap.set(photos, { willChange: 'translate' });
        gsap.to(entered, { ...common, clipPath: 'inset(0% 0% 0% 0%)', clearProps: 'clipPath' });
        gsap.to(photos, { ...common, '--photo-shift': '0%', onComplete: () => gsap.set(photos, { willChange: 'auto' }) });
        gsap.to(ghosts, { ...common, '--ghost-shift': '0%' });
      }
    });

    return () => batch.forEach(t => t.kill());
  }

  /* ==========================================================================
     6. BOTÕES MAGNÉTICOS
     Só com mouse (hover + ponteiro fino). Ficam de fora os botões da agenda (dia, horário,
     profissional), usados muitas vezes seguidas. Até 8px na direção do cursor, via quickTo.
     O deslocamento vai na propriedade CSS `translate`; o :active (scale) e o hover
     (translateY) continuam no `transform`, sem conflito.
     ========================================================================== */
  const MAGNET_MAX = 8;

  function magneticButtons() {
    const buttons = gsap.utils.toArray('.btn-solid, .btn-outline-orange, .btn-ink, .footer-social a');
    let hovered = null;   // só o botão sob o cursor guarda medida
    const offs = buttons.map(button => {
      const offset = { x: 0, y: 0 };
      const render = () => { button.style.translate = `${offset.x.toFixed(2)}px ${offset.y.toFixed(2)}px`; };
      const xTo = gsap.quickTo(offset, 'x', { duration: 0.35, ease: 'power3.out', onUpdate: render });
      const yTo = gsap.quickTo(offset, 'y', { duration: 0.35, ease: 'power3.out', onUpdate: render });

      // centro do botão sem o próprio deslocamento magnético; lido ao entrar, não a cada movimento
      let box = null;
      const measure = () => {
        const r = button.getBoundingClientRect();
        return { cx: r.left + r.width / 2 - offset.x, cy: r.top + r.height / 2 - offset.y, hw: r.width / 2, hh: r.height / 2 };
      };
      const self = { forget: () => { box = null; } };

      const enter = () => { box = measure(); hovered = self; };
      const move = event => {
        if (!box) box = measure();   // depois de uma rolagem com o cursor parado em cima
        let dx = (event.clientX - box.cx) / box.hw;
        let dy = (event.clientY - box.cy) / box.hh;
        const length = Math.hypot(dx, dy);
        if (length > 1) { dx /= length; dy /= length; }
        xTo(dx * MAGNET_MAX);
        yTo(dy * MAGNET_MAX);
      };
      const leave = () => { box = null; if (hovered === self) hovered = null; xTo(0); yTo(0); };

      button.addEventListener('pointerenter', enter);
      button.addEventListener('pointermove', move);
      button.addEventListener('pointerleave', leave);
      return () => {
        button.removeEventListener('pointerenter', enter);
        button.removeEventListener('pointermove', move);
        button.removeEventListener('pointerleave', leave);
        gsap.killTweensOf(offset);
        button.style.removeProperty('translate');
      };
    });
    // se a página rolar com o cursor parado em cima, a medida antiga não vale mais
    const forget = () => { if (hovered) hovered.forget(); };
    window.addEventListener('scroll', forget, { passive: true });

    return () => { window.removeEventListener('scroll', forget); offs.forEach(off => off()); };
  }

  /* ==========================================================================
     7. PROFUNDIDADE PELO PONTEIRO NO HERO (só mouse, desktop)
     Depois da abertura, as camadas do palco respondem ao ponteiro em velocidades diferentes:
     contorno da palavra para trás, palavra sólida, assinatura e máquina para a frente. Só escreve
     duas variáveis (--mx/--my, de -1 a 1) no .hero; cada camada as converte em `translate` no CSS,
     e .has-depth as promove a camadas próprias (só recompor, sem redesenhar). Máquina e palavra
     andam no máximo 6px uma em relação à outra, então a máscara de profundidade não precisa ser
     refeita a cada quadro (seria redesenhar a palavra gigante). Ao rolar para fora, tudo volta ao centro.
     ========================================================================== */
  function pointerDepth(app, ctx) {
    const { hero } = app;
    const state = { x: 0, y: 0 };
    let xTo = null, yTo = null, active = false;
    const center = () => { if (xTo) { xTo(0); yTo(0); } };
    const move = event => {
      if (!active || !xTo) return;
      if (window.scrollY > hero.el.offsetHeight * 0.15) { center(); return; }
      xTo(clamp(-1, 1, (event.clientX / window.innerWidth) * 2 - 1));
      yTo(clamp(-1, 1, (event.clientY / window.innerHeight) * 2 - 1));
    };
    const stopWaiting = afterIntro(app, ctx, () => {
      hero.el.classList.add('has-depth');
      const apply = () => {
        hero.el.style.setProperty('--mx', state.x.toFixed(3));
        hero.el.style.setProperty('--my', state.y.toFixed(3));
      };
      xTo = gsap.quickTo(state, 'x', { duration: 1.2, ease: 'power3.out', onUpdate: apply });
      yTo = gsap.quickTo(state, 'y', { duration: 1.2, ease: 'power3.out', onUpdate: apply });
      ScrollTrigger.create({
        trigger: hero.el, start: 'top top', end: '15% top',
        onToggle: self => { active = self.isActive; if (!active) center(); }
      });
      active = window.scrollY <= hero.el.offsetHeight * 0.15;
    });
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', center);

    return () => {
      stopWaiting();
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', center);
      gsap.killTweensOf(state);
      hero.el.classList.remove('has-depth');
      hero.el.style.removeProperty('--mx');
      hero.el.style.removeProperty('--my');
      hero.updateDepthMask();
    };
  }

  /* ==========================================================================
     8. ENTRADAS DAS SEÇÕES
     Uma linguagem só, com papéis por tipo de conteúdo (DESIGN.md §10):
     - rótulo: a linha laranja se desenha e o texto chega da esquerda
     - texto: sobe e aparece (expo.out)
     - linhas de lista (serviços, combos, horário): "corte" horizontal da esquerda para a direita,
       o mesmo gesto da máquina no hero
     - imagens: cortina de baixo para cima com um zoom que assenta (como a cortina da equipe)
     - momentos próprios: o ingresso do pacote destaque recebe o carimbo; o "Doug Funny" do rodapé
       sobe junto com o fim da página
     Tudo acontece uma vez (once) e termina limpando os estilos em linha (clearProps), então o
     hover e as transições do CSS voltam intactos. Sem GSAP ou com movimento reduzido, nada disto
     existe e o conteúdo fica sempre visível.
     ========================================================================== */
  const CLEAR = 'opacity,transform,transition';

  /* Elementos ainda escondidos, com o estado final de cada um. Serve ao teclado: o Tab rola a página só
     até o elemento encostar na borda de baixo, antes do ponto em que a entrada dispara, e o foco cairia
     num botão invisível (WCAG 2.4.7). Se o foco entra num elemento pendente, ele aparece na hora. */
  const pending = new Map();
  const hold = (el, to, clear) => pending.set(el, { to, clear });
  const revealFocused = event => {
    for (let el = event.target; el && el !== document.body; el = el.parentElement) {
      const entry = pending.get(el);
      if (!entry) continue;
      pending.delete(el);
      gsap.to(el, { ...entry.to, duration: 0.35, ease: 'power2.out', overwrite: 'auto', clearProps: entry.clear });
    }
  };

  /* Esconde os alvos e os revela em grupos quando entram na tela (ScrollTrigger.batch). */
  function enter(targets, from, to, opts = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return [];
    gsap.set(els, from);
    els.forEach(el => hold(el, to, opts.clear || CLEAR));
    return ScrollTrigger.batch(els, {
      start: opts.start || 'top 88%',
      once: true,
      interval: 0.1,
      onEnter: batch => {
        batch.forEach(el => pending.delete(el));
        gsap.to(batch, {
          ...to,
          duration: opts.duration || 0.9,
          ease: opts.ease || 'expo.out',
          stagger: opts.stagger === undefined ? 0.08 : opts.stagger,
          delay: opts.delay || 0,
          overwrite: 'auto',
          clearProps: opts.clear || CLEAR
        });
      }
    });
  }

  function sectionEntrances(mobile) {
    const d = mobile ? 24 : 40;
    const rise = { opacity: 0, y: d, transition: 'none' };
    const risen = { opacity: 1, y: 0 };
    const triggers = [];
    const add = list => triggers.push(...list);

    // rótulos (eyebrow): texto da esquerda, linha laranja desenhada (variável --line no CSS)
    add(enter('.section .eyebrow', { opacity: 0, x: -14, '--line': 0 }, { opacity: 1, x: 0, '--line': 1 },
      { duration: 1.1, clear: 'opacity,transform,--line' }));

    // texto corrido e blocos de apoio
    add(enter('.section-note, .gallery-note, .combos-head h3, .cta-band > p, .cta-band > .btn, .contact-col > h3', rise, risen));

    // linhas de lista: corte horizontal (a folga vertical não corta acentos nem o itálico)
    add(enter('.service, .combo, .hours-row',
      { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)' },
      { duration: 1.1, stagger: 0.05, delay: 0.15, clear: 'clipPath' }));   // o título da coluna chega antes

    // pacotes: o ingresso chega e recebe o carimbo; os cartões laterais vêm logo depois
    const pass = document.querySelector('.pass');
    if (pass) {
      const stamp = pass.querySelector('.stamp');
      gsap.set(pass, { opacity: 0, y: d * 1.6, rotation: mobile ? 0 : 1.2, transformOrigin: '0% 100%' });
      if (stamp) gsap.set(stamp, { opacity: 0, scale: 1.9, rotation: -40 });
      hold(pass, { opacity: 1, y: 0, rotation: 0 }, 'opacity,transform,transformOrigin');
      if (stamp) hold(stamp, { opacity: 1, scale: 1, rotation: -12 }, 'opacity,transform');
      triggers.push(ScrollTrigger.create({
        trigger: pass, start: 'top 85%', once: true,
        onEnter: () => {
          pending.delete(pass); pending.delete(stamp);
          gsap.to(pass, { opacity: 1, y: 0, rotation: 0, duration: 1.1, ease: 'expo.out', clearProps: 'opacity,transform,transformOrigin' });
          if (stamp) gsap.to(stamp, { opacity: 1, scale: 1, rotation: -12, duration: 0.45, delay: 0.55, ease: 'back.out(2.2)', clearProps: 'opacity,transform' });
        }
      }));
    }
    add(enter('.packs-side .pack', rise, risen, { delay: mobile ? 0 : 0.2, stagger: 0.12, duration: 1 }));

    // formação: texto em sequência, pílulas e linhas da tabela
    add(enter('.course-stat, .course-name, .course-text, .turmas-note, .course .btn-ink', rise, risen));
    add(enter('.topics li, .perks li', { opacity: 0, y: 14 }, { opacity: 1, y: 0 },
      { stagger: 0.04, duration: 0.7, ease: 'power3.out' }));
    add(enter('.turmas caption, .turmas tr', { opacity: 0, y: 16 }, risen, { stagger: 0.07 }));

    // imagens: cortina de baixo para cima; a foto assenta de um zoom (variável --zoom no CSS)
    const media = gsap.utils.toArray('.g-pole, .g-detail, .g-blade, .course-figure');
    const zoomed = el => !el.classList.contains('g-pole');   // o poste tem o sprite por cima, sem zoom
    const restZoom = el => (!mobile && (el.classList.contains('g-detail') || el.classList.contains('g-blade')) ? 1.12 : 1);
    if (media.length) {
      gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
      media.filter(zoomed).forEach(el => gsap.set(el, { '--zoom': restZoom(el) + 0.2 }));
      media.forEach(el => hold(el, { clipPath: 'inset(0% 0% 0% 0%)', '--zoom': restZoom(el) }, 'clipPath'));
      triggers.push(...ScrollTrigger.batch(media, {
        start: 'top 85%', once: true, interval: 0.1,
        onEnter: batch => {
          batch.forEach(el => pending.delete(el));
          gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', stagger: 0.12, clearProps: 'clipPath' });
          batch.filter(zoomed).forEach((el, i) => gsap.to(el, { '--zoom': restZoom(el), duration: 1.8, delay: i * 0.12, ease: 'expo.out' }));
        }
      }));
    }
    add(enter('.course-figure figcaption, .g-insta', rise, risen, { delay: 0.25 }));

    // desktop: dentro das molduras, as fotos andam mais devagar que a página (profundidade)
    if (!mobile) {
      gsap.utils.toArray('.g-detail, .g-blade').forEach(tile => {
        gsap.fromTo(tile, { '--drift': '-5%' }, {
          '--drift': '5%', ease: 'none',
          scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    // equipe: nome e função depois da cortina do retrato
    add(enter('.member-info', rise, risen, { delay: 0.35, stagger: 0.12, start: 'top 95%' }));

    // agenda: aviso, passos, horários e resumo, em ordem de leitura
    add(enter('.agenda-notice, .agenda-block, .agenda-summary', rise, risen, { stagger: 0.1 }));

    // contato e rodapé
    add(enter('.info-item', rise, risen, { stagger: 0.06 }));
    add(enter('.footer-top > *, .footer-copy', { opacity: 0, y: 20, transition: 'none' }, risen, { stagger: 0.08, start: 'top 98%' }));
    const mark = document.querySelector('.footer-mark');
    if (mark) {
      gsap.fromTo(mark, { yPercent: 45, opacity: 0.25 }, {
        yPercent: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
    }

    document.addEventListener('focusin', revealFocused);
    return () => {
      document.removeEventListener('focusin', revealFocused);
      pending.clear();
      triggers.forEach(t => t.kill());
    };
  }

  /* ==========================================================================
     9. AGENDA: RETORNO VISUAL
     Ao trocar de profissional ou de dia, os novos horários entram em sequência curta (continuidade:
     dá para ver que a lista mudou). Ao escolher um horário, o resumo pisca em laranja no valor que
     mudou. A seleção em si (pulso da pílula) é CSS, então também funciona sem GSAP.
     script.js só refaz a lista quando o conteúdo muda, então nada pisca na atualização de minuto.
     ========================================================================== */
  function agendaFeedback() {
    const lists = ['#slots-morning', '#slots-afternoon'].map(s => document.querySelector(s)).filter(Boolean);
    const summary = ['#summary-barber', '#summary-day', '#summary-time'].map(s => document.querySelector(s)).filter(Boolean);
    const slotsObserver = new MutationObserver(records => {
      const added = records.flatMap(r => [...r.addedNodes]).filter(n => n.nodeType === 1);
      if (added.length) gsap.fromTo(added, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.025, clearProps: 'opacity,transform' });
    });
    lists.forEach(list => slotsObserver.observe(list, { childList: true }));
    const summaryObserver = new MutationObserver(records => {
      const changed = [...new Set(records.map(r => (r.target.nodeType === 1 ? r.target : r.target.parentElement)))];
      // volta para a cor do próprio tema (claro ou escuro), lida antes de piscar
      changed.forEach(el => {
        gsap.killTweensOf(el, 'color');
        el.style.removeProperty('color');
        const base = getComputedStyle(el).color;
        const accent = getComputedStyle(el).getPropertyValue('--orange').trim() || '#FF5500';   // laranja de texto do tema
        gsap.fromTo(el, { color: accent }, { color: base, duration: 0.9, ease: 'power2.out', clearProps: 'color' });
      });
    });
    summary.forEach(el => summaryObserver.observe(el, { childList: true, characterData: true, subtree: true }));
    return () => { slotsObserver.disconnect(); summaryObserver.disconnect(); };
  }

  /* Celular: só uma paralaxe leve dentro do hero (sem viagem até Serviços) */
  function clipperParallax(app, ctx) {
    const { hero } = app;
    app.scroll.disableParallax();

    const stopWaiting = afterIntro(app, ctx, () => {
      const state = { t: 0 };
      let h = hero.el.offsetHeight;   // relido só no refresh, não a cada quadro
      gsap.to(state, {
        t: 1,
        ease: 'none',
        onUpdate: () => {
          const pos = hero.clipperPos.style;
          pos.setProperty('--py', `${(h * 0.28 * state.t).toFixed(1)}px`);
          pos.setProperty('--pr', `${(8 * state.t).toFixed(2)}deg`);
          hero.el.style.setProperty('--wy', `${(h * 0.12 * state.t).toFixed(1)}px`);
          hero.setExtraRotation(8 * state.t);
          hero.updateDepthMask();
        },
        scrollTrigger: { trigger: hero.el, start: 'top top', end: 'bottom top', scrub: true, onRefresh: () => { h = hero.el.offsetHeight; } }
      });
    });

    return () => {
      stopWaiting();
      ['--py', '--pr'].forEach(p => hero.clipperPos.style.removeProperty(p));
      hero.el.style.removeProperty('--wy');
      hero.setExtraRotation(0);
      hero.updateDepthMask();
    };
  }
})();
