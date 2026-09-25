"""PACE ADS200 PLUS display kit and individually pivoted 16-tip reference lineup.
Blender 5.1; 1 source unit = 10 mm, matching the existing site assets.
The station outline uses PACE's 130 W x 104 H x 152 D mm specification.
Fine surface details, stand, handpiece and tips are visual reconstructions, not CAD.
"""
import bpy, math, json, random, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'model-source'; RENDERS=SRC/'pace-renders'
for p in [RENDERS,SRC/'glb',ROOT/'public/models',ROOT/'public/images/pace']:
    p.mkdir(parents=True,exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
clear()
def mat(name,color,metal=0,rough=.4,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    if emission:
        bs.inputs['Emission Color'].default_value=(*color,1);bs.inputs['Emission Strength'].default_value=emission
    return m
ALU=mat('Silver grey cast aluminium',(.62,.65,.67),.35,.40)
RIM=mat('Silver badge and display trim',(.73,.76,.78),.85,.22)
BLACK=mat('Black anodised handle',(.018,.022,.027),.36,.35)
RUBBER=mat('Black silicone cable and feet',(.012,.015,.018),0,.52)
DARK=mat('Recess shadows',(.004,.006,.009),0,.62)
BLUE=mat('PACE cobalt control blue',(.005,.045,.36),.10,.32)
CYAN=mat('TD200 blue anodised collars',(.007,.30,.62),.67,.23)
RED=mat('Red temperature up key',(.70,.037,.016),0,.40)
DOWN=mat('Blue temperature down key',(.015,.13,.27),0,.4)
LED=mat('Red LED segments',(.85,.001,.010),0,.26,2.5)
LED_OFF=mat('Unlit LED segments',(.055,.003,.008),0,.5)
GLASS=mat('Dark red display filter',(.028,.001,.006),.08,.18)
STEEL=mat('Polished cartridge barrel',(.56,.60,.63),1,.26)
TIP=mat('Iron plated soldering surface',(.69,.71,.71),.90,.31)
BRASS=mat('Brass dry cleaning coils',(.63,.39,.075),1,.28)
SPONGE=mat('Yellow cellulose cleaning sponge',(.84,.67,.012),0,.91)

def texture(name,opaque=False):
    m=mat(name,(1,1,1),0,.42)
    n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(SRC/'pace-textures'/(name+'.png')));n.image.pack()
    b=m.node_tree.nodes.get('Principled BSDF');m.node_tree.links.new(n.outputs['Color'],b.inputs['Base Color'])
    if not opaque:
        m.node_tree.links.new(n.outputs['Alpha'],b.inputs['Alpha']);m.surface_render_method='DITHERED'
    return m

def finish(o,name,m,bevel=0,smooth=True):
    o.name=name;o.data.materials.append(m)
    bpy.context.view_layer.objects.active=o
    if bevel:
        mod=o.modifiers.new('Machined and moulded radii','BEVEL');mod.width=bevel;mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for f in o.data.polygons:f.use_smooth=smooth
    if smooth:
        mod=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL');mod.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def box(name,loc,dims,m,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,bevel)
def cyl(name,loc,r,depth,m,axis='Z',bevel=0,n=48):
    rot={'Z':(0,0,0),'Y':(math.pi/2,0,0),'X':(0,math.pi/2,0)}[axis]
    bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=depth,location=loc,rotation=rot)
    return finish(bpy.context.object,name,m,bevel)
def mesh(name,verts,faces,m,bevel=0,smooth=True):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o)
    return finish(o,name,m,bevel,smooth)
def subtract(o,cut):
    mod=o.modifiers.new('Recess','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cut
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cut,do_unlink=True)
def normals(o):
    bpy.context.view_layer.objects.active=o
    mod=o.modifiers.new('Final normals','WEIGHTED_NORMAL');mod.weight=100;mod.keep_sharp=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
def plane(name,verts,m):
    o=mesh(name,verts,[(0,1,2,3)],m,smooth=False);uv=o.data.uv_layers.new()
    for lp,co in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):lp.uv=co
    return o
