"""Modelo e render da máquina de corte Doug Funny (Blender/Cycles, sem assets externos).

Uso (com o módulo bpy instalado: pip install bpy):
  python render_maquina.py view=hero samples=160 pct=100 out=maquina.png   # imagem do hero (fundo transparente)
  python render_maquina.py view=macro samples=128 pct=100 out=detalhe.png  # close da gravação
Depois converta para WebP (ver DESIGN.md, seção Imagens).
"""
import bpy, addon_utils, math, os, sys
from mathutils import Vector, Euler

ARGS = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
SAMPLES = int(ARGS.get('samples', 24))
PCT = int(ARGS.get('pct', 40))
OUT = os.path.abspath(ARGS.get('out', 'maquina_preview.png'))
VIEW = ARGS.get('view', 'hero')
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Anton-Regular.ttf')

addon_utils.enable("cycles", default_set=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable("cycles", default_set=True)
sc = bpy.context.scene

# ---------- materiais ----------
def principled(name, base, metallic=0.0, rough=0.4, aniso=0.0, emit=None, emit_str=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    if 'Anisotropic' in b.inputs: b.inputs['Anisotropic'].default_value = aniso
    if coat and 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_str
    return m

ORANGE = (1.0, 0.18, 0.0)
M_CHROME = principled('chrome', (0.92, 0.92, 0.95), 1.0, 0.07)
M_SATIN = principled('satin', (0.8, 0.8, 0.83), 1.0, 0.22, aniso=0.55)
M_STEEL = principled('steel', (0.78, 0.78, 0.8), 1.0, 0.28, aniso=0.7)
M_DARKSTEEL = principled('darksteel', (0.35, 0.35, 0.37), 1.0, 0.3, aniso=0.5)
M_PIANO = principled('piano', (0.008, 0.008, 0.009), 0.0, 0.12, coat=1.0)
M_HOUSING = principled('housing', (0.012, 0.012, 0.013), 0.0, 0.32)
M_ORANGE = principled('orange', ORANGE, 0.35, 0.28, emit=ORANGE, emit_str=0.6)
M_LED = principled('led', ORANGE, 0.0, 0.3, emit=(1.0, 0.3, 0.02), emit_str=12.0)

def rubber_knurl():
    m = principled('rubber', (0.018, 0.018, 0.02), 0.0, 0.55)
    nt = m.node_tree; n = nt.nodes; l = nt.links
    b = n['Principled BSDF']
    tc = n.new('ShaderNodeTexCoord')
    waves = []
    for rot in (math.radians(45), math.radians(-45)):
        mp = n.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, rot, 0)
        w = n.new('ShaderNodeTexWave'); w.wave_type = 'BANDS'; w.bands_direction = 'X'
        w.inputs['Scale'].default_value = 3.2; w.inputs['Distortion'].default_value = 0
        w.wave_profile = 'TRI'
        l.new(tc.outputs['Object'], mp.inputs['Vector']); l.new(mp.outputs['Vector'], w.inputs['Vector'])
        waves.append(w)
    mul = n.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    l.new(waves[0].outputs['Fac'], mul.inputs[0]); l.new(waves[1].outputs['Fac'], mul.inputs[1])
    bump = n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.9; bump.inputs['Distance'].default_value = 0.05
    l.new(mul.outputs['Value'], bump.inputs['Height']); l.new(bump.outputs['Normal'], b.inputs['Normal'])
    return m
M_RUBBER = rubber_knurl()

# ---------- utilitários de modelagem ----------
def apply_mods(o):
    bpy.context.view_layer.objects.active = o
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)

