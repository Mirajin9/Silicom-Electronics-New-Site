// Standalone review only. No imports or edits to the main redesign's components.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const status = document.getElementById('status');
const manifest = await fetch('/models/pace-manifest.json').then(r => r.json());

function studio(id, spec) {
  const host = document.getElementById(id);
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.AgXToneMapping;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', id === 'station' ? 'Interactive PACE soldering station' : 'Interactive PACE tip lineup');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .05).texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, .8));
  for (const [pos, intensity] of [[[4,12,14], 2.3],[[-8,5,-7],1.8]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity); light.position.set(...pos); scene.add(light);
  }
  const camera = new THREE.OrthographicCamera();
  const target = new THREE.Vector3(...spec.frame.target);
  camera.position.copy(target).add(new THREE.Vector3(...spec.view).multiplyScalar(70));
  camera.lookAt(target); camera.near=.1;camera.far=250;
  function resize() {
    const w=host.clientWidth,h=host.clientHeight,aspect=w/h;
    let fw=spec.frame.width,fh=spec.frame.height;
    // Leave room above the lineup for the hover lift.
    if(id==='tips')fh+=1.0;
    if(fw/fh<aspect)fw=fh*aspect;else fh=fw/aspect;
    camera.left=-fw/2;camera.right=fw/2;camera.top=fh/2;camera.bottom=-fh/2;camera.updateProjectionMatrix();
    renderer.setSize(w,h); renderer.render(scene,camera);
  }
  new ResizeObserver(resize).observe(host);resize();
  return {host,scene,renderer,camera,target,render:()=>renderer.render(scene,camera)};
}

try {
  const s=studio('station',manifest['pace-ads200']);
  const t=studio('tips',manifest['pace-blue-tips']);
  const [station,tips]=await Promise.all([loader.loadAsync('/models/pace-ads200.glb'),loader.loadAsync('/models/pace-blue-tips.glb')]);
  s.scene.add(station.scene);t.scene.add(tips.scene);
  s.host.classList.add('ready');t.host.classList.add('ready');
  const controls=new OrbitControls(s.camera,s.renderer.domElement);
  controls.target.copy(s.target);controls.enablePan=false;controls.minZoom=.7;controls.maxZoom=2.4;controls.update();controls.saveState();
  controls.addEventListener('change',s.render);document.getElementById('reset').onclick=()=>{controls.reset();s.render();};
  const entries=manifest.tips.map(spec=>({spec,node:tips.scene.getObjectByName(spec.node)}));
  if(entries.some(e=>!e.node))throw new Error('A required independent tip node is missing.');
  let selected=-1,pinned=-1,hovered=-1;
  const names=document.getElementById('tip-name');const buttons=[];
  function select(i){
    selected=i;names.textContent=i<0?'Hover over any tip to inspect its shape.':`${String(i+1).padStart(2,'0')} · ${entries[i].spec.label}`;
    buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
    t.host.dataset.activeTip=i<0?'':entries[i].spec.node;
  }
  entries.forEach((e,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label',`Inspect tip ${i+1}: ${e.spec.label}`);b.setAttribute('aria-pressed','false');
    b.addEventListener('pointerenter',()=>select(i));b.addEventListener('pointerleave',()=>select(pinned));
    b.addEventListener('focus',()=>select(i));b.addEventListener('blur',()=>select(pinned));
    b.addEventListener('click',()=>{pinned=pinned===i?-1:i;select(pinned);});
    document.getElementById('tip-buttons').appendChild(b);buttons.push(b);
  });
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  t.renderer.domElement.addEventListener('pointermove',event=>{
    const r=t.renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);
    raycaster.setFromCamera(pointer,t.camera);
    const hit=raycaster.intersectObjects(entries.map(e=>e.node),true)[0];
    let object=hit?.object;while(object&&!/^TIP_\d\d$/.test(object.name))object=object.parent;
    hovered=object?entries.findIndex(e=>e.node===object):-1;select(hovered>=0?hovered:pinned);
    t.renderer.domElement.style.cursor=hovered>=0?'pointer':'default';
  });
  t.renderer.domElement.addEventListener('pointerleave',()=>{hovered=-1;select(pinned);});
  t.renderer.domElement.addEventListener('click',()=>{pinned=hovered===pinned?-1:hovered;select(pinned);});
  let previous=performance.now();
  function animate(now){
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(!document.hidden){
      let moving=false;
      entries.forEach(({node,spec},i)=>{
        const active=i===selected,goal=spec.homePosition[1]+(active?.48:0);
        node.position.y=reduced?goal:THREE.MathUtils.damp(node.position.y,goal,11,dt);
        if(active&&!reduced){node.rotation.y+=dt*.90;moving=true;}
        else{node.rotation.y=Math.atan2(Math.sin(node.rotation.y),Math.cos(node.rotation.y));node.rotation.y=THREE.MathUtils.damp(node.rotation.y,0,10,dt);}
        moving ||= Math.abs(node.position.y-goal)>.0001||Math.abs(node.rotation.y)>.0001;
      });
      if(moving||reduced)t.render();
    }
    requestAnimationFrame(animate);
  }
  s.render();t.render();requestAnimationFrame(animate);
  status.textContent='Station ready · All 16 tips retain independent pivots';status.dataset.ready='true';
} catch(error) {
  console.error(error);status.textContent='3D preview unavailable. The rendered product images are shown above.';
}
