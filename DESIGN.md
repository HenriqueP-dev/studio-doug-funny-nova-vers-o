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
| `.g-tile` | **Palco dos trabalhos** (`.gallery` > `.gallery-stage`): três cartões em camadas sobre um painel escuro com a luz laranja do hero (poste alto à esquerda, detalhe largo ao fundo, lâmina à frente cruzando os dois) e o cartão laranja do Instagram ("Trabalhos reais") como adesivo que passa por cima da borda do painel. Aviso `.gallery-note` antes do palco e selo `.g-tag` "Ilustração 3D" em cada legenda: são renders, nunca fotos de cortes. O título ("Trabalhos & aulas no Instagram") diz onde estão os trabalhos reais; com fotos reais, troque as imagens no mesmo palco (cada cartão tem a proporção da imagem) e ajuste o título |
| **Folha** (`.section-sheet`) | Pacotes, Trabalhos, Equipe, Agenda e Contato são **folhas** que passam por cima do fim da seção anterior: cantos superiores arredondados (18–32px; 14–22px no Contato), sombra de um tom por fronteira (suave sobre o bege, marrom sobre o laranja, fio de luz laranja na Equipe, brilho quente na Agenda) e uma sobreposição do tamanho do raio, compensada no `padding-top`: **a altura da página e a posição de todo conteúdo ficam as mesmas** (§6.0 do CSS). Trabalhos e Contato ganham `background: var(--bg)` para os cantos aparecerem |
| **Lâmina** | Cunha laranja de borda diagonal (`#pacotes::after`, `clip-path`), a inclinação da lâmina da máquina, que sai do fim de Pacotes e se funde ao laranja da Formação (entra 2px por baixo dela, sem costura). Sobe com a rolagem (`--blade`) |
| **Véu** (`.veil`) | Camada decorativa (`aria-hidden`, sem eventos) que `motion.js` cria no fim das seções que recuam: Serviços, Formação, Trabalhos e Equipe. A cor muda com a seção (`--veil`) |
| **Linha de leitura** | Fio laranja de 2px sob o cabeçalho (`.header::after`), desenhado de 0 a 100% enquanto se lê a página (`--read`) |
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
- Raios: 4px (base), 10–14px (cards, galeria), 18–32px (folhas de seção, palco dos trabalhos), 999px (botões, pílulas).
- **Camadas entre seções:** cada seção é uma folha sobre a anterior (§4 e §10). Sombra de folha = profundidade entre seções; a sombra da máquina e a sombra de folha nunca se misturam. Cada `main > .section` tem `isolation: isolate`, para que os `z-index` de dentro (Formação, palco) não furem a folha que sobe.

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
- Não inventar um efeito novo por seção: toda entrada usa um dos papéis da §10 (rótulo, texto, linha de lista, imagem, mergulho) ou um momento próprio já documentado. Nada de animação em loop infinito, nada que suma ao rolar de volta.
- Não usar `position: sticky` nem `pin` para cobrir uma seção com outra: `html` e `body` têm `overflow-x: hidden`. A cobertura é a folha (CSS) mais o recuo da seção anterior (`motion.js` §11), com a rolagem sempre 1:1.
- Não esconder um bloco com `opacity: 0` para fazê-lo "chegar": o mergulho só usa `translate`, `scale` e `rotate` (o bloco está sempre visível, também para o teclado e para o leitor de tela).
- Não adicionar bibliotecas além das que já estão em `vendor/` (GSAP, ScrollTrigger, SplitText e Lenis, servidas localmente). Nada por CDN. A abertura do hero continua em Web Animations API.
- Não criar animação que só funcione com as bibliotecas: sem `vendor/`, o site precisa ficar igual ao que era antes delas.
- Não usar a foto comercial de máquina enviada como referência: licença desconhecida.

---

## 8. Responsive

