# Studio Doug Funny — Design Language

> Site de uma barbearia e escola de barbeiros em Barretos-SP (desde 2014). Objetivo: **vender** e transmitir **alto nível**. Público: homens da região (cortes, barba, pacotes) e futuros barbeiros (curso de R$ 1.400 a R$ 2.600).

> Versão: "Redesign cinematográfico" (v3) com o **tema claro como padrão**. Extraído de `index.html`, `styles.css`, `script.js` e `motion.js`. Valores abaixo são os do código.

## 1. Visual Theme

**Theme statement:** cinematográfico, afiado, urbano — "uma máquina de corte que atravessa o título como se cortasse a tela".

**Character:** site **claro** (bege quente e branco-papel, texto marrom-escuro) que abre num **hero de palco escuro** com luz laranja de cinema, tipografia condensada monumental e a **máquina de corte como protagonista**. O contraste vem de três vozes tipográficas: condensada (força), serifada em itálico (elegância) e uma assinatura em pincel (marca). Duas seções quebram o ritmo claro: Formação, inteira em laranja, e Equipe, em marrom-escuro.

**Tema:** o claro é o único tema em uso, fixo no HTML (`<html data-theme="light">`); não há alternância. O hero continua escuro de propósito: é o palco da máquina e da abertura. As regras do tema claro ficam em `styles.css` §10.

**Referências do cliente:**
- Mockup próprio "Doug Funny" (preto + laranja, "BARBEARIA" gigante com máquina atravessando e "Doug Funny" em pincel).
- Banner de barbearia com a máquina atravessando o título.
- Design systems Lando Norris (tipografia de grande escala, revelação de texto), Blade & Co. (condensada + contorno, agendamento evidente) e NOIR (atmosfera, máscaras, sincronia com a rolagem). *As páginas desses sistemas não puderam ser abertas no ambiente de desenvolvimento; os princípios vieram da descrição do cliente.*

---

## 2. Color Palette

Os tokens ficam em `styles.css`: §1 (`:root`) guarda a paleta escura de base, que o hero usa; §10 (`[data-theme="light"]`) troca as superfícies e o texto para o tema claro, que é o tema em uso.

**Superfícies e texto (tema claro):**

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#F5F1EB` | Fundo principal (bege) |
| `--bg-2` | `#EAE4DC` | Seções alternadas |
| `--surface` | `#FFFCF8` | Cards, cabeçalho sólido, resumo da agenda |
| `--line` | `#D2C9BE` | Divisórias e bordas de 1px |
| `--text` | `#211B17` | Texto principal |
| `--muted` | `#62574E` | Texto de apoio |
| `--ink` | `#211811` | Texto sobre laranja e fundo do botão escuro (`.btn-ink`) |
| `--metal` | degradê `#FFF → #6F6B67` | Só nas letras gigantes do hero |

**Laranja: um token por papel.** O mesmo laranja não serve para preencher e para escrever: `#FF5500` sobre bege dá só 2,9:1.

| Token | Valor | Uso |
|-------|-------|-----|
| `--brand` | `#FF5500` | **Cor da identidade** em preenchimentos (botões, ingresso, seção Formação, cartão do Instagram, seleção da agenda), linhas da marca e a assinatura. Nunca como texto sobre fundo claro |
| `--brand-hi` | `#FF7433` | Hover dos preenchimentos; acento da seção Equipe |
| `--brand-text` | `#A93806` | Laranja de **texto** sobre os fundos claros |
| `--brand-text-hi` | `#8F3104` | Hover do laranja de texto |
| `--accent` / `--accent-hi` | por contexto | O laranja que texto, ícones e bordas finas usam (rótulos, preços, itálico dos títulos, link atual). Cada contexto define o seu (tabela abaixo) |
| `--focus` | por contexto | Anel de foco do teclado; sem definição, usa `--accent` |

| Contexto | Fundo | `--accent` |
|----------|-------|------------|
| Seções claras (padrão) | bege, branco-papel | `--brand-text` |
| Hero e cabeçalho sobre o hero (`.header:not(.is-solid)`, `.header.is-over-hero`) | escuro | `--brand` |
| Cabeçalho sólido depois do hero e painel do menu do celular | claro | `--brand-text` |
| Equipe (`.team-section`) | marrom-escuro `#25211E` | `--brand-hi` |
| Ingresso e Formação (`.pass`, `.course-section`) | `--brand` | `--ink` (também o anel de foco) |

