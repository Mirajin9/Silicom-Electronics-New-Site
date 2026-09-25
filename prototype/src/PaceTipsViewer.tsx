import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { AgXToneMapping, MathUtils, Vector3, type Object3D, type OrthographicCamera } from 'three';
import paceModels from './pace-models.json';
import { softwareRenderer } from './ModelViewer';
import { url } from './base';

const spec = paceModels['pace-blue-tips'];
const tips = paceModels.tips;
/** How far a selected tip rises, and the headroom left for it (as in ChatGPT's review page). */
const LIFT = 0.48;
const HEADROOM = 1;

/** Orthographic camera from the poster render, sized like object-fit: contain. */
function Framing() {
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    const target = new Vector3(...(spec.frame.target as [number, number, number]));
    camera.position.copy(target).add(new Vector3(...(spec.view as [number, number, number])).normalize().multiplyScalar(40));
    camera.lookAt(target);
    camera.zoom = Math.min(size.width / spec.frame.width, size.height / (spec.frame.height + HEADROOM));
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

const tipIndex = (object: Object3D | null) => {
  while (object && !/^TIP_\d\d$/.test(object.name)) object = object.parent;
  return object ? tips.findIndex((t) => t.node === object!.name) : -1;
};

function Lineup({ selected, reduced, onHover, onPin, onReady }: {
  selected: number; reduced: boolean; onHover: (i: number) => void; onPin: (i: number) => void; onReady: () => void;
}) {
  const { scene } = useGLTF(url('/models/pace-blue-tips.glb'));
  // Meshopt quantisation moves each tip's node, so animate from the loaded position, kept
  // once on the (cached) node rather than the manifest's design position.
  const nodes = useMemo(() => tips.map((t) => {
    const node = scene.getObjectByName(t.node);
    if (node && node.userData.home === undefined) node.userData.home = node.position.y;
    return node;
  }), [scene]);
  const { invalidate, gl } = useThree();
  const frames = useRef(0);
  useLayoutEffect(() => { invalidate(); }, [selected, invalidate]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    let moving = false;
    nodes.forEach((node, i) => {
      if (!node) return;
      const goal = (node.userData.home as number) + (i === selected ? LIFT : 0);
      node.position.y = reduced ? goal : MathUtils.damp(node.position.y, goal, 11, dt);
      if (i === selected && !reduced) {
        node.rotation.y += dt * 0.9;
        moving = true;
      } else {
        const r = Math.atan2(Math.sin(node.rotation.y), Math.cos(node.rotation.y));
        node.rotation.y = reduced ? 0 : MathUtils.damp(r, 0, 10, dt);
      }
      moving ||= Math.abs(node.position.y - goal) > 1e-4 || Math.abs(node.rotation.y) > 1e-4;
    });
    if (frames.current < 2 && ++frames.current === 2) onReady();
    if (moving || frames.current < 2) invalidate();
  });
  return <primitive
    object={scene}
    onPointerMove={(e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const i = tipIndex(e.object);
      gl.domElement.style.cursor = i >= 0 ? 'pointer' : '';
      onHover(i);
    }}
    onPointerOut={() => { gl.domElement.style.cursor = ''; onHover(-1); }}
    onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); const i = tipIndex(e.object); if (i >= 0) onPin(i); }}
  />;
}

export default function PaceTipsViewer({ selected, reduced, active, onHover, onPin, onReady, onUnsupported }: {
  selected: number; reduced: boolean; active: boolean;
  onHover: (i: number) => void; onPin: (i: number) => void; onReady: () => void; onUnsupported: () => void;
}) {
  return <Canvas
    className="pace-tips-canvas"
    orthographic
    frameloop={active ? 'demand' : 'never'}
    dpr={[1, 1.75]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power', toneMapping: AgXToneMapping }}
    // Vertical swipes keep scrolling the page; taps pick a tip.
    style={{ touchAction: 'pan-x pan-y' }}
    onCreated={(state) => { if (softwareRenderer(state.gl)) onUnsupported(); }}
  >
    <ambientLight intensity={0.9} />
    <directionalLight position={[4, 12, 14]} intensity={2.4} />
    <directionalLight position={[-8, 5, -7]} intensity={1.6} color="#d6e7ff" />
    <Suspense fallback={null}>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[6, 4, 1]} rotation={[-Math.PI / 3, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 0]} scale={[3, 5, 1]} rotation={[0, Math.PI / 2, 0]} />
      </Environment>
    </Suspense>
    <Suspense fallback={null}>
      <Framing />
      <Lineup selected={selected} reduced={reduced} onHover={onHover} onPin={onPin} onReady={onReady} />
    </Suspense>
  </Canvas>;
}
