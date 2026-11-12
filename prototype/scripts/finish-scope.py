"""Update the LCD poster material and render the refined existing model."""
import bpy, bmesh, math, sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1];source=root/'model-source';out=root/'public/images'
bpy.ops.wm.open_mainfile(filepath=str(source/'tektronix-5b-refined.blend'))
bpy.context.preferences.filepaths.save_version=0
if bpy.context.scene.get('scope_connector_revision',0)<2:
    # Correct the first detail pass in-place; no enclosure is recreated.
    for o in list(bpy.context.scene.objects):
        if o.type!='MESH':continue
        mat=o.active_material.name if o.active_material else ''
        bm=bmesh.new();bm.from_mesh(o.data);discard=[];inv=o.matrix_world.inverted()
        for v in bm.verts:
            p=o.matrix_world@v.co
            if p.y>1.05:
                if mat in ['White panel print','Fine panel print']:discard.append(v)
                else:
                    p.x=-p.x;v.co=inv@p
                    if mat=='Gold plated contacts' and p.x<-.1 and p.y>1.115 and p.z<1.0:discard.append(v)
            if mat=='Screen typography' and p.y<-.97 and p.x>0 and p.z>2.95:discard.append(v)
        bmesh.ops.delete(bm,geom=list(set(discard)),context='VERTS');bm.to_mesh(o.data);bm.free()
    def legend(body,x,z,size=.025,dark=False):
        c=bpy.data.curves.new('Rear '+body,'FONT');c.body=body;c.size=size;c.align_x='CENTER';c.resolution_u=2
        c.font=bpy.data.fonts.get('Arial Regular') or bpy.data.fonts[0]
        o=bpy.data.objects.new('Rear '+body,c);bpy.context.collection.objects.link(o)
        o.location=(-x,1.065,z*1.08);o.rotation_euler=(math.pi/2,0,math.pi)
        o.data.materials.append(bpy.data.materials['Fine panel print' if dark else 'White panel print'])
    legend('Tektronix  MSO58B',0,1.49,.046,True)
    legend('5 Series B MSO | CE | Protective earth',0,1.425,.022,True)
    for x,t in [(0,'Ref In'),(.36,'AUX Out'),(.71,'AFG Out')]:legend(t,x,1.28,.028)
    legend('100-240 V / 50-60 Hz',-.57,1.33,.024);legend('LAN 10/100/1000',-.62,.98,.022)
    for x,t in [(-.62,'USB 2.0'),(-.29,'USB 3.0'),(.04,'Device')]:legend(t,x,.755,.024)
    for x,z,t in [(.31,.63,'DisplayPort'),(.68,.64,'DVI-D'),(.68,.91,'VGA')]:legend(t,x,z,.022)
    for x,z,w,n in [(.68,.55,.39,8),(.68,.81,.28,5)]:
        for j in range(n):
            for row in range(2):
                bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=.004,depth=.005,location=(-(x-w*.34+j*w*.68/(n-1)),1.124,(z-.013+row*.027)*1.08),rotation=(math.pi/2,0,0))
                bpy.context.object.data.materials.append(bpy.data.materials['Port recess'])
    for name,loc,dims,mat in [('USB B cavity',(-.04,1.13,.57*1.08),(.10,.012,.08*1.08),'Port recess'),('USB B tongue',(-.04,1.14,.55*1.08),(.07,.008,.015*1.08),'Tek blue housing')]:
        bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dims;o.data.materials.append(bpy.data.materials[mat]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:
        if o.type in {'FONT','MESH'}:o.select_set(True)
    bpy.context.view_layer.objects.active=bpy.context.selected_objects[0];bpy.ops.object.convert(target='MESH')
    for material in bpy.data.materials:
        if material.name=='SCOPE_SCREEN':continue
        objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==material and len(o.data.vertices)]
        if len(objs)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:o.select_set(True)
        bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join()
    bpy.context.scene['scope_connector_revision']=2
if not bpy.context.scene.get('scope_rear_rim_revision',False):
    # Complete the rear reflection on the back face of the IEC metal rim. Its
    # back face sits just behind the original selection plane.
    for o in bpy.context.scene.objects:
        if o.type!='MESH' or not o.active_material:continue
        mat=o.active_material.name
        if mat not in ['Brushed nickel','Front panel white']:continue
        inv=o.matrix_world.inverted()
        for v in o.data.vertices:
            p=o.matrix_world@v.co
            if 1.04<p.y<1.05 and (mat=='Front panel white' or 1.10<p.z<1.45):
                p.x=-p.x;v.co=inv@p
    bpy.context.scene['scope_rear_rim_revision']=True
if bpy.context.scene.get('scope_normals_revision',0)<4:
    # Panel parts reflected in the first refinement need outward face winding
    # and regenerated split normals, especially the metal connector shells.
    for o in bpy.context.scene.objects:
        if o.type!='MESH' or not o.active_material:continue
        if any(t in o.active_material.name.lower() for t in ['print','typography','scope_screen']):continue
        bm=bmesh.new();bm.from_mesh(o.data)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
        if len(o.data.loops):o.data.normals_split_custom_set([(0,0,0)]*len(o.data.loops))
        o.data.set_sharp_from_angle(angle=math.radians(55))
        bpy.context.view_layer.objects.active=o
        modifier=o.modifiers.new('Refined weighted normals','WEIGHTED_NORMAL');modifier.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.context.scene['scope_normals_revision']=4
for o in bpy.context.scene.objects:
    if o.type=='MESH' and o.active_material and o.active_material.name in ['Warm white polymer','Front panel white','Tek blue housing']:
        bm=bmesh.new();bm.from_mesh(o.data)
        bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>4])
        bm.to_mesh(o.data);bm.free()
m=bpy.data.materials['SCOPE_SCREEN'];p=m.node_tree.nodes.get('Principled BSDF')
t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(source/'scope-textures/screen-default.png'))
m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color']);m.node_tree.links.new(t.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.65
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(source/'glb/scope.glb'),export_format='GLB',use_selection=True,export_apply=True,export_tangents=True,export_cameras=False,export_lights=False)
scene=bpy.context.scene;camera=scene.camera;scene.cycles.samples=32
def render(name,loc,scale,w=1400,h=1100):
    camera.location=loc;camera.rotation_euler=(Vector((0,0,1.76))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
if '--export-only' not in sys.argv:
    render('scope-hero',(6,-12,5.5),6.25)
    render('scope-detail',(-3.5,-13,4.0),5.8,1100,850)
    render('scope-rear',(-4,12,4.8),6.25)
bpy.ops.wm.save_as_mainfile(filepath=str(source/'tektronix-5b-refined.blend'))
