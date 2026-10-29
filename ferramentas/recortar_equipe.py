"""Recorta os retratos da equipe (fundo vermelho) e gera os WebP usados no site.

Entrada : imagens/funny.png, imagens/miguel.png, imagens/thaylor.png (originais, fundo vermelho)
Saída   : imagens/equipe-<nome>.webp (RGBA, recortado, altura máx. 900 px)

Uso (na raiz do projeto ou em qualquer pasta):
    pip install pillow numpy scipy
    python ferramentas/recortar_equipe.py                  # gera os três WebP
    python ferramentas/recortar_equipe.py --preview pasta  # também salva prévias sobre fundos de teste
    python ferramentas/recortar_equipe.py miguel           # só um retrato

Como funciona (por que não basta "remover o vermelho"):
  A pele em sombra e a camiseta do Thaylor também são vermelhas. Por isso o recorte não
  mede "quanto o pixel é vermelho", e sim a distância até a COR DO FUNDO naquele ponto.
  1. Sementes de fundo: pixels vermelho-saturados, ligados à borda da foto (ou regiões grandes,
     como o vão entre os dedos do Funny).
  2. Modelo local do fundo: média ponderada das sementes com desfoque largo. Acompanha o
     degradê do fundo do Funny e é extrapolada para baixo da pessoa.
  3. Trimapa: perto da cor do fundo = fundo; longe = pessoa; o meio é a borda incerta.
  4. Na borda, a transparência vem do "desmisturar" C = a·F + (1-a)·B, com B = fundo local e
     F = cor da pessoa estimada nos vizinhos opacos. Isso preserva fios de cabelo.
  5. Descontaminação: a cor da borda é recalculada sem a parcela do fundo, o que elimina
     o halo vermelho/rosa no cabelo, no pescoço e nas roupas.
  6. Limpeza: remove manchas soltas de fundo dentro da pessoa e ilhas soltas fora dela.
"""
from __future__ import annotations

import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IMG_DIR = os.path.join(ROOT, 'imagens')
MAX_HEIGHT = 900
WEBP_QUALITY = 86

# Ajustes por retrato. Distâncias em RGB (0–255) até a cor local do fundo.
#   bg_dist: abaixo disso é fundo certo   fg_dist: acima disso é pessoa certa
#   hole_area: furos de fundo dentro da pessoa menores que isso (fração da imagem) são preenchidos
#   red_key: (início, fim) da chave de vermelho R - max(G, B). Só para quem NÃO veste vermelho;
#            o Thaylor (camiseta vermelha) usa apenas a distância ao fundo.
#   seed_max_g: verde máximo de um pixel "semente" de fundo (o fundo do Funny tem degradê rosado,
#               G até ~70; nos outros o fundo é chapado, G≈0, e a camiseta clara do Thaylor tem G≥35)
PORTRAITS = {
    'funny':   {'bg_dist': 40, 'fg_dist': 110, 'hole_area': 0.00004, 'seed_max_g': 80, 'red_key': (75, 135)},
    'miguel':  {'bg_dist': 40, 'fg_dist': 110, 'hole_area': 0.00004, 'seed_max_g': 25, 'red_key': (75, 135)},
    'thaylor': {'bg_dist': 40, 'fg_dist': 95, 'hole_area': 0.00004, 'seed_max_g': 18},
}


def blur_weighted(values: np.ndarray, weight: np.ndarray, sigma: float) -> tuple[np.ndarray, np.ndarray]:
    """Convolução normalizada: média local de `values` só onde `weight` > 0."""
    w = ndi.gaussian_filter(weight, sigma)
    out = np.empty_like(values)
    for c in range(values.shape[-1]):
        out[..., c] = ndi.gaussian_filter(values[..., c] * weight, sigma)
    return out / np.maximum(w, 1e-6)[..., None], w