| Largura | Mudança |
|---------|---------|
| ≤ 1240px | Menu vira botão (painel opaco, fecha com Esc). O botão vem antes do `<nav>` no HTML, então o Tab entra nos links abertos |
| ≤ 1024px | Pacotes e formação em 1 coluna; o palco dos trabalhos encolhe e o Instagram vira uma faixa larga embaixo dele; resumo da agenda abaixo dos passos |
| ≤ 760px | **Hero vertical**: palco no alto, texto em fluxo; máquina menor (54svh), atrás da palavra; serviços e combos em 1 coluna; trabalhos em pilha vertical de cartões sobrepostos; equipe 1 coluna; agenda em 1 coluna, faixa de dias mostra parte do próximo cartão |
| ≤ 480px | Some o botão do cabeçalho (o hero tem o CTA); o Instagram dos trabalhos empilha o ícone e o texto |

Verificado sem rolagem horizontal em 320, 375, 390, 768, 834, 1024, 1280, 1440 e 1920px. Alvos de toque ≥ 44px no celular.

---

## 9. Agent Prompt Guide

**Invariantes:**
1. **Agenda:** seletores usados pelo JS: `.barber-tab[data-barber]`, `.day-strip`, `.day-card` (`data-date`), `#slots-morning`, `#slots-afternoon`, `.slot.period-slot` (`data-period`), `#summary-barber`, `#summary-day`, `#summary-period`, `#agenda-whatsapp-link`. Menu: `.menu-toggle`, `#primary-navigation`, `.nav-link` (o link ativo recebe `aria-current`).
   - Dias e períodos vêm de `script.js` → `OPENING_HOURS`, o horário real de funcionamento: nenhum horário é inventado. Cada dia aberto tem um intervalo por nome de `PERIOD_NAMES` (`Manhã`, `Tarde`), nessa ordem; um dia com outro formato fica de fora da agenda, com aviso no console. A faixa mostra `AGENDA_DAYS_SHOWN` (5) dias abertos.
   - Hoje: um período que já terminou aparece como encerrado; se o Studio já fechou, hoje sai da faixa. A página se atualiza sozinha a cada minuto.
   - A mensagem diz profissional, dia e período (ou "em qualquer período"). O horário exato e a disponibilidade são confirmados pela equipe no WhatsApp.
2. **Hero:** `.stage`, `[data-word]` (3 cópias, nesta ordem), `.clipper-pos > .clipper-mover > .clipper-buzz > .clipper`, `.cutline`, `.script`. Pose final por variáveis CSS em `.stage`: `--cx`, `--cy`, `--ch`, `--rot`, `--depth-y`, `--word-top`. O `script.js` acrescenta dentro de `.clipper-buzz`, em tempo de execução, `.clipper-giro` (canvas), `.clipper-sombra` e `.clipper-brilho`; `.clipper-pos` ganha `.has-spin`/`.is-spinning` enquanto os quadros assumem. As imagens `imagens/maquina-giro-a|b.{avif,webp,json}` são geradas por `ferramentas/` e precisam ser refeitas se a máquina, a luz ou a câmera mudarem.
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
     - `hero.spin`: `set(parte, graus)` (giro da máquina pela rolagem ou pelo ponteiro, em partes que se somam) e `rest()`;
     - `scroll.disableParallax()`;
     - `scroll.header`;
     - `reveals.release(el)`: o `script.js` para de observar aquele elemento.
   - Sem GSAP ou Lenis, ou com movimento reduzido, o `motion.js` não cria nada.
   - Versões e licenças das bibliotecas: `vendor/LICENSES.md`. A GSAP 3.15.0 tem licença Standard "no charge", gratuita também para uso comercial; a Lenis 1.3.27 é MIT.
6. O estado inicial da abertura só existe com JS (`html.intro-pending`); há um tempo de segurança de 4s que mostra tudo se algo falhar. **Nenhuma animação nova do hero começa antes de `intro-pending` sair** (`hero.onIntroDone`).
7. **Seletores usados pelo `motion.js`:**
   - títulos: `.title.reveal` (com `.line > span`) e `#servicos-title` (com `.section-head` e `.section-note`), que definem onde a máquina pousa;
   - Serviços: `#servicos .cut-divider`;
   - poste: `.g-pole` (com `img`); palco dos trabalhos: `.gallery`, `.gallery-stage`, `.g-pole`, `.g-detail`, `.g-blade`, `.g-insta`;
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

