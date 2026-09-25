import { Layout, useReducedMotion } from '../Layout';
import { InlineModel, PackageBrowser } from '../InlineModel';
import { components, instruments, type BrandCard, type Division } from '../content';
import { categoriesOf } from '../content/categories';
import { AdlerSpotlight, CategoryCards, PartnerLogo, ProductCard } from '../catalogue';
import { Actions, Arrow, Chips, ContactBand, PageHero, Rich, Title, href } from '../ui';

function CategoryIndex({ division }: { division: 'instruments' | 'components' }) {
  return <section className="families section-shell" aria-labelledby="families-title">
    <div className="page-intro">
      <div>
        <span className="eyebrow">Explore the range</span>
        <h2 id="families-title">{division === 'instruments' ? <>Start from the measurement.<br /><span>Then pick the brand.</span></> : <>Start from the part.<br /><span>Then pick the brand.</span></>}</h2>
      </div>
    </div>
    <CategoryCards items={categoriesOf(division)} />
  </section>;
}

function BrandRow({ c }: { c: BrandCard }) {
  return <details className="brand-row" id={c.slug ? `brand-${c.slug}` : undefined}>
    <summary>
      <span className="brand-row-logo">{c.slug ? <PartnerLogo slug={c.slug} name={c.title} alt={c.logo?.alt ?? c.title} /> : <span className="logo-text">{c.title}</span>}</span>
      <span className="brand-row-name">
        <strong>{c.title}</strong>
        {c.meta && <span>{c.meta}</span>}
      </span>
      <span className="brand-row-count">{c.categories.length} categories</span>
      <span className="brand-row-toggle" aria-hidden="true" />
    </summary>
    <div className="brand-row-body">
      <ul className="category-links">
        {c.categories.map((l) => <li key={l.href}><a href={href(l.href)}>{l.label} <Arrow diagonal /></a></li>)}
      </ul>
      <div className="brand-row-foot">
        <span>{c.note}</span>
        <div>{c.links.map((l) => <a key={l.href} className="text-link" href={href(l.href)}>{l.label} <Arrow diagonal /></a>)}</div>
      </div>
    </div>
  </details>;
}

export default function DivisionPage({ id }: { id: 'instruments' | 'components' }) {
  const d: Division = id === 'instruments' ? instruments : components;
  const reduced = useReducedMotion();
  const featuredText = d.featured?.head.text.replace(/ — click to expand and browse the highlights\.$/, '.');
  return <Layout page={id}>
    <PageHero
      kicker={`${d.hero.badge} · ${d.hero.tag}`}
      aside="New Delhi · Across India"
      title={<Title parts={d.hero.title} />}
      lede={d.hero.lede}
      actions={d.hero.actions}
      dark={id === 'components'}
      media={id === 'instruments'
        ? <div className="hero-product"><div className="product-orbit" aria-hidden="true" /><InlineModel model="scope" reduced={reduced} /></div>
        : <PackageBrowser reduced={reduced} />}
    >
      {d.hero.note && <Rich as="p" className="hero-note" html={d.hero.note} />}
    </PageHero>
    <CategoryIndex division={id} />
    {id === 'components' && <AdlerSpotlight />}
    {d.featured && <section className="featured section-shell" aria-labelledby="featured-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{d.featured.head.eyebrow}</span>
          <h2 id="featured-title">{d.featured.head.heading}</h2>
        </div>
        <div className="page-intro-side"><p>{featuredText}</p></div>
      </div>
      <div className="feature-grid">{d.featured.products.map((p) => <ProductCard key={p.title} p={p} />)}</div>
    </section>}
    <section className="brand-index section-shell" id="brands" aria-labelledby="brands-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{d.brands.head.eyebrow}</span>
          <h2 id="brands-title">{d.brands.head.heading}</h2>
        </div>
        <div className="page-intro-side">
          {d.brands.head.text && <p>{d.brands.head.text}</p>}
          {d.brands.note && <p className="brand-index-note">{d.brands.note}</p>}
        </div>
      </div>
      <div className="brand-rows">{d.brands.cards.map((c) => <BrandRow key={c.title} c={c} />)}</div>
    </section>
    {d.banners.length > 0 && <section className="banner-pair section-shell">
      {d.banners.map((b) => <article key={b.heading} id={b.id ?? undefined} className="banner">
        <span className="eyebrow">{b.eyebrow}</span>
        <h2>{b.heading}</h2>
        <p>{b.text}</p>
        <Chips items={b.chips} />
        <Actions links={b.actions} className="banner-actions" />
      </article>)}
    </section>}
    <ContactBand {...d.cta} />
  </Layout>;
}
