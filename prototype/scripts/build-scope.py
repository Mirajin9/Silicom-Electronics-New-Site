"""Tektronix 5 Series B visual study from supplied photographs.
Reference-based geometry, not a manufacturer CAD conversion or dimensional model.
Run with Blender 5.x --background --python scripts/build-scope.py.
"""
import bpy, os, math, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public');SOURCE=os.path.join(ROOT,'model-source')
os.makedirs(SOURCE,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def mat(name,color,metal=0,rough=.4,emission=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    if emission:b.inputs['Emission Color'].default_value=(*color,1);b.inputs['Emission Strength'].default_value=emission
    return m
housing=mat('Warm white polymer',(.72,.75,.73),0,.32)
front=mat('Front panel white',(.86,.88,.85),0,.30)
rear=mat('Tek blue housing',(.028,.26,.40),.05,.34)  # sampled from the supplied photographs
grip=mat('Blue handle rubber',(.024,.24,.38),0,.57)
plate=mat('Rear I/O plate',(.50,.53,.55),.35,.35)
black=mat('Display bezel',(.009,.012,.016),0,.29)
screen=mat('Display glass',(.003,.006,.009),0,.29)
grey=mat('Control grey',(.39,.44,.45),.05,.30)
dark=mat('Vent shadow',(.024,.043,.046),0,.6)
silver=mat('Nickel connectors',(.59,.65,.67),.87,.21)
gold=mat('Connector brass',(.49,.32,.10),.80,.24)
label=mat('Panel typography',(.06,.08,.084),0,.6)
white=mat('Screen typography',(.67,.76,.78),0,.7,.2)
grid=mat('Screen graticule',(.08,.16,.18),0,.7,.3)
dim=mat('Screen secondary panel',(.045,.061,.064),0,.6,.2)
yellow=mat('Channel yellow',(.85,.73,.01),0,.45,.7)
cyan=mat('Channel cyan',(.01,.65,.72),0,.45,.7)
pink=mat('Channel magenta',(.61,.09,.51),0,.45,.6)
green=mat('Channel green',(.14,.54,.24),0,.45,.6)
orange=mat('Channel orange',(.92,.28,.035),0,.45,.4)
chcolors=[yellow,cyan,pink,green,orange,white,cyan,yellow]

def finish(o,name,m,bevel=0):
    o.name=name;o.data.materials.append(m)
    if bevel:
        b=o.modifiers.new('Soft manufactured edges','BEVEL');b.width=bevel;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
        for f in o.data.polygons:f.use_smooth=True
        n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');n.keep_sharp=True;bpy.ops.object.modifier_apply(modifier=n.name)
    return o
def box(name,loc,dims,m,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=dims;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,m,bevel)
def cylinder(name,loc,r,depth,m,rotation=(math.pi/2,0,0),bevel=.006,vertices=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc,rotation=rotation);return finish(bpy.context.object,name,m,bevel)
def line(name,points,m,r=.006):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=r;c.bevel_resolution=1;s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,xyz in zip(s.points,points):p.co=(*xyz,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
def text(name,body,x,z,size,m=label,y=-.937,align='LEFT'):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.align_x=align;c.resolution_u=3;c.space_character=1.03
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=(x,y,z);o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(m);return o

# Exterior silhouette: deep ventilated rear, broad front, tilting feet and raised handle.
box('Cyan rear shell',(0,.23,1.66),(4.50,1.36,2.64),rear,.16)
box('White side and top shell',(0,-.33,1.66),(4.57,.70,2.68),housing,.15)
box('Front panel',(0,-.76,1.67),(4.55,.30,2.68),front,.14)
box('Rear inset',(0,.937,1.64),(3.98,.035,2.14),dark,.07)
box('Rear service cover',(0,.966,1.64),(3.82,.04,2.02),rear,.05)
for x in [-1.63,1.63]:
    o=box('Front foot',(x,-.47,.19),(.44,.58,.46),housing,.035);o.rotation_euler.x=math.radians(-11)
    box('Foot rubber',(x,-.46,-.025),(.42,.39,.052),dark,.016)
    cylinder('Handle hinge',(x*1.34,.20,2.64),.155,.085,housing,rotation=(0,math.pi/2,0))
for side in [-1,1]:
    x=side*2.14
    line('Handle side support',[(x,.22,2.67),(x,.25,3.15),(x*.99,.25,3.33),(x*.94,.25,3.42),(side*1.80,.25,3.42)],housing,.056)
box('Carrying handle grip',(0,.25,3.42),(3.72,.22,.18),grip,.065)
for i in range(27):
    z=.65+i*.077
    box('Right side ventilation %02d'%i,(2.246,.30,z),(.012,.97,.019),dark,.006)
    box('Left side ventilation %02d'%i,(-2.246,.30,z),(.012,.97,.019),dark,.006)
# Rear: a full grid of cooling slots around a grey I/O plate, as in the rear photograph.
plate_box=(-.72,.72,.60,1.26)  # x0, x1, z0, z1
for col in range(12):
    for row in range(21):
        x=-1.68+col*.305;z=.74+row*.088
        if plate_box[0]-.15<x<plate_box[1]+.15 and z<plate_box[3]+.05:continue
        box('Rear cooling slot',(x,.991,z),(.25,.012,.046),dark,0)
box('Rear I/O plate',(0,.992,.93),(1.44,.02,.66),plate,.01)
box('Mains inlet',(-.46,1.006,.80),(.32,.03,.22),black,.012)
for x in [-.54,-.46,-.38]:box('Mains pin',(x,1.02,.80),(.03,.02,.07),silver,0)
for i,x in enumerate([-.08,.13,.34,.55]):
    cylinder('Aux BNC barrel %d'%i,(x,1.03,1.10),.045,.075,silver,rotation=(math.pi/2,0,0))
    cylinder('Aux BNC bore %d'%i,(x,1.07,1.10),.02,.01,black,rotation=(math.pi/2,0,0),bevel=0)
for i,x in enumerate([-.16,-.03]):box('Rear USB port %d'%i,(x,1.004,.80),(.10,.02,.045),black,.004)
box('LAN port',(.12,1.006,.80),(.13,.024,.11),black,.006)
box('DisplayPort',(.31,1.004,.80),(.12,.02,.05),black,.005)
box('DVI port',(.50,1.004,.80),(.22,.02,.07),black,.006)
box('Rear serial label',(-.46,1.003,1.08),(.28,.012,.14),housing,0)
for x in [-1.62,1.62]:
    box('Handle hinge bracket',(x,.97,2.66),(.46,.04,.12),plate,.02)
    box('Rear foot',(x,.88,.30),(.40,.14,.10),dark,.02)

# Screen and front-panel controls.
box('Large display bezel',(-.46,-.931,1.91),(3.50,.065,2.04),black,.025)
box('Active display',(-.49,-.969,1.89),(3.29,.012,1.78),screen,.006)
text('Tektronix logotype','Tektronix',-2.14,2.85,.076,white,-.977)
text('Product family','5 SERIES B  MIXED SIGNAL OSCILLOSCOPE',1.23,2.87,.034,white,-.977,'RIGHT')
text('Measurement screen title','MEASURE   |   ACQUIRE   |   ANALYZE',-2.075,2.69,.029,white,-.982)
text('Screen status','RUN',.29,2.69,.03,green,-.982)
box('Measurements sidebar',(.867,-.98,1.84),(.56,.005,1.48),dim,0)
text('Sidebar title','MEASUREMENTS',.62,2.49,.039,white,-.99)
for i in range(11):
    z=2.35-i*.105
    text('Measurement label %d'%i,['Amplitude','Frequency','Period','Rise time'][i%4],.62,z,.027,white,-.99)
    text('Measurement value %d'%i,['3.300 V','1.000 MHz','1.000 us','3.240 ns'][i%4],.62,z-.037,.035,chcolors[i%4],-.99)
# Grid and explicit illustrative waveform curves.
for i in range(13):
    x=-2.075+i*.216
    line('Vertical graticule %d'%i,[(x,-.983,1.13),(x,-.983,2.56)],grid,.0015)
for j in range(9):
    z=1.13+j*.179
    line('Horizontal graticule %d'%j,[(-2.075,-.983,z),(.517,-.983,z)],grid,.0015)
for k,m in enumerate([yellow,cyan,pink,green]):
    pts=[]
    for i in range(350):
        t=i/349;x=-2.075+t*2.592
        if k==0:signal=(.13 if math.sin(t*math.pi*22)>0 else -.13)+.008*math.sin(t*190)
        elif k==1:signal=.12*math.sin(t*math.pi*16)+.026*math.sin(t*math.pi*48)
        elif k==2:signal=.11*math.sin(t*math.pi*16+.9)*(.6+.4*math.cos(t*6))
        else:signal=.06*math.sin(t*math.pi*7)+(.055 if math.sin(t*math.pi*10)>0 else -.04)
        pts.append((x,-.99,2.38-k*.345+signal))
    line('Illustrative channel %d'%(k+1),pts,m,.004)
for i,m in enumerate(chcolors):
    x=-2.065+i*.402
    box('Channel status bar %d'%i,(x+.18,-.987,1.043),(.38,.006,.055),dim,0)
    text('Channel setting %d'%i,'%d   1.00 V'%(i+1),x,1.034,.025,m,-.994)
text('Illustration note','ILLUSTRATIVE SIGNAL  /  DISPLAY STUDY',-2.07,.985,.023,white,-.994)

def knob(name,x,z,r=.106):
    cylinder(name+' rim',(x,-.947,z),r*1.10,.041,grey)
    cylinder(name+' dial',(x,-1.002,z),r,.082,housing)
    cylinder(name+' face',(x,-1.05,z),r*.86,.02,front)
    line(name+' index',[(x,-1.063,z+r*.53),(x,-1.063,z+r*.84)],label,.005)
def button(name,x,z,w=.17,h=.062,m=grey):return box(name,(x,-.944,z),(w,.052,h),m,.012)
text('Control title','ACQUISITION',1.43,2.84,.036)
button('Run stop',1.54,2.73,.23,.105,green);button('Single',1.86,2.73,.21,.105,housing)
for j in range(2):
    knob('Multipurpose %d'%j,1.53,2.46-j*.30,.107)
    button('Control soft key',1.84,2.51-j*.3,.20);button('Control soft key',1.84,2.41-j*.3,.20,h=.06,m=front)
line('Control separator',[(1.35,-.94,2.03),(2.06,-.94,2.03)],grey,.004)
text('Vertical label','VERTICAL',1.43,1.95,.038)
for i in range(8):
    x=1.41+(i%4)*.17;z=1.84-(i//4)*.115
    button('Channel selection %d'%(i+1),x,z,.12,.07,chcolors[i]);text('Channel number',str(i+1),x,z-.012,.033,label,-.975,'CENTER')
knob('Vertical position',1.53,1.50,.105);knob('Vertical scale',1.92,1.50,.118)
line('Control separator',[(1.35,-.94,1.34),(2.06,-.94,1.34)],grey,.004)
text('Horizontal title','HORIZONTAL',1.43,1.25,.035)
knob('Horizontal scale',1.62,1.06,.115);button('Horizontal key',1.95,1.13,.13);button('Horizontal key',1.95,1.00,.13)
for row in range(2):
    for col in range(2):button('Function key',1.54+col*.33,.81-row*.10,.24,.062,front)
for col in range(3):box('Front USB port',(1.44+col*.23,-.94,.50),(.16,.055,.062),black,.006)
text('USB legend','USB',1.53,.56,.033)
for i,m in enumerate(chcolors):
    x=-1.84+i*.404
    box('Input well %d'%(i+1),(x,-.933,.683),(.30,.034,.355),grey,.012)
    box('Input recess %d'%(i+1),(x,-.956,.665),(.22,.034,.26),black,.006)
    cylinder('BNC outer barrel %d'%(i+1),(x,-1.014,.669),.084,.13,gold)
    cylinder('BNC dielectric %d'%(i+1),(x,-1.082,.669),.061,.008,front,bevel=.002)
    cylinder('BNC bore %d'%(i+1),(x,-1.09,.669),.032,.008,black,bevel=.002)
    cylinder('BNC contact %d'%(i+1),(x,-1.096,.669),.010,.005,gold,bevel=.001,vertices=16)
    for dx in [-.092,.092]:box('BNC locking lug',(x+dx,-1.02,.669),(.032,.055,.033),silver,.005)
    box('Channel identifier',(x,-.958,.875),(.27,.02,.025),m,.002)
    text('Input number',str(i+1),x,.91,.042,label,-.95,'CENTER')
cylinder('Illuminated power ring',(-2.085,-.947,.49),.062,.025,cyan)
cylinder('Power switch',(-2.085,-.966,.49),.043,.021,front)
text('Probe legend','ANALOG INPUTS',-.35,.445,.030,label,-.94,'CENTER')
for x in [-2.10,2.10]:
    for z in [.44,2.88]:cylinder('Case screw',(x,-.934,z),.023,.007,silver,bevel=.001,vertices=16)

# Convert and merge by material to limit draw calls in the web viewer.
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=bpy.context.selected_objects[0];bpy.ops.object.convert(target='MESH')
for material in list(bpy.data.materials):
    objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==material]
    if not objs:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name=material.name
bpy.ops.object.select_all(action='SELECT')
os.makedirs(os.path.join(SOURCE,'glb'),exist_ok=True);bpy.ops.export_scene.gltf(filepath=os.path.join(SOURCE,'glb','scope.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True;scene.render.film_transparent=True;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.world.color=(.27,.27,.27);scene.view_settings.view_transform='AgX'
def light(name,loc,power,size,color=(1,1,1)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.5))-o.location).to_track_quat('-Z','Y').to_euler()
light('Broad front softbox',(-3,-5,7),1000,5);light('Right fill',(5,-3,4),750,4);light('Rear rim',(1,4,6),1300,3,(.78,.89,1))
cdata=bpy.data.cameras.new('Product camera');camera=bpy.data.objects.new('Product camera',cdata);scene.collection.objects.link(camera);scene.camera=camera;cdata.type='ORTHO'
def render(name,w,h,loc,target,scale):
    camera.location=loc;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();cdata.ortho_scale=scale;scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=os.path.join(OUT,'images',name+'.png');bpy.ops.render.render(write_still=True)
render('scope-hero',1400,1100,(6,-12,5.5),(0,0,1.62),6.25)
render('scope-detail',1100,850,(-3.5,-13,4.0),(0,0,1.65),5.8)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,'tektronix-5b-study.blend'))
print('Oscilloscope reference study complete.')