Escalonamento de 0,04–0,12s entre itens do mesmo grupo. As entradas acontecem **uma vez**; a camada entre seções (linha 12 abaixo) é ligada à rolagem e reversível. Ao rolar de volta, nada desaparece.

**A abertura (≈2,9s no desktop, 2,7s no celular).** Toda em Web Animations API (`script.js`), sem `setTimeout` no cronograma: cada passo é uma animação com `delay`, então a sequência inteira obedece ao mesmo relógio (e pode ser testada em câmera lenta).
1. 0s: a **luz acende**. Uma cortina preta sólida (`.hero-dark`) perde a opacidade em 1,2s. Não se anima o `.hero-bg`: ele tem granulação em `mix-blend-mode` e feixe com `blur`, e animá-lo redesenha a tela inteira a cada quadro.
2. 0,12s: letras de "BARBEARIA" em **contorno** sobem da máscara (750ms, escalonadas 40ms).
3. 0,42s: a máquina entra **totalmente de fora da tela**, à direita e acima, deitada (−88°; −80° no celular) e **maior** (escala 1,22; 1,12 no celular), como se viesse da câmera. Ela arqueia, passa um pouco do ponto (−2,5°, escala 0,992) e assenta na diagonal (−32°). Duração 1550ms (1400ms no celular), curvas por trecho. **No desktop ela também gira uma volta em torno do próprio eixo** (ver "Giro da máquina em 3D", abaixo) e termina de frente, na pose e na imagem de sempre.
4. Por onde a **ponta da lâmina** passa (alto da imagem, calculado pelo ângulo real a cada quadro), a palavra fica **sólida**. O corte nunca volta. A cópia da frente aparece **só atrás da lâmina**, com a profundidade do ângulo atual (antes ela aparecia sólida adiantada, e no celular a palavra ficava sólida, depois contorno, depois sólida).
5. A 70% do trajeto, a linha laranja termina de atravessar a palavra (480ms).
6. Ao pousar (≈1,97s): vibração (320ms), brilho e um **reflexo de luz** que percorre o metal das letras, da esquerda para a direita (700ms por letra, escalonado 38ms; faixa de `background-position` em cada letra, fora dela em repouso). Junto com ele, uma **faixa de luz atravessa o metal da própria máquina**, da cabeça à base (950ms, depois de 150ms): `.clipper-brilho`, uma camada criada na hora e removida ao fim, presa ao formato da máquina por uma máscara com a própria imagem (só `transform` anda; `script.js`, `glint()`).
7. 1,15s: rótulo, frase, botões e "2014" entram em sequência (800ms, +80ms cada). 1,6s: "Doug Funny" é pintado com **borda de pincel inclinada** (`clip-path: polygon`, 750ms).

Seguranças: o texto cru da palavra fica invisível até ser dividido em letras (`.word:not(.is-split)`). Se `script.js` não rodar em 5s, o `<head>` tira o `intro-pending` (o hero nunca fica vazio). Se a imagem da máquina travar, o estado final aparece em 4s.

**Profundidade:** a cópia da palavra "na frente" é recortada por um semiplano perpendicular ao eixo da máquina, calculado em JS (`updateDepthMask`) a partir da altura `--depth-y`. Acima dela a máquina fica na frente; abaixo, atrás.

**Giro da máquina em 3D (`script.js`, `createSpin`).** A máquina é um render do Blender. Para girá-la de verdade em torno do próprio eixo, o **mesmo modelo, com a mesma luz e a mesma câmera**, foi renderizado em várias posições (`ferramentas/render_maquina.py rolls=…` e `montar_giro.py`; comandos no `ferramentas/README.md`). Duas folhas de quadros, cada uma em AVIF com reserva em WebP e um `.json` com os ângulos:
- `imagens/maquina-giro-a`: volta inteira, de 10 em 10°, 408px de altura (≈160 KB em AVIF). Abertura e rolagem.
- `imagens/maquina-giro-b`: só de −30° a +30°, de 5 em 5°, 817px (≈180 KB). Pouso e mouse, onde a nitidez aparece.

O ângulo 0 é **exatamente** a imagem da página (`maquina-doug-funny.webp` é um corte 1:1 do mesmo render; o alinhamento foi conferido com desvio máximo de 0,5px), então o giro sempre termina na pose de sempre e a dissolvência final, de 0,2s, é entre dois quadros iguais (medido: 0 pixels de diferença depois dela).