Paleta escura de base (`:root`, usada pelo hero): `--bg #0A0A0A`, `--bg-2 #111012`, `--surface #17161A`, `--line #2A282C`, `--text #F5F3F0`, `--muted #A8A29E`; dentro do hero, `--muted` vira `#C7BEB4`.

**Contraste medido (WCAG AA):** texto 15,1:1 no bege · apoio 6,2:1 (5,6:1 no bege-2) · laranja de texto 5,7:1 (5,1:1 no bege-2) · tinta sobre laranja 5,4:1 · laranja sobre o botão escuro 5,4:1 · laranja no hero 6,2:1 · `#FF7433` na Equipe 5,9:1.
**Regras:** botões laranja usam texto **escuro** (branco sobre `#FF5500` dá só 3,2:1). Texto, ícone ou borda fina em laranja usa `--accent`; `--brand` direto só em preenchimentos ou onde o fundo é sempre escuro (assinatura, texto do botão escuro, numeração sobre as fotos da galeria).

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
| `.header` | Fixo; degradê escuro no topo e fundo sólido depois de 40px. No tema claro fica **escuro enquanto o hero estiver atrás dele** (`.is-over-hero`, `script.js` → `initScroll`, pelo IntersectionObserver do hero e pela base do hero) e claro depois |
| `.course-section` | Seção inteira laranja, retrato do instrutor em duotom (`multiply`), limitado a 1,25× a largura do arquivo (357px) até haver uma foto maior |
| `.g-tile` | Galeria em 12 colunas: poste (alto), detalhe (largo), lâmina, cartão laranja do Instagram ("Trabalhos reais"). Aviso `.gallery-note` antes das imagens e selo `.g-tag` "Ilustração 3D" em cada legenda: são renders, nunca fotos de cortes. O título ("Trabalhos & aulas no Instagram") diz onde estão os trabalhos reais; com fotos reais, troque as imagens no mesmo layout e ajuste o título |
| `.member` | Retrato recortado + nome gigante em contorno atrás + brilho laranja |
| Agenda | Painel `.agenda-steps` com passos 01/02/03 (foto decorativa do profissional, dias em faixa rolável, manhã e tarde como **períodos** do horário real) + resumo `.agenda-summary` em `<dl>`, fixo à direita no desktop e abaixo dos passos ≤ 1024px. Selecionado = laranja cheio por `aria-pressed`; o período ganha também ✓ e halo. `#summary-period.is-empty` (script.js) deixa o texto de ajuda discreto. **Consulta**: monta uma mensagem para o WhatsApp com profissional, dia e período; nunca reserva |
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
- Sombra só na máquina (`drop-shadow`). No palco escuro ela é longa e escura (`0 40px 60px rgba(0,0,0,.7)`) e dá profundidade sobre as letras e a luz laranja. Na viagem até Serviços (desktop), quando essa sombra alcançaria o bege visível, `motion.js` §2 põe `.is-off-stage` em `.clipper-pos` e o CSS (§10) a troca, em 0,5s, por uma sombra curta e clara (`0 16px 22px rgba(60,36,18,.22)`); de volta ao topo, a escura retorna. A conta usa só medidas feitas no refresh, sem ler o layout a cada quadro.
- Cards separados por tom e borda de 1px (`--line`).
- Raios: 4px (base), 10–14px (cards, galeria), 999px (botões, pílulas).

---

## 7. Do's and Don'ts

### Do
- Manter a **máquina como protagonista do hero**; nas demais seções o movimento é complementar.
- Usar a assinatura em pincel **uma vez só**.
- Garantir que "BARBEARIA" fique legível: no celular a palavra fica **inteira na frente** da máquina (`--depth-y: -0.3`).
- Usar laranja para ação, preço e rótulos, sempre pelo token do papel (§2): `--brand` para preencher, `--accent` para texto.
- Retratos da equipe em preto e branco (os originais têm fundo vermelho que briga com o laranja). O recorte precisa ser limpo, sem halo nem furos. Nunca disfarce um defeito de recorte com CSS: refaça com `ferramentas/recortar_equipe.py`.
- Conteúdo comercial sempre real (ver §9).
- Na agenda, falar em **consulta**, nunca em reserva ou confirmação, enquanto ela não estiver ligada a uma disponibilidade real.

