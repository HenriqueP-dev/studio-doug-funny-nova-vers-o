# Studio Doug Funny — Design Language

> Site de uma barbearia e escola de barbeiros em Barretos-SP (desde 2014). Objetivo: **vender** e transmitir **alto nível**. Público: homens da região (cortes, barba, pacotes) e futuros barbeiros (curso de R$ 1.400 a R$ 2.600).

> Versão: "Redesign cinematográfico" (v3). Extraído de `index.html`, `styles.css` e `script.js`. Valores abaixo são os do código.

## 1. Visual Theme

**Theme statement:** cinematográfico, afiado, urbano — "uma máquina de corte que atravessa o título como se cortasse a tela".

**Character:** palco escuro com luz laranja de cinema, tipografia condensada monumental e a **máquina de corte como protagonista**. O contraste vem de três vozes tipográficas: condensada (força), serifada em itálico (elegância) e uma assinatura em pincel (marca). Uma única seção inteira em laranja (Formação) quebra o ritmo escuro.

**Referências do cliente:**
- Mockup próprio "Doug Funny" (preto + laranja, "BARBEARIA" gigante com máquina atravessando e "Doug Funny" em pincel).
- Banner de barbearia com a máquina atravessando o título.
- Design systems Lando Norris (tipografia de grande escala, revelação de texto), Blade & Co. (condensada + contorno, agendamento evidente) e NOIR (atmosfera, máscaras, sincronia com a rolagem). *As páginas desses sistemas não puderam ser abertas no ambiente de desenvolvimento; os princípios vieram da descrição do cliente.*

---

## 2. Color Palette

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0A0A0A` | Fundo principal |
| `--bg-2` | `#111012` | Seções alternadas (pacotes, agenda) |
| `--surface` | `#17161A` | Cards |
| `--line` | `#2A282C` | Divisórias |
| `--orange` | `#FF5500` | **Cor da identidade**: CTAs, preços, rótulos, seção Formação |
| `--orange-hi` | `#FF7433` | Hover |
| `--ink` | `#0A0A0A` | Texto sobre laranja |
| `--text` | `#F5F3F0` | Texto principal |
| `--muted` | `#A8A29E` | Texto de apoio |
| `--metal` | degradê `#FFF → #6F6B67` | Só nas letras gigantes do hero |

**Contraste (WCAG AA):** texto sobre fundo ~17:1 · cinza sobre fundo ~7,9:1 · laranja sobre fundo ~6,1:1 · tinta sobre laranja ~6,2:1.
**Regra:** botões laranja usam texto **escuro** (branco sobre `#FF5500` dá só 3,2:1).

---

## 3. Typography

| Voz | Família | Uso |
|-----|---------|-----|
| Display | **Anton** | Títulos em caixa alta, preços dos pacotes, nomes, palavra do hero |
| Contraste | **Instrument Serif** itálico | Segunda linha dos títulos, preços da tabela, legendas |
| Texto | **Instrument Sans** 400–700 | Corpo, botões, rótulos |
| Assinatura | **Mr Dafoe** | **Somente** "Doug Funny" no hero |

Padrão de título: linha 1 em Anton + linha 2 em serifada itálica laranja (`.title` + `em`). Variação: linha em contorno (`.outline`, cor do traço por `--stroke-c`).

| Papel | Tamanho |
|-------|---------|
| Palavra do hero | `clamp(4.4rem, 19vw, 21rem)` (celular: `19.6vw`) |
| Título de seção | `clamp(3rem, 8.2vw, 7.5rem)`, altura de linha 0,9 |
| Preço do pacote destaque | `clamp(5rem, 10vw, 8.5rem)` |
| Nome de serviço | `clamp(1.45rem, 2.4vw, 2.1rem)` |
| Corpo | 1rem / 1,6 |
| Rótulo (eyebrow) | 0,78rem, 700, espaçamento 0,28em, caixa alta |

Números sempre `lining-nums`.

---

## 4. Components

