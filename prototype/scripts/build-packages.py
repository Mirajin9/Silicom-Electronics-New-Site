"""Semiconductor package models at JEDEC outline dimensions. Blender 5.x, no add-ons.
Run: blender --background --python scripts/build-packages.py

Scale: 1 Blender unit = 10 mm. Nominal outlines (typical datasheet values):
  TO-220AB  body 10.0 x 9.2 x 4.5 mm, nickel tab 1.3 mm thick to 15.9 mm, hole 3.8 mm,
            leads 0.8 mm (1.3 mm shoulders) at 2.54 mm pitch, 13 mm long
  TO-247AD  body 15.9 x 20.9 x 5.0 mm, hole 3.6 mm through the body, exposed metal back,
            leads 1.2 mm (2.2 mm shoulders) at 5.45 mm pitch, 20 mm long
  QFN-32    5.0 x 5.0 x 0.9 mm, 32 pads 0.25 x 0.4 mm at 0.5 mm pitch flush with the
            sides, 3.1 mm exposed thermal pad, pin-1 dot
  SOT-23    body 2.9 x 1.3 x 1.0 mm, three gull-wing leads 0.4 mm wide (two at 1.9 mm
            pitch, one opposite), 2.4 mm across the leads
The parts carry no invented markings: they illustrate package families, not SKUs.
"""
import bpy, math, os
from mathutils import Vector
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public')
SOURCES = os.path.join(ROOT, 'model-source')
os.makedirs(os.path.join(SOURCES, 'glb'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'images', 'packages'), exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)


def material(name, color, metal=0.0, rough=0.4):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    return m


EPOXY = material('Moulded epoxy', (0.018, 0.02, 0.024), 0, 0.42)
EJECTOR = material('Ejector pin mark', (0.03, 0.033, 0.038), 0, 0.62)
TIN = material('Matte tin leads', (0.70, 0.71, 0.73), 1.0, 0.36)
NICKEL = material('Nickel plated tab', (0.66, 0.66, 0.66), 1.0, 0.24)
PIN1 = material('Pin one dimple', (0.045, 0.048, 0.055), 0, 0.75)


def finish(o, name, mat, bevel=0.0):
    o.name = name; o.data.materials.append(mat)
    if bevel:
        m = o.modifiers.new('Edge radius', 'BEVEL'); m.width = bevel; m.segments = 3
        bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)
        for f in o.data.polygons:
            f.use_smooth = True
        m = o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL'); m.keep_sharp = True; bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def box(name, loc, dims, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object
    o.dimensions = dims; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, name, mat, bevel)


def cylinder(name, loc, radius, depth, mat, rotation=(math.pi / 2, 0, 0), bevel=0.0, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    return finish(bpy.context.object, name, mat, bevel)


def drill(target, loc, radius, rotation=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=radius, depth=2, location=loc, rotation=rotation); cut = bpy.context.object
    m = target.modifiers.new('Mounting hole', 'BOOLEAN'); m.object = cut; m.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = target; bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(cut, do_unlink=True)


def group(name, build):
    before = set(bpy.data.objects); build()
    root = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(root)
    for o in set(bpy.data.objects) - before - {root}:
        o.parent = root
    return root


def to220():
    # Body front face at -y; the tab sits flush with the body's back face.
    w, h, d = 1.00, 0.92, 0.45
    body = box('Epoxy body', (0, 0, h / 2), (w, d, h), EPOXY, 0.03)
    tab_h, tab_t = 1.59, 0.13
    tab = box('Nickel mounting tab', (0, d / 2 - tab_t / 2 + 0.001, tab_h / 2 + 0.02), (w, tab_t, tab_h - 0.04), NICKEL, 0.012)
    drill(tab, (0, 0, tab_h - 0.28), 0.19)
    drill(body, (0, 0, tab_h - 0.28), 0.19)
    for x in (-0.22, 0.22):
        cylinder('Ejector pin mark', (x, -d / 2 - 0.0005, h * 0.55), 0.06, 0.004, EJECTOR)
    for i in (-1, 0, 1):
        x = i * 0.254
        box('Lead shoulder', (x, d / 2 - 0.24, -0.12), (0.13, 0.05, 0.25), TIN, 0.006)
        box('Lead', (x, d / 2 - 0.24, -0.82), (0.08, 0.05, 1.18), TIN, 0.006)


def to247():
    w, h, d = 1.59, 2.09, 0.50
    body = box('Epoxy body', (0, -0.05, h / 2), (w, d - 0.10, h), EPOXY, 0.035)
    back = box('Exposed metal back', (0, d / 2 - 0.06, h / 2), (w - 0.10, 0.12, h - 0.10), NICKEL, 0.01)
    hole_z = h - 0.56
    drill(body, (0, 0, hole_z), 0.18)
    drill(back, (0, 0, hole_z), 0.18)
    cylinder('Ejector pin mark', (0.46, -d / 2 - 0.0005 + 0.05, 0.42), 0.075, 0.004, EJECTOR)
    for i in (-1, 0, 1):
        x = i * 0.545
        box('Lead shoulder', (x, 0, -0.15), (0.22, 0.06, 0.30), TIN, 0.008)
        box('Lead', (x, 0, -1.15), (0.12, 0.06, 1.72), TIN, 0.008)


def qfn():
    s, t = 0.50, 0.09
    box('Epoxy body', (0, 0, t / 2 + 0.002), (s, s, t - 0.004), EPOXY, 0.004)
    box('Exposed thermal pad', (0, 0, 0.0015), (0.31, 0.31, 0.004), TIN)
    pitch, pad_w, pad_l = 0.05, 0.025, 0.04
    for side in range(4):
        a = side * math.pi / 2
        for i in range(8):
            u = (i - 3.5) * pitch
            # Pads sit in the bottom edge, flush with the side wall.
            x, y = u, -s / 2 + pad_l / 2 - 0.0002
            o = box('Contact pad', (x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a), 0.011), (pad_w, pad_l, 0.022), TIN)
            o.rotation_euler.z = a
    cylinder('Pin one dot', (-s / 2 + 0.06, -s / 2 + 0.06, t + 0.0003), 0.018, 0.001, PIN1, rotation=(0, 0, 0))