### Don't
- Não usar fotos de banco como se fossem trabalhos do Studio. A galeria usa renders 3D e diz isso.
- Não usar texto branco sobre o laranja em tamanho pequeno.
- Não inventar um efeito novo por seção: toda entrada usa um dos papéis da §10 (rótulo, texto, linha de lista, imagem) ou um momento próprio já documentado. Nada de animação em loop infinito, nada que suma ao rolar de volta.
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

Verificado sem rolagem horizontal em 320, 375, 390, 768, 834, 1024, 1280, 1440 e 1920px. Alvos de toque ≥ 44px no celular.

---

## 9. Agent Prompt Guide

**Invariantes:**
1. **Agenda:** seletores usados pelo JS: `.barber-tab[data-barber]`, `.day-strip`, `.day-card` (`data-date`), `#slots-morning`, `#slots-afternoon`, `.slot.period-slot` (`data-period`), `#summary-barber`, `#summary-day`, `#summary-period`, `#agenda-whatsapp-link`. Menu: `.menu-toggle`, `#primary-navigation`, `.nav-link` (o link ativo recebe `aria-current`).
   - Dias e períodos vêm de `script.js` → `OPENING_HOURS`, o horário real de funcionamento: nenhum horário é inventado. Cada dia aberto tem um intervalo por nome de `PERIOD_NAMES` (`Manhã`, `Tarde`), nessa ordem; um dia com outro formato fica de fora da agenda, com aviso no console. A faixa mostra `AGENDA_DAYS_SHOWN` (5) dias abertos.
   - Hoje: um período que já terminou aparece como encerrado; se o Studio já fechou, hoje sai da faixa. A página se atualiza sozinha a cada minuto.
   - A mensagem diz profissional, dia e período (ou "em qualquer período"). O horário exato e a disponibilidade são confirmados pela equipe no WhatsApp.
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
8. **Busca e compartilhamento:** Open Graph, ícones e JSON-LD `BarberShop` no `<head>`, com endereços absolutos do domínio atual (`https://studio-doug-funny-nova-vers-o.vercel.app/`) em `canonical`, `og:url`, `og:image` e no JSON-LD (`url`, `image`, `logo`). Ao ligar um domínio próprio, troque-o nesses lugares (há um comentário no HTML).
9. **Pendências comerciais:** duração, datas de início, diferenças entre as turmas (a Turma 3 custa menos que as Turmas 1 e 2) e formas de pagamento do curso. Nada disso deve ser estimado: até o Studio informar, a nota da tabela encaminha essas dúvidas ao WhatsApp. Também falta uma foto do Funny em alta resolução (≥ 1200px de largura): o único original, `imagens/funny.png`, tem 512×512.

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

**Linguagem de movimento.** Um gesto central, o **corte**: algo atravessa da esquerda para a direita (ou é atravessado pela lâmina) e deixa o conteúdo para trás. Ele aparece na abertura, na linha que liga o hero a Serviços, nas linhas de lista, na varredura dos botões, no sublinhado do menu e na abertura do menu do celular.

| Papel | Tempo | Curva |
|-------|-------|-------|
| Expressivo (abertura, entradas de seção, imagens) | 0,7–1,3s (imagens até 1,8s no zoom) | `expo.out` / `cubic-bezier(.16,1,.3,1)` (`--ease-out`) |
| Reposição (máquina assentando, corte, assinatura) | 0,45–0,75s | `cubic-bezier(.65,0,.35,1)` (`--ease-io`) |
| Retorno de ação (pulso da agenda, varredura, sublinhado) | 0,32–0,5s | `--ease-out` |
| Toque (`:active`) | 120ms | `ease` |

Escalonamento de 0,04–0,12s entre itens do mesmo grupo. Tudo acontece **uma vez**; ao rolar de volta, nada desaparece.

