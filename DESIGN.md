# Studio Doug Funny — Design Language

> Site de uma barbearia e escola de barbeiros em Barretos-SP (desde 2014). Público: homens da região que querem cortar, fazer a barba ou fechar um pacote, e futuros barbeiros que avaliam o curso (R$ 1.400 a R$ 2.600). Objetivo do site: **vender** e **transmitir alto nível**.

> Fonte desta documentação: extraída do `index.html` (versão "Redesign v2", commit `d651962`). Os valores abaixo são os que o código usa de fato. Onde o código não segue um padrão, isso está marcado como **lacuna**.

## 1. Visual Theme

**Theme statement:** escuro, artesanal, afiado — "uma tabela de preços impressa sobre um balcão de barbearia, sob a luz de um espelho".

**Character:** fundo carvão com um único acento âmbar (cobre). Tipografia serifada de alto contraste, em tamanhos grandes, carrega a personalidade. Os preços aparecem em cartões de papel creme, como as tabelas de barbearia antigas. A moldura em **arco de espelho** é o elemento de identidade e se repete no hero, na formação, na equipe e em uma foto da galeria. O único momento de movimento é a abertura: uma lâmina de luz cruza a tela e o título sobe de uma máscara.

**References:**
- Referência 1 do cliente (site de barbearia escuro, serifa, linhas finas, fotos em destaque).
- Referência 2 do cliente (letras gigantes, âmbar sobre preto).
- Tabelas de preço impressas de barbearia clássica (pontilhado entre nome e preço).
- Setor mais próximo na base da skill: *Luxury Fashion* (contenção, ouro fosco, preto) e *Artisanal Heritage* (serifa, tons quentes). Não existe linha específica para barbearia.

**Ainda não resolvido:** o site depende de fotos que não existem no projeto (só as 3 da equipe). Fotos de banco de imagem estão sendo usadas como provisórias.

---

## 2. Color Palette

### Neutros e superfícies
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0A0A0A` | Fundo da página (carvão) |
| (alt) | `#0f0f10` | Seções alternadas e rodapé (**lacuna:** valor fixo, sem token) |
| `--surface` | `#18181B` | Cards, painéis da agenda, pacotes secundários |
| `--line` | `#2A2A2E` | Divisórias e bordas de 1px |
| `--text` | `#F4F4F5` | Texto principal |
| `--muted` | `#A1A1AA` | Texto de apoio |
| `--paper` | `#E9E2D3` | Cartões de papel (serviços, horário) |
| `--ink` | `#15120D` | Texto sobre papel e sobre âmbar |

### Acento
| Token | Valor | Uso |
|-------|-------|-----|
| `--amber` | `#C58535` | Botão principal, preços, foco, links ativos, pacote em destaque |
| `--amber-hi` | `#DDA04E` | Hover do âmbar |
| `--amber-ink` | `#8A4F0E` | Âmbar escuro, **só sobre papel** |

### Contraste medido (WCAG 2.1 AA)
| Par | Razão | Resultado |
|-----|-------|-----------|
| Texto sobre fundo | 18,0:1 | Passa |
| Cinza (muted) sobre fundo / alt / surface | 7,7 / 7,5 / 6,9:1 | Passa |
| Âmbar sobre fundo / surface | 6,4 / 5,7:1 | Passa |
| Tinta sobre âmbar | 6,0:1 | Passa |
| Tinta sobre papel | 14,5:1 | Passa |
| Âmbar escuro sobre papel | 5,1:1 | Passa |
| "a partir de" (âmbar escuro, 85%) sobre papel | 3,9:1 | **Falha** (texto pequeno) |
| Borda de card sobre fundo | 1,4:1 | Abaixo de 3:1 (o texto identifica o componente) |
| Borda de botão contorno sobre fundo | 2,5:1 | Abaixo de 3:1 |

### Semânticos
Não existem cores de sucesso, aviso ou erro: o site não tem formulários nem mensagens de estado. **Lacuna aceita** enquanto a agenda for apenas demonstração.

