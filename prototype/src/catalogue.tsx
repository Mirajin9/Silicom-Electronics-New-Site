// Catalogue pieces shared by the division and category pages.
import type { CSSProperties } from 'react';
import { brandBySlug, brandLogo, type Product } from './content';
import { brandPath, categoryBrands, categoryHref, categoryPhoto, type Category } from './content/categories';
import { ADLER_PATH, pairWith, ranges, stockChips } from './content/adler';
import { Arrow, Photo, Rich, href } from './ui';
import { url } from './base';

/** A division's categories as photo cards: on the division pages and under each category page. */
export function CategoryCards({ items, current }: { items: Category[]; current?: string }) {
  return <div className="category-cards">
    {items.map((c, i) => <a key={c.id} id={current ? undefined : c.id} href={url(categoryHref(c))} className="category-card" aria-current={c.id === current ? 'page' : undefined}>
      <span className="category-card-media">
        <img src={url(categoryPhoto(c, '-card'))} alt="" width="720" height="540" loading="lazy" />
        <span className="category-card-num">{String(i + 1).padStart(2, '0')}</span>
      </span>
      <span className="category-card-body">
        <strong>{c.name}</strong>
        <span className="category-card-text">{c.menu}</span>
        <span className="category-card-brands">{categoryBrands(c).map((s) => brandBySlug(s).name).join(' · ')}</span>
        <span className="category-card-go">{c.id === current ? 'You are here' : 'Explore'} <Arrow /></span>
      </span>
    </a>)}
  </div>;
}

export function ProductCard({ p }: { p: Product }) {
  return <article className="feature">
    <div className="feature-media"><Photo img={p.image} /></div>
    <div className="feature-body">
      <div className="feature-brand">
        <Photo img={p.brandLogo} className="feature-brand-logo" />
        <span>{p.brandLabel}</span>
        <span className="feature-model">{p.model}</span>
      </div>
      <h3>{p.title}</h3>
      <p className="feature-tagline">{p.tagline}</p>
      <dl className="spec-grid">
        {p.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <ul className="bullets">{p.bullets.map((b) => <Rich key={b} as="li" html={b} />)}</ul>
      <div className="feature-foot">
        <span>{p.useCase}</span>
        <a className="text-link" href={href(p.link.href)}>{p.link.label} <Arrow diagonal /></a>
      </div>
    </div>
  </article>;
}

/** A partner logo at its balanced size (scaled by --logo-scale in CSS), or the name as text. */
export function PartnerLogo({ slug, name, alt = '' }: { slug: string; name: string; alt?: string }) {
  const logo = brandLogo(slug);
  if (!logo) return <span className="logo-text small">{name}</span>;
  return <img className="partner-logo-img" src={url(logo.src)} alt={alt} width={logo.w} height={logo.h} loading="lazy"
    style={{ '--logo-w': `${logo.w}px` } as CSSProperties} />;
}

/** ADLER promotion for the Components, Circuit Protection and Applications pages: the stock
 *  range, the IATF 16949 automotive and solar ranges, and the semiconductor partners to pair. */
export function AdlerSpotlight({ compact = false }: { compact?: boolean }) {
  const enquire = '/contact.html?brand=adler';
  if (compact) {
    return <aside className="adler-callout" aria-label="ADLER fuses">
      <img src={url('/images/products/adler-a85.webp')} alt="" width="900" height="675" loading="lazy" />
      <div>
        <span className="eyebrow">ADLER · IATF 16949 · In stock</span>
        <p><strong>Protect it with ADLER.</strong> Solar PV fuse links and holders, EV and charger fuses from ADLER’s authorised distributor in India.</p>
        <a className="text-link" href={url(ADLER_PATH)}>ADLER fuses <Arrow diagonal /></a>
      </div>
    </aside>;
  }
  return <section className="adler-spotlight section-shell" id="adler" aria-labelledby="adler-spotlight-title">
    <div className="adler-spotlight-copy">
      <span className="eyebrow">Authorised distributor · In stock in New Delhi</span>
      <h2 id="adler-spotlight-title">ADLER fuses for<br /><span>solar and automotive.</span></h2>
      <p>IATF 16949 EV and automotive fuses, solar PV fuse links up to 2000 Vdc and DIN-rail fuse holders from Germany’s ADLER. We are ready to supply fuse links and fuse holders from stock.</p>
      <ul className="adler-stock" aria-label="ADLER parts in stock">{stockChips.map((c) => <li key={c}>{c}</li>)}</ul>
      <div className="hero-actions">
        <a className="button primary" href={url(ADLER_PATH)}>Explore ADLER <Arrow /></a>
        <a className="text-link" href={url(enquire)}>Ask for stock &amp; price <Arrow diagonal /></a>
      </div>
      <p className="adler-pair">Pair with {pairWith.map((b, i) => <span key={b.slug}>{i > 0 && ' and '}<a href={url(brandPath(b.slug))}>{b.name}</a></span>)} for reliable diodes, transistors and power transistors.</p>
    </div>
    <div className="adler-spotlight-media">
      {ranges.map((r) => <a key={r.id} href={url(`${ADLER_PATH}#${r.id}`)}>
        <img src={url(r.photo.replace('.webp', '-card.webp'))} alt={r.photoAlt} width="720" height="540" loading="lazy" />
        <span>{r.eyebrow}</span>
      </a>)}
    </div>
  </section>;
}
