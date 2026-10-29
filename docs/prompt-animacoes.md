# Prompt — 6 animações do Studio Doug Funny

> Cole o texto abaixo (a partir de "Você vai implementar…") no Claude Code do VS Code, com a pasta do projeto aberta.

---

Você vai implementar 6 animações no site do Studio Doug Funny. Trabalhe como um desenvolvedor front-end sênior especializado em motion design. Responda e escreva commits em português do Brasil.

## 0. Antes de tudo

1. Rode `git checkout claude/optimistic-galileo-fezkkb && git pull`. Trabalhe só nessa branch. **Não mexa na `main`** e não abra pull request.
2. Leia `DESIGN.md` inteiro, principalmente as seções **9 (invariantes)** e **10 (movimento)**. Leia `index.html` inteiro antes de alterar qualquer coisa.
3. Se estiverem instaladas, use estas skills e siga as regras delas:
   - **GSAP oficial** (`greensock/gsap-skills`). Se não estiver instalada, rode `npx -y skills add greensock/gsap-skills --agent claude-code`.
   - **audit-suite**: `web-animation-design` e `emil-design-engineering`.
   - **design-superpowers**: `/design-review` no fim.
4. Escreva primeiro um plano curto (o que muda em cada animação, quais arquivos, riscos) e só então implemente.

## 1. Contexto do projeto (não quebre nada disto)

- Site estático: **um único `index.html`**, com CSS e JS embutidos, sem build. Imagens em `imagens/`.
- **Hero já tem uma abertura própria** (Web Animations API): a palavra "BARBEARIA" em contorno vira metal sólido enquanto a máquina de corte atravessa. Há também a máscara de profundidade (`updateDepthMask`), a linha de corte (`.cutline`) e a assinatura `.script`. **Não altere essa abertura.** Ela termina por volta de 2,4s. As animações novas do hero só podem começar depois que a classe `intro-pending` sair do `<html>`.
- **Agenda:** a lógica e todos os seletores listados no DESIGN.md §9 devem continuar funcionando. O link do WhatsApp precisa continuar gerando a mensagem certa.
- Conteúdo comercial (preços, nomes, horários, endereço) não pode mudar.
- Movimento reduzido já é respeitado e precisa continuar sendo.

## 2. Bibliotecas: locais, nunca por CDN

- Instale `gsap` e `lenis` pelo npm numa pasta temporária e **copie só os arquivos minificados** para `vendor/`:
  - `vendor/gsap.min.js`
  - `vendor/ScrollTrigger.min.js`
  - `vendor/SplitText.min.js`
  - `vendor/lenis.min.js`
- Use as versões estáveis mais recentes e registre versão e licença de cada uma em `vendor/LICENSES.md`. A GSAP 3.13+ é gratuita inclusive para uso comercial, com SplitText e ScrollTrigger; **confirme isso na licença do pacote** antes de usar. A Lenis é MIT.
- Carregue com `<script src="vendor/..." defer>` antes do script principal.
- **Degradação segura:** se `window.gsap` ou `window.Lenis` não existir, o site deve funcionar exatamente como hoje, sem erro no console. Envolva todo o código novo em verificações.
- Não adicione nenhuma outra biblioteca.

## 3. As 6 animações

Regras gerais (da skill de animação):
- Anime só `transform`, `opacity` e `clip-path`.
- Entrada: `ease-out` (expo/quart). Movimento de algo já na tela: `ease-in-out`. Hover: `ease`.
- Revelações de rolagem acontecem **uma vez** por carregamento.
- Nada em loop infinito.
- Cada animação precisa de uma alternativa com movimento reduzido, em que o elemento aparece direto no estado final.

### 1) Rolagem suave com Lenis
- Inicie a Lenis e sincronize com o ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))` e `gsap.ticker.lagSmoothing(0)`.
- Os links âncora do menu, do rodapé e do hero (`href="#..."`) devem usar `lenis.scrollTo(alvo, { offset: -altura_do_cabeçalho })`. O menu do celular continua fechando ao clicar.
- O link "Pular para o conteúdo" precisa continuar movendo o **foco do teclado** para `#conteudo`.
- Remova `scroll-behavior: smooth` do `html` quando a Lenis estiver ativa, porque os dois conflitam.
- **Desligue a Lenis** com movimento reduzido. Não force rolagem suave no toque do celular (mantenha o padrão da Lenis).

### 2) A máquina conduz do hero até Serviços
- Substitua a paralaxe atual da máquina (variáveis `--px`, `--py`, `--pr` no `onScroll`) por um ScrollTrigger com `scrub` que vai do topo do hero até o título de Serviços aparecer.
- **Desktop:** a máquina desce na diagonal, gira um pouco e diminui (até ~35%). Ela pousa **ao lado** do título "Serviços & procedimentos", nunca em cima dos nomes ou preços, e então some com opacidade. A palavra "BARBEARIA" sobe mais devagar (paralaxe).
- O hero tem `overflow: hidden`. Escolha a técnica mais robusta para a máquina sair dele: um clone fixo durante a transição ou um contêiner fixo, por exemplo. **Explique a escolha.**
- A máscara de profundidade (`updateDepthMask`) precisa continuar correta enquanto a máquina estiver sobre a palavra.
- **Celular (≤ 760px):** versão simplificada. Só uma paralaxe leve dentro do hero, sem viagem até Serviços.
- A linha laranja `.cut-divider` no topo de Serviços deve ser desenhada sincronizada com a chegada da máquina.

