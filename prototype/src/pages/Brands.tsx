import { useState } from 'react';
import { Layout } from '../Layout';
import { brandIndex, brandModel } from '../content';
import { Actions, Arrow, Chips, ContactBand, PageHero, Title } from '../ui';
import { PartnerLogo } from '../catalogue';
import { url } from '../base';

export default function BrandsPage() {
  const { hero, filters, tiles, banner, cta } = brandIndex;
  const [filter, setFilter] = useState('all');
  return <Layout page="brands">
    <PageHero
      kicker={`${hero.badge} · ${hero.tag}`}
      aside={`${tiles.length} partners`}
      title={<Title parts={hero.title} />}
      lede={hero.lede}
      media={<ul className="logo-wall" aria-label="Brand partners">
        {tiles.map((t) => <li key={t.slug}><PartnerLogo slug={t.slug} name={t.name} alt={t.logo?.alt ?? t.name} /></li>)}
      </ul>}
    >
      <div className="filter-bar" role="group" aria-label="Filter brands">
        {filters.map((f) => <button key={f.id} type="button" data-filter={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
      </div>
    </PageHero>
    <section className="brand-grid-section section-shell" aria-label="Brand partners">
      <div className="brand-grid" id="brand-grid">
        {tiles.map((t) => {
          const model = brandModel[t.slug];
          return <article key={t.slug} className="brand-tile" data-cat={t.cat} hidden={filter !== 'all' && filter !== t.cat}>
            <a className="brand-tile-link" href={url(`/brand-${t.slug}.html`)} aria-label={`View ${t.name} details`}><span className="sr-only">{t.linkLabel}</span></a>
            <div className={`brand-tile-media${t.image ? '' : model ? ' is-render' : ' is-logo'}`}>
              {t.image ? <img src={url(t.image.src)} alt={t.image.alt} loading="lazy" />
                : model ? <img src={url(`/images/packages/${model}.webp`)} alt="" loading="lazy" />
                : t.logo ? <img src={url(t.logo.src)} alt="" loading="lazy" /> : <span className="logo-text">{t.name}</span>}
            </div>
            <div className="brand-tile-head">
              <span className="brand-tile-logo"><PartnerLogo slug={t.slug} name={t.name} alt={t.logo?.alt ?? t.name} /></span>
              <span className="brand-tile-cat">{t.catLabel}</span>
            </div>
            <h3>{t.name}</h3>
            <p>{t.description}</p>
            <Chips items={t.chips} />
            <span className="brand-tile-view">{t.viewLabel} <Arrow /></span>
          </article>;
        })}
      </div>
    </section>
    <section className="banner-pair section-shell single">
      <article className="banner">
        <span className="eyebrow">{banner.eyebrow}</span>
        <h2>{banner.heading}</h2>
        <p>{banner.text}</p>
        <Actions links={banner.actions} className="banner-actions" />
      </article>
    </section>
    <ContactBand {...cta} />
  </Layout>;
}
