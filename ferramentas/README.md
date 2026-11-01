# Ferramentas — como gerar de novo as imagens do site

Todos os comandos rodam a partir da raiz do projeto. Os scripts gravam direto nos arquivos finais
usados pelo site; não há etapa de build depois disso.

```bash
pip install pillow numpy scipy
```

## Retratos da equipe — `recortar_equipe.py`

| Entrada (original, fundo vermelho) | Saída (usada no site) |
|---|---|
| `imagens/funny.png`   | `imagens/equipe-funny.webp` |
| `imagens/miguel.png`  | `imagens/equipe-miguel.webp` |
| `imagens/thaylor.png` | `imagens/equipe-thaylor.webp` |

```bash
python ferramentas/recortar_equipe.py                    # gera os três WebP
python ferramentas/recortar_equipe.py thaylor            # só um retrato
python ferramentas/recortar_equipe.py --preview previas  # + prévias sobre branco, verde, preto e laranja
```

**Sempre confira as prévias** (`previas/<nome>_prev.jpg`). O fundo verde mostra furos, e o preto mostra
halos vermelhos. O script imprime o tamanho final de cada retrato. Se ele mudar, atualize `width` e
`height` das tags `<img>` em `index.html` (equipe e formação).

O que o script faz (detalhes no topo do arquivo):

1. Ele modela a **cor local do fundo**, o que acompanha o degradê rosado do fundo do Funny, e mede a
   distância de cada pixel até ela. O canal verde pesa 2x, porque é o canal que separa o fundo da
   camiseta vermelha do Thaylor e da pele em sombra.
2. Monta um **trimapa** (fundo / borda / pessoa). Na borda, a transparência sai da desmistura
   `C = a·F + (1-a)·B`, que preserva os fios de cabelo.
3. Faz a **descontaminação de cor** da borda e remove o reflexo do fundo nos cachos. O halo
   rosado que já existia nas fotos originais também sai.
4. Remove ilhas e manchas soltas. Furos minúsculos dentro da pessoa são preenchidos, mas os vãos
   reais (entre dedos e cabelo) continuam abertos.

Os ajustes por retrato ficam em `PORTRAITS`, no início do script. Use `red_key` só em quem **não**
veste vermelho. Se um retrato novo tiver roupa vermelha, siga a configuração do Thaylor.

O site mostra os retratos em preto e branco por identidade (CSS `grayscale`). O recorte em si é colorido
e limpo: no hover a cor volta parcialmente e não pode haver halo.

## Ícones e imagem de compartilhamento — `gerar_icones.py`

```bash
python ferramentas/gerar_icones.py
```

Gera `favicon.ico`, `imagens/icone-32.png`, `imagens/icone-180.png` (iPhone), `imagens/icone-512.png` e
`imagens/compartilhamento.jpg` (1200×630, Open Graph). A arte usa só a fonte `Anton-Regular.ttf` e o render
`imagens/maquina-doug-funny.webp`.

## Renders 3D — `render_maquina.py`, `render_poste.py`

Precisam do Blender como módulo Python (`pip install bpy`). As instruções estão no topo de cada script.
Converta o PNG para WebP (qualidade ~84) com o mesmo nome usado em `index.html`.

O `bpy` 5.x só é publicado para **Python 3.11**. Se o Python do sistema for outro, crie um ambiente à
parte (a pasta `.bpyenv/` está no `.gitignore`):

```bash
pip install uv
python -m uv venv --python 3.11 .bpyenv
python -m uv pip install --python .bpyenv/Scripts/python.exe bpy pillow
```

### Sprite do poste (animação da galeria)

```bash
cd ferramentas
../.bpyenv/Scripts/python.exe render_poste.py sprite=../imagens/poste-sprite.webp   # ~5 min na CPU
../.bpyenv/Scripts/python.exe render_poste.py frame=6 out=teste.png                 # um quadro, para conferir
```

O comando gera 24 quadros de 450×650, juntos lado a lado em `imagens/poste-sprite.webp` (10800×650).
Cada quadro desloca a fase das listras em 1/24 de meia volta, então a sequência fecha um laço, e o
quadro 0 é igual a `poste-barbeiro.webp`. Se mudar `frames` ou `res`, ajuste `POLE_FRAMES` em
`motion.js` e `.pole-sprite` em `styles.css`.

### Giro da máquina em torno do próprio eixo (sequência do hero)

```bash
cd ferramentas
# quadros: um PNG por ângulo, com a mesma câmera e a mesma luz do hero
../.bpyenv/Scripts/python.exe render_maquina.py view=hero rolls=0,5,10,15 samples=96 pct=50 outdir=quadros
../.bpyenv/Scripts/python.exe render_maquina.py view=hero roll=90 out=giro90.png     # um ângulo só, para conferir
# sprite: recorta (alinhado à imagem do site), reduz e junta os quadros numa grade + um .json com os ângulos
../.bpyenv/Scripts/python.exe montar_giro.py quadros --altura 817 --saida ../imagens/maquina-giro --formato webp
```

`roll` gira a máquina no eixo longo **antes** da pose do hero, então o eixo fica parado na tela e só a face
muda. `roll=0` é o render de sempre: o recorte de `imagens/maquina-doug-funny.webp` é um corte 1:1 do render de
900×2250 (`samples=160 pct=100`), e `montar_giro.py` usa essa imagem como referência para que o quadro 0 caia
exatamente em cima dela. Ângulos negativos entram como `m` no nome do arquivo (`quadro_m30.png`).