**A abertura (≈2,9s no desktop, 2,7s no celular).** Toda em Web Animations API (`script.js`), sem `setTimeout` no cronograma: cada passo é uma animação com `delay`, então a sequência inteira obedece ao mesmo relógio (e pode ser testada em câmera lenta).
1. 0s: a **luz acende**. Uma cortina preta sólida (`.hero-dark`) perde a opacidade em 1,2s. Não se anima o `.hero-bg`: ele tem granulação em `mix-blend-mode` e feixe com `blur`, e animá-lo redesenha a tela inteira a cada quadro.
2. 0,12s: letras de "BARBEARIA" em **contorno** sobem da máscara (750ms, escalonadas 40ms).
3. 0,42s: a máquina entra **totalmente de fora da tela**, à direita e acima, deitada (−88°; −80° no celular) e **maior** (escala 1,22; 1,12 no celular), como se viesse da câmera. Ela arqueia, passa um pouco do ponto (−2,5°, escala 0,992) e assenta na diagonal (−32°). Duração 1550ms (1400ms no celular), curvas por trecho.
4. Por onde a **ponta da lâmina** passa (alto da imagem, calculado pelo ângulo real a cada quadro), a palavra fica **sólida**. O corte nunca volta. A cópia da frente aparece **só atrás da lâmina**, com a profundidade do ângulo atual (antes ela aparecia sólida adiantada, e no celular a palavra ficava sólida, depois contorno, depois sólida).
5. A 70% do trajeto, a linha laranja termina de atravessar a palavra (480ms).
6. Ao pousar (≈1,97s): vibração (320ms), brilho e um **reflexo de luz** que percorre o metal das letras, da esquerda para a direita (700ms por letra, escalonado 38ms; faixa de `background-position` em cada letra, fora dela em repouso).
7. 1,15s: rótulo, frase, botões e "2014" entram em sequência (800ms, +80ms cada). 1,6s: "Doug Funny" é pintado com **borda de pincel inclinada** (`clip-path: polygon`, 750ms).

Seguranças: o texto cru da palavra fica invisível até ser dividido em letras (`.word:not(.is-split)`). Se `script.js` não rodar em 5s, o `<head>` tira o `intro-pending` (o hero nunca fica vazio). Se a imagem da máquina travar, o estado final aparece em 4s.

**Profundidade:** a cópia da palavra "na frente" é recortada por um semiplano perpendicular ao eixo da máquina, calculado em JS (`updateDepthMask`) a partir da altura `--depth-y`. Acima dela a máquina fica na frente; abaixo, atrás.

**Base sem bibliotecas (`script.js`):** só enquanto o hero está visível (IntersectionObserver): a máquina desce 0,42× e gira levemente, e a palavra sobe 0,14×. Ao entrar em Serviços, uma linha laranja "corta" o topo da seção. Os títulos sobem de uma máscara por linha, uma vez. É o que roda quando `vendor/` não carrega.

**Camada de movimento (`motion.js`, GSAP + ScrollTrigger + SplitText + Lenis).** Tudo é criado com `gsap.matchMedia()`: ao trocar de largura ou de preferência de movimento, o que existia é desfeito.