| Componente | Descrição |
|------------|-----------|
| **Hero stage** | 3 cópias da palavra (contorno, preenchida, frente) + máquina + linha de corte + assinatura. Ver §10. |
| `.btn` | Pílula, altura mínima 48px. Variantes: `solid` (laranja), `line`, `ink` (sobre laranja), `outline-orange` (cabeçalho) |
| `.eyebrow` | Rótulo laranja com traço |
| `.service` | Linha nome (Anton) ↔ preço (serifada itálica). Hover: traço laranja cresce e nome desliza 8px |
| `.pass` | Pacote destaque como **ingresso** laranja: picote com recortes laterais e carimbo girado |
| `.pack` | Pacotes secundários escuros, preço à direita |
| `.combo` | Lista compacta em 3 colunas |
| `.course-section` | Seção inteira laranja, retrato do instrutor em duotom (`multiply`) |
| `.g-tile` | Galeria em 12 colunas: poste (alto), detalhe (largo), lâmina, cartão laranja do Instagram ("Trabalhos reais"). Aviso `.gallery-note` antes das imagens e selo `.g-tag` "Ilustração 3D" em cada legenda: são renders, nunca fotos de cortes |
| `.member` | Retrato recortado + nome gigante em contorno atrás + brilho laranja |
| Agenda | Painel `.agenda-steps` com passos 01/02/03 (foto decorativa do profissional, dias em faixa rolável, manhã/tarde em grades) + resumo `.agenda-summary` em `<dl>`, fixo à direita no desktop e abaixo dos passos ≤ 1024px. Selecionado = laranja cheio por `aria-pressed`; o horário ganha também ✓ e halo. `#summary-time.is-empty` (script.js) deixa o texto de ajuda discreto. **Demonstração**: só monta uma consulta para o WhatsApp, nunca reserva |
| `.turmas` | Tabela turma ↔ investimento + nota pedindo consulta das condições pelo WhatsApp |
| Ícones | Sprite SVG de linha, traço 1,6 |

---

## 5. Layout

- Conteúdo até 1280px; margem lateral `--gutter: clamp(1.25rem, 5vw, 4.5rem)`.
- Respiro de seção: `clamp(5rem, 10vw, 8.5rem)`.
- Escala de espaço (base 4px): `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96 · `--s-10` 128.
- Cabeçalho de seção: título à esquerda, nota à direita (grid 1fr / 22rem).

---

## 6. Depth

- Profundidade principal: **sobreposição** (máquina entre as cópias da palavra; retrato na frente do nome em contorno).
- Luz: brilhos radiais laranja, feixe diagonal, granulação SVG (8–9%) e vinheta no hero.
- Sombra só na máquina (`drop-shadow`). Cards separados por tom e borda de 1px.
- Raios: 4px (base), 10–14px (cards, galeria), 999px (botões, pílulas).

---

## 7. Do's and Don'ts

### Do
- Manter a **máquina como protagonista do hero**; nas demais seções o movimento é complementar.
- Usar a assinatura em pincel **uma vez só**.
- Garantir que "BARBEARIA" fique legível: no celular a palavra fica **inteira na frente** da máquina (`--depth-y: -0.3`).
- Usar laranja para ação, preço e rótulos.
- Retratos da equipe em preto e branco (os originais têm fundo vermelho que briga com o laranja). O recorte precisa ser limpo, sem halo nem furos. Nunca disfarce um defeito de recorte com CSS: refaça com `ferramentas/recortar_equipe.py`.
- Conteúdo comercial sempre real (ver §9).
- Na agenda, falar em **consulta**, nunca em reserva ou confirmação, enquanto ela não estiver ligada a uma disponibilidade real.

### Don't
- Não usar fotos de banco como se fossem trabalhos do Studio. A galeria usa renders 3D e diz isso.
- Não usar texto branco sobre o laranja em tamanho pequeno.
- Não animar todas as seções; não adicionar animação em loop infinito.
- Não adicionar bibliotecas além das que já estão em `vendor/` (GSAP, ScrollTrigger, SplitText e Lenis, servidas localmente). Nada por CDN. A abertura do hero continua em Web Animations API.
- Não criar animação que só funcione com as bibliotecas: sem `vendor/`, o site precisa ficar igual ao que era antes delas.
- Não usar a foto comercial de máquina enviada como referência: licença desconhecida.

---

## 8. Responsive

| Largura | Mudança |
|---------|---------|
| ≤ 1240px | Menu vira botão (painel opaco, fecha com Esc). O botão vem antes do `<nav>` no HTML, então o Tab entra nos links abertos |
| ≤ 1024px | Pacotes e formação em 1 coluna; Instagram da galeria vira faixa larga; resumo da agenda abaixo dos passos |
| ≤ 760px | **Hero vertical**: palco no alto, texto em fluxo; máquina menor (54svh), atrás da palavra; serviços e combos em 1 coluna; galeria 2 colunas (poste alto à esquerda); equipe 1 coluna; agenda em 1 coluna, faixa de dias mostra parte do próximo cartão |
| ≤ 480px | Some o botão do cabeçalho (o hero tem o CTA); galeria em 1 coluna com alturas que mostram cada objeto inteiro |

Verificado sem rolagem horizontal em 320, 375, 390, 768, 1024, 1280, 1440 e 1920px. Alvos de toque ≥ 44px no celular.

---

## 9. Agent Prompt Guide

**Invariantes:**
1. **Agenda:** seletores usados pelo JS: `#agenda-notice`, `.barber-tab[data-barber]`, `.day-strip`, `.day-card` (`data-date`), `#slots-morning`, `#slots-afternoon`, `.slot`, `#summary-barber`, `#summary-day`, `#summary-time`, `#agenda-whatsapp-link`. Menu: `.menu-toggle`, `#primary-navigation`, `.nav-link` (o link ativo recebe `aria-current`).
   - Os dados de exemplo ficam em `script.js` → `DEMO_SCHEDULE` (profissional → dia da semana → horários). Os turnos vêm de `OPENING_HOURS`.
   - Horários que já passaram não aparecem no dia de hoje. Se o Studio já fechou, hoje sai da faixa de dias.
   - Para usar dados reais: substitua `DEMO_SCHEDULE` e ponha `AGENDA_IS_DEMO = false`. Com isso o aviso some e os textos deixam de dizer "exemplo".
