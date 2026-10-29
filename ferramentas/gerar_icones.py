"""Gera o ícone do site e a imagem de compartilhamento (Open Graph) a partir de arquivos do projeto.

Uso (na raiz do projeto ou em qualquer pasta):
    pip install pillow numpy
    python ferramentas/gerar_icones.py

Saída:
    favicon.ico                         16/32/48 px (raiz do site, pedido automático dos navegadores)
    imagens/icone-32.png                ícone da aba
    imagens/icone-180.png               ícone da tela inicial do iPhone (apple-touch-icon)
    imagens/icone-512.png               ícone grande (instalação / buscadores)
    imagens/compartilhamento.jpg        1200x630, prévia em WhatsApp, Instagram, Facebook etc.

Usa só o que já existe no projeto: a fonte Anton (ferramentas/Anton-Regular.ttf) e o render da
máquina (imagens/maquina-doug-funny.webp). Os textos são os mesmos do site.
"""
from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IMG = os.path.join(ROOT, 'imagens')
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Anton-Regular.ttf')

BG = (10, 10, 10)
ORANGE = (255, 85, 0)
TEXT = (245, 243, 240)
MUTED = (168, 162, 158)


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size)


def radial(w: int, h: int, cx: float, cy: float, rx: float, ry: float, color, strength: float) -> np.ndarray:
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x - cx * w) / (rx * w)) ** 2 + ((y - cy * h) / (ry * h)) ** 2)
    t = np.clip(1 - d, 0, 1) ** 1.6 * strength
    return t[..., None] * np.array(color, np.float32)


# ---------------------------------------------------------------- ícone
def make_icon(size: int) -> Image.Image:
    s = size * 4  # desenha grande e reduz, para bordas limpas
    img = Image.new('RGB', (s, s), BG)
    d = ImageDraw.Draw(img)
    f = font(int(s * 0.66))
    box = d.textbbox((0, 0), 'DF', font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((s - tw) / 2 - box[0], (s - th) / 2 - box[1]), 'DF', font=f, fill=ORANGE)
    # a "linha de corte" do hero, atravessando as letras
    if size >= 32:
        lw = max(2, s // 40)
        d.line([(s * 0.08, s * 0.72), (s * 0.92, s * 0.28)], fill=TEXT, width=lw)
    return img.resize((size, size), Image.LANCZOS)


# ---------------------------------------------------------------- Open Graph
def make_og() -> Image.Image:
    W, H = 1200, 630
    base = np.full((H, W, 3), BG, np.float32)
    base += radial(W, H, 0.62, 0.52, 0.42, 0.62, ORANGE, 0.32)
    base += radial(W, H, 0.90, 0.95, 0.30, 0.45, ORANGE, 0.22)
    img = Image.fromarray(base.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')

    # "BARBEARIA" gigante em degradê metálico, como no hero
    word = 'BARBEARIA'
    f = font(250)
    mask = Image.new('L', (W, H), 0)
    md = ImageDraw.Draw(mask)
    box = md.textbbox((0, 0), word, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    wx, wy = (W - tw) / 2 - box[0], H * 0.47 - th / 2 - box[1]
    md.text((wx, wy), word, font=f, fill=255)
    top, bot = wy + box[1], wy + box[3]
    yy = np.clip((np.arange(H, dtype=np.float32) - top) / max(bot - top, 1), 0, 1)
    stops = np.array([0, 0.38, 0.72, 1.0])
    cols = np.array([[255, 255, 255], [228, 225, 220], [169, 165, 160], [111, 107, 103]], np.float32)
    grad = np.stack([np.interp(yy, stops, cols[:, c]) for c in range(3)], -1)
    metal = Image.fromarray(np.repeat(grad[:, None, :], W, 1).astype(np.uint8), 'RGB').convert('RGBA')
    metal.putalpha(mask)
    img.alpha_composite(metal)

    # máquina atravessando a palavra
    clipper = Image.open(os.path.join(IMG, 'maquina-doug-funny.webp')).convert('RGBA')
    ch = 560
    clipper = clipper.resize((round(clipper.width * ch / clipper.height), ch), Image.LANCZOS)
    clipper = clipper.rotate(32, resample=Image.BICUBIC, expand=True)
    shadow = Image.new('RGBA', clipper.size, (0, 0, 0, 0))
    shadow.putalpha(clipper.getchannel('A').point(lambda v: int(v * 0.7)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    cx, cy = int(W * 0.60), int(H * 0.52)
    pos = (cx - clipper.width // 2, cy - clipper.height // 2)
    img.alpha_composite(shadow, (pos[0], pos[1] + 30))
    img.alpha_composite(clipper, pos)

    d = ImageDraw.Draw(img)
    d.text((64, 52), 'STUDIO DOUG FUNNY', font=font(54), fill=ORANGE)
    d.text((64, H - 96), 'BARBEARIA & FORMAÇÃO PROFISSIONAL', font=font(32), fill=TEXT)
    d.text((64, H - 56), 'BARRETOS – SP · DESDE 2014', font=font(24), fill=MUTED)
    return img.convert('RGB')


def main() -> None:
    icons = {n: make_icon(n) for n in (16, 32, 48, 180, 512)}
    icons[32].save(os.path.join(IMG, 'icone-32.png'), optimize=True)
    icons[180].save(os.path.join(IMG, 'icone-180.png'), optimize=True)
    icons[512].save(os.path.join(IMG, 'icone-512.png'), optimize=True)
    icons[48].save(os.path.join(ROOT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)],
                   append_images=[icons[16], icons[32]])
    make_og().save(os.path.join(IMG, 'compartilhamento.jpg'), quality=86, optimize=True, progressive=True)
    print('ok: favicon.ico, imagens/icone-{32,180,512}.png, imagens/compartilhamento.jpg')


if __name__ == '__main__':
    main()
