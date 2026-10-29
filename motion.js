/* ==========================================================================
   Studio Doug Funny — camada de movimento (GSAP + ScrollTrigger + SplitText + Lenis)

   Este arquivo é OPCIONAL. Ele roda depois de script.js e só melhora o que já existe:
   - sem GSAP/Lenis (arquivo de vendor/ ausente ou bloqueado), ele não faz nada e o site
     funciona só com script.js;
   - com movimento reduzido, nada daqui é criado (tudo aparece no estado final);
   - cada parte verifica a própria dependência, então a falta de uma não derruba as outras.

   1. Rolagem suave (Lenis)
   ========================================================================== */
(() => {
  'use strict';

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const MOTION = '(prefers-reduced-motion: no-preference)';

  document.addEventListener('DOMContentLoaded', () => {
    const app = window.StudioDF;
    if (!app) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(MOTION, () => smoothScroll(app));
  });

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
})();
