// Catalogue pieces shared by the division and category pages.
import type { CSSProperties } from 'react';
import { brandBySlug, brandLogo, type Product } from './content';
import { categoryBrands, categoryHref, categoryPhoto, type Category } from './content/categories';
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