| # | Animação | Como | Valores |
|---|----------|------|---------|
| 1 | **Rolagem suave** | Lenis no ticker da GSAP (`lenis.raf(t*1000)`, `lagSmoothing(0)`), `lenis.on('scroll', ScrollTrigger.update)` | Só a roda do mouse fica suave; toque e teclado são nativos. Links `#…` usam `lenis.scrollTo` e param logo abaixo do cabeçalho; o foco vai para a seção. "Pular para o conteúdo" é nativo. `html.lenis` desliga o `scroll-behavior` |
| 2 | **Máquina conduz até Serviços** (desktop > 760px) | ScrollTrigger `scrub: 0.6`, do topo do hero até o centro de `#servicos-title` a 40% da tela; altera `--px/--py/--pr/--ps` e `opacity` de `.clipper-pos` | 0–80% do trajeto: desce na diagonal, gira −16° e diminui (`power2.inOut`). 80–100%: some (`power1.in`). A linha `.cut-divider` é desenhada de 45% a 80%, chegando junto com a máquina. "BARBEARIA" fica para trás 0,22× (paralaxe). O pouso é calculado no espaço livre à direita do texto do título, acima da nota; a escala fica entre 0,16 e 0,35, ajustada para caber, e é recalculada a cada refresh, não a cada quadro. Fora do palco a sombra escura vira uma sombra curta e clara (`.is-off-stage`, ver §6) |
| 2b | **Paralaxe leve** (celular ≤ 760px) | ScrollTrigger `scrub`, dentro do hero recortado | A máquina desce 0,28× a altura do hero e gira 8°; a palavra fica para trás 0,12× |
| 3 | **Títulos letra por letra** | SplitText `words,chars`, `mask: 'chars'`, `aria: 'hidden'` e `aria-label` no `<h2>`; divide depois de `document.fonts.ready` (até 2,5s); `autoSplit` | `yPercent 110 → 0`, 0,7s, stagger 0,02s, `expo.out`; a 2ª linha (itálico/contorno) entra 0,1s depois; uma vez (`once`, `top 82%`). A máscara tem folga (`.title-char-mask`) para não cortar Ç/Ã/Á nem o itálico. Substitui a máscara por linha (`.is-split`) |
| 4 | **Poste gira com a rolagem** | `.pole-sprite` por cima da foto, mesmo enquadramento (cover 50% 40%, unidades `cq`); sprite de 24 quadros | Três ciclos de listras enquanto o quadro atravessa a tela; `background-position` em passos inteiros, escrito só quando o quadro muda. O sprite é baixado 600px antes de aparecer e mostrado depois de decodificado |
| 5 | **Cortina na equipe** | `ScrollTrigger.batch(.member-stage)`, uma vez | `clip-path inset(100% 0 0 0) → inset(0)`, 0,9s, `power4.out`, stagger 0,12s. A foto vai de `--photo-shift` 8% a 0 e o nome em contorno de `--ghost-shift` −35% a 0, ambos pela propriedade CSS `translate`; o `transform` do hover não é tocado |
| 6 | **Botões magnéticos** (só `(hover: hover) and (pointer: fine)`) | `gsap.quickTo` num objeto, que escreve a propriedade CSS `translate` | Até 8px na direção do cursor, 0,35s, `power3.out`; volta a 0 ao sair. Vale para `.btn-solid`, `.btn-outline-orange`, `.btn-ink` e os ícones sociais do rodapé, não para a agenda. `:active` de todos os botões: `transform: scale(.97)`, 120ms `ease`. São propriedades separadas, então não brigam |
| 7 | **Profundidade pelo ponteiro** (desktop com mouse, depois da abertura) | `quickTo` (1,2s, `power3.out`) escreve `--mx/--my` (−1 a 1) no `.hero`; cada camada converte em `translate` no CSS | Contorno −3/−2px, palavra sólida +5/+4px, assinatura +8/+6px, máquina +11/+8px. `.has-depth` promove essas camadas a camadas próprias (`will-change: translate`): andar com elas é só recompor. Máquina e palavra andam no máximo 6px uma em relação à outra, então a máscara não é refeita a cada quadro. Volta ao centro ao rolar além de 15% do hero e quando o ponteiro sai da janela. Medido: 60 fps com o mouse em movimento (antes da promoção, ~7 fps) |
| 8 | **Saída do hero** (desktop) | ScrollTrigger `scrub`, do topo ao fim do hero | Texto e botões sobem 90px a mais que a página e vão a 30% de opacidade, enquanto a palavra fica para trás e a máquina segue para Serviços |
| 9 | **Entradas das seções** | `ScrollTrigger.batch`, `once`, `top 88%`; `clearProps` no fim (hover e transições do CSS voltam intactos) | Ver a tabela de papéis abaixo |
| 10 | **Agenda** | `MutationObserver` + CSS | Ao trocar de profissional ou dia, os novos períodos entram (450ms, 25ms entre eles). O valor do resumo que mudou pisca em laranja (900ms). A pílula escolhida pulsa (`press-pop`, 340ms, CSS puro) |

**Papéis das entradas (motion.js §8):**