**Modo claro:** não existe. O site é só escuro (`color-scheme: dark`).

---

## 3. Typography

**Famílias** (Google Fonts, únicas dependências externas):
- **Títulos, preços e nomes:** Fraunces (variável, eixos de peso e tamanho óptico), fallback Georgia.
- **Texto e interface:** Instrument Sans (400, 500, 600, 700), fallback system-ui.

Números sempre alinhados à linha de base (`font-variant-numeric: lining-nums`). Sem isso, a Fraunces e a Cormorant mostram números "antigos" e "31" parece "3ı".

**Escala (a do código, sem razão modular fixa — lacuna):**
| Papel | Tamanho | Peso | Altura de linha | Espaçamento |
|-------|---------|------|-----------------|-------------|
| Hero (nome) | `clamp(3.7rem, 12.2vw, 11rem)` | 800 | 0,88 | -0,04em |
| Preço do pacote em destaque | `clamp(4.5rem, 9vw, 7.5rem)` | 800 | 0,9 | -0,02em |
| Título de seção (h2) | `clamp(2.5rem, 6vw, 4.8rem)` | 700 | 0,98 | -0,03em |
| Título do curso | `clamp(2.2rem, 4.4vw, 3.8rem)` | 800 | 1 | -0,035em |
| Subtítulo do hero (itálico) | `clamp(1.35rem, 2.3vw, 1.9rem)` | 400 | 1,25 | 0 |
| Título de pacote | 1,9rem | 700 | 1,1 | -0,02em |
| Nome e preço na lista pontilhada | 1,45rem | 600 / 700 | 1,15 | -0,01em |
| Corpo | 1rem (16px) | 400 | 1,6 | 0 |
| Botão | 0,82rem | 600 | 1,2 | 0,04em |
| Texto de apoio | 0,85–0,95rem | 400–500 | 1,6 | 0 |

**Regras:** títulos em maiúscula/minúscula normal (sem caixa alta). Itálico da Fraunces é usado para legendas, subtítulos e funções ("Barbeiro & Instrutor"). O menor texto medido hoje é 12,5px (desktop) e 11,5px (celular).

---

## 4. Components

| Componente | Função | Variantes |
|------------|--------|-----------|
| **Button** (`.btn`) | Ação | `solid` (âmbar), `line` (contorno), `ink` (tinta, só sobre âmbar) |
| **Pill** (`.pill`) | Selo de economia | padrão (âmbar), sobre âmbar (tinta) |
| **Leader** (`.leader`) | Linha "nome ····· preço" | `on-paper`, `on-dark`; preço com "a partir de" |
| **Menu card** (`.menu-card`) | Tabela de serviços em papel | com moldura interna de 1px |
| **Hours card** (`.hours-card`) | Horário de funcionamento em papel | — |
| **Mirror frame** (`.mirror-frame` + `.mirror`) | Foto em arco com moldura âmbar e brilho | hero, formação |
| **Pack feature** | Pacote principal (âmbar sólido) | 1 |
| **Pack row** | Pacotes secundários (escuros) | 2 |
| **Tile** (`.tile`) | Foto da galeria com legenda | `tile-a` em arco; demais retangulares |
| **Team card** | Retrato em arco, preto e branco | escalonado (o 2º desce 3,5rem) |
| **Agenda** | Passos: profissional, dia, horário, resumo | `barber-tab-btn`, `day-card-btn`, `time-slot-btn`, `request-summary-card` |
| **Info item** | Contato com ícone de linha | — |
| **Pole** (`.pole`) | Divisória de poste de barbeiro (9px) | usada 2×: após o hero e antes do rodapé |
| **Ícones** | SVG de linha em sprite inline, traço 1,5 | sem dependências |

---

## 5. Layout

**Grade:** sem grade de colunas global. Cada seção tem sua composição (hero assimétrico, cartão de papel, 2 colunas desiguais, mosaico de 12 colunas na galeria). Largura máxima do conteúdo: 1240px.

