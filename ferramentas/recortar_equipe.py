"""Remove o fundo vermelho dos retratos da equipe (chroma key + remoção de vazamento).

Uso: python recortar_equipe.py  -> gera cut/<nome>.png com transparência
"""
from PIL import Image, ImageFilter
import numpy as np, sys
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'imagens') + '/'
os.makedirs('cut', exist_ok=True)
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
for name in ('funny', 'miguel', 'thaylor'):
    im = np.array(Image.open(SRC + name + '.png').convert('RGB')).astype(np.float32)
    R, G, B = im[..., 0], im[..., 1], im[..., 2]
    red = R - np.maximum(G, B)
    bg = ss(85, 125, red) * ss(110, 170, R)
    a = 1 - bg
    A = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    a = np.array(A).astype(np.float32) / 255
    # tirar vazamento vermelho nas bordas
    edge = np.array(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))).astype(np.float32) / 255
    spill = (edge < 0.99) & (red > 25)
    lim = np.maximum(G, B) + 14
    R2 = np.where(spill, np.minimum(R, lim), R)
    out = np.dstack([R2, G, B, a * 255]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')
    bbox = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    img = img.crop(bbox)
    img.save(f'cut/{name}.png')
    prev = Image.new('RGBA', img.size, (14, 12, 11, 255)); prev.alpha_composite(img)
    prev.convert('RGB').resize((img.width * 360 // img.height, 360)).save(f'cut/{name}_prev.jpg')
    print(name, img.size)