- **Como desenha:** um `<canvas>` por folha, sob a imagem. O ângulo vira uma média ponderada dos quadros vizinhos (movimento contínuo, sem degraus) e, quando o giro é rápido, vira borrão de movimento de graça (a média se espalha pelo arco de uma exposição de obturador de 180° a 60 qps). A folha nítida entra por cima perto da pose final e a leve deixa de ser redesenhada.
- **Sombra:** o filtro `drop-shadow` da imagem sumiria junto com ela, e num canvas que muda a cada quadro ele custaria caro. Uma **cópia estática** da imagem (`.clipper-sombra`, `brightness(0) blur(30px)`) faz a sombra: o desfoque de algo que não muda não precisa ser refeito. Fora do palco (tema claro) ela vira a sombra curta e clara, como a da imagem.
- **Ordem das camadas** dentro de `.clipper-buzz`, de trás para a frente: luz laranja (`.clipper-glow`, z −1) < sombra < quadros < imagem. A luz fica atrás da máquina, como no HTML original.
- **Imagem escondida de verdade:** durante o giro a imagem usa `visibility: hidden` (com transição de 0,2s). Deixá-la só quase transparente custava, a cada quadro, refazer as duas sombras do filtro dela (medido: 149 → 185 quadros na abertura).
- **Nunca atrasa nada:** as folhas são baixadas com prioridade baixa (`<link rel="preload" fetchpriority="low">` injetado no `<head>` só no desktop, e `Image.fetchPriority`), e só valem se já chegaram quando a máquina começa a se mover; a decisão é tomada **uma vez**, no primeiro quadro (nunca começa a girar no meio do caminho). Se não chegaram (rede lenta, falha, 404), a abertura é a de sempre. `Save-Data`, rede 2G/3G e movimento reduzido não baixam nada. No celular as folhas só são baixadas depois da abertura, em ociosidade. O LCP continua sendo a imagem plana.
- **Voltas, velocidade e desaceleração** foram escolhidas num laboratório com sete candidatas gravadas em vídeo: **1 volta** com a curva `cubic-bezier(.45, 0, .15, 1)` (`SPIN_TURNS`, `SPIN_EASE`). Sai devagar enquanto a máquina ainda entra, acelera até ≈730°/s a 31% do trajeto e desacelera por muito tempo (24°/s nos últimos 10%), pousando de frente. Ver os critérios na seção 6 do plano.
- **Rolagem (desktop):** na viagem até Serviços ela gira mais uma volta no mesmo sentido (−360°, `TRAVEL_ROLL`), amarrada à rolagem; de volta ao topo, volta à imagem. **Celular:** −270° enquanto o hero sai da tela (`MOBILE_ROLL`).
- **Mouse (desktop):** o rosto da máquina vira até 14° para o ponteiro. Os quadros girados são um pouco mais suaves que a imagem (em tela retina dá para notar), então, com o ponteiro parado por 1,3s, ela **relaxa de volta à pose** e à imagem nítida.

**Perspectiva do palco (desktop com mouse).** O `.stage` inclina até 3° (em Y) e 2° (em X) com o ponteiro, em perspectiva de 1400px: o cartaz inteiro acompanha o cursor. As três cópias da palavra, a máquina e a assinatura ficam no **mesmo plano**, então a inclinação não separa uma da outra e a máscara de profundidade continua valendo, **desde que seja calculada no plano do palco**: medida com a inclinação ligada, a caixa do retângulo erraria o corte em até ~20px. Por isso `measureFlat()` desliga a inclinação só durante a leitura (sem pintar entre as duas trocas) e só quando existe alguma. Conferido: o recorte com inclinação é idêntico ao calculado sem ela, nas sete posições testadas do ponteiro. É a parte mais cara da profundidade: se o intervalo médio entre as atualizações do ponteiro passa de 30ms, o `motion.js` põe `.no-tilt` e a inclinação some (o giro e o deslocamento das camadas continuam).