def rbox(name, size, loc=(0, 0, 0), bevel=0.3, seg=5, sub=1, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name
    o.scale = size; bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = seg; bv.limit_method = 'NONE'
    if sub:
        ss = o.modifiers.new('ss', 'SUBSURF'); ss.levels = sub; ss.render_levels = sub
    if mat: o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o

def boolean(target, cutter, op='INTERSECT'):
    md = target.modifiers.new('bool', 'BOOLEAN'); md.operation = op; md.object = cutter; md.solver = 'EXACT'
    apply_mods(target); bpy.data.objects.remove(cutter)
    target.data.materials.clear()
    for poly in target.data.polygons: poly.material_index = 0

def dup(o, name, scale=(1, 1, 1)):
    n = o.copy(); n.data = o.data.copy(); n.name = name
    bpy.context.collection.objects.link(n)
    n.scale = scale
    bpy.context.view_layer.objects.active = n
    for ob in bpy.context.selected_objects: ob.select_set(False)
    n.select_set(True); bpy.ops.object.transform_apply(scale=True)
    n.data.materials.clear()
    return n

def cutter_box(zmin, zmax, xr=5, ymin=-5, ymax=5):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, (ymin + ymax) / 2, (zmin + zmax) / 2))
    c = bpy.context.active_object; c.scale = (xr * 2, ymax - ymin, zmax - zmin)
    bpy.ops.object.transform_apply(scale=True)
    return c

parts = []

# ---------- corpo ----------
import bmesh
def interp(z, pts):
    for (z0, v0), (z1, v1) in zip(pts, pts[1:]):
        if z0 <= z <= z1:
            t = (z - z0) / (z1 - z0); t = t * t * (3 - 2 * t)
            return v0 + (v1 - v0) * t
    return pts[0][1] if z < pts[0][0] else pts[-1][1]
A = [(-4.5, 1.00), (-2.6, 1.05), (-0.4, 0.99), (2.2, 1.07), (4.4, 1.2)]   # meia-largura
B = [(-4.5, 0.86), (-2.6, 0.88), (-0.4, 0.82), (2.6, 0.9), (4.4, 0.8)]    # meia-profundidade
def squircle(a, b, n=4.2, k=56):
    pts = []
    for i in range(k):
        t = 2 * math.pi * i / k; c, s_ = math.cos(t), math.sin(t)
        pts.append((a * math.copysign(abs(c) ** (2 / n), c), b * math.copysign(abs(s_) ** (2 / n), s_)))
    return pts
bm = bmesh.new(); rings = []
zs = [-4.5 + 8.9 * i / 60 for i in range(61)]
# fundo arredondado: anéis extras abaixo de -4.5
caps = [(-4.5 - 0.32 * (1 - math.cos(math.radians(d))), math.sin(math.radians(90 - d)) ** 0.5) for d in (75, 55, 35, 15)]
for zc, f in caps[::-1]:
    rings.append([bm.verts.new((x * (0.35 + 0.65 * f), y * (0.35 + 0.65 * f), zc)) for x, y in squircle(interp(-4.5, A), interp(-4.5, B))])
for z in zs:
    rings.append([bm.verts.new((x, y, z)) for x, y in squircle(interp(z, A), interp(z, B))])
k = len(rings[0])
for r0, r1 in zip(rings, rings[1:]):
    for i in range(k):
        bm.faces.new((r0[i], r0[(i + 1) % k], r1[(i + 1) % k], r1[i]))
bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
me = bpy.data.meshes.new('body'); bm.to_mesh(me); bm.free()
body = bpy.data.objects.new('body', me); bpy.context.collection.objects.link(body)
bpy.context.view_layer.objects.active = body; body.select_set(True)
ss = body.modifiers.new('ss', 'SUBSURF'); ss.levels = 1; apply_mods(body)
bpy.ops.object.shade_smooth()
body.data.materials.append(M_SATIN); parts.append(body)

# punho de borracha (metade inferior)
grip = dup(body, 'grip', (1.018, 1.025, 1.0)); boolean(grip, cutter_box(-5.2, -0.35))
grip.data.materials.append(M_RUBBER); bpy.ops.object.shade_smooth(); parts.append(grip)

# anel laranja
ring = dup(body, 'ring', (1.03, 1.04, 1.0)); boolean(ring, cutter_box(-0.35, -0.12))
ring.data.materials.append(M_ORANGE); parts.append(ring)

# tampa inferior cromada
cap = dup(body, 'cap', (1.03, 1.04, 1.0)); boolean(cap, cutter_box(-5.2, -4.3))
cap.data.materials.append(M_CHROME); parts.append(cap)