2. **Hero:** `.stage`, `[data-word]` (3 cópias, nesta ordem), `.clipper-pos > .clipper-mover > .clipper-buzz > .clipper`, `.cutline`, `.script`. Pose final por variáveis CSS em `.stage`: `--cx`, `--cy`, `--ch`, `--rot`, `--depth-y`, `--word-top`.
3. **WhatsApp** `5517991052256` (em `script.js` → `WHATSAPP_NUMBER` e nos links do HTML); mensagens pré-preenchidas mantidas.
4. **Conteúdo real:** Funny (Barbeiro & Instrutor), Miguel, Thaylor; preços, combos, turmas; endereço Rua Doutor Riolando Prado, 62, Nogueira, Barretos-SP, CEP 14783-254; horários ter–sex 08:00–12:30 e 14:00–19:00, sáb 08:00–13:30 e 15:00–18:30, dom e seg fechado; e-mail e Instagram. O horário aparece em **três lugares**, que precisam ficar iguais: seção Contato, `OPENING_HOURS` (script.js) e o JSON-LD no `<head>`.
5. Site estático sem build. A ordem de carregamento, toda com `defer`, é:
   1. `index.html` + `styles.css`;
   2. `vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js`, `vendor/SplitText.min.js`, `vendor/lenis.min.js`;
   3. `script.js`;
   4. `motion.js`.

   Dependência externa, só o Google Fonts. Os únicos scripts inline são o de pré-pintura (`intro-pending`) e o JSON-LD.
   - **`script.js`** é a base: abertura, menu, paralaxe simples, revelação por máscara de linha e agenda. Funciona sozinho.
   - **`motion.js`** é opcional e substitui partes da base pela ponte `window.StudioDF`:
     - `hero.onIntroDone(cb)`: espera a abertura terminar;
     - `hero.setExtraRotation(deg)`: rotação extra, que entra na máscara de profundidade;
     - `hero.updateDepthMask()`;
     - `scroll.disableParallax()`;
     - `scroll.header`;
     - `reveals.release(el)`: o `script.js` para de observar aquele elemento.
   - Sem GSAP ou Lenis, ou com movimento reduzido, o `motion.js` não cria nada.
   - Versões e licenças das bibliotecas: `vendor/LICENSES.md`. A GSAP 3.15.0 tem licença Standard "no charge", gratuita também para uso comercial; a Lenis 1.3.27 é MIT.
6. O estado inicial da abertura só existe com JS (`html.intro-pending`); há um tempo de segurança de 4s que mostra tudo se algo falhar. **Nenhuma animação nova do hero começa antes de `intro-pending` sair** (`hero.onIntroDone`).
7. **Seletores usados pelo `motion.js`:**
   - títulos: `.title.reveal` (com `.line > span`) e `#servicos-title` (com `.section-head` e `.section-note`), que definem onde a máquina pousa;
   - Serviços: `#servicos .cut-divider`;
   - poste: `.g-pole` (com `img`);
   - equipe: `.member-stage` (com `img` e `.member-ghost`);
   - botões magnéticos: `.btn-solid`, `.btn-outline-orange`, `.btn-ink`, `.footer-social a`.