def front(name,cx,y,z,w,h,m):
    return plane(name,[(cx-w/2,y,z-h/2),(cx+w/2,y,z-h/2),(cx+w/2,y,z+h/2),(cx-w/2,y,z+h/2)],m)
def profile(name,points,depth,m,y=0,bevel=.03):
    n=len(points);v=[(x,y+s*depth/2,z) for s in [-1,1] for x,z in points]
    f=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)]
    o=mesh(name,v,f,m,bevel)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
    return o
def rounded_panel(name,cx,y,cz,w,h,r,depth,m):
    points=[]
    for ox,oz,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(9):
            a=math.radians(start+i*90/8);points.append((cx+ox+r*math.cos(a),cz+oz+r*math.sin(a)))
    return profile(name,points,depth,m,y=y,bevel=min(.035,depth*.15))
def lathe(name,profile,m,n=48):
    # profile rows: height, radius, optional x offset (for bent tips).
    verts=[]
    for row in profile:
        z,r=row[:2];cx=row[2] if len(row)>2 else 0
        for j in range(n):
            a=2*math.pi*j/n;verts.append((cx+r*math.cos(a),r*math.sin(a),z))
    faces=[]
    for i in range(len(profile)-1):
        for j in range(n):faces.append((i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j))
    faces += [tuple(range(n-1,-1,-1)),tuple((len(profile)-1)*n+j for j in range(n))]
    return mesh(name,verts,faces,m)
