import { useEffect, useState, type ReactNode } from 'react';
import { SiteHeader, SiteFooter } from './SiteChrome';

export function Layout({ page = '', children }: { page?: string; children: ReactNode }) {
  return <div className="site">
    <SiteHeader page={page} />
    <main>{children}</main>
    <SiteFooter />
  </div>;
}

/** False during server rendering and the first client render, so hydration matches. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}
