"""Poste de barbeiro (render próprio) para a galeria.

Requer o Blender como módulo Python (pip install bpy; o bpy 5.x exige Python 3.11).

Uso:
  python render_poste.py samples=128 out=poste.png                 # imagem estática (quadro 0), 900x1300
  python render_poste.py frame=6 frames=24 res=450x650 out=q6.png  # um quadro da rotação
  python render_poste.py sprite=../imagens/poste-sprite.webp       # sprite com os 24 quadros lado a lado

Rotação: as listras são fract(z*0.32 + ângulo*2/2π). Com o fator 2 no ângulo, o padrão se repete a
cada MEIA volta; somar frame/frames antes do fract avança 1/frames desse ciclo. Os quadros
0..frames-1 fecham um laço perfeito, e o quadro 0 é idêntico ao render estático.
O sprite (padrão: 24 quadros de 450x650, samples=96) precisa do Pillow no mesmo Python:
pip install pillow.
"""
import bpy, addon_utils, math, os, sys
from mathutils import Vector
ARGS = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
SPRITE = os.path.abspath(ARGS['sprite']) if 'sprite' in ARGS else None
OUT = os.path.abspath(ARGS.get('out', 'poste.png'))
SAMPLES = int(ARGS.get('samples', 96 if SPRITE else 128)); PCT = int(ARGS.get('pct', 100))
FRAMES = int(ARGS.get('frames', 24)); FRAME = int(ARGS.get('frame', 0))
RES = tuple(int(v) for v in ARGS.get('res', '450x650' if SPRITE else '900x1300').split('x'))
addon_utils.enable("cycles", default_set=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable("cycles", default_set=True)
sc = bpy.context.scene

def mat(name, base, metal=0.0, rough=0.4, trans=0.0, ior=1.45, emit=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough; b.inputs['Transmission Weight'].default_value = trans; b.inputs['IOR'].default_value = ior
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = es
    return m

chrome = mat('chrome', (0.85, 0.85, 0.88), 1, 0.24)
glass = mat('glass', (1, 1, 1), 0, 0.02, trans=1.0, ior=1.5)

# listras helicoidais
stripe = bpy.data.materials.new('stripe'); stripe.use_nodes = True
nt = stripe.node_tree; n = nt.nodes; l = nt.links
b = n['Principled BSDF']; b.inputs['Roughness'].default_value = 0.35
tc = n.new('ShaderNodeTexCoord'); sep = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sep.inputs[0])
at = n.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; l.new(sep.outputs['Y'], at.inputs[0]); l.new(sep.outputs['X'], at.inputs[1])
mz = n.new('ShaderNodeMath'); mz.operation = 'MULTIPLY'; mz.inputs[1].default_value = 0.32; l.new(sep.outputs['Z'], mz.inputs[0])
ma = n.new('ShaderNodeMath'); ma.operation = 'MULTIPLY'; ma.inputs[1].default_value = 2 / (2 * math.pi); l.new(at.outputs[0], ma.inputs[0])
ad = n.new('ShaderNodeMath'); ad.operation = 'ADD'; l.new(mz.outputs[0], ad.inputs[0]); l.new(ma.outputs[0], ad.inputs[1])
# fase da rotação (0 = render estático original); 1.0 = meia volta = um ciclo completo do padrão
phase = n.new('ShaderNodeMath'); phase.operation = 'ADD'; phase.inputs[1].default_value = FRAME / FRAMES
l.new(ad.outputs[0], phase.inputs[0])
fr = n.new('ShaderNodeMath'); fr.operation = 'FRACT'; l.new(phase.outputs[0], fr.inputs[0])
ramp = n.new('ShaderNodeValToRGB'); l.new(fr.outputs[0], ramp.inputs['Fac'])
cr = ramp.color_ramp; cr.interpolation = 'CONSTANT'
cr.elements[0].position = 0.0; cr.elements[0].color = (1.0, 0.16, 0.0, 1)
cr.elements[1].position = 0.33; cr.elements[1].color = (0.9, 0.88, 0.85, 1)
e = cr.elements.new(0.66); e.color = (0.015, 0.015, 0.015, 1)
l.new(ramp.outputs['Color'], b.inputs['Base Color'])
em = n.new('ShaderNodeMath'); em.operation = 'MULTIPLY'; em.inputs[1].default_value = 0.0
b.inputs['Emission Strength'].default_value = 0.35; l.new(ramp.outputs['Color'], b.inputs['Emission Color'])

bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=7.0, vertices=128, location=(0, 0, 0))
core = bpy.context.active_object; core.data.materials.append(stripe); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cylinder_add(radius=1.18, depth=7.2, vertices=128, location=(0, 0, 0))
g = bpy.context.active_object; g.data.materials.append(glass); bpy.ops.object.shade_smooth()
for z, s in ((3.75, 1), (-3.75, -1)):
    bpy.ops.mesh.primitive_cylinder_add(radius=1.36, depth=0.5, vertices=128, location=(0, 0, z))
    c = bpy.context.active_object; c.data.materials.append(chrome); bpy.ops.object.shade_smooth()
    bv = c.modifiers.new('bv', 'BEVEL'); bv.width = 0.12; bv.segments = 4
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.95, location=(0, 0, z + s * 0.25), segments=64, ring_count=32)
    d = bpy.context.active_object; d.scale = (1, 1, 0.55); d.data.materials.append(chrome); bpy.ops.object.shade_smooth()

def area(loc, sx, sy, energy, color=(1, 1, 1), target=(0, 0, 0)):
    ld = bpy.data.lights.new('a', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy; ld.energy = energy; ld.color = color
    o = bpy.data.objects.new('a', ld); bpy.context.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area((-7, -8, 4), 3, 12, 2600)
area((7, -4, 2), 1.2, 14, 1800)
area((3, 7, 3), 2, 14, 7000, (1, 0.32, 0.06))
area((0, -20, 9), 12, 3, 900)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.003, 0.003, 1)

cd = bpy.data.cameras.new('c'); cd.lens = 70
cam = bpy.data.objects.new('c', cd); bpy.context.collection.objects.link(cam); sc.camera = cam
cam.location = (2.5, -20, 4.5); cam.rotation_euler = (Vector((0, 0, 0.2)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = PCT
sc.cycles.seed = 0   # mesma semente em todos os quadros: o ruído não "ferve" entre eles
try:
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception:
    pass

if not SPRITE:
    sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('DONE')
else:
    # renderiza os quadros 0..FRAMES-1 e junta lado a lado num único WebP
    from PIL import Image
    import tempfile
    tmp = tempfile.mkdtemp(prefix='poste_')
    paths = []
    for f in range(FRAMES):
        phase.inputs[1].default_value = f / FRAMES
        sc.render.filepath = os.path.join(tmp, f'q{f:02d}.png')
        bpy.ops.render.render(write_still=True)
        paths.append(sc.render.filepath)
        print(f'quadro {f + 1}/{FRAMES}', flush=True)
    frames = [Image.open(p).convert('RGB') for p in paths]
    w, h = frames[0].size
    sheet = Image.new('RGB', (w * FRAMES, h))
    for i, im in enumerate(frames):
        sheet.paste(im, (i * w, 0))
    os.makedirs(os.path.dirname(SPRITE), exist_ok=True)
    sheet.save(SPRITE, 'WEBP', quality=82, method=6)
    print(f'DONE sprite {sheet.size[0]}x{sheet.size[1]} ({FRAMES} quadros de {w}x{h}) -> {SPRITE}')
