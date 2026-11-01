"""Monta a sequência de giro da máquina (sprite) a partir dos quadros de render_maquina.py.

Uso (no mesmo Python do bpy, com Pillow e numpy):
  python montar_giro.py quadros --altura 817 --saida ../imagens/maquina-giro-sm --formato webp
  python montar_giro.py quadros --altura 1635 --saida giro --formato avif --qualidade 55 --colunas 12

Entrada: a pasta com quadro_<ângulo>.png (render_maquina.py rolls=… outdir=…), todos com a mesma câmera.
Saída:   <saida>.webp (ou .avif) com os quadros em grade + <saida>.json com ângulos, tamanho e colunas.

Alinhamento (por que o pouso não dá pulo): o recorte é FIXO para todos os quadros e parte do render atual da
máquina. A imagem do site (--ref, padrão imagens/maquina-doug-funny.webp, 513×1635) é um corte 1:1 do render de
900×2250 (samples=160, pct=100) na posição REF_ORIGEM; medido comparando as caixas das duas imagens (escala 1,0000
nos dois eixos). Com --pct (o pct usado no render dos quadros) o recorte sai dessa conta exata, e o quadro roll=0
cai sobre a imagem do site quando exibido na mesma altura. O recorte tem a mesma altura da imagem e é mais largo,
centrado no mesmo eixo, para caber as outras faces.
"""
import argparse, glob, json, math, os, re
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('pasta')
ap.add_argument('--saida', required=True)
ap.add_argument('--pct', type=float, default=100, help='o pct usado no render dos quadros (render_maquina.py pct=...)')
ap.add_argument('--altura', type=int, default=817, help='altura de cada quadro na sprite, em px (a imagem de referência tem 1635)')
ap.add_argument('--formato', choices=['webp', 'avif'], default='webp')
ap.add_argument('--qualidade', type=int, default=82)
ap.add_argument('--colunas', type=int, default=0, help='colunas da grade (0 = automático, perto de um quadrado)')
ap.add_argument('--ref', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'imagens', 'maquina-doug-funny.webp'))
ap.add_argument('--margem', type=float, default=0.03, help='folga lateral extra, como fração da largura do recorte')
args = ap.parse_args()

REF_ORIGEM = (149, 329)   # canto do corte da imagem do site dentro do render de 900×2250 (pct=100)

def angulo(path):
    m = re.search(r'quadro_(m?)([0-9.]+)\.png$', path)
    return -float(m.group(2)) if m.group(1) else float(m.group(2))

arquivos = sorted(glob.glob(os.path.join(args.pasta, 'quadro_*.png')), key=angulo)
assert arquivos, 'nenhum quadro_*.png em ' + args.pasta
angulos = [angulo(a) for a in arquivos]
quadros = [Image.open(a).convert('RGBA') for a in arquivos]
W0, H0 = quadros[0].size
assert all(q.size == (W0, H0) for q in quadros), 'quadros com tamanhos diferentes'

def bbox(im, limiar=8):
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.where(a > limiar)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

# --- recorte fixo, ancorado na imagem de referência (conta exata, sem estimar pelas bordas) ---
i0 = angulos.index(0.0) if 0.0 in angulos else None
if i0 is None:
    raise SystemExit('é preciso o quadro roll=0 (quadro_0.png) para conferir o alinhamento com a referência')
ref = Image.open(args.ref).convert('RGBA')
f = args.pct / 100.0                      # px do render por px do render de pct=100
cw = ref.width * f; ch = ref.height * f   # tamanho do corte da referência, em px dos quadros
cx0 = REF_ORIGEM[0] * f; cy0 = REF_ORIGEM[1] * f
centro = cx0 + cw / 2
# confere a conta com as caixas da máquina (tolerância de 1,5 px: as bordas têm antisserrilhado)
rb = bbox(ref); fb = bbox(quadros[i0])
esperado = (cx0 + rb[0] * f, cy0 + rb[1] * f, cx0 + rb[2] * f, cy0 + rb[3] * f)
desvio = max(abs(a - b) for a, b in zip(esperado, fb))
print(f'confere com a caixa da máquina: esperado {tuple(round(v, 1) for v in esperado)} | medido {fb} | desvio máx {desvio:.1f}px')
assert desvio <= 1.5 + 1.5 * f, 'o quadro roll=0 não cai onde a imagem do site foi recortada: confira o pct e a câmera'
# largura necessária para todas as faces: união das caixas, simétrica em torno do mesmo eixo
ux0 = min(bbox(q)[0] for q in quadros); ux1 = max(bbox(q)[2] for q in quadros)
meia = max(centro - ux0, ux1 - centro) + args.margem * cw
meia = max(meia, cw / 2)
x0 = centro - meia; x1 = centro + meia
y0 = cy0; y1 = cy0 + ch
s = 1 / f
print(f'recorte no render: x {x0:.2f}→{x1:.2f} ({x1 - x0:.2f}px) y {y0:.2f}→{y1:.2f} ({y1 - y0:.2f}px) | união das caixas x {ux0}→{ux1}')

# --- recorta, reduz e monta a grade ---
altura = args.altura
largura = int(round((x1 - x0) / (y1 - y0) * altura))
largura += largura % 2
n = len(quadros)
cols = args.colunas or max(1, round(math.sqrt(n * altura / largura)))
rows = math.ceil(n / cols)
folha = Image.new('RGBA', (cols * largura, rows * altura), (0, 0, 0, 0))
for i, q in enumerate(quadros):
    c = q.resize((largura, altura), Image.LANCZOS, box=(x0, y0, x1, y1))              # corte fracionário; RGBA reduz com alfa pré-multiplicado
    folha.paste(c, ((i % cols) * largura, (i // cols) * altura))
assert max(folha.size) <= 16383, f'a folha {folha.size} passa do limite de 16383 px do WebP; aumente --colunas ou reduza --altura'

destino = args.saida + '.' + args.formato
if args.formato == 'webp':
    folha.save(destino, 'WEBP', quality=args.qualidade, alpha_quality=min(100, args.qualidade + 10), method=6)
else:
    folha.save(destino, 'AVIF', quality=args.qualidade, speed=6)
info = {
    'angulos': angulos, 'quadros': n, 'larguraQuadro': largura, 'alturaQuadro': altura, 'colunas': cols, 'linhas': rows,
    'folha': list(folha.size), 'proporcao': round(largura / altura, 5),
    'referencia': {'arquivo': os.path.basename(args.ref), 'largura': ref.width, 'altura': ref.height, 'caixaMaquina': list(map(int, rb))},
    'recorteNoRender': [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)],
    'escalaRefPorRender': round(s, 5), 'pct': args.pct
}   # sem formato/qualidade: o mesmo .json vale para o .webp e para o .avif
with open(args.saida + '.json', 'w') as f:
    json.dump(info, f, indent=1)
kb = os.path.getsize(destino) / 1024
print(f'OK {destino}: {n} quadros de {largura}x{altura}, grade {cols}x{rows} = {folha.size[0]}x{folha.size[1]}, {kb:.0f} KB ({kb / n:.1f} KB/quadro)')