# painel frontal preto (janela no cromado)
panel = dup(body, 'panel', (1.012, 1.02, 1.0)); boolean(panel, cutter_box(0.15, 3.55, xr=0.78, ymin=-5, ymax=-0.2))
bv = panel.modifiers.new('bv', 'BEVEL'); bv.width = 0.03; bv.segments = 2; apply_mods(panel)
panel.data.materials.append(M_PIANO); bpy.ops.object.shade_smooth(); parts.append(panel)

front_y = min(v.co.y for v in panel.data.vertices)

# gravação DOUG FUNNY (vertical, lendo de baixo para cima)
bpy.ops.object.text_add(location=(0, front_y - 0.004, 1.85))
txt = bpy.context.active_object; txt.name = 'brand'
txt.data.body = 'DOUG FUNNY'
if os.path.exists(FONT): txt.data.font = bpy.data.fonts.load(FONT)
txt.data.size = 0.62; txt.data.extrude = 0.012; txt.data.align_x = 'CENTER'; txt.data.align_y = 'CENTER'
txt.rotation_euler = (math.radians(90), math.radians(-90), 0)
txt.data.materials.append(M_ORANGE); parts.append(txt)

# botão com LED
bpy.ops.mesh.primitive_cylinder_add(radius=0.26, depth=0.14, location=(0, front_y - 0.03, -0.75), rotation=(math.radians(90), 0, 0))
btn = bpy.context.active_object; btn.data.materials.append(M_CHROME); bpy.ops.object.shade_smooth()
bv = btn.modifiers.new('bv', 'BEVEL'); bv.width = 0.04; bv.segments = 3; parts.append(btn)
bpy.ops.mesh.primitive_torus_add(major_radius=0.34, minor_radius=0.028, location=(0, front_y + 0.0, -0.75), rotation=(math.radians(90), 0, 0))
led = bpy.context.active_object; led.data.materials.append(M_LED); bpy.ops.object.shade_smooth(); parts.append(led)

# ---------- cabeça / lâminas ----------
top_z = max(v.co.z for v in body.data.vertices)
housing = rbox('housing', (2.75, 1.45, 0.95), loc=(0, -0.05, top_z + 0.18), bevel=0.22, seg=4, sub=1, mat=M_HOUSING)
parts.append(housing)

# lâmina fixa (com dentes)
blade_y = -0.82
sb = rbox('statblade', (2.9, 0.12, 0.9), loc=(0, blade_y, top_z + 0.4), bevel=0.0, seg=2, sub=0, mat=M_STEEL)
for v in sb.data.vertices:
    if v.co.z < 0: v.co.x *= 0.84
bv = sb.modifiers.new('bv', 'BEVEL'); bv.width = 0.035; bv.segments = 2; parts.append(sb)
teeth_n = 31; span = 2.86; sp = span / (teeth_n - 1)
bpy.ops.mesh.primitive_cube_add(size=1, location=(-span / 2, blade_y - 0.035, top_z + 0.94))
t = bpy.context.active_object; t.scale = (0.05, 0.1, 0.32); bpy.ops.object.transform_apply(scale=True)
for v in t.data.vertices:
    if v.co.z > 0: v.co.x *= 0.45; v.co.y *= 0.6
ar = t.modifiers.new('ar', 'ARRAY'); ar.count = teeth_n; ar.use_relative_offset = False; ar.use_constant_offset = True
ar.constant_offset_displace = (sp, 0, 0)
bv = t.modifiers.new('bv', 'BEVEL'); bv.width = 0.008; bv.segments = 2
t.data.materials.append(M_STEEL); parts.append(t)

# lâmina de corte (atrás, dentes menores)
cb = rbox('cutblade', (2.55, 0.1, 0.6), loc=(0, blade_y + 0.15, top_z + 0.5), bevel=0.03, seg=2, sub=0, mat=M_DARKSTEEL); parts.append(cb)
bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.25, blade_y + 0.15, top_z + 0.92))
t2 = bpy.context.active_object; t2.scale = (0.05, 0.08, 0.26); bpy.ops.object.transform_apply(scale=True)
for v in t2.data.vertices:
    if v.co.z > 0: v.co.x *= 0.4
