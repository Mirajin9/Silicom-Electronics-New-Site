import { useEffect, useState } from 'react';

/** Keep one row of cards visible as the layout changes from desktop to phone. */
export function useCardsPerPage() {
  const [size, setSize] = useState(3);
  useEffect(() => {
    const phone = matchMedia('(max-width: 580px)');
    const tablet = matchMedia('(max-width: 820px)');
    const update = () => setSize(phone.matches ? 1 : tablet.matches ? 2 : 3);
    update();
    phone.addEventListener('change', update);
    tablet.addEventListener('change', update);
    return () => {
      phone.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, []);
  return size;
}

export function CollectionPager({ page, pages, onChange, label, controls }: {
  page: number; pages: number; onChange: (page: number) => void; label: string; controls: string;
}) {
  if (pages < 2) return null;
  return <nav className="collection-pager" aria-label={label}>
    <button type="button" aria-controls={controls} disabled={page === 0} onClick={() => onChange(page - 1)}>← Previous</button>
    <span role="status" aria-live="polite">{page + 1} / {pages}</span>
    <button type="button" aria-controls={controls} disabled={page === pages - 1} onClick={() => onChange(page + 1)}>Next →</button>
  </nav>;
}
