"""Refine the existing 5 Series B .blend; retain its enclosure, handle and feet.
Sources: model-source/scope-references/README.md. Blender 5.1+, no add-ons.
"""
import bpy, bmesh, math, os, json
from mathutils import Vector
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'model-source'
OUT = ROOT / 'public'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE / 'tektronix-5b-study.blend'))

# The original was joined by material. Remove only the connected small parts in
# inaccurate panel regions; the main enclosure, handle, feet and bezel survive.
removed = 0
for obj in list(bpy.data.objects):
    if obj.type != 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)
        continue
    bm = bmesh.new(); bm.from_mesh(obj.data)
    unseen = set(bm.verts); discard = []
    while unseen:
        first = unseen.pop(); stack = [first]; island = [first]
        while stack:
            v = stack.pop()
            for edge in v.link_edges:
                other = edge.other_vert(v)
                if other in unseen:
                    unseen.remove(other); stack.append(other); island.append(other)
        points = [obj.matrix_world @ v.co for v in island]
        lo = Vector(tuple(min(p[k] for p in points) for k in range(3)))
        hi = Vector(tuple(max(p[k] for p in points) for k in range(3)))
        c = (lo + hi) / 2; extent = hi - lo
        front_part = c.y < -.916 and ((c.x > 1.30 and extent.x < .80) or (c.z < .97 and extent.x < 3.4))
        screen_part = c.y < -.97 and -2.16 < c.x < 1.25 and .97 < c.z < 2.73
        rear_part = c.y > .978
        old_family = c.y < -.97 and c.x > 0 and c.z > 2.75
        if front_part or screen_part or rear_part or old_family:
            discard.extend(island); removed += 1
    bmesh.ops.delete(bm, geom=discard, context='VERTS')
    bm.to_mesh(obj.data); bm.free()
    if not len(obj.data.vertices): bpy.data.objects.remove(obj, do_unlink=True)

def material(name, color, metal=0, rough=.4, emission=0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
    p.inputs['Emission Color'].default_value = (*color, 1)
    p.inputs['Emission Strength'].default_value = emission
    return m
plastic = material('Warm white polymer', (.70,.735,.72), rough=.43)
face = material('Front panel white', (.83,.845,.82), rough=.38)
blue = material('Tek blue housing', (.007,.235,.34), rough=.40)
grip = material('Blue handle rubber', (.008,.17,.23), rough=.72)
black = material('Port recess', (.006,.009,.011), rough=.55)
rubber = material('Rubber and vent interior', (.012,.019,.024), rough=.78)
silver = material('Brushed nickel', (.62,.67,.70), .90, .23)
brass = material('Gold plated contacts', (.58,.37,.095), .86, .24)
ink = material('Fine panel print', (.035,.045,.048), rough=.8)
white = material('White panel print', (.86,.89,.88), rough=.65)
keygrey = material('Key caps', (.48,.52,.53), rough=.46)
glass = material('Display bezel', (.006,.009,.012), rough=.28)
led = [material('LED '+n, c, rough=.35, emission=.22) for n,c in [
    ('yellow',(.89,.78,.02)),('cyan',(.015,.61,.72)),('red',(.86,.13,.16)),
    ('green',(.18,.65,.26)),('orange',(.94,.43,.08)),('blue',(.20,.43,.84)),
    ('purple',(.61,.32,.75)),('grey',(.58,.63,.67))]]

# Fine moulded texture. It is a small exported normal map, not a new photograph.
texdir = SOURCE / 'scope-textures'; texdir.mkdir(exist_ok=True)
import random
random.seed(58)
normal = bpy.data.images.new('Moulded polymer grain', width=128, height=128, alpha=True)
normal.colorspace_settings.name = 'Non-Color'
pixels = []
for i in range(128 * 128): pixels.extend((.5+random.uniform(-.035,.035), .5+random.uniform(-.035,.035), 1, 1))
normal.pixels.foreach_set(pixels)
normal.filepath_raw = str(texdir / 'polymer-normal.png'); normal.file_format = 'PNG'; normal.save()
for m in [plastic, face, blue]:
    nodes = m.node_tree.nodes; links = m.node_tree.links
    tex = nodes.new('ShaderNodeTexImage'); tex.image = normal
    mapping = nodes.new('ShaderNodeTexCoord')
    links.new(mapping.outputs['Generated'], tex.inputs['Vector'])
    n = nodes.new('ShaderNodeNormalMap'); n.inputs['Strength'].default_value = .20
    links.new(tex.outputs['Color'], n.inputs['Color']); links.new(n.outputs['Normal'], nodes.get('Principled BSDF').inputs['Normal'])

def finish(o, name, mat, bevel=0):
    o.name = name; o.data.materials.append(mat)
    if bevel:
        mod = o.modifiers.new('Manufactured edge radius', 'BEVEL'); mod.width=bevel; mod.segments=3
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
        for p in o.data.polygons: p.use_smooth=True
        mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL'); mod.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o
def box(name, loc, dims, mat, bevel=.008):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.dimensions=dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o,name,mat,bevel)
def cylinder(name,x,y,z,r,depth,mat,vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=(x,y,z),rotation=(math.pi/2,0,0))
    return finish(bpy.context.object,name,mat,.002)