**Recuo da palavra.** Ao rolar, "BARBEARIA" recua em profundidade: `--ws` vai de 1 a 0,9 no desktop e a 0,92 no celular (`scale` dentro do mesmo `transform` que a centraliza, para não deslocá-la). O recorte da profundidade é escrito em px do próprio elemento, então `depthPolygon` divide as medidas da tela por `--ws`.

**Base sem bibliotecas (`script.js`):** só enquanto o hero está visível (IntersectionObserver): a máquina desce 0,42× e gira levemente, e a palavra sobe 0,14×. Ao entrar em Serviços, uma linha laranja "corta" o topo da seção. Os títulos sobem de uma máscara por linha, uma vez. É o que roda quando `vendor/` não carrega.

**Camada de movimento (`motion.js`, GSAP + ScrollTrigger + SplitText + Lenis).** Tudo é criado com `gsap.matchMedia()`: ao trocar de largura ou de preferência de movimento, o que existia é desfeito.

| # | Animação | Como | Valores |
|---|----------|------|---------|
| 1 | **Rolagem suave** | Lenis no ticker da GSAP (`lenis.raf(t*1000)`, `lagSmoothing(0)`), `lenis.on('scroll', ScrollTrigger.update)` | Só a roda do mouse fica suave; toque e teclado são nativos. Links `#…` usam `lenis.scrollTo` e param logo abaixo do cabeçalho; o foco vai para a seção. "Pular para o conteúdo" é nativo. `html.lenis` desliga o `scroll-behavior` |
| 2 | **Máquina conduz até Serviços** (desktop > 760px) | ScrollTrigger `scrub: 0.6`, do topo do hero até o centro de `#servicos-title` a 40% da tela; altera `--px/--py/--pr/--ps` e `opacity` de `.clipper-pos`; `hero.spin.set('scroll', −360° × t)` | 0–80% do trajeto: desce na diagonal, gira −16° no plano **e uma volta em torno do próprio eixo** (quadros renderizados) e diminui (`power2.inOut`). 80–100%: some (`power1.in`). A linha `.cut-divider` é desenhada de 45% a 80%, chegando junto com a máquina. "BARBEARIA" fica para trás 0,22× (paralaxe). O pouso é calculado no espaço livre à direita do texto do título, acima da nota; a escala fica entre 0,16 e 0,35, ajustada para caber, e é recalculada a cada refresh, não a cada quadro. Fora do palco a sombra escura vira uma sombra curta e clara (`.is-off-stage`, ver §6) |
| 2b | **Profundidade no hero** (celular ≤ 760px) | ScrollTrigger `scrub`, dentro do hero recortado; `hero.spin.set('scroll', −270° × t)` | A máquina desce 0,28× a altura do hero, gira 8° no plano e −270° em torno do próprio eixo (folhas baixadas depois da abertura, em ociosidade); a palavra fica para trás 0,12× e recua a 0,92× |
| 3 | **Títulos letra por letra** | SplitText `words,chars`, `mask: 'chars'`, `aria: 'hidden'` e `aria-label` no `<h2>`; divide depois de `document.fonts.ready` (até 2,5s); `autoSplit` | `yPercent 110 → 0`, 0,7s, stagger 0,02s, `expo.out`; a 2ª linha (itálico/contorno) entra 0,1s depois; uma vez (`once`, `top 82%`). A máscara tem folga (`.title-char-mask`) para não cortar Ç/Ã/Á nem o itálico. Substitui a máscara por linha (`.is-split`) |
| 4 | **Poste gira com a rolagem** | `.pole-sprite` por cima da foto, mesmo enquadramento (cover 50% 40%, unidades `cq`); sprite de 24 quadros | Três ciclos de listras enquanto o quadro atravessa a tela; `background-position` em passos inteiros, escrito só quando o quadro muda. O sprite é baixado 600px antes de aparecer e mostrado depois de decodificado |
| 5 | **Cortina na equipe** | `ScrollTrigger.batch(.member-stage)`, uma vez | `clip-path inset(100% 0 0 0) → inset(0)`, 0,9s, `power4.out`, stagger 0,12s. A foto vai de `--photo-shift` 8% a 0 e o nome em contorno de `--ghost-shift` −35% a 0, ambos pela propriedade CSS `translate`; o `transform` do hover não é tocado |
| 6 | **Botões magnéticos** (só `(hover: hover) and (pointer: fine)`) | `gsap.quickTo` num objeto, que escreve a propriedade CSS `translate` | Até 8px na direção do cursor, 0,35s, `power3.out`; volta a 0 ao sair. Vale para `.btn-solid`, `.btn-outline-orange`, `.btn-ink` e os ícones sociais do rodapé, não para a agenda. `:active` de todos os botões: `transform: scale(.97)`, 120ms `ease`. São propriedades separadas, então não brigam |
| 7 | **Profundidade pelo ponteiro** (desktop com mouse, depois da abertura) | `quickTo` (1,2s, `power3.out`) escreve `--mx/--my` (−1 a 1) no `.hero` e o giro da máquina; cada camada converte em `translate` no CSS e o `.stage` em `perspective/rotateX/rotateY` | Contorno −3/−2px, palavra sólida +5/+4px, assinatura +8/+6px, máquina +11/+8px; palco inclina até 3°/2°; a máquina vira o rosto até 14° (e relaxa com o ponteiro parado por 1,3s). `.has-depth` promove essas camadas a camadas próprias (`will-change: translate`): andar com elas é só recompor. Máquina e palavra andam no máximo 6px uma em relação à outra, então a máscara não é refeita a cada quadro. Volta ao centro ao rolar além de 15% do hero e quando o ponteiro sai da janela. Medido: 60 fps com o mouse em movimento (antes da promoção, ~7 fps) |
| 8 | **Saída do hero** (desktop) | ScrollTrigger `scrub`, do topo ao fim do hero | Texto e botões sobem 90px a mais que a página e vão a 30% de opacidade, enquanto a palavra fica para trás e a máquina segue para Serviços |
| 9 | **Entradas das seções** | `ScrollTrigger.batch`, `once`, `top 88%`; `clearProps` no fim (hover e transições do CSS voltam intactos) | Ver a tabela de papéis abaixo |
| 10 | **Agenda** | `MutationObserver` + CSS | Ao trocar de profissional ou dia, os novos períodos entram (450ms, 25ms entre eles). O valor do resumo que mudou pisca em laranja (900ms). A pílula escolhida pulsa (`press-pop`, 340ms, CSS puro) |
| 11 | **Palco dos trabalhos** (§6.4) | `galleryDepth` (ScrollTrigger só escreve variáveis) e `galleryOrbit` (`quickTo`, 0,9s) na caixa `.gallery`; o CSS faz a conta de cada camada | Desktop: `--p` (0 a 1) enquanto o palco atravessa a tela; as camadas da frente andam e crescem mais (detalhe 80px, poste 10px, lâmina −100px, Instagram −150px; escala até +14%). Com mouse: `--ox`/`--oy` (−1 a 1) viram até 6° de giro e 52px de deslocamento por camada, em perspectiva de 1400px; se o intervalo médio entre as atualizações passa de 30ms, a órbita se desliga sozinha. Celular: `--k` em cada cartão (1 no miolo da passagem), que se aproxima e recua nas bordas da tela. O poste continua girando pelo sprite (§4). Só `transform` e `opacity`; `will-change` só com o palco na tela |
| 12 | **Camada entre seções** (§6.0 do CSS) | `sectionCamera` (`motion.js` §11), tudo por ScrollTrigger com `scrub: true` e reversível. **Recuo:** a seção anterior recua enquanto a próxima (a folha) sobe por cima, do topo da folha na borda de baixo da tela até a de cima, escrevendo direto no `.wrap` e no véu (nunca numa variável herdada pela seção inteira). **Lâmina:** `--blade` de 0 a 1 do topo da Formação na borda de baixo até 45% da tela. **Mergulho:** `--dive` de 0 a 1 em cada bloco enquanto o topo dele sobe de 98% a ≈62% da tela. **Linha de leitura:** `--read` de 0 a 1 na página toda | Recuo no desktop: Serviços 0,975 / véu 8% / desce até 10% da altura da tela; Formação 0,95 / 38% / 12%; Trabalhos só véu de 14% (o palco 3D já custa o bastante); Equipe 0,96 / 32% / 10%. A escala parte da base do `.wrap`; o véu entra com `power2.in`, tarde, para o foco do teclado nunca ficar escurecido. Celular: 45% da escala, 70% do véu, sem deslocamento (a rolagem nativa chega ao JavaScript um quadro depois). Mergulho: o bloco sobe 44px (ingresso 64px com giro de 1,2°, itens de contato 18px) e cresce de 94% a 100% (celular 28–40px e 97%), só com `translate`, `scale` e `rotate` individuais, nunca `opacity`. `.dive` é posta por `motion.js` e `.is-arrived` tira as propriedades de vez quando o bloco chega: em repouso ele é igual ao de antes. Se o intervalo médio entre as atualizações passa de 30ms, o recuo e o véu se desligam sozinhos (`slowWatch`); ficam a folha, a lâmina e o mergulho |

