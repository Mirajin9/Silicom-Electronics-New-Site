import { useState } from 'react';
import { InlineModel } from './InlineModel';
import { useReducedMotion } from './Layout';
import { url } from './base';
import type { ModelId } from './models';

const products: { id: ModelId; name: string; type: string; detail: string }[] = [
  { id: 'adler-bh300', name: 'BH300', type: 'PV fuse holder', detail: 'Slim DIN rail holder with a blue pull handle. Shown as the BH300-02 indicator version.' },
  { id: 'adler-bh400', name: 'BH400', type: 'PV fuse holder', detail: 'DIN rail holder for 22 × 58 mm cylindrical fuse links, with a raised operating handle.' },
  { id: 'adler-a94', name: 'A94', type: 'gPV fuse link', detail: '22 × 58 mm cylindrical cartridge, with a blue sleeve and silver-plated end caps.' },
  { id: 'adler-a84', name: 'A84', type: 'gPV fuse link', detail: '14 × 51 mm cylindrical cartridge, with a blue sleeve and silver-plated end caps.' },
];

export function AdlerBrowser() {
  const [index, setIndex] = useState(0);
  const selected = products[index];
  const reduced = useReducedMotion();
  return <div className="adler-browser">
    <div className="adler-selector" aria-label="Select ADLER product">
      {products.map((p, i) => <button type="button" key={p.id} aria-pressed={i === index} onClick={() => setIndex(i)}>
        <strong>{p.name}</strong><span>{p.type}</span>
      </button>)}
    </div>
    <InlineModel key={selected.id} model={selected.id} reduced={reduced} />
    <div className="adler-product-caption" aria-live="polite">
      <div><strong>{selected.name}</strong><span>{selected.type}</span></div>
      <p>{selected.detail}</p>
    </div>
    <a className="text-link" href={url(`/contact.html?brand=adler&model=${selected.name}`)}>Enquire about {selected.name} <span aria-hidden="true">↗</span></a>
  </div>;
}