**Margem lateral (`--gutter`):** `clamp(1.25rem, 5vw, 4.5rem)`.

**Espaçamento:** **lacuna.** O código usa valores soltos em rem (0,5 / 0,7 / 1 / 1,25 / 1,5 / 2 / 2,5 / 3 / 4 rem...). Falta uma escala. Recomendação: base de 4px, com 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

**Respiro entre seções:** `clamp(4.5rem, 9vw, 7.5rem)`.

**Breakpoints reais:**
| Largura | O que muda |
|---------|-----------|
| ≤ 1300px | Menu vira botão (hambúrguer) |
| ≤ 1024px | Hero, pacotes, formação e contato viram 1 coluna |
| ≤ 900px | Agenda empilha; galeria em 2 colunas |
| ≤ 760px | Listas, equipe e galeria em 1 coluna |
| ≤ 600px | Cabeçalho compacto; botões do hero em largura total |

**Densidade:** confortável.

---

## 6. Depth

- **Sem sombras**, exceto nos 2 cartões de papel: `0 30px 80px rgba(0,0,0,.5)`.
- A profundidade vem de **tom**: `--bg` → `#0f0f10` → `--surface`. É o recomendado para tema escuro.
- Cabeçalho fixo com desfoque (`blur(14px)`) e fundo a 80%.
- **Raios (lacuna, 5 valores):** 2px (botões), 4px (cards e fotos), 10px (moldura do espelho), 999px (arcos e pílulas), 50% (círculos). Recomendação: consolidar em 3.

**Camadas:** hero (-2 a 2) < cabeçalho 100 < lâmina de abertura 300.

---

## 7. Do's and Don'ts

### Do
- Usar **âmbar só para o que é ação ou preço**: botão principal, preço, foco, link ativo.
- Mostrar preços em **Fraunces**, alinhados à linha de base, com pontilhado ligando ao nome.
- Usar o **papel creme** só para dados de consulta (tabela de serviços, horário). O contraste com o preto é o que dá o "objeto impresso".
- Manter o **arco de espelho** restrito a hero, formação, equipe e uma foto da galeria. Se aparecer em todo lugar, deixa de ser identidade.
- Tratar fotos da equipe em **preto e branco de alto contraste**: os retratos originais têm fundo vermelho saturado, que brigaria com o âmbar.
- Escurecer fotos de banco de imagem (filtro de brilho) para combinar com o fundo.
- Respeitar `prefers-reduced-motion`: sem lâmina, sem subida do título, sem brilho.
- Manter textos, preços, horários, endereço e nomes **reais**.

### Don't
- **Não inventar dados**: depoimentos, números, avaliações ou descrições de serviço que o cliente não forneceu.
- **Não apresentar foto de banco como trabalho do Studio**. Hoje há um aviso "Imagens ilustrativas" sob a galeria; remover só quando entrarem fotos reais.
- Não usar mais de um acento. Não usar roxo, gradiente em texto, brilho neon.
- Não escrever títulos em caixa alta nem rótulos pequenos em caixa alta acima de títulos.
- Não usar emoji nem ícone de outra família junto dos ícones de linha existentes.
- Não adicionar bibliotecas externas. O site funciona sem JavaScript de terceiros, e isso é intencional (o visualizador de artefatos bloqueia scripts de CDN).
- Não usar `R$` sem espaço (`R$ 40`) nem com barra invertida.
- Não adicionar animação de entrada em cada seção. O movimento é reservado à abertura.

---

## 8. Responsive

- Estratégia: o desktop é o projeto-base; o celular reorganiza em coluna única.
- **Menu:** abaixo de 1300px vira botão; o painel é opaco e fecha com Esc ou ao tocar num link.
- **Hero:** o arco desce para baixo do texto; botões ocupam a largura total no celular.
- **Pacotes:** o destaque vem primeiro, depois os dois secundários.
- **Equipe:** o escalonamento do 2º cartão é removido no celular.
- **Agenda:** os dias rolam na horizontal; o botão do WhatsApp ocupa a largura total.
- **Verificado:** sem rolagem horizontal em 1440, 1100, 820 e 390px.