**Papéis das entradas (motion.js §8 e §11):**

| Papel | Elementos | De → para | Tempo |
|-------|-----------|-----------|-------|
| Rótulo | `.section .eyebrow` | texto de −14px e linha laranja `--line` 0 → 1 | 1,1s |
| Texto | notas, títulos de coluna, textos da formação, CTA, títulos do contato, nome/função da equipe, rodapé | `y` 40px (24px no celular) + opacidade | 0,9s, 0,08s entre itens |
| Linha de lista | `.service`, `.combo`, `.hours-row` | `clip-path` corte da esquerda para a direita (folga vertical de 20% para não cortar acentos) | 1,1s, 0,05s entre linhas, +0,15s para o título da coluna chegar antes |
| Imagem | `.course-figure` | cortina `inset(100% 0 0 0)` → 0; a foto assenta de `--zoom` +0,2 | 1,3s (zoom 1,8s) |
| Cartão do palco | `.g-pole`, `.g-detail`, `.g-blade`, `.g-insta` | chegam de longe (menores, mais baixos e transparentes) até o lugar pela variável `--in` (0 → 1); a cortina de `clip-path` não serve aqui porque achata a profundidade | 1,4s, 0,16s entre cartões |
| Pílula | `.topics li`, `.perks li` | `y` 14px + opacidade | 0,7s, 0,04s entre itens |
| Mergulho | `.pass`, `.packs-side .pack`, `.agenda-steps`, `.agenda-summary`, `.info-item` | sobem e crescem até o lugar ligados à rolagem (`--dive`, linha 12), sempre visíveis; o ingresso ainda gira 1,2° → 0 | o trecho da rolagem, sem tempo |
| Momento: carimbo | `.pass .stamp` | cai de 1,9× e −40° para −12° (`back.out(2.2)`) quando o ingresso termina de chegar (topo a 64% da tela, +0,1s) | 0,45s |
| Momento: rodapé | `.footer-mark` | `yPercent` 45 → 0 e opacidade 0,25 → 1 com a rolagem, até o fim da página | `scrub` |