ar = t2.modifiers.new('ar', 'ARRAY'); ar.count = 27; ar.use_relative_offset = False; ar.use_constant_offset = True
ar.constant_offset_displace = (2.5 / 26, 0, 0)
t2.data.materials.append(M_DARKSTEEL); parts.append(t2)

# parafusos da lâmina
for x in (-0.85, 0.85):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.06, location=(x, blade_y - 0.07, top_z + 0.3), rotation=(math.radians(90), 0, 0))
    s = bpy.context.active_object; s.data.materials.append(M_CHROME); bpy.ops.object.shade_smooth(); parts.append(s)

# alavanca de ajuste (lado direito)
side_x = max(v.co.x for v in body.data.vertices)
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.18, location=(side_x - 0.02, 0.0, top_z - 0.55), rotation=(0, math.radians(90), 0))
pv = bpy.context.active_object; pv.data.materials.append(M_CHROME); bpy.ops.object.shade_smooth(); parts.append(pv)
lever = rbox('lever', (0.1, 0.22, 1.55), loc=(side_x + 0.06, 0.0, top_z - 1.25), bevel=0.05, seg=3, sub=1, mat=M_CHROME)
lever.rotation_euler = (math.radians(-8), 0, 0); parts.append(lever)

# ---------- alinhar dentes ao centro medido das lâminas ----------
def center_x(ob):
    dg = bpy.context.evaluated_depsgraph_get(); e = ob.evaluated_get(dg)
    xs = [(e.matrix_world @ Vector(c)).x for c in e.bound_box]
    return (min(xs) + max(xs)) / 2
bpy.context.view_layer.update()
for teeth, plate in ((t, sb), (t2, cb)):
    teeth.location.x += center_x(plate) - center_x(teeth)
bpy.context.view_layer.update()

# ---------- agrupar e posar ----------
root = bpy.data.objects.new('clipper', None); bpy.context.collection.objects.link(root)
for p in parts: p.parent = root
pose = {'hero': (math.radians(4), 0, math.radians(-30)), 'macro': (math.radians(28), 0, math.radians(-22))}[VIEW]
root.rotation_euler = pose

# ---------- luz ----------
def area(name, loc, size, energy, color=(1, 1, 1), shape='RECTANGLE', sx=None, sy=None, target=(0, 0, 0.5)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.color = color; ld.shape = shape
    ld.size = sx or size; ld.size_y = sy or size
    o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o); o.location = loc
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return o

area('key', (-8, -9, 7), 0, 4200, sx=7, sy=9)
area('strip', (8, -5, 1), 0, 2600, sx=1.2, sy=14)
area('rim_orange', (4, 8, 3), 0, 9000, color=(1.0, 0.3, 0.05), sx=2.2, sy=14)
area('rim_left', (-6, 7, 2), 0, 1800, color=(1.0, 0.55, 0.3), sx=1.5, sy=12)
area('top', (0, -3, 13), 0, 900, sx=4, sy=2)
area('refl_high', (-3, -34, 10), 0, 2600, sx=16, sy=4.5, target=(0, 0, 2))
area('refl_low', (4, -30, -7), 0, 500, sx=10, sy=2.5, target=(0, 0, -2))
area('refl_side', (-14, -14, 2), 0, 1400, sx=1.6, sy=16, target=(0, 0, 0))

w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.003, 0.003, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0

# ---------- câmera ----------
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 100 if VIEW == 'hero' else 135
cam = bpy.data.objects.new('cam', cam_d); bpy.context.collection.objects.link(cam); sc.camera = cam
if VIEW == 'hero':
    cam.location = (0, -40, 2.0); tgt = Vector((0, 0, 0.55))
else:
    bpy.context.view_layer.update()
    tgt = sb.matrix_world.translation + Vector((0.0, 0, 0.35))
    cam.location = tgt + Vector((2.6, -10.5, 3.2))
cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()

# ---------- render ----------
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.film_transparent = True
if VIEW == 'hero':
    sc.render.resolution_x, sc.render.resolution_y = 900, 2250
else:
    sc.render.resolution_x, sc.render.resolution_y = 1600, 1100
sc.render.resolution_percentage = PCT
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try:
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception as e:
    print('look fallback', e)
sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('DONE', OUT)
