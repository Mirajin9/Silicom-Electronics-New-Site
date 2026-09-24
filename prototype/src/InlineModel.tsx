import { Component, lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { MODELS, createInput, type ModelId } from './models';
import { LogoLoader } from './brand/Logo';
import { introPlaying, onIntroDone } from './brand/BrandIntro';
import { url } from './base';
const Viewer = lazy(() => import('./ModelViewer'));

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const coarsePointer = () => matchMedia('(pointer: coarse)').matches;

/** A live product model on the page. The poster (if any) shows until the first 3D frame
 *  is drawn, then cross-fades. Drag or swipe sideways to turn it; vertical swipes scroll. */
export function InlineModel({ model, reduced = false, preload }: { model: ModelId; reduced?: boolean; preload?: ModelId[] }) {
  const spec = MODELS[model];
  const host = useRef<HTMLDivElement>(null);
  const input = useRef(createInput()).current;
  const [visible, setVisible] = useState(false);
  const [visited, setVisited] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [readyId, setReadyId] = useState<ModelId | null>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  // Browser-only facts start neutral so server and client render the same markup.
  const [coarse, setCoarse] = useState(false);
  const [introDone, setIntroDone] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setVisited(true);
    }, { rootMargin: '300px 0px' });
    observer.observe(host.current!);
    setCoarse(coarsePointer());
    const change = () => setHidden(document.hidden);
    change();
    document.addEventListener('visibilitychange', change);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', change); };
  }, []);
  useEffect(() => {
    if (!introPlaying()) return;
    setIntroDone(false);
    return onIntroDone(() => setIntroDone(true));
  }, []);

  // `shown`: the canvas has drawn a model, so it replaces the poster. `ready`: the current model is drawn.
  const shown = readyId !== null && !failed;
  const ready = readyId === model && !failed;
  const touch = () => { input.lastInteraction = performance.now(); input.invalidate?.(); };
  const turn = (angle: number) => { input.turn += angle; input.posed = true; touch(); };
  const release = (e: PointerEvent) => {
    if (e.pointerId !== input.pointerId) return;
    input.dragging = false;
    input.pointerId = -1;
    touch();
  };
  const handlers = {
    onPointerDown(e: PointerEvent<HTMLDivElement>) {
      if (e.button !== 0 || !shown) return;
      Object.assign(input, { dragging: true, pointerId: e.pointerId, pointerType: e.pointerType, lastX: e.clientX, lastY: e.clientY, posed: true });
      e.currentTarget.setPointerCapture(e.pointerId);
      touch();
    },
    onPointerMove(e: PointerEvent) {
      if (!input.dragging || e.pointerId !== input.pointerId) return;
      input.dx += e.clientX - input.lastX;
      input.dy += e.clientY - input.lastY;
      input.lastX = e.clientX;
      input.lastY = e.clientY;
      touch();
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerEnter(e: PointerEvent) { if (e.pointerType === 'mouse') { input.hovered = true; touch(); } },
    onPointerLeave(e: PointerEvent) { if (e.pointerType === 'mouse') { input.hovered = false; touch(); } },
    onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') turn(e.key === 'ArrowLeft' ? -0.4 : 0.4);
      else if (e.key === 'Home') { input.reset = true; touch(); }
      else return;
      e.preventDefault();
    },
  };

  return <div ref={host} className={`inline-model inline-${model}`} data-ready={shown}>
    <div
      className="inline-stage"
      tabIndex={0}
      role="group"
      aria-roledescription="3D model"
      aria-label={`${spec.label}. ${coarse ? 'Swipe sideways' : 'Drag'} to rotate, or use the left and right arrow keys.`}
      {...handlers}
    >
      {(spec.poster || failed) && <img className="inline-poster" src={url((failed ? spec.fallback : spec.poster)!)} alt="" draggable={false} />}
      {visited && introDone && !failed && <Boundary onError={() => setFailed(true)}>
        <Suspense fallback={null}>
          <Viewer model={model} input={input} reduced={reduced} paused={paused} active={visible && !hidden} preload={preload} onReady={setReadyId} onUnsupported={() => setFailed(true)} />
        </Suspense>
      </Boundary>}
      {!ready && !spec.poster && !failed && <LogoLoader />}
    </div>
    <div className="inline-controls">
      <span>{failed ? 'Interactive view unavailable on this device' : coarse ? 'Swipe sideways to rotate' : 'Drag to rotate'}</span>
      {!failed && <div>
        <button type="button" aria-label="Rotate model left" onClick={() => turn(-0.4)}>↶</button>
        <button type="button" aria-label="Reset model view" onClick={() => { input.reset = true; touch(); }}>Reset</button>
        {!reduced && <button type="button" aria-pressed={paused} aria-label={paused ? 'Resume model motion' : 'Pause model motion'} onClick={() => setPaused(!paused)}>{paused ? 'Play' : 'Pause'}</button>}
        <button type="button" aria-label="Rotate model right" onClick={() => turn(0.4)}>↷</button>
      </div>}
    </div>
  </div>;
}

const packages: [ModelId, string, string][] = [
  ['to220', 'TO-220', 'Through-hole power · body 10 × 9.2 mm'],
  ['to247', 'TO-247', 'Through-hole high power · body 15.9 × 20.9 mm'],
  ['qfn', 'QFN-32', 'Surface-mount leadless · 5 × 5 mm'],
  ['sot23', 'SOT-23', 'Surface-mount small signal · 2.9 × 1.3 mm'],
];
const packageIds = packages.map(([id]) => id);

export function PackageBrowser({ reduced = false }: { reduced?: boolean }) {
  const [index, setIndex] = useState(0);
  const [model, label, description] = packages[index];
  const step = (by: number) => setIndex((index + by + packages.length) % packages.length);
  return <div className="package-browser">
    <InlineModel model={model} reduced={reduced} preload={packageIds} />
    <div className="package-navigation">
      <button type="button" aria-label="Previous semiconductor package" onClick={() => step(-1)}>←</button>
      <div aria-live="polite"><strong>{label}</strong><span>{description}</span></div>
      <button type="button" aria-label="Next semiconductor package" onClick={() => step(1)}>→</button>
    </div>
    <div className="package-dots" aria-label="Select package">{packages.map(([id, name], i) => <button type="button" key={id} aria-label={`Show ${name} package`} aria-pressed={i === index} onClick={() => setIndex(i)}>{name}</button>)}</div>
    <p className="package-note">Package families at typical JEDEC outline dimensions, shown enlarged. Availability depends on the selected part.</p>
  </div>;
}
