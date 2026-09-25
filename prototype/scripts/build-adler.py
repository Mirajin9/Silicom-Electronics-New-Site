"""ADLER display models. Run from any directory with Blender 5.1 --background --python.
One source unit = 10 mm, like the existing site models. Dimensions follow the local
Adler-PV Catalog 202411.pdf pp. 19, 32, 58, 59 (PDF pages). Cosmetic geometry is
reconstructed from supplied photos, not manufacturing CAD. No simulation internals.
"""
import bpy, math, os, json, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'model-source'
OUT = ROOT / 'public'
for p in [SOURCE/'glb', OUT/'models', OUT/'images/adler']:
    p.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0, rough=.35):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal; bs.inputs['Roughness'].default_value=rough
    return m
WHITE=material('Warm white moulded polymer',(.79,.80,.77),rough=.32)
SEAM=material('Polymer parting line',(.46,.49,.48),rough=.53)
BLUE=material('BH300 cobalt handle',(.009,.035,.29),rough=.43)
BLUE.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.22
DARK=material('Recess interior',(.016,.025,.028),rough=.64)
RED=material('Red indicator and DIN latch',(.65,.012,.006),rough=.26)
METAL=material('Silver plated contacts',(.73,.76,.78),1,.25)
SCREW=material('Terminal steel',(.32,.36,.39),1,.28)
CERAMIC=material('Glass fibre fuse body',(.80,.80,.75),rough=.72)

def textured(name, opaque=False):
    m=material(name,(1,1,1),rough=.46)
    im=bpy.data.images.load(str(SOURCE/'adler-textures'/(name+'.png')))
    im.pack(); n=m.node_tree.nodes.new('ShaderNodeTexImage'); n.image=im
    bs=m.node_tree.nodes.get('Principled BSDF')
    m.node_tree.links.new(n.outputs['Color'],bs.inputs['Base Color'])
    if not opaque:
        m.node_tree.links.new(n.outputs['Alpha'],bs.inputs['Alpha'])
        m.surface_render_method='DITHERED'
    return m

def finish(o,name,mat,bevel=0):
    o.name=name; o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Moulded edge radii','BEVEL'); mod.width=bevel; mod.segments=3
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons: p.use_smooth=True
    mod=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL'); mod.keep_sharp=True
    bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def box(name,loc,dims,mat,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,mat,bevel)

def cyl(name,loc,r,depth,mat,axis='Z',bevel=0,verts=64):
    rot={'X':(0,math.pi/2,0),'Y':(math.pi/2,0,0),'Z':(0,0,0)}[axis]
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc,rotation=rot)
    return finish(bpy.context.object,name,mat,bevel)

def subtract(target,cut):
    mod=target.modifiers.new('Moulded recess','BOOLEAN'); mod.operation='DIFFERENCE'; mod.object=cut
    bpy.context.view_layer.objects.active=target; bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cut,do_unlink=True)

def final_normals(o):
    # Booleans change topology after the initial bevel. Recompute split normals on
    # the finished shell; otherwise the large planar sides acquire triangular shading.
    for p in o.data.polygons: p.use_smooth=True
    mod=o.modifiers.new('Final area weighted normals','WEIGHTED_NORMAL')
    mod.keep_sharp=True; mod.weight=100
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.modifier_apply(modifier=mod.name)

def profile(name,points,depth,mat,bevel=.04,y=0):
    n=len(points)
    vertices=[(x,y+side*depth/2,z) for side in [-1,1] for x,z in points]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active=o; o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    o.select_set(False)
    return finish(o,name,mat,bevel)

def plane(name,verts,mat):
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],[(0,1,2,3)]); mesh.update()
    uv=mesh.uv_layers.new()
    for l,co in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]): l.uv=co
    o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); o.data.materials.append(mat)
    return o

def label_sides(name,length,height,depth):
    mat=textured(name+'-side')
    for s in [-1,1]:
        y=s*(depth/2+.012); x=length/2
        plane(name+' side print', [(-s*-x,y,.1),(-s*x,y,.1),(-s*x,y,height+.1),(-s*-x,y,height+.1)],mat)

