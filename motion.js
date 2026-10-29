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
    const note = els.note && els.note.getBoundingClientRect();
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
      apply();
    });

    return () => {
      stopWaiting();
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
        gsap.to(entered, { ...common, clipPath: 'inset(0% 0% 0% 0%)' });
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
