import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { ACESFilmicToneMapping, AgXToneMapping, Box3, Group, OrthographicCamera, Vector3, type WebGLRenderer } from 'three';
import { MODELS, type ModelId, type ModelSpec, type ViewerInput } from './models';
import { url } from './base';

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Software WebGL (blocklisted GPUs, some office laptops) renders at a few frames a
 *  second and pins the CPU; those visitors get the still image instead. */
function softwareRenderer(gl: WebGLRenderer) {
  const context = gl.getContext();
  const info = context.getExtension('WEBGL_debug_renderer_info');
  const name = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}

/** Places the orthographic camera along the spec's view direction and sizes it like
 *  object-fit: contain, so a poster frame and the live frame line up exactly. */
function Framing({ spec, radius }: { spec: ModelSpec; radius: number }) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const cam = camera as OrthographicCamera;
    cam.position.copy(new Vector3(...spec.view).normalize().multiplyScalar(40));
    cam.up.set(0, 1, 0);
    cam.lookAt(0, 0, 0);
    const [w, h] = spec.frame.kind === 'poster'
      ? [spec.frame.width, spec.frame.height]
      : [2 * radius * spec.frame.padding, 2 * radius * spec.frame.padding];
    cam.zoom = Math.min(size.width / w, size.height / h);
    cam.near = 0.1;
    cam.far = 100;
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, spec, radius, invalidate]);
  return null;
}

function Product({ spec }: { spec: ModelSpec }) {
  const { scene } = useGLTF(url(spec.url));
  const { object, offset, radius } = useMemo(() => {
    const object = scene.clone(true);
    const box = new Box3().setFromObject(object);
    const centre = spec.frame.kind === 'poster' ? new Vector3(...spec.frame.target) : box.getCenter(new Vector3());
    return { object, offset: centre.negate(), radius: box.getSize(new Vector3()).length() / 2 };
  }, [scene, spec]);
  return <>
    <Framing spec={spec} radius={radius} />
    <primitive object={object} position={offset} dispose={null} />
  </>;
}

/** Idle sway, hover, drag, inertia and keyboard turns. Rotation pivots on the model's
 *  vertical axis; tilt pivots on the camera's horizontal axis. */