def torus(name,x,y,z,r,t,mat):
    bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=8,location=(x,y,z),major_radius=r,minor_radius=t,rotation=(math.pi/2,0,0))
    return finish(bpy.context.object,name,mat)
fontpath = ROOT / 'scripts/fonts/Alegreya[wght].ttf'
# The installed system font is used for small mechanical legends, not the logo artwork.
systemfont = Path('C:/Windows/Fonts/arial.ttf')
font = bpy.data.fonts.load(str(systemfont)) if systemfont.exists() else None
def text(name,body,x,z,size=.035,mat=ink,y=-.955,rear=False,align='CENTER'):
    c=bpy.data.curves.new(name,'FONT'); c.body=body; c.size=size; c.align_x=align; c.resolution_u=2
    if font:c.font=font
    o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o)
    o.location=(x,y,z); o.rotation_euler=(math.pi/2,0,math.pi if rear else 0); o.data.materials.append(mat)
    return o
def key(name,label,x,z,w=.16,h=.07,color=None):
    box(name+' surround',(x,-.953,z),(w+.018,.035,h+.018),color or keygrey,.009)
    box(name+' cap',(x,-.978,z),(w,.031,h),keygrey if color else plastic,.009)
    if label:text(name+' legend',label,x,z-.012,min(.031,w/max(len(label),1)*1.65),white if color else ink,y=-.997)
def knob(name,x,z,r=.11,color=None):
    cylinder(name+' socket',x,-.953,z,r*1.12,.026,keygrey)
    if color:torus(name+' illuminated ring',x,-.978,z,r*1.02,.009,color)
    cylinder(name+' barrel',x,-1.010,z,r,.088,plastic)
    cylinder(name+' satin face',x,-1.058,z,r*.88,.014,face)
    for i in range(32):
        a=i*math.tau/32
        cylinder(name+' grip flute',x+math.cos(a)*r*.96,-1.012,z+math.sin(a)*r*.96,.004,.062,face,12)
    box(name+' index',(x,-1.068,z+r*.65),(.009,.003,r*.25),ink,.001)