**Teclado:** o Tab rola a página só até o elemento encostar na borda de baixo, antes do ponto de disparo. Se o foco entra num elemento que ainda espera a entrada, ele aparece na hora (0,35s). Verificado num ciclo completo de Tab: 43 elementos no desktop e 35 no celular (WCAG 2.4.7).

**Microinterações (CSS):**
- **Botões:** uma faixa (`--sweep` por variante) entra pela esquerda e sai pela direita, em 0,5s.
- **Menu:** o sublinhado entra pela esquerda e sai pela direita, no hover e no link da seção atual; como o link atual muda com a rolagem, ele parece viajar.
- **Menu do celular:** o painel abre como um corte (`clip-path`, 0,38s) e os links descem em sequência (30ms entre eles).

**Responsivo:**

| Largura | Movimento |
|---------|-----------|
| > 760px com mouse | Tudo, incluindo giro da máquina na abertura e na viagem, profundidade e perspectiva pelo ponteiro, e magnetismo |
| > 760px com toque (tablet) | Abertura completa (com giro), viagem da máquina com giro, entradas; sem ponteiro nem magnetismo |
| ≤ 760px | Abertura mais curta e menor (sem giro na entrada), profundidade no hero com giro da máquina e recuo da palavra pela rolagem, entradas com distâncias menores (24px), sem deriva nas fotos; folhas de seção com raio de 18px, recuo da seção anterior com 45% da escala e sem deslocamento, mergulho de 28–40px |