| Papel | Elementos | De → para | Tempo |
|-------|-----------|-----------|-------|
| Rótulo | `.section .eyebrow` | texto de −14px e linha laranja `--line` 0 → 1 | 1,1s |
| Texto | notas, títulos de coluna, textos da formação, CTA, contato, agenda, nome/função da equipe, rodapé | `y` 40px (24px no celular) + opacidade | 0,9s, 0,08s entre itens |
| Linha de lista | `.service`, `.combo`, `.hours-row` | `clip-path` corte da esquerda para a direita (folga vertical de 20% para não cortar acentos) | 1,1s, 0,05s entre linhas, +0,15s para o título da coluna chegar antes |
| Imagem | `.g-pole`, `.g-detail`, `.g-blade`, `.course-figure` | cortina `inset(100% 0 0 0)` → 0; a foto assenta de `--zoom` +0,2 (o poste não tem zoom: o sprite fica por cima) | 1,3s (zoom 1,8s) |
| Pílula | `.topics li`, `.perks li` | `y` 14px + opacidade | 0,7s, 0,04s entre itens |
| Momento: ingresso | `.pass` + `.stamp` | o ingresso sobe girando 1,2° → 0; o carimbo cai de 1,9× e −40° para −12° (`back.out(2.2)`, +0,55s) | 1,1s / 0,45s |
| Momento: rodapé | `.footer-mark` | `yPercent` 45 → 0 e opacidade 0,25 → 1 com a rolagem, até o fim da página | `scrub` |
| Profundidade (desktop) | fotos de `.g-detail` e `.g-blade` | `--drift` −5% → 5% enquanto atravessam a tela (descansam em zoom 1,12 para cobrir a moldura) | `scrub` |

**Teclado:** o Tab rola a página só até o elemento encostar na borda de baixo, antes do ponto de disparo. Se o foco entra num elemento que ainda espera a entrada, ele aparece na hora (0,35s). Verificado num ciclo completo de Tab: 43 elementos no desktop e 35 no celular (WCAG 2.4.7).

**Microinterações (CSS):**
- **Botões:** uma faixa (`--sweep` por variante) entra pela esquerda e sai pela direita, em 0,5s.
- **Menu:** o sublinhado entra pela esquerda e sai pela direita, no hover e no link da seção atual; como o link atual muda com a rolagem, ele parece viajar.
- **Menu do celular:** o painel abre como um corte (`clip-path`, 0,38s) e os links descem em sequência (30ms entre eles).

**Responsivo:**

| Largura | Movimento |
|---------|-----------|
| > 760px com mouse | Tudo, incluindo profundidade pelo ponteiro e magnetismo |
| > 760px com toque (tablet) | Abertura completa, viagem da máquina, entradas; sem ponteiro nem magnetismo |
| ≤ 760px | Abertura mais curta e menor, paralaxe leve no hero, entradas com distâncias menores (24px), sem deriva nas fotos |

**Desempenho:**
- Medido no Chromium sem placa de vídeo (pior caso): abertura no desktop com ~156 quadros em 4s (a versão anterior tinha 137); celular a 60 fps; rolagem com mediana de 16,7ms nos três aparelhos.
- As animações usam só `transform`/`translate`, `opacity` e `clip-path`. A exceção é o quadro do poste (`background-position`, pedido assim, repinta só aquele quadro).
- O `will-change` da máquina só existe enquanto a viagem está ativa.
- A máscara de profundidade lê dois retângulos por quadro, e só enquanto o hero está na tela; os valores de pose (`--rot`, `--depth-y`) ficam em cache até o próximo resize.

**Movimento reduzido:** nada anima e tudo aparece no estado final. O `motion.js` não cria nada (nem Lenis, nem divisão de títulos, nem cortina, nem magnetismo, nem entradas de seção, nem profundidade), e o poste mostra a foto parada, que é o quadro 0 do sprite. As transições e animações do CSS (varredura, sublinhado, menu, pulso da agenda) ficam instantâneas, com atrasos zerados.

---

## 11. Voice & Tone

Português do Brasil, direto. Verbos: **Agendar horário**, **Agendar via WhatsApp**, **Consultar no WhatsApp**, **Quero este pacote**, **Garantir minha vaga**, **Ver serviços**. Preços como `R$ 40`, `R$ 2.600`, "a partir de R$ 120".
