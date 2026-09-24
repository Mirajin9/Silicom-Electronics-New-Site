import { Layout } from '../Layout';
import { brandBySlug, brandModel } from '../content';
import { Actions, Arrow, Chips, ContactBand, Photo, Title } from '../ui';
import { PartnerLogo } from '../catalogue';
import { url } from '../base';

export default function BrandPage({ slug }: { slug: string }) {
  const b = brandBySlug(slug);
  const model = brandModel[slug];
  // Component brands without photography show their package render instead of a generic illustration.
  const media = b.cat === 'components' && model ? { src: `/images/packages/${model}.webp`, alt: b.heroImage?.alt ?? '' } : b.heroImage;
  return <Layout page="brands">
    <section className="page-hero brand-hero section-shell" id="main" tabIndex={-1}>
      <div className="hero-kicker">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {b.breadcrumb.map((c, i) => <span key={c.label}>{i > 0 && <span aria-hidden="true"> / </span>}{c.href ? <a href={url(`/${c.href}`)}>{c.label}</a> : <span aria-current="page">{c.label}</span>}</span>)}
        </nav>
        <span className="hero-location">{b.hero.badge} · {b.hero.tag}</span>
      </div>
      <div className="page-hero-body">
        <div className="page-hero-copy">
          <h1><Title parts={b.hero.title} /></h1>
          <p className="page-lede">{b.hero.lede}</p>
          <Actions links={b.hero.actions} />
          <Chips items={b.hero.chips} />
        </div>
        <div className="page-hero-media brand-hero-media">
          <div className={`brand-hero-photo${media === b.heroImage ? '' : ' is-render'}`}><Photo img={media} eager /></div>
          <div className="brand-glance">
            <div className="brand-glance-logo"><PartnerLogo slug={b.slug} name={b.name} alt={b.logo?.alt ?? b.name} /></div>
            <div>
              <span className="eyebrow">{b.glance.eyebrow}</span>
              <dl>{b.glance.rows.map(([k, v]) => <div key={k}><dt>{`${k}:`}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="brand-about section-shell">
      <div>
        <span className="eyebrow">{b.about.eyebrow}</span>
        <h2>{b.about.heading}</h2>
      </div>
      <div className="brand-about-text">{b.about.paragraphs.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}</div>
    </section>

    <section className="brand-range section-shell">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{b.range.eyebrow}</span>
          <h2>{b.range.heading}</h2>
        </div>
        <div className="page-intro-side"><p>{b.range.text}</p></div>
      </div>
      <dl className="range-list">
        {b.range.rows.map(([k, v], i) => <div key={k}><dt><span>{String(i + 1).padStart(2, '0')}</span>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>

    <section className="brand-apps section-shell">
      <span className="eyebrow">{b.applications.eyebrow}</span>
      <h2>{b.applications.heading}</h2>
      <Chips items={b.applications.chips} className="chips large" />
    </section>

    <section className="brand-why section-shell">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{b.why.eyebrow}</span>
          <h2>{b.why.heading}</h2>
        </div>
      </div>
      <div className="why-grid">
        {b.why.items.map((w) => <div key={w.title}>
          <span className="why-icon" aria-hidden="true">{w.icon}</span>
          <h3>{w.title}</h3>
          <p>{w.text}</p>
        </div>)}
      </div>
    </section>

    <section className="brand-faq section-shell">
      <div>
        <span className="eyebrow">{b.faq.eyebrow}</span>
        <h2>{b.faq.heading}</h2>
      </div>
      <div className="faq-list">
        {b.faq.items.map((f) => <details key={f.q}><summary><span>{f.q}</span><span className="faq-toggle" aria-hidden="true" /></summary><p>{f.a}</p></details>)}
      </div>
    </section>

    <ContactBand {...b.cta} />

    <section className="related section-shell" aria-labelledby="related-title">
      <span className="eyebrow" id="related-title">{b.related.eyebrow}</span>
      <div className="related-list">
        {b.related.items.map((r) => <a key={r.slug} href={url(`/brand-${r.slug}.html`)}>
          <strong>{r.name}</strong><span>{r.label}</span><Arrow diagonal />
        </a>)}
      </div>
    </section>
  </Layout>;
}
