import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import paceModels from './pace-models.json';
import { useReducedMotion } from './Layout';
import { url } from './base';
import { paceTipParts } from './content/pace';
const Viewer = lazy(() => import('./PaceTipsViewer'));

export const tips = paceModels.tips;
const frame = paceModels['pace-blue-tips'].frame;
/** The viewer frames the lineup exactly (see PaceTipsViewer), so each button sits under its tip. */
const HEADROOM = 1;
const tipLeft = (x: number) => ((x - (frame.target[0] - frame.width / 2)) / frame.width) * 100;
const num = (i: number) => String(i + 1).padStart(2, '0');

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** PACE AccuDrive Blue Series tip lineup (ChatGPT's model, 16 independently named tips).
 *  Hovering a tip, or hovering, focusing or pressing its number, lifts and turns it;
 *  a press or click pins it. The rendered lineup shows until the model is drawn, and
 *  stays if WebGL is unavailable. */
export function PaceTips() {
  const host = useRef<HTMLDivElement>(null);
  const numbers = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [visited, setVisited] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(-1);
  const [pinned, setPinned] = useState(-1);
  const selected = hovered >= 0 ? hovered : pinned;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setVisited(true);
    }, { rootMargin: '300px 0px' });
    observer.observe(host.current!);
    return () => observer.disconnect();
  }, []);
  const pin = (i: number) => setPinned((p) => (p === i ? -1 : i));
  // From the part list, bring the tip into view (on phones the lineup scrolls sideways).
  const pinFromList = (i: number) => {
    pin(i);
    numbers.current?.children[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
  };
  return <div className="pace-tips">
    <p className="pace-tips-swipe" aria-hidden="true">Swipe along the row to see all 16 tips →</p>
    <div className="pace-tips-scroll">
      <div className="pace-tips-track">
        <div className="pace-tips-stage" ref={host} style={{ aspectRatio: `${frame.width} / ${frame.height + HEADROOM}` }}>
          <img className={`pace-tips-poster${ready && !failed ? ' is-hidden' : ''}`} src={url('/images/pace/pace-blue-tips.webp')}
            alt="Sixteen PACE AccuDrive Blue Series soldering tip shapes in a row" width="2000" height="680" loading="lazy" />
          {visited && !failed && <Boundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Viewer selected={selected} reduced={reduced} active={visible} onHover={setHovered} onPin={pin}
                onReady={() => setReady(true)} onUnsupported={() => setFailed(true)} />
            </Suspense>
          </Boundary>}
        </div>
        <div className="pace-tip-buttons" ref={numbers} role="group" aria-label="Inspect a tip">
          {tips.map((t, i) => <button key={t.node} type="button" aria-pressed={pinned === i} aria-label={`Tip ${i + 1}: ${paceTipParts[i].sku}, ${paceTipParts[i].name}`}
            className={selected === i ? 'is-active' : undefined} style={{ left: `${tipLeft(t.homePosition[0])}%` }}
            onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)}
            onFocus={() => setHovered(i)} onBlur={() => setHovered(-1)} onClick={() => pin(i)}>
            {num(i)}
          </button>)}
        </div>
      </div>
    </div>
    <p className="pace-tip-name" aria-live="polite">
      {selected < 0 ? 'Point at a tip, or choose a number, to see its PACE part number.'
        : <><strong>{num(selected)}</strong><span className="pace-tip-sku">{paceTipParts[selected].sku}</span>{paceTipParts[selected].name}</>}
    </p>
    <ol className="pace-tip-parts" aria-label="Part numbers of the tips shown">
      {paceTipParts.map((p, i) => <li key={p.sku}>
        <button type="button" className={selected === i ? 'is-active' : undefined} aria-pressed={pinned === i}
          onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)}
          onFocus={() => setHovered(i)} onBlur={() => setHovered(-1)} onClick={() => pinFromList(i)}>
          <span className="pace-tip-num">{num(i)}</span>
          <span className="pace-tip-sku">{p.sku}</span>
          <span className="pace-tip-desc">{p.name}</span>
        </button>
      </li>)}
    </ol>
  </div>;
}