def bosses(shell,x,z,depth,r=.40):
    for s in [-1,1]:
        y=s*(depth/2+.027)
        boss=cyl('Recessed fastener collar',(x,y,z),r,.08,WHITE,'Y',.025)
        cut=box('Square socket cutter',(x,y,z),(.28,.5,.28),DARK,.018)
        subtract(boss,cut)
        box('Dark square fastener socket',(x,s*(depth/2+.001),z),(.26,.018,.26),DARK,.012)
        # Fine concentric moulding line around the boss.
        bpy.ops.mesh.primitive_torus_add(major_radius=r*.81,minor_radius=.009,major_segments=48,minor_segments=6,location=(x,s*(depth/2+.074),z),rotation=(math.pi/2,0,0))
        finish(bpy.context.object,'Fastener collar ring',SEAM)

def terminal(shell,x,z,width,depth):
    # Real blind screw well, with a metal slotted terminal screw recessed inside.
    subtract(shell,cyl('Screw access bore',(x,0,z),.33,1.15,DARK,'Z'))
    cyl('Screw well shadow',(x,0,z-.47),.326,.06,DARK)
    screw=cyl('Terminal screw',(x,0,z-.39),.24,.10,SCREW,'Z',.02)
    subtract(screw,box('Driver slot',(x,0,z-.33),(.39,.08,.12),DARK))
    # End wire aperture is carved into each end face.
    edge=(1 if x>0 else -1)*width/2
    subtract(shell,box('Wire entry cutter',(edge,0,1.53),(.45,depth*.50,.99),DARK,.035))
    box('Wire entry interior',(edge-(.23 if x>0 else -.23),0,1.53),(.03,depth*.48,.96),DARK,.01)
    box('Terminal contact',(edge-(.24 if x>0 else -.24),0,1.29),(.05,depth*.36,.28),METAL,.01)

def holder300():
    L,D=12.62,2.18
    pts=[(-6.31,.13),(-2.32,.13),(-2.12,.56),(.88,.56),(1.1,.13),(6.31,.13),(6.31,4.72),(4.88,4.72),(4.68,5.3),(-4.80,5.3),(-5.02,4.72),(-6.31,4.72)]
    shell=profile('BH300 injection moulded housing',pts,D,WHITE,.075)
    for x in [-4.46,4.46]:
        bosses(shell,x,4.64,D); bosses(shell,x,.91,D)
    for s in [-1,1]:
        for x in [-1.78,-.10,1.58]:
            for z in [2.30,2.72,3.14,3.56]:
                subtract(shell,box('BH300 ventilation cutter',(x,s*D/2,z),(1.39,.36,.135),DARK,.060))
                box('Recessed vent shadow',(x,s*(D/2-.165),z),(1.38,.018,.132),DARK,.055)
        for x in [-6.06,6.06]:
            for z in [3.71,4.09,4.47]:
                subtract(shell,box('End ventilation groove',(x,s*D/2,z),(.58,.4,.115),DARK,.035))
                box('End vent shadow',(x,s*(D/2-.18),z),(.57,.02,.11),DARK,.02)
        # Lower cover seam follows the case, with a slight offset from the bottom.
        box('Lower shell parting seam',(0,s*(D/2+.004),1.20),(10.80,.008,.016),SEAM,.003)
    for x in [-5.58,5.58]: terminal(shell,x,4.76,L,D)
    box('Blue fuse carrier top',(-.55,0,5.305),(8.42,1.95,.13),BLUE,.045)
    # The pull rises from the left end and curls outward at the top.
    handle=[(-4.7,5.23),(-4.33,5.23),(-4.52,5.70),(-4.76,6.28),(-5.01,6.75),(-5.28,6.89),(-5.65,6.77),(-5.79,6.64),(-5.44,6.56),(-5.24,6.22),(-5.0,5.68)]
    profile('Raised blue pull handle',handle,1.80,BLUE,.07)
    for x,z,r in [(-4.85,5.67,.105),(-5.03,6.08,.077)]:
        for s in [-1,1]: cyl('Handle moulding recess',(x,s*.914,z),r,.014,DARK,'Y')
    cyl('Red fuse indicator',(-2.95,0,5.411),.13,.065,RED,'Z',.025)
    plane('BH300 top markings',[(-2.25,-.81,5.378),(3.14,-.81,5.378),(3.14,.81,5.378),(-2.25,.81,5.378)],textured('bh300-top'))
    for x in [-1.85,-1.16,-.47]: box('DIN rail moulded tooth',(x,0,.41),(.18,1.83,.24),WHITE,.025)
    for x in [-5.78,5.78]: box('Mounting foot',(x,0,.14),(.63,2.30,.27),WHITE,.045)
    box('DIN rail underside spring',(-.55,0,.34),(3.42,1.28,.13),SCREW,.025)
    final_normals(shell)
    label_sides('bh300',L,4.92,D)