8. **Busca e compartilhamento:** Open Graph, ícones e JSON-LD `BarberShop` no `<head>`. Quando houver domínio, troque a `og:image` por um endereço absoluto e ative `canonical`/`og:url` (há um comentário no HTML).
9. **Pendências comerciais:** duração, datas, diferenças entre turmas e formas de pagamento do curso (comentário `CONFIRMAR COM O STUDIO` no HTML).

**Imagens (todas próprias):**
| Arquivo | Origem |
|---------|--------|
| `imagens/maquina-doug-funny(-sm).webp` | `ferramentas/render_maquina.py view=hero` |
| `imagens/maquina-detalhe.webp` | `render_maquina.py view=macro` |
| `imagens/maquina-lamina.webp` | recorte do render do hero |
| `imagens/poste-barbeiro.webp` | `ferramentas/render_poste.py` (quadro 0, 900×1300) |
| `imagens/poste-sprite.webp` | `ferramentas/render_poste.py sprite=../imagens/poste-sprite.webp` (24 quadros de 450×650 lado a lado, 10800×650) |
| `imagens/equipe-*.webp` | `ferramentas/recortar_equipe.py` sobre `funny.png`, `miguel.png`, `thaylor.png` |
| `favicon.ico`, `imagens/icone-*.png`, `imagens/compartilhamento.jpg` | `ferramentas/gerar_icones.py` |

Passo a passo para gerar de novo cada arquivo: **`ferramentas/README.md`**. Renders 3D: `pip install bpy` (Blender 5.x como módulo Python); converter PNG → WebP (qualidade ~84).

**Regenerar o sprite do poste:**
- O `bpy` 5.x só existe para **Python 3.11**. Se o Python do sistema for outro, crie um ambiente com `uv`:
  ```bash
  pip install uv
  python -m uv venv --python 3.11 .bpyenv
  python -m uv pip install --python .bpyenv/Scripts/python.exe bpy pillow
  cd ferramentas
  ../.bpyenv/Scripts/python.exe render_poste.py sprite=../imagens/poste-sprite.webp
  ```
- O render leva cerca de 5 min na CPU.
- Opções:
  - `frames=24`: número de quadros;
  - `res=450x650`: tamanho de cada quadro;
  - `samples=96`: amostras do render;
  - `frame=N out=x.png`: renderiza um quadro só.
- Se mudar `frames` ou `res`, atualize `POLE_FRAMES` em `motion.js` e `aspect-ratio` e `background-size` em `.pole-sprite` (`styles.css`).

---

## 10. Motion

**A abertura (≈2,4s):**
1. 0,08s — letras de "BARBEARIA" em **contorno** sobem da máscara (700ms, escalonadas 45ms).
2. 0,45s — a máquina entra pela direita, **deitada (-86°)**, atravessa a palavra e se endireita na diagonal (-32°): 1500ms, `cubic-bezier(.22,.8,.2,1)`.
3. Por onde a máquina passa, a palavra fica **sólida** (recorte acompanhado quadro a quadro) e uma linha laranja marca a borda do corte.
4. A 80% do trajeto, a linha de corte termina de atravessar a palavra (480ms).
5. Ao pousar: vibração curta (320ms) e brilho, como se a máquina fosse ligada.
6. 1,05s — texto e CTAs aparecem; 1,5s — "Doug Funny" é pintado (650ms).

**Profundidade:** a cópia da palavra "na frente" é recortada por um semiplano perpendicular ao eixo da máquina, calculado em JS (`updateDepthMask`) a partir da altura `--depth-y`. Acima dela a máquina fica na frente; abaixo, atrás.

**Base sem bibliotecas (`script.js`):** só enquanto o hero está visível (IntersectionObserver): a máquina desce 0,42× e gira levemente, e a palavra sobe 0,14×. Ao entrar em Serviços, uma linha laranja "corta" o topo da seção. Os títulos sobem de uma máscara por linha, uma vez. É o que roda quando `vendor/` não carrega.

**Camada de movimento (`motion.js`, GSAP + ScrollTrigger + SplitText + Lenis).** Tudo é criado com `gsap.matchMedia()`: ao trocar de largura ou de preferência de movimento, o que existia é desfeito.