def cable(name,points,r,m,res=6):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=14;cu.bevel_depth=r;cu.bevel_resolution=res
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for bp,co in zip(sp.bezier_points,points):bp.co=co;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.data.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    return bpy.context.object
def group(name,build,origin=(0,0,0)):
    before=set(bpy.data.objects);build();parts=[o for o in set(bpy.data.objects)-before if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
    bpy.context.scene.cursor.location=origin;bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return o

def screw(x,y,z):
    cyl('Black countersunk screw',(x,y,z),.265,.055,DARK,'Y',.018)
    cyl('Screw head',(x,y-.036,z),.16,.025,BLACK,'Y',.015)
    box('Screw driver cross',(x,y-.055,z),(.19,.012,.043),RIM,.008)
    box('Screw driver cross',(x,y-.055,z),(.043,.012,.19),RIM,.008)

SX=-5.65; FY=-3.8
def station_body():
    box('Extruded aluminium chassis',(SX,3.67,5.33),(12.58,14.80,9.56),ALU,.52)
    # Closely spaced longitudinal heat-sink ribs and two wide separator tracks.
    for i in range(51):
        x=-5.7+i*.228
        if abs(x-2.63)<.22 or abs(x+2.63)<.22:continue
        box('Top extrusion rib',(SX+x,3.96,10.145),(.084,13.10,.12),ALU,.025)
    for s in [-1,1]:
        for z in [2.4,2.75,3.1,3.45]:
            box('Side heat channel',(SX+s*6.25,3.66,z),(.032,12.4,.050),DARK,.015)
    frame=rounded_panel('Rounded cast front surround',SX,FY,5.27,13,10.32,1.04,.78,ALU)
    # Blue face inset, following the strongly rounded corners of the photographed bezel.
    panel=rounded_panel('Blue inset faceplate',SX,FY-.409,5.11,10.85,8.45,.75,.12,texture('panel-color',True))
    uv=panel.data.uv_layers.new()
    for lp in panel.data.loops:
        co=panel.data.vertices[lp.vertex_index].co;uv.data[lp.index].uv=((co.x-SX+5.425)/10.85,(co.z-5.11+4.225)/8.45)
    front('ADS200 and AccuDrive printed labels',SX,FY-.487,5.10,10.14,7.77,texture('panel-print'))
    # Raised PACE emblem; transparent manufacturer artwork over a subtle silver badge.
    front('PACE front badge',SX,FY-.404,9.80,2.45,.78,texture('pace-logo'))
    for x in [-5.49,5.49]:
        for z in [1.05,9.02]:screw(SX+x,FY-.429,z)
    for x in [-4.90,4.90]:
        for y in [-2.0,9.10]:cyl('Rubber support foot',(SX+x,y,.22),.53,.44,RUBBER,'Z',.08)
    # Back features are approximate, kept restrained where no rear reference exists.
    box('Rear cover',(SX,11.13,5.12),(11.5,.12,8.5),ALU,.22)
    box('Rear IEC inlet recess',(SX-3.1,11.23,2.31),(2.35,.10,1.42),DARK,.14)
    for x,z in [(-3.60,2.22),(-2.60,2.22),(-3.10,2.70)]:box('IEC terminal',(SX+x,11.30,z),(.10,.09,.27),RIM,.012)
    for x in [-1,0,1,2,3]:box('Rear ventilation',(SX+x,11.23,6.05),(.40,.02,2.7),DARK,.16)

def controls():
    y=FY-.60
    box('Display chrome rim',(SX,y,6.88),(3.66,.35,2.18),RIM,.16)
    box('Display black bezel',(SX,y-.20,6.88),(3.45,.17,1.98),BLACK,.13)
    box('Display ruby filter',(SX,y-.30,6.88),(3.12,.055,1.67),GLASS,.065)
    # Actual emissive geometry, readable from oblique views without a flat photograph.
    mapping={'6':'acdefg','5':'acdfg','0':'abcdef'}
    locations={'a':(0,.60,.56,.068),'g':(0,0,.56,.065),'d':(0,-.60,.56,.068),'f':(-.29,.30,.072,.50),'e':(-.29,-.30,.072,.50),'b':(.29,.30,.072,.50),'c':(.29,-.30,.072,.50)}
    for i,char in enumerate('650'):
        for key,(x,z,w,h) in locations.items():
            segment=box('LED '+char+' '+key,(SX+(i-1)*.96+x,y-.343,6.88+z),(w,.017,h),LED if key in mapping[char] else LED_OFF,.025)
    cyl('Program button',(SX-2.75,y-.03,6.85),.43,.19,BLACK,'Y',.075)
    cyl('Status LED bezel',(SX+3.15,y-.012,6.85),.16,.055,RIM,'Y',.025)
    cyl('Status LED lens',(SX+3.15,y-.055,6.85),.105,.043,ALU,'Y',.025)
    for x,up,m in [(-.72,True,RED),(.86,False,DOWN)]:
        a=[(-.60,-.47),(.60,-.47),(0,.58)]
        pts=[(SX+x+px,4.78+(pz if up else -pz)) for px,pz in a]
        profile('Temperature '+('up' if up else 'down'),pts,.17,m,y=y-.03,bevel=.095)
    # Nine narrow vertical front vents.
    for i in range(9):rounded_panel('Face ventilation slot',SX-2.33+i*.59,y-.013,2.05,.225,1.53,.108,.023,DARK)
    box('Mains rocker bezel',(SX-4.27,y-.05,1.53),(1.78,.20,1.25),DARK,.10)
    box('Mains rocker',(SX-4.27,y-.175,1.53),(1.36,.10,.91),BLACK,.07)
    box('Rocker on mark',(SX-4.63,y-.234,1.58),(.25,.012,.045),RIM,.01)
    cyl('Rocker off mark',(SX-3.97,y-.23,1.52),.13,.018,SEAM if 'SEAM' in globals() else ALU,'Y')
    cyl('Rocker off mark centre',(SX-3.97,y-.245,1.52),.082,.02,BLACK,'Y')
    for r,dy,depth,m in [(.81,0,.16,DARK),(.70,-.15,.23,BLACK),(.57,-.32,.27,ALU),(.53,-.46,.33,RUBBER),(.35,-.69,.42,RUBBER)]:
        cyl('TD200 front connector',(SX+3.38,y+dy,4.16),r,depth,m,'Y',.04)
    for i in range(18):
        a=i*2*math.pi/18
        box('Connector grip rib',(SX+3.38+.65*math.sin(a),y-.2,4.16+.65*math.cos(a)),(.055,.22,.055),BLACK,.02)

def stand():
    x=7.52
    # A heavy metal wedge, with separate front sponge well and upper tool cubby.
    pts=[(-4.3,.35),(4.1,.35),(4.1,6.53),(2.36,6.9),(.42,3.2),(-4.3,1.10)]
    wedge=profile('Tool stand wedge',pts,5.3,BLACK,y=0,bevel=.11)
    # Profile was drawn in x/z; rotate its extrusion to put the long dimension along y.
    wedge.rotation_euler.z=math.pi/2;wedge.location.x=x
    for xx in [-2.1,2.1]:
        for yy in [-3.6,3.3]:cyl('Stand rubber foot',(x+xx,yy,.19),.38,.38,RUBBER,'Z',.05)
    box('Sponge tray',(x,-3.35,1.10),(5.35,2.40,1.15),BLACK,.13)
    box('Sponge tray dark well',(x,-3.16,1.69),(4.84,1.91,.09),DARK,.06)
    sponge=box('Yellow cleaning sponge',(x,-3.16,1.89),(4.68,1.73,.46),SPONGE,.12)
    tx=texture('sponge',True);tx.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.94
    sponge.data.materials.clear();sponge.data.materials.append(tx)
    # Generated UV cube mapping for the porous sponge atlas.
    bpy.ops.object.select_all(action='DESELECT');sponge.select_set(True);bpy.context.view_layer.objects.active=sponge
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.cube_project();bpy.ops.object.mode_set(mode='OBJECT')
    box('Brass cleaner tray',(x,-.77,2.35),(4.99,2.76,.5),BLACK,.22)
    # Upper silver receiver is a tapered oval cup aimed up and toward the operator.
    axis=Vector((0,-.64,.768)); right=Vector((1,0,0)); up=axis.cross(right)
    origin=Vector((x,1.55,5.30)); rings=[(-1.0,.78,.73),(.1,1.20,.94),(1.15,1.85,1.18)]
    n=64;v=[]
    for inside in [False,True]:
        for t,rx,ry in rings:
            for j in range(n):
                a=2*math.pi*j/n;pad=.17 if inside else 0
                p=origin+axis*t+right*((rx-pad)*math.cos(a))+up*((ry-pad)*math.sin(a));v.append(tuple(p))
    faces=[]
    for k in [0,3]:
        for ri in range(2):
            for j in range(n):faces.append(((k+ri)*n+j,(k+ri)*n+(j+1)%n,(k+ri+1)*n+(j+1)%n,(k+ri+1)*n+j))
    for ri in [0,2]:
        for j in range(n):faces.append((ri*n+j,ri*n+(j+1)%n,(ri+3)*n+(j+1)%n,(ri+3)*n+j))
    cup=mesh('Wide angled silver tool receiver',v,faces,ALU,.07)
    # Small open channel at the front lip is visible in the reference.
    subtract(cup,box('Iron rest channel',(x,-.13,6.85),(.85,1.6,1.20),DARK,.19));normals(cup)
    for s in [-1,1]:screw(x+s*2.08,.27,5.68)
    for i in range(7):cyl('Spare tip storage hole',(x-2.06+i*.68,3.83,6.57),.13,.04,DARK,'Z')

def brass_wool():
    rng=random.Random(104);verts=[];faces=[]
    # Many irregular metal curls form a real silhouette; all coils share one mesh/material.
    for coil in range(210):
        cx=7.52+rng.uniform(-1.94,1.94);cy=rng.uniform(-1.86,.28);cz=2.89+rng.uniform(-.15,.73)
        r=rng.uniform(.10,.29);phase=rng.uniform(0,math.tau);steps=28;offset=len(verts)
        q=Vector((rng.uniform(-1,1),rng.uniform(-1,1),rng.uniform(-1,1))).normalized().to_track_quat('Z','Y')
        for j in range(steps):
            a=phase+j/steps*math.pi*rng.uniform(3.8,4.1)
            centre=Vector((r*math.cos(a),r*math.sin(a),(j/steps-.5)*.62))
            for k in range(5):
                b=k*math.tau/5;p=q@(centre+Vector((.028*math.cos(b)*math.cos(a),.028*math.cos(b)*math.sin(a),.028*math.sin(b))))+Vector((cx,cy,cz));verts.append(tuple(p))
        for j in range(steps-1):
            for k in range(5):faces.append((offset+j*5+k,offset+j*5+(k+1)%5,offset+(j+1)*5+(k+1)%5,offset+(j+1)*5+k))
    mesh('Coiled brass dry cleaner',verts,faces,BRASS)

def iron():
    # Build along local Z, then put the whole handpiece horizontally across the foreground.
    body=lathe('TD200 Cool Touch handle',[(0,.44),(.15,.48),(.55,.50),(9.0,.57),(10.6,.58),(11.3,.48)],BLACK,64)
    lathe('TD200 blue front collar',[(-.34,.40),(-.26,.62),(-.04,.65),(.18,.55),(.32,.49)],CYAN,64)
    vs=[];n=64
    for end in [False,True]:
        for i in range(n):
            a=i*math.tau/n;vs.append((.588*math.cos(a),.588*math.sin(a),9.88 if end else 8.18+.53*math.cos(a)))
    mesh('TD200 diagonal blue rear band',vs,[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],CYAN)
    lathe('Rear strain relief',[(10.55,.578),(11.4,.49),(11.68,.36),(12.1,.26)],RUBBER,48)
    for a in range(6):
        ang=a*math.tau/6
        ob=box('Rear axial grip slot',(.49*math.cos(ang),.49*math.sin(ang),11.05),(.12,.12,.85),DARK,.045)
    cyl('Tip cartridge shaft',(0,0,-2.04),.15,3.49,STEEL,'Z',.025)
    lathe('Iron installed chisel tip',[(-4.60,.032),(-4.30,.105),(-3.68,.15)],TIP,48)
    cyl('Tip retention collar',(0,0,-.37),.25,.14,STEEL,'Z',.02)

def build_station():
    a=group('Power_source',station_body);b=group('Front_controls',controls)
    c=group('Tool_stand',stand);d=group('Brass_cleaner',brass_wool)
    hand=group('TD200_handpiece',iron)
    hand.rotation_euler=(0,math.pi/2,0.07);hand.location=(-4.0,-8.23,.86)
    # Local handpiece base is the grip front, z+ points toward the cable end.
    bpy.context.view_layer.update();end=hand.matrix_world@Vector((0,0,12.07))
    wire=group('Flexible_cable',lambda:cable('Continuous silicone cable',[(SX+3.38,FY-1.51,4.16),(-.25,-6.13,1.70),(5.5,-5.42,.35),(11.9,-5.72,.38),(12.8,-7.05,.42),(10.80,-8.62,.63),tuple(end)],.145,RUBBER,3))
    root=bpy.data.objects.new('PACE_ADS200_PLUS',None);bpy.context.collection.objects.link(root)
    root['model']='ADS200 PLUS with TD200 and standard tool stand';root['sourceUnitMillimetres']=10
    for o in [a,b,c,d,hand,wire]:o.parent=root
    return root

TIP_SPECS=[
    ('01','Broad truncated conical','broad',422,2.94,.260),
    ('02','Extended fine conical','needle',489,3.19,.182),
    ('03','Wide chisel','chisel-wide',539,2.96,.238),
    ('04','Extended conical','extended',600,3.36,.182),
    ('05','Narrow rounded chisel','chisel',656,3.15,.246),
    ('06','Oval bevel','bevel',719,3.20,.256),
    ('07','Bent chisel','bent',774,3.41,.209),
    ('08','Fine conical','cone',828,3.18,.245),
    ('09','Bent fine conical','bent-needle',887,3.17,.245),
    ('10','Necked conical','necked',955,3.30,.266),
    ('11','Slim chisel','slim-chisel',1016,3.27,.183),
    ('12','Large oval bevel','bevel-large',1076,3.23,.252),
    ('13','Slim conical','slim-cone',1128,3.30,.193),
    ('14','Knife blade','knife',1183,3.44,.228),
    ('15','Medium chisel','chisel-medium',1255,3.23,.250),
    ('16','Extra wide chisel','chisel-extra',1324,3.14,.253),
]

def blade(name,z0,h,w,d,m,slant=0):
    # Elliptical shaft transitions into the flattened plated working surface.
    levels=[(z0,w*.71,d*1.75),(z0+(h-z0)*.23,w*.86,d*1.25),(h,w,d)]
    verts=[];n=24
    for z,rx,ry in levels:
        for i in range(n):
            a=i*math.tau/n;xx=rx*math.cos(a)
            verts.append((xx,ry*math.sin(a),z+(slant*xx if z==h else 0)))
    faces=[]
    for j in range(2):
        for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    faces += [tuple(range(n-1,-1,-1)),tuple(2*n+i for i in range(n))]
    return mesh(name,verts,faces,m,.007)

def bevel_tip(z0,h,r):
    n=48;v=[]
    for top in [False,True]:
        for i in range(n):
            a=i*math.tau/n;x=r*math.cos(a);y=r*math.sin(a)
            v.append((x,y,(h-.20+y*.93) if top else z0))
    f=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    f += [tuple(range(n-1,-1,-1)),tuple(n+i for i in range(n))]
    return mesh('Angled oval working face',v,f,TIP,.014)

def tip(spec):
    num,label,kind,x,h,r=spec
    shoulder=2.26 if kind not in ['needle','extended','slim-chisel','slim-cone'] else 2.24
    barrel_profile=[(0,.153),(.83,.153),(1.01,.163),(1.14,r*.90),(1.22,r),(shoulder-.07,r),(shoulder,r*.94)]
    if kind in ['needle','extended','slim-chisel','slim-cone']:
        barrel_profile=[(0,r),(shoulder-.03,r),(shoulder,r*.95)]
    lathe('Cartridge shaft and heater sleeve',barrel_profile,STEEL,48)
    cyl('Rolled sleeve lip',(0,0,shoulder-.035),r*1.017,.036,STEEL,'Z',.009,48)
    z=shoulder-.012
    if kind=='broad':
        lathe('Broad truncated cone',[(z,r*1.22),(z+.12,r*1.30),(h-.07,.113),(h,.105)],TIP)
    elif kind in ['needle','cone','bent-needle']:
        bent=.16 if kind=='bent-needle' else 0
        lathe('Fine conical working tip',[(z,r*.82,0),(z+.12,r*.70,0),(h-.18,.045,bent*.7),(h,.014,bent)],TIP)
    elif kind in ['extended','slim-cone','necked']:
        lathe('Necked working tip',[(z,r*.91),(z+.15,.091),(h-.31,.087),(h-.055,.032),(h,.016)],TIP)
    elif kind.startswith('chisel') or kind=='slim-chisel':
        w={'chisel-wide':.222,'chisel':.106,'slim-chisel':.113,'chisel-medium':.174,'chisel-extra':.326}[kind]
        lathe('Chisel neck',[(z,r*.9),(z+.18,w*.88),(h-.4,w*.89)],TIP)
        blade('Flattened chisel working surface',max(z+.10,h-.58),h,w,.038 if kind!='chisel-extra' else .077,TIP,slant=-.14 if kind=='chisel-medium' else .035)
    elif kind in ['bevel','bevel-large']:
        rr=.132 if kind=='bevel' else .145
        lathe('Bevel neck',[(z,r*.87),(z+.13,rr),(z+.23,rr)],TIP)
        bevel_tip(z+.12,h+.08,rr)
    elif kind=='bent':
        lathe('Thirty degree bent working end',[(z,r*.83,0),(z+.20,.115,.04),(h-.18,.111,.31),(h-.04,.088,.36),(h,.028,.35)],TIP)
    elif kind=='knife':
        lathe('Knife neck',[(z,r*.91),(z+.12,.15),(z+.2,.145)],TIP)
        blade('Knife working edge',z+.12,h-.19,.177,.047,TIP,slant=-1.32)

def build_tips():
    root=bpy.data.objects.new('PACE_BLUE_SERIES_16_TIPS',None);bpy.context.collection.objects.link(root)
    root['sourceUnitMillimetres']=10;root['reference']='User 16-tip photo, preserved left-to-right order'
    for spec in TIP_SPECS:
        num,label,kind,x,h,r=spec
        ob=group('TIP_'+num,lambda s=spec:tip(s))
        ob.location.x=(x-873)/80
        ob['tipIndex']=int(num);ob['shape']=label;ob['skuVerified']=False
        ob['pivot']='Lower shaft centre; glTF local Y is the rise/rotation axis'
        ob.parent=root
    return root

scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX'
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.48,.51,.55,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.7

def light(name,loc,power,size,target,ratio=.7):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='RECTANGLE';d.size=size;d.size_y=size*ratio
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

def bounds(root):
    bpy.context.view_layer.update()
    points=[o.matrix_world@Vector(v) for o in root.children_recursive if o.type=='MESH' for v in o.bound_box]
    lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)])
    return lo,hi