def holder400():
    L,D=11.04,3.49
    pts=[(-5.52,.12),(-2.04,.12),(-1.82,.56),(1.82,.56),(2.10,.12),(5.52,.12),(5.52,5.16),(3.22,5.16),(3.05,5.33),(-3.27,5.33),(-3.46,5.16),(-5.52,5.16)]
    shell=profile('BH400 moulded main housing',pts,D,WHITE,.105)
    for x,z in [(-3.49,1.05),(3.49,1.05),(0,4.02)]: bosses(shell,x,z,D,.39)
    for s in [-1,1]:
        for x in [-4.50,4.50]:
            for z in [3.24,3.74,4.24]:
                subtract(shell,box('BH400 end ventilation cutter',(x,s*D/2,z),(2.0,.43,.18),DARK,.078))
                box('Deep end vent shadow',(x,s*(D/2-.195),z),(1.97,.017,.17),DARK,.065)
        box('Two part case seam',(0,s*(D/2+.006),2.86),(10.62,.009,.022),SEAM,.002)
    for x in [-4.66,4.66]: terminal(shell,x,5.23,L,D)
    # Raised white handle follows the curved crest and sloped finger ramp in the photograph.
    lid=[(-3.77,5.24),(-3.57,5.86),(-3.54,6.28),(-3.88,6.35),(-3.56,6.54),(-3.13,6.65),(-2.6,6.7),(-2.16,6.56),(-1.67,6.06),(-1.22,5.61),(-.66,5.43),(1.52,5.43),(1.69,5.26),(1.32,5.11),(-.66,5.12),(-1.27,5.23),(-1.83,5.61),(-2.11,5.79),(-2.65,5.52),(-3.13,5.29)]
    profile('BH400 raised white operating handle',lid,3.15,WHITE,.075)
    for s in [-1,1]:
        cyl('Handle pivot dark recess',(-2.93,s*1.59,5.97),.13,.03,DARK,'Y',.015)
        cyl('Handle pivot steel pin',(-2.93,s*1.614,5.97),.068,.012,SCREW,'Y')
    # No red indicator on BH400: the indicator belongs to BH401.
    box('Handle finger grip ledge',(.78,0,5.47),(1.20,2.40,.08),WHITE,.035)
    # Follow the curved crest with a conforming decal instead of floating a flat label.
    crest=[(-3.42,6.586),(-3.13,6.662),(-2.60,6.712),(-2.16,6.572),(-1.83,6.235)]
    verts=[(x,y,z) for x,z in crest for y in [-1.03,1.03]]
    faces=[(2*i,2*i+2,2*i+3,2*i+1) for i in range(len(crest)-1)]
    me=bpy.data.meshes.new('Conforming handle print'); me.from_pydata(verts,[],faces); me.update(); uv=me.uv_layers.new()
    for lp in me.loops:
        x,y,z=verts[lp.vertex_index]; uv.data[lp.index].uv=((x-crest[0][0])/(crest[-1][0]-crest[0][0]),(y+1.03)/2.06)
    ob=bpy.data.objects.new('BH400 curved handle markings',me); bpy.context.collection.objects.link(ob); ob.data.materials.append(textured('bh400-top'))
    for x in [-4.83,4.83]:
        box('Lower case mounting foot',(x,0,.12),(.54,3.30,.25),WHITE,.04)
    box('Red DIN release tab',(5.55,0,.49),(.62,1.24,.45),RED,.06)
    for x in [-2.2,2.2]: box('DIN rail engagement tooth',(x,0,.31),(.36,2.94,.30),WHITE,.03)
    box('DIN rail steel spring',(0,0,.37),(3.67,2.28,.13),SCREW,.025)
    final_normals(shell)
    label_sides('bh400',L,4.92,D)