| # | Animação | Como | Valores |
|---|----------|------|---------|
| 1 | **Rolagem suave** | Lenis no ticker da GSAP (`lenis.raf(t*1000)`, `lagSmoothing(0)`), `lenis.on('scroll', ScrollTrigger.update)` | Só a roda do mouse fica suave; toque e teclado são nativos. Links `#…` usam `lenis.scrollTo` e param logo abaixo do cabeçalho; o foco vai para a seção. "Pular para o conteúdo" é nativo. `html.lenis` desliga o `scroll-behavior` |
| 2 | **Máquina conduz até Serviços** (desktop > 760px) | ScrollTrigger `scrub: 0.6`, do topo do hero até o centro de `#servicos-title` a 40% da tela; altera `--px/--py/--pr/--ps` e `opacity` de `.clipper-pos` | 0–80% do trajeto: desce na diagonal, gira −16° e diminui (`power2.inOut`). 80–100%: some (`power1.in`). A linha `.cut-divider` é desenhada de 45% a 80%, chegando junto com a máquina. "BARBEARIA" fica para trás 0,22× (paralaxe). O pouso é calculado no espaço livre à direita do texto do título, acima da nota; a escala fica entre 0,16 e 0,35, ajustada para caber, e é recalculada a cada refresh, não a cada quadro |
| 2b | **Paralaxe leve** (celular ≤ 760px) | ScrollTrigger `scrub`, dentro do hero recortado | A máquina desce 0,28× a altura do hero e gira 8°; a palavra fica para trás 0,12× |
| 3 | **Títulos letra por letra** | SplitText `words,chars`, `mask: 'chars'`, `aria: 'hidden'` e `aria-label` no `<h2>`; divide depois de `document.fonts.ready` (até 2,5s); `autoSplit` | `yPercent 110 → 0`, 0,7s, stagger 0,02s, `expo.out`; a 2ª linha (itálico/contorno) entra 0,1s depois; uma vez (`once`, `top 82%`). A máscara tem folga (`.title-char-mask`) para não cortar Ç/Ã/Á nem o itálico. Substitui a máscara por linha (`.is-split`) |
| 4 | **Poste gira com a rolagem** | `.pole-sprite` por cima da foto, mesmo enquadramento (cover 50% 40%, unidades `cq`); sprite de 24 quadros | Três ciclos de listras enquanto o quadro atravessa a tela; `background-position` em passos inteiros, escrito só quando o quadro muda. O sprite é baixado 600px antes de aparecer e mostrado depois de decodificado |
| 5 | **Cortina na equipe** | `ScrollTrigger.batch(.member-stage)`, uma vez | `clip-path inset(100% 0 0 0) → inset(0)`, 0,9s, `power4.out`, stagger 0,12s. A foto vai de `--photo-shift` 8% a 0 e o nome em contorno de `--ghost-shift` −35% a 0, ambos pela propriedade CSS `translate`; o `transform` do hover não é tocado |
| 6 | **Botões magnéticos** (só `(hover: hover) and (pointer: fine)`) | `gsap.quickTo` num objeto, que escreve a propriedade CSS `translate` | Até 8px na direção do cursor, 0,35s, `power3.out`; volta a 0 ao sair. Vale para `.btn-solid`, `.btn-outline-orange`, `.btn-ink` e os ícones sociais do rodapé, não para a agenda. `:active` de todos os botões: `transform: scale(.97)`, 120ms `ease`. São propriedades separadas, então não brigam |

**Desempenho:**
- As animações usam só `transform`/`translate`, `opacity` e `clip-path`. A exceção é o quadro do poste (`background-position`, pedido assim, repinta só aquele quadro).
- O `will-change` da máquina só existe enquanto a viagem está ativa.
- A máscara de profundidade lê dois retângulos por quadro, e só enquanto o hero está na tela; os valores de pose (`--rot`, `--depth-y`) ficam em cache até o próximo resize.

**Movimento reduzido:** nada anima e tudo aparece no estado final. O `motion.js` não cria nada (nem Lenis, nem divisão de títulos, nem cortina, nem magnetismo), e o poste mostra a foto parada, que é o quadro 0 do sprite.

---

## 11. Voice & Tone

Português do Brasil, direto. Verbos: **Agendar horário**, **Agendar via WhatsApp**, **Consultar no WhatsApp**, **Quero este pacote**, **Garantir minha vaga**, **Ver serviços**. Preços como `R$ 40`, `R$ 2.600`, "a partir de R$ 120".