# Replace the invented control layout with the manufacturer's two-column bank.
key('Run stop','Run / Stop',1.54,2.77,.29,.115,led[3]);key('Single sequence','Single / Seq',1.94,2.77,.29,.115)
for x,t in zip([1.39,1.59,1.79,1.99],['Cursors','FastAcq','HighRes','Clear']):key(t,t,x,2.61,.16,.067)
knob('Multipurpose A',1.52,2.38,.15);knob('Multipurpose B',1.52,2.02,.15)
text('A badge','A',1.36,2.53,.04,led[1]);text('B badge','B',1.36,2.17,.04,led[1])
box('Trigger group header',(1.94,-.946,2.51),(.39,.018,.07),black,.002)
text('Trigger heading','TRIGGER',1.94,2.49,.038,white)
key('Force trigger','Force',1.84,2.40,.14,.068);key('Trigger ready','Ready',2.03,2.40,.14,.068)
text('Level label','Level',1.94,2.29,.035);knob('Trigger level',1.94,2.18,.085,led[0])
key('Trigger slope','Slope',1.84,2.02,.14,.067);key('Trigger mode','Mode',2.03,2.02,.14,.067)
box('Vertical group header',(1.72,-.946,1.88),(.79,.018,.07),black,.002)
text('Vertical heading','VERTICAL',1.72,1.86,.041,white)
text('Position label','Position',1.50,1.76,.034);knob('Vertical position',1.50,1.65,.090,led[0])
text('Scale label','Scale',1.50,1.46,.034);knob('Vertical scale',1.50,1.30,.13,led[0])
for i in range(8):
    x=1.83+(i//4)*.20;z=1.74-(i%4)*.13
    key('Channel '+str(i+1),str(i+1),x,z,.145,.082,led[i])
for x,t in [(1.62,'Math'),(1.84,'Ref'),(2.05,'Bus')]:key(t,t,x,1.19,.16,.066)
box('Horizontal group header',(1.72,-.946,1.09),(.79,.018,.07),black,.002)
text('Horizontal heading','HORIZONTAL',1.72,1.07,.037,white)
text('Horizontal position label','Position',1.50,.99,.029);knob('Horizontal position',1.50,.91,.075)
text('Horizontal scale label','Scale',1.50,.78,.03);knob('Horizontal scale',1.50,.68,.11)
knob('Zoom pan',1.94,.88,.105)
key('Navigate left','<',1.83,.69,.15,.062);key('Navigate right','>',2.04,.69,.15,.062)

# Input wells, chamfered BNCs, contact arrays and subtle coloured identifiers.
for i in range(8):
    x=-1.84+i*.404; z=.68
    box('FlexChannel outer rim',(x,-.937,z),(.316,.027,.365),silver,.019)
    box('FlexChannel inset',(x,-.960,z),(.281,.028,.332),black,.017)
    box('FlexChannel contact bed',(x,-.980,z-.088),(.215,.013,.11),rubber,.004)
    for row in range(3):
        for col in range(7):box('Gold probe contact',(x-.084+col*.028,-.990,z-.128+row*.027),(.012,.007,.016),brass,.002)
    cylinder('BNC threaded body',x,-1.008,z+.005,.078,.10,silver)
    for j in range(5):torus('BNC thread',x,-.984-j*.018,z+.005,.077,.003,silver)
    torus('BNC gold front lip',x,-1.067,z+.005,.062,.012,brass)
    cylinder('BNC dielectric',x,-1.068,z+.005,.049,.012,face)
    cylinder('BNC signal bore',x,-1.078,z+.005,.027,.01,black)
    cylinder('BNC centre contact',x,-1.085,z+.005,.007,.009,brass,16)
    for sign in [-1,1]:box('BNC bayonet lug',(x+sign*.09,-1.023,z+.005),(.032,.031,.035),silver,.005)
    box('Channel colour strip',(x,-.944,.903),(.28,.013,.018),led[i],.003)
    text('Channel number',str(i+1),x,.924,.039)
box('Model badge',(-2.13,-.944,.81),(.29,.013,.18),keygrey,.006)
text('Model number','MSO58B',-2.13,.835,.043,white)
text('Model bandwidth','2 GHz',-2.13,.785,.030,white)
text('Model sample rate','6.25 GS/s',-2.13,.748,.025,white)
cylinder('Power button rim',-2.13,-.953,.51,.058,.026,led[1]);cylinder('Power button',-2.13,-.977,.51,.043,.025,plastic)
text('Power mark','I',-2.13,.497,.039,led[1],y=-.995)
text('Input ratings','Inputs 1-8   1 MOhm / 50 Ohm   Observe probe ratings',-.43,.425,.025)
cylinder('Aux trigger rim',1.17,-.97,.68,.046,.05,silver);cylinder('Aux trigger bore',1.17,-1.00,.68,.025,.01,black)
text('Aux trigger legend','Aux Trig',1.17,.777,.027)
for i in range(3):
    x=1.48+i*.23
    box('USB A front shell',(x,-.952,.454),(.18,.035,.075),silver,.004)
    box('USB A front cavity',(x,-.975,.454),(.15,.025,.051),black,.003)
    box('USB A front tongue',(x,-.990,.448),(.116,.004,.012),blue if i==0 else rubber,.001)
text('USB front label','USB 3.0             USB 2.0',1.71,.515,.024)
box('Probe compensation ground',(1.18,-.96,.51),(.048,.036,.016),silver,.003)
box('Probe compensation signal',(1.18,-.96,.46),(.048,.036,.016),silver,.003)

# Real rear connector groups: three BNCs, four USB hosts, one USB-B device.
rear_start = set(bpy.context.scene.objects)
for col in range(11):
    for row in range(41):
        x=-1.91+col*.382;z=.63+row*.054
        if -.99<x<.99 and z<1.66:continue
        box('Rear ventilation aperture',(x,1.001,z),(.342,.027,.024),rubber,.002)
box('Recessed rear I/O surround',(0,1.013,1.075),(1.95,.032,1.14),rubber,.01)
box('Rear I/O panel',(0,1.037,1.075),(1.88,.022,1.07),blue,.009)
box('Rear compliance label',(0,1.053,1.46),(1.58,.008,.19),face,.003)
text('Rear identification','Tektronix   MSO58B',0,1.49,.046,ink,y=1.062,rear=True)
text('Rear serial','5 Series B MSO  |  CE  |  Protective earth',0,1.425,.022,ink,y=1.062,rear=True)
box('IEC power inlet rim',(-.57,1.065,1.17),(.39,.035,.25),silver,.035)
box('IEC power inlet',(-.57,1.092,1.17),(.33,.04,.195),black,.030)
for x,z in [(-.65,1.15),(-.49,1.15),(-.57,1.22)]:box('IEC terminal',(x,1.12,z),(.022,.021,.065),silver,.001)
for x,t in [(0,'Ref In'),(.36,'AUX Out'),(.71,'AFG Out')]:
    cylinder(t+' barrel',x,1.095,1.17,.049,.080,silver)
    torus(t+' face',x,1.14,1.17,.033,.009,brass)
    cylinder(t+' core',x,1.143,1.17,.024,.008,black)
    text(t+' label',t,x,1.28,.028,white,y=1.065,rear=True)
text('Rear power rating','100-240 V  /  50-60 Hz',-.57,1.33,.024,white,y=1.065,rear=True)
box('LAN shell',(-.62,1.073,.86),(.20,.04,.15),silver,.008)
box('LAN cavity',(-.62,1.10,.86),(.16,.03,.115),black,.005)
for j in range(8):box('LAN gold contact',(-.676+j*.016,1.118,.89),(.006,.008,.035),brass,.001)
text('LAN legend','LAN 10/100/1000',-.62,.98,.022,white,y=1.065,rear=True)
for col,x in enumerate([-.62,-.29]):
    for z in [.67,.55]:
        box('Rear USB host shell',(x,1.074,z),(.20,.04,.085),silver,.004)
        box('Rear USB host socket',(x,1.101,z),(.17,.024,.056),black,.003)
        box('Rear USB host tongue',(x,1.118,z-.01),(.135,.004,.012),blue if col else rubber,.001)
    text('Host USB label','USB 3.0' if col else 'USB 2.0',x,.755,.025,white,y=1.065,rear=True)
box('USB B device rim',(.04,1.073,.57),(.16,.04,.15),silver,.012)
box('USB B device opening',(.04,1.102,.57),(.12,.025,.11),blue,.008)
text('Device legend','Device',.04,.755,.024,white,y=1.065,rear=True)
for x,z,w,h,name in [(.31,.55,.22,.075,'DisplayPort'),(.68,.55,.39,.085,'DVI-D'),(.68,.81,.28,.115,'VGA')]:
    box(name+' metal shell',(x,1.075,z),(w,.04,h),silver,.008)
    box(name+' insert',(x,1.103,z),(w-.035,.025,h-.025),blue if name=='VGA' else black,.005)
    for j in range(8 if name!='VGA' else 5):
        for row in range(2):cylinder(name+' female socket',x-w*.34+j*w*.68/(7 if name!='VGA' else 4),1.12,z-.013+row*.027,.004,.005,black,8)
    text(name+' label',name,x,z+h/2+.04,.021,white,y=1.065,rear=True)
box('USB B cavity',(.04,1.13,.57),(.10,.012,.08),black,.005)
box('USB B tongue',(.04,1.14,.55),(.07,.008,.015),blue,.002)
# Reference photographs are seen from the rear; world X is reversed relative to
# the front. Move each complete part/legend without mirroring its lettering.
for o in set(bpy.context.scene.objects) - rear_start:o.location.x *= -1

# Retain the existing silhouette, with a height correction matching the 371 mm
# handle-up outline. New detail coordinates are corrected by the same transform.
for o in bpy.context.scene.objects:
    if o.type in {'MESH','FONT','CURVE'}:
        o.location.z *= 1.08; o.scale.z *= 1.08
bpy.context.scene['scope_connector_revision'] = 2
bpy.context.scene['scope_rear_rim_revision'] = True

# Replace the static geometry display with one named, UV-mapped 16:9 surface.
screenmat=material('SCOPE_SCREEN',(.012,.017,.022),rough=.40,emission=.15)
static_lcd = texdir / 'screen-default.png'
if static_lcd.exists():
    tex = screenmat.node_tree.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(str(static_lcd))
    p = screenmat.node_tree.nodes.get('Principled BSDF')
    screenmat.node_tree.links.new(tex.outputs['Color'], p.inputs['Base Color'])
    screenmat.node_tree.links.new(tex.outputs['Color'], p.inputs['Emission Color'])
    p.inputs['Emission Strength'].default_value=.65
cx,cy,cz=-.49,-1.003,1.89*1.08
w,h=3.30,3.30*9/16
mesh=bpy.data.meshes.new('LCD UV surface')
mesh.from_pydata([(cx-w/2,cy,cz-h/2),(cx+w/2,cy,cz-h/2),(cx+w/2,cy,cz+h/2),(cx-w/2,cy,cz+h/2)],[],[(0,1,2,3)])
mesh.update(); uv=mesh.uv_layers.new(name='UVMap')
for loop,coord in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=coord
lcd=bpy.data.objects.new('SCOPE_SCREEN',mesh);bpy.context.collection.objects.link(lcd);lcd.data.materials.append(screenmat)
text('Family panel legend','5 SERIES B   MIXED SIGNAL OSCILLOSCOPE',1.19,2.87*1.08,.032,white,y=-.982,align='RIGHT')

# Export compatible material groups while keeping the LCD as a distinct mesh.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.type in {'FONT','CURVE','MESH'}:o.select_set(True)
bpy.context.view_layer.objects.active=lcd;bpy.ops.object.convert(target='MESH')
for mat in list(bpy.data.materials):
    if mat.name=='SCOPE_SCREEN':continue
    objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==mat]
    if not objs:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name='Refined '+mat.name
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(SOURCE/'glb/scope.glb'),export_format='GLB',use_selection=True,export_apply=True,export_tangents=True,export_cameras=False,export_lights=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.render.film_transparent=True;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX';scene.world.color=(.10,.10,.10)
def light(name,loc,power,size,color=(1,1,1)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.8))-o.location).to_track_quat('-Z','Y').to_euler()
light('Large key',(-4,-6,7),850,5);light('Soft fill',(5,-2,4),450,4);light('Rear edge',(0,4,5),850,3,(.84,.94,1))
c=bpy.data.cameras.new('Review camera');camera=bpy.data.objects.new('Review camera',c);scene.collection.objects.link(camera);scene.camera=camera;c.type='ORTHO'
def render(name,loc,target,scale,w=1400,h=1100):
    camera.location=loc;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();c.ortho_scale=scale
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(OUT/'images'/f'{name}.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'tektronix-5b-refined.blend'))
render('scope-hero',(6,-12,5.5),(0,0,1.76),6.25)
render('scope-detail',(-3.5,-13,4.0),(0,0,1.76),5.8,1100,850)
render('scope-rear',(-4,12,4.8),(0,0,1.76),6.25)
print(json.dumps({'source':'tektronix-5b-study.blend','refined':'tektronix-5b-refined.blend','replaced_detail_islands':removed}))