def render(root,name,w,h,direction,margin=1.12):
    lo,hi=bounds(root);target=(lo+hi)/2
    d=Vector(direction).normalized();camdata=bpy.data.cameras.new('Product camera');cam=bpy.data.objects.new('Product camera',camdata);scene.collection.objects.link(cam)
    scene.camera=cam;camdata.type='ORTHO';cam.location=target+d*70;cam.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler()
    bpy.context.view_layer.update();inv=cam.matrix_world.inverted()
    points=[inv@(o.matrix_world@Vector(v)) for o in root.children_recursive if o.type=='MESH' for v in o.bound_box]
    x0,x1=min(p.x for p in points),max(p.x for p in points);y0,y1=min(p.y for p in points),max(p.y for p in points)
    shift=cam.matrix_world.to_3x3()@Vector(((x0+x1)/2,(y0+y1)/2,0));cam.location+=shift;target+=shift
    width=margin*max(x1-x0,(y1-y0)*w/h);camdata.ortho_scale=width
    span=(hi-lo).length
    light('Left studio softbox',target+Vector((-span*.60,-span*.60,span*.95)),2200 if name=='pace-ads200' else 600,span*.63,target)
    light('Right narrow reflector',target+Vector((span*.54,-span*.25,span*.44)),1800 if name=='pace-ads200' else 430,span*.55,target,.14)
    light('Rear softbox',target+Vector((0,span*.55,span*.83)),2500 if name=='pace-ads200' else 600,span*.55,target)
    light('Front fill',target+Vector((0,-span*.55,span*.25)),800 if name=='pace-ads200' else 220,span*.68,target,.45)
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(RENDERS/(name+'.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(SRC/(name+'.blend')))
    bpy.ops.render.render(write_still=True)
    return {'view':[d.x,d.z,-d.y],'frame':{'kind':'poster','width':width,'height':width*h/w,'target':[target.x,target.z,-target.y]},'dimensionsSourceUnits':list(hi-lo)}

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
manifest={}
for name,builder,w,h,view in [('pace-ads200',build_station,1600,1200,(1.3,-22,3.5)),('pace-blue-tips',build_tips,2000,680,(0,-14,1.10))]:
    if args and name not in args:continue
    clear();root=builder()
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(SRC/'glb'/(name+'.glb')),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True)
    manifest[name]=render(root,name,w,h,view)
    manifest[name]['url']='/models/'+name+'.glb';manifest[name]['poster']='/images/pace/'+name+'.webp'
    print('Completed '+name,flush=True)
manifest_path=SRC/'pace-manifest.json'
if manifest_path.exists():
    old=json.loads(manifest_path.read_text());old.update(manifest);manifest=old
manifest['tips']=[{'node':'TIP_'+s[0],'index':int(s[0]),'label':s[1],'homePosition':[(s[3]-873)/80,0,0],'axis':'Y','height':s[4],'skuVerified':False} for s in TIP_SPECS]
manifest_path.write_text(json.dumps(manifest,indent=2))
print('PACE source files, GLB masters and renders complete.',flush=True)