def background_seeds(rgb: np.ndarray, hole_area: float, seed_max_g: float) -> np.ndarray:
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    seed = (R > 170) & (G < seed_max_g) & (B < 115) & (R - np.maximum(G, B) > 115)
    seed = ndi.binary_opening(seed, iterations=2)
    # Só vale como fundo o que toca a borda da foto ou é uma região grande (vãos entre braço/dedos).
    labels, n = ndi.label(seed)
    if n == 0:
        return seed
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    sizes = ndi.sum(seed, labels, index=np.arange(1, n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = sizes > hole_area * seed.size
    keep[border] = True
    keep[0] = False
    return keep[labels]


def cut_portrait(rgb: np.ndarray, bg_dist: float, fg_dist: float, hole_area: float,
                 seed_max_g: float, red_key: tuple[float, float] | None = None) -> np.ndarray:
    """Devolve RGBA float (0–255) com fundo removido e bordas descontaminadas."""
    h, w, _ = rgb.shape
    scale = max(h, w) / 1024

    # 1–2. fundo local (acompanha degradês e é extrapolado para trás da pessoa)
    seed = background_seeds(rgb, hole_area, seed_max_g)
    bg_local, wgt = blur_weighted(rgb, ndi.binary_erosion(seed, iterations=2).astype(np.float32), 18 * scale)
    bg_far, _ = blur_weighted(rgb, seed.astype(np.float32), 90 * scale)
    mix = np.clip(wgt / 0.25, 0, 1)[..., None]
    bg = bg_local * mix + bg_far * (1 - mix)

    # 3. trimapa pela distância à cor do fundo. O verde pesa 2x: o fundo tem G≈0, e é o canal
    #    que mais separa o fundo da camiseta vermelha do Thaylor e da pele em sombra.
    dist = np.linalg.norm((rgb - bg) * np.array([1.0, 2.0, 1.0], np.float32), axis=-1)
    sure_bg = dist < bg_dist
    fg = dist > fg_dist
    # Retratos sem nada vermelho na pessoa: vermelho saturado (R muito acima de G e B) é fundo
    # ou o brilho rosado que ficou da edição original em volta do cabelo.
    key_alpha = None
    if red_key:
        redness = rgb[..., 0] - np.maximum(rgb[..., 1], rgb[..., 2])
        lo, hi = red_key
        tk = np.clip((redness - lo) / (hi - lo), 0, 1)
        key_alpha = 1 - tk * tk * (3 - 2 * tk)
        fg &= key_alpha > 0.5
        sure_bg |= key_alpha < 0.02
    # pessoa = componente principal + partes grandes (descarta pontinhos soltos no fundo)
    labels, n = ndi.label(fg)
    if n:
        sizes = ndi.sum(fg, labels, index=np.arange(1, n + 1))
        keep = np.zeros(n + 1, bool)
        keep[1:] = sizes > max(sizes.max() * 0.002, 40)
        fg = keep[labels]
    # furos minúsculos (ruído/compressão na pele ou na roupa) viram pessoa; vãos reais ficam abertos
    holes = ndi.binary_fill_holes(fg) & ~fg
    hl, hn = ndi.label(holes)
    if hn:
        sizes = ndi.sum(holes, hl, index=np.arange(1, hn + 1))
        small = np.zeros(hn + 1, bool)
        small[1:] = sizes < hole_area * holes.size
        fg |= small[hl] & ~sure_bg
    # núcleo opaco: a pessoa sem os 2 px da borda, que costumam ser mistura de pessoa + fundo
    core = ndi.binary_erosion(fg, iterations=max(2, round(2 * scale)))
    sure_bg &= ~fg

    # 4. cor da pessoa (vizinhos do núcleo) + desmistura C = a·F + (1-a)·B na faixa incerta
    near_idx = ndi.distance_transform_edt(~core, return_distances=False, return_indices=True)
    fg_nearest = rgb[near_idx[0], near_idx[1]]
    fg_soft, wgt_fg = blur_weighted(rgb, core.astype(np.float32), 3 * scale)
    t = np.clip(wgt_fg / 0.3, 0, 1)[..., None]
    fg_col = fg_soft * t + fg_nearest * (1 - t)
    d = fg_col - bg
    alpha = np.sum((rgb - bg) * d, axis=-1) / np.maximum(np.sum(d * d, axis=-1), 1.0)
    alpha = np.clip(alpha, 0, 1)
    alpha[core] = 1.0
    alpha[sure_bg] = 0.0
    if key_alpha is not None:
        alpha = np.minimum(alpha, key_alpha)
        core &= key_alpha > 0.99
    # a faixa incerta só existe junto à pessoa: longe dela é ruído do fundo
    alpha[~ndi.binary_dilation(fg, iterations=max(2, round(3 * scale)))] = 0.0
    # aperta levemente a borda para não sobrar franja e tira o serrilhado
    alpha = np.clip((alpha - 0.05) / 0.9, 0, 1)
    alpha = np.where(core, 1.0, np.minimum(ndi.gaussian_filter(alpha, 0.5 * scale), np.maximum(alpha, 0.0) + 0.15))
    alpha = np.clip(alpha, 0, 1)

    # 5. descontaminação: F = (C - (1-a)B) / a, misturada à cor dos vizinhos quando a é baixo
    a = alpha[..., None]
    unmixed = np.clip((rgb - (1 - a) * bg) / np.maximum(a, 0.2), 0, 255)
    trust = np.clip((a - 0.2) / 0.6, 0, 1)
    color = np.where(core[..., None], rgb, unmixed * trust + fg_col * (1 - trust))
    if red_key:
        # Nesses retratos nada na pessoa é vermelho saturado: na borda, a cromaticidade vem da cor
        # interna vizinha (cabelo/pele/roupa) e só o brilho do pixel é mantido.
        edge = ~core[..., None]
        lum = lambda c: c @ np.array([0.299, 0.587, 0.114], np.float32)
        ratio = np.clip(lum(color) / np.maximum(lum(fg_col), 1.0), 0.6, 1.4)[..., None]
        color = np.where(edge, fg_col * ratio, color)
        # Reflexo do fundo nos cachos (alguns px para dentro do contorno): o fundo tem B > G, então
        # o reflexo puxa para magenta. A pele tem G > B e fica intacta.
        R, G, B = color[..., 0], color[..., 1], color[..., 2]
        depth = ndi.distance_transform_edt(alpha > 0.5)
        reach = np.clip((45 * scale - depth) / (20 * scale), 0, 1)  # total até 25 px, some aos 45 px
        redness = R - np.maximum(G, B)
        magenta = (B >= G - 2) & (redness > 18)          # reflexo frio (cachos do Miguel)
        hot = ~magenta & (redness > 0.5 * R) & (R > 110)  # vermelho vivo nas pontas do cabelo do Funny
        target_r = np.where(magenta, np.maximum(G, B) + 12, np.maximum(G, B) * 1.3)
        w_sp = reach * (magenta | hot)
        color[..., 0] = R - w_sp * np.maximum(R - target_r, 0)
        color[..., 2] = B - w_sp * magenta * np.maximum(B - (G + 6), 0)
    color = np.clip(color, 0, 255)

    # 6. remove ilhas soltas (resíduos do fundo) fora da pessoa
    solid = alpha > 0.02
    labels, n = ndi.label(solid)
    if n:
        sizes = ndi.sum(solid, labels, index=np.arange(1, n + 1))
        keep = np.zeros(n + 1, bool)
        keep[1:] = sizes > sizes.max() * 0.01
        alpha *= keep[labels]

    return np.dstack([color, alpha * 255])


def to_image(rgba: np.ndarray) -> Image.Image:
    img = Image.fromarray(np.round(rgba).clip(0, 255).astype(np.uint8), 'RGBA')
    bbox = img.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
    img = img.crop(bbox)
    if img.height > MAX_HEIGHT:
        size = (round(img.width * MAX_HEIGHT / img.height), MAX_HEIGHT)
        # redimensiona em alfa pré-multiplicado para não escurecer nem tingir as bordas
        img = img.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')
    return img


def save_preview(img: Image.Image, name: str, folder: str) -> None:
    os.makedirs(folder, exist_ok=True)
    tiles = []
    for bg in ((255, 255, 255), (40, 180, 70), (10, 10, 10), (255, 85, 0)):
        t = Image.new('RGBA', img.size, bg + (255,))
        t.alpha_composite(img)
        tiles.append(t.convert('RGB'))
    sheet = Image.new('RGB', (img.width * len(tiles), img.height))
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * img.width, 0))
    sheet.save(os.path.join(folder, f'{name}_prev.jpg'), quality=88)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('names', nargs='*', default=list(PORTRAITS), choices=list(PORTRAITS))
    parser.add_argument('--preview', metavar='PASTA', help='salva prévias sobre branco, verde, preto e laranja')
    args = parser.parse_args()

    for name in args.names:
        rgb = np.asarray(Image.open(os.path.join(IMG_DIR, f'{name}.png')).convert('RGB'), dtype=np.float32)
        img = to_image(cut_portrait(rgb, **PORTRAITS[name]))
        out = os.path.join(IMG_DIR, f'equipe-{name}.webp')
        img.save(out, 'WEBP', quality=WEBP_QUALITY, method=6, exact=False)
        if args.preview:
            save_preview(img, name, args.preview)
        print(f'{name}: {img.width}x{img.height} -> {os.path.relpath(out, ROOT)}')


if __name__ == '__main__':
    main()