function Rig({ spec, input, animate, reduced, entrance, onReady, children }: {
  spec: ModelSpec; input: ViewerInput; animate: boolean; reduced: boolean; entrance: boolean;
  onReady: (id: ModelId) => void; children: ReactNode;
}) {
  const outer = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const yawGroup = useRef<Group>(null);
  const azimuth = Math.atan2(spec.view[0], spec.view[2]);
  const bobSize = spec.frame.kind === 'poster' ? 0.05 : 0.025;
  const s = useRef({ yaw: 0, pitch: 0, vel: 0, turn: 0, phase: 0, scale: 1, bob: 0, enter: entrance && !reduced ? 0 : 1, resetting: false, frames: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const now = performance.now();
    const st = s.current;
    if (input.reset) {
      input.reset = false;
      input.posed = false;
      st.resetting = true;
      st.vel = 0;
      st.turn = 0;
    }
    if (input.turn) {
      st.turn += input.turn;
      input.turn = 0;
      st.resetting = false;
    }
    let moving = false;
    if (Math.abs(st.turn) > 1e-4) {
      const step = st.turn * (1 - Math.exp(-dt * 9));
      st.yaw += step;
      st.turn -= step;
      moving = true;
    }
    // Movement is applied even if the drag has already ended, so a quick flick is never lost.
    if (input.dx || input.dy) {
      const step = input.dx * 0.0095;
      st.yaw += step;
      st.vel = input.dragging ? step / Math.max(dt, 1e-3) : 0;
      if (input.pointerType === 'mouse') st.pitch = Math.max(-0.4, Math.min(0.4, st.pitch + input.dy * 0.006));
      input.dx = input.dy = 0;
      st.resetting = false;
      moving = true;
    } else if (input.dragging) {
      st.vel = 0;
    } else if (st.vel) {
      st.yaw += st.vel * dt;
      st.vel *= Math.exp(-dt * 4.5);
      if (Math.abs(st.vel) < 0.02) st.vel = 0;
      moving = true;
    }
    const engaged = input.dragging || st.vel !== 0 || Math.abs(st.turn) > 1e-4;
    // A pose the visitor chose is kept while they hover, and for three seconds after.
    if (input.posed && !input.hovered && !engaged && now - input.lastInteraction > 3000) input.posed = false;
    const auto = animate && !input.posed && !engaged;
    if (auto && !input.hovered) st.phase += dt * 0.5;
    if (!engaged && (auto || st.resetting)) {
      // Hovering turns the product to face the visitor; otherwise it sways around that view.
      const target = st.resetting || input.hovered ? 0 : spec.sway * Math.sin(st.phase);
      const diff = wrap(target - st.yaw);
      st.yaw += diff * (1 - Math.exp(-dt * 2.6));
      if (st.resetting && Math.abs(diff) < 1e-3) st.resetting = false;
      moving ||= Math.abs(diff) > 1e-4;
    }
    if (!input.dragging && !input.posed) st.pitch *= Math.exp(-dt * 2.5);
    const scaleTarget = input.hovered && !reduced ? 1.035 : 1;
    st.scale += (scaleTarget - st.scale) * (1 - Math.exp(-dt * 6));
    const bobTarget = animate && !input.hovered && !engaged ? Math.sin(state.clock.elapsedTime * 0.9) * bobSize : 0;
    st.bob += (bobTarget - st.bob) * (1 - Math.exp(-dt * 3));
    if (st.enter < 1) st.enter = Math.min(1, st.enter + dt / 0.6);
    const e = ease(st.enter);

    outer.current!.position.y = st.bob;
    outer.current!.scale.setScalar(st.scale * (0.86 + 0.14 * e));
    tilt.current!.rotation.x = st.pitch;
    yawGroup.current!.rotation.y = st.yaw - 0.6 * (1 - e);

    // Report readiness once a frame has actually been drawn.
    if (st.frames < 2 && ++st.frames === 2) onReady(spec.id);
    const settled = !moving && st.enter === 1 && Math.abs(st.scale - scaleTarget) < 1e-3
      && Math.abs(st.bob - bobTarget) < 1e-4 && (input.posed || Math.abs(st.pitch) < 1e-3);
    if (!animate && (!settled || st.frames < 2)) state.invalidate();
  });

  return <group ref={outer}>
    <group rotation-y={azimuth}>
      <group ref={tilt}>
        <group rotation-y={-azimuth}>
          <group ref={yawGroup}>{children}</group>
        </group>
      </group>
    </group>
  </group>;
}

export default function ModelViewer({ model, input, reduced, paused, active, preload = [], onReady, onUnsupported }: {
  model: ModelId; input: ViewerInput; reduced: boolean; paused: boolean; active: boolean;
  preload?: ModelId[]; onReady: (id: ModelId) => void; onUnsupported: () => void;
}) {
  const spec = MODELS[model];
  const first = useRef(model);
  const animate = !reduced && !paused;
  const preloadKey = preload.join();
  useEffect(() => { preload.forEach((id) => useGLTF.preload(url(MODELS[id].url))); }, [preloadKey]);
  return <Canvas
    className="viewer-canvas"
    orthographic
    frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
    dpr={[1, 1.75]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power', toneMapping: spec.tone === 'agx' ? AgXToneMapping : ACESFilmicToneMapping }}
    style={{ pointerEvents: 'none' }}
    onCreated={(state) => {
      if (softwareRenderer(state.gl)) onUnsupported();
      input.invalidate = state.invalidate;
    }}
  >
    <ambientLight intensity={0.9} />
    <directionalLight position={[5, 8, 6]} intensity={2.8} />
    <directionalLight position={[-4, 3, -4]} intensity={1.8} color="#d6e7ff" />
    {spec.rim && <directionalLight position={[-3, 4, -7]} intensity={3.2} color="#a9cdff" />}
    <Suspense fallback={null}>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[6, 4, 1]} rotation={[-Math.PI / 3, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 0]} scale={[3, 5, 1]} rotation={[0, Math.PI / 2, 0]} />
      </Environment>
    </Suspense>
    <Suspense fallback={null}>
      <Rig key={model} spec={spec} input={input} animate={animate} reduced={reduced} entrance={model !== first.current} onReady={onReady}>
        <Product spec={spec} />
      </Rig>
    </Suspense>
  </Canvas>;
}