**Desempenho:**
- Medido no Chromium sem placa de vídeo (pior caso): abertura no desktop com ~156 quadros em 4s (a versão anterior tinha 137); celular a 60 fps; rolagem com mediana de 16,7ms nos três aparelhos.
- As animações usam só `transform`/`translate`, `opacity` e `clip-path`. A exceção é o quadro do poste (`background-position`, pedido assim, repinta só aquele quadro).
- O `will-change` da máquina só existe enquanto a viagem está ativa.
- **Giro (medido no Chromium sem placa de vídeo, pior caso, 1440×900; mediana de 4 execuções contra a versão sem giro):** abertura com 175 quadros em 4,8s (a anterior, 195); rolagem do hero até Serviços igual (185–190 quadros); ponteiro com 130 quadros em 3s (151), já com a inclinação desligada pela guarda após ≈1,3s de movimento. LCP no desktop 872 → 904ms (+32ms, 8 execuções intercaladas) e no celular (4G lenta, CPU 4×) 3312 → 3424ms (+3,4%); o LCP segue sendo a imagem plana. Custo em bytes: +345 KB em AVIF só no desktop, depois da imagem, em prioridade baixa (o celular só baixa depois da abertura). Não foi medido com placa de vídeo real, nem em Safari ou Firefox.
- **Camada entre seções (medido no Chromium sem placa de vídeo, pior caso; mediana de 3 rodadas; contra a versão publicada, `88721ab`):** rolagem da página inteira no desktop (roda do mouse, 1440×900): 918 → 984 quadros no mesmo percurso, mediana de 16,7ms nas duas e p90 de 33,3 → 16,8ms; no celular (390×844, DPR 3, CPU 4×, 1200px/s): 610 → 609 quadros, mediana e p90 de 16,7ms nas duas. A guarda de aparelho lento não disparou em nenhuma das 6 rodadas da versão nova (3 no desktop, 3 no celular). LCP no desktop 952 → 928ms e no celular (4G lenta, CPU 4×) 3132 → 3232ms (+3,2%; 6 execuções intercaladas; o servidor de teste não comprime, então os +13 KB de CSS e JS pesam mais que em produção, onde são +4 KB comprimidos); CLS máximo 0,072 → 0,058 no desktop e 0,019 → 0,012 no celular; o LCP segue sendo a imagem plana. Nenhuma requisição nova. Não foi medido com placa de vídeo real, nem em Safari ou Firefox.
- A imagem da máquina some com `visibility`, não com `opacity`, enquanto os quadros assumem (ver "Giro da máquina em 3D"); a folha leve deixa de ser redesenhada quando a nítida a cobre; o ângulo só é redesenhado quando muda mais de 0,25° ou a máquina anda rápido.
- A máscara de profundidade lê dois retângulos por quadro, e só enquanto o hero está na tela; os valores de pose (`--rot`, `--depth-y`) ficam em cache até o próximo resize.

**Movimento reduzido:** nada anima e tudo aparece no estado final. O `motion.js` não cria nada (nem Lenis, nem divisão de títulos, nem cortina, nem magnetismo, nem entradas de seção, nem profundidade), o poste mostra a foto parada, que é o quadro 0 do sprite, e as folhas do giro da máquina nem são baixadas. As transições e animações do CSS (varredura, sublinhado, menu, pulso da agenda) ficam instantâneas, com atrasos zerados. Da camada entre seções ficam só as **formas** (folha com cantos e sombra, lâmina em repouso): véu, recuo, mergulho e linha de leitura não existem, e os blocos nunca têm transformação. O mesmo vale sem `vendor/` (conferido: texto, altura e ordem do Tab idênticos aos da versão anterior).

---

## 11. Voice & Tone

Português do Brasil, direto. Verbos: **Agendar horário**, **Agendar via WhatsApp**, **Consultar no WhatsApp**, **Quero este pacote**, **Garantir minha vaga**, **Ver serviços**. Preços como `R$ 40`, `R$ 2.600`, "a partir de R$ 120".