---

## 9. Agent Prompt Guide

**Como usar este arquivo:** leia as seções 2, 3, 4 e 7 antes de mexer em qualquer estilo. Valores novos devem virar tokens (`:root`), não números soltos.

**Invariantes — nunca quebrar:**
1. **Lógica da agenda intacta.** O JavaScript depende destes seletores e IDs: `.barber-tab-btn[data-barber]`, `.days-horizontal-strip`, `.day-card-btn` (criado pelo script, com `data-day` e `data-day-code`), `#morning-slots`, `#afternoon-slots`, `#summary-barber`, `#summary-day`, `#summary-time`, `#agenda-whatsapp-link`, `.time-slot-btn`, `.menu-toggle`, `#primary-navigation`.
2. **WhatsApp:** número `5517991052256`. Mensagens pré-preenchidas devem ser mantidas.
3. **Conteúdo real:** nomes (Funny, Miguel, Thaylor), preços, turmas, endereço (Rua Doutor Riolando Prado, 62, Nogueira, Barretos-SP, CEP 14783-254), horários (ter–sex 08:00–12:30 e 14:00–19:00; sáb 08:00–13:30 e 15:00–18:30; dom e seg fechado), e-mail e Instagram.
4. **Fotos da equipe** ficam em `imagens/` (`funny.png`, `miguel.png`, `thaylor.png`).
5. **Um único arquivo** (`index.html`) com CSS e JS embutidos; sem build.
6. **Sem dependências externas** além de Google Fonts.

**Pendências conhecidas (do `/design-review`):** botão do menu encolhe no celular (37px de largura), falta link "pular para o conteúdo", alvos de toque abaixo de 44px, o texto "a partir de" não atinge contraste AA, brilho do espelho repete infinitamente sem controle.

---

## 10. Motion

**Registro:** expressivo, só na abertura. O resto da interface é imediato.

| Elemento | Duração | Atraso | Curva |
|----------|---------|--------|-------|
| Lâmina de luz atravessa a tela | 1150ms | 150ms | `cubic-bezier(.7, 0, .25, 1)` |
| Título sobe de uma máscara (2 linhas) | 1000ms | 750ms / 900ms | `cubic-bezier(.16, .84, .24, 1)` |
| Espelho do hero aparece | 1200ms | 900ms | ease |
| Subtítulo, frase e botões aparecem | 900ms | 1550ms | ease |
| Brilho passa pelo vidro dos espelhos | 8s, **infinito** | 3s | ease-in-out |
| Hover de botão e link | 250ms | 0 | ease |
| Zoom de foto no hover | 700ms | 0 | ease |

Só `transform` e `opacity` são animados nos movimentos de abertura.
**Movimento reduzido:** a lâmina some, o título e o espelho aparecem no estado final, o brilho para, transições ficam a 0,01ms.

---

## 11. Voice & Tone

**Voz:** direta, local, sem exagero. Português do Brasil, maiúscula só no início da frase.

**Verbos de ação (manter iguais em todo o site):**
- Agendar horário · Agendar via WhatsApp · Consultar no WhatsApp
- Assinar pacote
- Garantir minha vaga
- Ver tabela de serviços · Ver rota no Google Maps

**Termos preferidos:** "pacote", "combo", "turma", "horário", "Studio".
**Evitar:** "premium" como adjetivo vazio, "experiência", "exclusivo" sem dizer o quê.

**Preços:** `R$ 40`, `R$ 2.600`; faixa como "a partir de R$ 120".

**Observação:** o rótulo "Assinar pacote" abre uma conversa no WhatsApp, não uma assinatura automática. Vale confirmar com o cliente se o verbo é o mais honesto.
