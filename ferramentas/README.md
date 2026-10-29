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