def sot23():
    L, W, H, standoff = 0.29, 0.13, 0.10, 0.01
    box('Epoxy body', (0, 0, standoff + H / 2), (L, W, H), EPOXY, 0.008)
    t, lw, z_exit = 0.015, 0.04, standoff + H * 0.45
    for x, side in ((-0.095, -1), (0.095, -1), (0.0, 1)):
        y0 = side * W / 2
        box('Lead exit', (x, y0 + side * 0.01, z_exit), (lw, 0.024, t), TIN, 0.002)
        box('Lead bend', (x, y0 + side * 0.025, (z_exit + t / 2) / 2), (lw, t, z_exit + t / 2), TIN, 0.002)
        box('Lead foot', (x, y0 + side * 0.042, t / 2), (lw, 0.04, t), TIN, 0.002)


families = {'to220': group('TO-220', to220), 'to247': group('TO-247', to247), 'qfn': group('QFN-32', qfn), 'sot23': group('SOT-23', sot23)}


def visible(roots):
    for r in families.values():
        for o in r.children:
            o.hide_render = r not in roots; o.hide_set(r not in roots)


def export(name, r):
    visible([r]); bpy.ops.object.select_all(action='DESELECT'); r.select_set(True)
    for o in r.children:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(SOURCES, 'glb', name + '.glb'), export_format='GLB', use_selection=True,
                              export_apply=True, export_cameras=False, export_lights=False)


for name, r in families.items():
    export(name, r)

# ---- Posters: transparent renders for the page (package-theatre, packages) and brand tiles.
scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 48; scene.cycles.use_denoising = True; scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_mode = 'RGBA'; scene.render.resolution_percentage = 100
scene.world.color = (0.26, 0.27, 0.29); scene.view_settings.view_transform = 'AgX'


def light(name, loc, power, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = power; d.shape = 'DISK'; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - o.location).to_track_quat('-Z', 'Y').to_euler()
    return o


rig = [light('Key softbox', (-3, -4, 6), 700, 5), light('Strip reflection', (5, -1, 3), 650, 3), light('Cool rim', (1, 4, 4), 1400, 3, (0.70, 0.82, 1))]
cam = bpy.data.cameras.new('Product camera'); c = bpy.data.objects.new('Product camera', cam); scene.collection.objects.link(c); scene.camera = c; cam.type = 'ORTHO'


def render(path, w, h, roots, direction=(4, -7, 3.4), margin=1.08):
    """Frame the visible parts exactly: project their corners into the camera plane and
    fit the orthographic frame to that outline."""
    d = Vector(direction).normalized()
    c.location = d * 30; c.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.view_layer.update()
    inv = c.matrix_world.inverted()
    pts = [inv @ (o.matrix_world @ Vector(v)) for r in roots for o in r.children if not o.hide_render for v in o.bound_box]
    x0, x1 = min(p.x for p in pts), max(p.x for p in pts)
    y0, y1 = min(p.y for p in pts), max(p.y for p in pts)
    axes = c.matrix_world.to_3x3()
    c.location += axes @ Vector(((x0 + x1) / 2, (y0 + y1) / 2, 0))
    # ortho_scale spans the render's longer side.
    cam.ortho_scale = margin * (max(x1 - x0, (y1 - y0) * w / h) if w >= h else max((x1 - x0) * h / w, y1 - y0))
    scene.render.resolution_x = w; scene.render.resolution_y = h
    scene.render.filepath = path; bpy.ops.render.render(write_still=True)


# Each package alone, framed to its own outline (the brand tiles show them enlarged).
for name, r in families.items():
    visible([r])
    render(os.path.join(OUT, 'images', 'packages', name + '.png'), 1000, 750, [r], margin=1.12)

# The single-package fallback for the package viewer, and the four-package composition.
visible([families['to220']])
render(os.path.join(OUT, 'images', 'package-theatre.png'), 1100, 1000, [families['to220']], margin=1.1)
# The composition enlarges the surface-mount parts so all four read at one glance:
# power packages stand at the back, surface-mount parts lie in front.
layout = {'to247': ((-1.15, 1.3, 1.1), 1.0, -0.25), 'to220': ((1.25, 1.2, 0.75), 1.25, 0.2),
          'qfn': ((-0.95, -1.35, 0.0), 3.4, 0.3), 'sot23': ((1.2, -1.35, 0.0), 4.4, -0.3)}
for name, (loc, scale, rz) in layout.items():
    families[name].location = loc; families[name].scale = (scale, scale, scale); families[name].rotation_euler.z = rz
visible(list(families.values()))
render(os.path.join(OUT, 'images', 'packages.png'), 1100, 850, list(families.values()), (5, -9, 6), 1.06)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCES, 'semiconductor-families.blend'))
print('Package sources, GLBs and posters complete.')
