import { useEffect, useLayoutEffect, useRef, useState, type AnimationEvent } from 'react';
import { Logo } from './Logo';

const SEEN = 'silicom-intro-seen';
const DONE = 'silicom:intro-done';
const SKIP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
let playing = false;

/** Heavy work (the 3D viewer) waits for the intro, so the drawing stays smooth. */
export const introPlaying = () => playing;
export function onIntroDone(callback: () => void) {
  window.addEventListener(DONE, callback, { once: true });
  return () => window.removeEventListener(DONE, callback);
}

/** First homepage visit of a session: the logo draws itself, then docks into the header.
 *  An inline script in index.html decides whether to play (not for deep links, reduced
 *  motion or repeat visits) and covers the first paint with `intro-pending`, so the
 *  pre-rendered page never flashes. Any click, key or scroll ends it at once. */
export function BrandIntro() {
  // 'idle' on the server and the first client render, so hydration matches.
  const [phase, setPhase] = useState<'idle' | 'draw' | 'dock' | 'done'>('idle');
  const logoRef = useRef<HTMLDivElement>(null);
  const hold = useRef(0);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains('intro-pending')) {
      html.classList.remove('intro-pending');
      playing = true;
      setPhase('draw');
    } else setPhase('done');
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('brand-intro-on', phase === 'draw' || phase === 'dock');
    if (phase === 'done' && playing) {
      playing = false;
      window.dispatchEvent(new Event(DONE));
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'draw' && phase !== 'dock') return;
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {}
    const skip = () => setPhase('done');
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }));
    // Safety net in case animation events never arrive.
    const timer = window.setTimeout(skip, phase === 'draw' ? 4000 : 1500);
    return () => {
      clearTimeout(timer);
      clearTimeout(hold.current);
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
    };
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== 'dock') return;
    const node = logoRef.current!;
    const from = node.getBoundingClientRect();
    const to = document.querySelector('.header .logo .brand-logo')?.getBoundingClientRect();
    if (!to || !to.width) {
      setPhase('done');
      return;
    }
    const move = node.animate(
      [{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` }],
      { duration: 700, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' },
    );
    move.onfinish = () => setPhase('done');
    return () => move.cancel();
  }, [phase]);

  // Dock a beat after the wordmark (the last element) has settled.
  const drawn = (e: AnimationEvent) => {
    if (e.animationName === 'logo-slide' && phase === 'draw' && !hold.current) hold.current = window.setTimeout(() => setPhase('dock'), 300);
  };

  if (phase !== 'draw' && phase !== 'dock') return null;
  return <div className={`brand-intro is-${phase}`} aria-hidden="true" onAnimationEnd={drawn}>
    <div className="brand-intro-logo" ref={logoRef}>
      <Logo draw decorative />
    </div>
  </div>;
}