def fuse(name,length,radius,cap):
    z=radius
    body_len=length-2*cap+.07
    cyl(name.upper()+' glass fibre tube',(0,0,z),radius*.926,length-.12,CERAMIC,'X',.022,96)
    # A continuous custom UV cylinder makes the label wrap around the tube.
    n=128; vs=[]; uv=[]
    for x,u in [(-body_len/2,0),(body_len/2,1)]:
        for i in range(n+1):
            t=2*math.pi*(i/n-.5)
            vs.append((x,-radius*.941*math.cos(t),z+radius*.941*math.sin(t)))
            uv.append((u,i/n))
    faces=[(i,i+n+1,i+n+2,i+1) for i in range(n)]
    me=bpy.data.meshes.new('Printed wrap'); me.from_pydata(vs,[],faces); me.update(); layer=me.uv_layers.new()
    for loop in me.loops: layer.data[loop.index].uv=uv[loop.vertex_index]
    ob=bpy.data.objects.new(name.upper()+' blue printed sleeve',me); bpy.context.collection.objects.link(ob)
    ob.data.materials.append(textured(name+'-wrap',True))
    for p in me.polygons: p.use_smooth=True
    for s in [-1,1]:
        x=s*(length-cap)/2
        cyl('Silver plated end cap',(x,0,z),radius,cap,METAL,'X',.08 if name=='a94' else .05,96)
        # The rolled inner lip and fine crimp line catch the strip lights.
        for offset,r,d in [(s*(-cap/2+.045),radius*1.002,.045),(s*(-cap/2+.10),radius*.984,.027)]:
            cyl('Rolled cap lip',(x+offset,0,z),r,d,METAL,'X',.014,96)
        cyl('Flat silver cap end',(s*(length/2-.017),0,z),radius*.92,.028,METAL,'X',.027,96)

builders={'bh300':holder300,'bh400':holder400,'a94':lambda:fuse('a94',5.8,1.10,1.35),'a84':lambda:fuse('a84',5.1,.71,.82)}
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=32; scene.cycles.use_denoising=True
scene.render.film_transparent=True; scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.render.resolution_x=1200; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.world.color=(.24,.24,.24); scene.view_settings.view_transform='AgX'

def light(name,loc,energy,size,target):
    d=bpy.data.lights.new(name,'AREA'); d.energy=energy; d.shape='RECTANGLE'; d.size=size; d.size_y=size*.65
    o=bpy.data.objects.new(name,d); scene.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o

manifest=[]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for name,build in builders.items():
    if args and name not in args: continue
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    build()
    parts=list(scene.objects)
    root=bpy.data.objects.new('ADLER '+name.upper(),None); scene.collection.objects.link(root)
    root['units']='1 source unit = 10 mm'; root['purpose']='Website visualization; not manufacturing CAD'
    for o in parts: o.parent=root
    bpy.context.view_layer.update()
    pts=[o.matrix_world @ Vector(v) for o in parts for v in o.bound_box]
    lo=Vector([min(p[i] for p in pts) for i in range(3)]); hi=Vector([max(p[i] for p in pts) for i in range(3)])
    target=(lo+hi)/2; size=hi-lo
    bpy.ops.object.select_all(action='SELECT')
    path=SOURCE/'glb'/('adler-'+name+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True)
    camera=bpy.data.cameras.new('Product camera'); cam=bpy.data.objects.new('Product camera',camera); scene.collection.objects.link(cam); scene.camera=cam
    direction=Vector((4,-9,4.6) if name.startswith('bh') else (2.6,-9,4.8)).normalized()
    cam.location=target+direction*32; cam.rotation_euler=(-direction).to_track_quat('-Z','Y').to_euler(); camera.type='ORTHO'
    # Fits a sphere so posters and live view share framing and a turned product stays inside the canvas.
    frame_width=size.length*1.13; frame_height=frame_width*.75; camera.ortho_scale=frame_width
    light('Large key softbox',(-6,-10,16),2100,10,target)
    light('Right strip',(9,-2,10),1750,7,target)
    light('Back rim',(-3,8,12),2600,8,target)
    light('Front fill',(0,-12,3),650,7,target)
    # Transparent render masters stay with the sources; finish-adler.py makes the web posters.
    scene.render.filepath=str(SOURCE/'adler-renders'/(name+'.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/('adler-'+name+'.blend')))
    bpy.ops.render.render(write_still=True)
    manifest.append({'id':name,'dimensionsSourceUnits':list(size),'frameWidth':frame_width,'frameHeight':frame_height,'targetGltf':[target.x,target.z,-target.y], 'viewGltf':[direction.x,direction.z,-direction.y], 'sourceBytes':path.stat().st_size})
    print('Completed',name,flush=True)
(SOURCE/'adler-manifest.json').write_text(json.dumps(manifest,indent=2))
(ROOT/'src/adler-frames.json').write_text(json.dumps({m['id']:{'width':m['frameWidth'],'height':m['frameHeight'],'target':m['targetGltf']} for m in manifest},indent=2))
print('ADLER models, editable sources and posters complete.',flush=True)