### 3) Títulos revelados letra por letra
- Use SplitText nos títulos de seção (`.title`), **exceto no hero**.
- As letras sobem de dentro de uma máscara: `yPercent: 110 → 0`, duração 0,7s, `stagger` 0,02s, `ease: "expo.out"`. A linha em itálico (`em`) entra 0,1s depois da primeira.
- Substitua a revelação atual por máscara (`.reveal .line`), em vez de somar as duas.
- **Acessibilidade:** o texto completo do título precisa continuar legível para leitor de tela (use a opção de acessibilidade do SplitText ou `aria-label` no título com as letras `aria-hidden`).
- Os acentos (Ç, Ã, Á) **não podem ser cortados** pela máscara. Já aconteceu antes; teste "FORMAÇÃO" e "SERVIÇOS".
- O título só se divide em letras depois que as fontes carregarem (`document.fonts.ready`). Refaça a divisão em `resize` se as quebras de linha mudarem.

### 4) Poste de barbeiro girando com a rolagem
- O poste da galeria (`imagens/poste-barbeiro.webp`) é uma imagem estática, então **não gire a imagem em CSS**, porque isso fica falso.
- Gere uma sequência de quadros: altere `ferramentas/render_poste.py` para aceitar `frame=N` e deslocar a fase das listras (o padrão se repete a cada meia volta). Renderize **24 quadros** em 450×650 e junte tudo num único sprite `imagens/poste-sprite.webp` (24 quadros lado a lado).
- Na rolagem, enquanto a galeria está na tela, avance os quadros com `scrub` (troque `background-position` em passos inteiros, sem interpolar entre quadros).
- **Pré-requisito:** `pip install bpy` (Blender como módulo Python). Se não for possível instalar, **pare esta animação e me avise**. Não substitua por um desenho genérico.
- Com movimento reduzido, mostre o quadro 0 parado.

### 5) Retratos da equipe com efeito de cortina
- Ao entrar na tela, cada `.member-stage` se revela de baixo para cima: `clip-path: inset(100% 0 0 0) → inset(0 0 0 0)`, 0,9s, `ease: "power4.out"`, `stagger` 0,12s entre os três.
- Ao mesmo tempo, a foto sobe de leve (`yPercent: 8 → 0`) e o nome em contorno (`.member-ghost`) desliza no sentido oposto.
- O filtro e o hover dos retratos continuam como estão.

### 6) Botões magnéticos
- **Só em dispositivos com mouse:** `matchMedia('(hover: hover) and (pointer: fine)')`.
- Aplique em `.btn-solid`, `.btn-outline-orange`, `.btn-ink` e nos ícones sociais do rodapé. **Não aplique** nos botões da agenda (dias, horários, profissional), porque são usados muitas vezes seguidas.
- O deslocamento máximo é de 8px na direção do cursor, com `gsap.quickTo`, 0,35s e `power3.out`. Ao sair, o botão volta ao lugar.
- Adicione `transform: scale(0.97)` no `:active` de todos os botões (`transition: transform 120ms ease`). Garanta que o transform magnético e o `:active` não briguem: use um elemento interno, ou aplique o magnetismo num `span` de conteúdo.

## 4. Desempenho e acessibilidade

- O JS adicionado (vendor + seu código) deve ser o mínimo possível. **Informe o tamanho final de cada arquivo.**
- Nenhuma animação pode ler layout dentro de loops de rolagem sem necessidade. Use `will-change` só durante a animação.
- Pause o que estiver fora da tela (o ScrollTrigger já faz isso quando bem configurado).
- Nenhuma mudança de layout inesperada (CLS) no carregamento.
- Foco visível, ordem do Tab e áreas de toque ≥ 44px continuam como estão.

## 5. Testes obrigatórios (não encerre sem fazer)

1. Abra o site num servidor local (por exemplo `npx serve .`) e verifique se não há **nenhum erro no console**.
2. Teste com Playwright nas larguras **320, 390, 768, 1024, 1440 e 1920**: sem rolagem horizontal e sem texto coberto pela máquina na posição final.
3. Grave um vídeo da rolagem completa no desktop e no celular e confira cada uma das 6 animações quadro a quadro.
4. Teste com `reducedMotion: 'reduce'`: tudo visível, nada se movendo, Lenis desligada.
5. Teste com os arquivos de `vendor/` renomeados de propósito: o site precisa funcionar como antes, sem erro.
6. Teste o fluxo da agenda: escolher Miguel, um dia e um horário deve gerar o link do WhatsApp com a mensagem correta.
7. Teste o teclado: Tab, "Pular para o conteúdo", menu do celular com Esc.
8. Rode `/design-review`, se disponível, e corrija o que for P0 ou P1.

## 6. Entrega

- **Faça um commit por animação**, com mensagens descritivas em português, e dê push na branch `claude/optimistic-galileo-fezkkb`.
- Atualize `DESIGN.md` (seções 9 e 10) com as novas animações, as bibliotecas e como regenerar o sprite do poste.
- No fim, me mande um resumo com:
  - o que foi feito em cada animação;
  - o que não deu para fazer e por quê;
  - o tamanho do JS adicionado;
  - os resultados dos testes.

**Não invente** dados, fotos ou textos comerciais. Se algo for ambíguo, pergunte antes.
