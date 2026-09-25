import { Layout, useReducedMotion } from '../Layout';
import { InlineModel } from '../InlineModel';
import { applications, brandBySlug, instruments, type Product } from '../content';
import { AdlerSpotlight, CategoryCards, PartnerLogo, ProductCard } from '../catalogue';
import { brandPath, categoriesOf, categoryBrands, categoryByRoute, categoryPhoto } from '../content/categories';
import { Arrow, ContactBand, Photo } from '../ui';
import { url } from '../base';

const divisionLabel = { instruments: 'Instruments', components: 'Components' };
const allApplications = applications.groups.flatMap((g) => g.items);

export default function CategoryPage({ route }: { route: string }) {
  const c = categoryByRoute(route)!;
  const reduced = useReducedMotion();
  const brands = categoryBrands(c).map(brandBySlug);
  const others = [...new Set(c.types.flatMap((t) => t.others ?? []))];
  const products = (c.products ?? []).map((t) => instruments.featured?.products.find((p) => p.title === t)).filter((p): p is Product => !!p);
  const gallery = c.types.filter((t) => t.image);
  const apps = c.applications.map((id) => allApplications.find((a) => a.id === id)).filter((a) => !!a);
  const enquire = (topic?: string) => `/contact.html?division=${c.division}&cat=${encodeURIComponent(topic ?? c.name)}`;
  return <Layout page={c.division}>
    <section className="page-hero category-hero section-shell" id="main" tabIndex={-1}>
      <div className="hero-kicker">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href={url("/")}>Home</a><span aria-hidden="true"> / </span>
          <a href={url(`/${c.division}.html`)}>{divisionLabel[c.division]}</a><span aria-hidden="true"> / </span>
          <span aria-current="page">{c.name}</span>
        </nav>
        <span className="hero-location">{c.types.length} product types · {brands.length + others.length} {brands.length + others.length === 1 ? 'partner' : 'partners'}</span>
      </div>
      <div className="page-hero-body">
        <div className="page-hero-copy">
          <h1>{c.name}</h1>
          <p className="category-strap">{c.headline[1]}</p>
          <p className="page-lede">{c.lede}</p>
          <div className="hero-actions">
            <a className="button primary" href={url(enquire())}>Ask for a quote <Arrow /></a>
            <a className="text-link" href="#range">See the range <Arrow diagonal /></a>
          </div>
        </div>
        <div className="page-hero-media category-hero-media">
          {c.live
            ? <div className="hero-product"><InlineModel model={c.live} reduced={reduced} /></div>
            : <img className="page-hero-photo" src={url(categoryPhoto(c))} alt={c.photoAlt} width="1400" height="1050" fetchPriority="high" />}
          {c.model && <img className="category-render" src={url(`/images/packages/${c.model}.webp`)} alt="" width="1000" height="750" loading="lazy" />}
        </div>
      </div>
    </section>

    <section className="category-range section-shell" id="range" aria-labelledby="range-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">What we supply</span>
          <h2 id="range-title">{c.types.length} product types.<br /><span>One point of contact.</span></h2>
        </div>
        <div className="page-intro-side">
          <p>Tell us the part or measurement and we will match it to the right partner, with pricing, lead time and support.</p>
        </div>
      </div>
      {gallery.length > 0 && <ul className="type-gallery">
        {gallery.map((t) => <li key={t.name}>
          <img src={url(t.image!)} alt={t.name} loading="lazy" />
          <span>{t.name}</span>
        </li>)}
      </ul>}
      <ol className="type-list">
        {c.types.map((t, i) => <li key={t.name}>
          <span className="type-num">{String(i + 1).padStart(2, '0')}</span>
          <div className="type-main">
            <h3>{t.name}</h3>
            <p>{t.text}</p>
          </div>
          <div className="type-brands">
            {t.brands.map((s) => <a key={s} href={url(brandPath(s))}>{brandBySlug(s).name} <Arrow diagonal /></a>)}
            {t.others?.map((o) => <span key={o}>{o}</span>)}
            {!t.brands.length && !t.others?.length && <span>Sourced on request</span>}
          </div>
          <a className="type-enquire" href={url(enquire(t.name))}>Enquire <Arrow /></a>
        </li>)}
      </ol>
    </section>

    {c.spotlight === 'adler' && <AdlerSpotlight />}

    {products.length > 0 && <section className="featured section-shell" aria-labelledby="featured-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Featured</span>
          <h2 id="featured-title">Featured products.</h2>
        </div>
      </div>
      <div className="feature-grid">{products.map((p) => <ProductCard key={p.title} p={p} />)}</div>
    </section>}

    <section className="category-brands section-shell" id="brands" aria-labelledby="brands-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Authorized partners</span>
          <h2 id="brands-title">Pick the brand.</h2>
        </div>
      </div>
      <ul className="partner-grid">
        {brands.map((b) => <li key={b.slug}>
          <a href={url(brandPath(b.slug))}>
            <span className="partner-logo"><PartnerLogo slug={b.slug} name={b.name} /></span>
            <strong>{b.name}</strong>
            <span className="partner-types">{c.types.filter((t) => t.brands.includes(b.slug)).map((t) => t.name).join(' · ')}</span>
            <span className="partner-go">Brand page <Arrow /></span>
          </a>
        </li>)}
        {others.map((o) => <li key={o}>
          <div>
            <strong>{o}</strong>
            <span className="partner-types">{c.types.filter((t) => t.others?.includes(o)).map((t) => t.name).join(' · ')}</span>
            <span className="partner-go">Line card partner</span>
          </div>
        </li>)}
      </ul>
    </section>

    {apps.length > 0 && <section className="category-apps section-shell" aria-labelledby="apps-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Where it is used</span>
          <h2 id="apps-title">Applications.</h2>
        </div>
        <div className="page-intro-side"><a className="text-link" href={url("/applications.html")}>All applications <Arrow diagonal /></a></div>
      </div>
      <ul className="app-cards">
        {apps.map((a) => <li key={a!.id}>
          <a href={url(`/applications.html#${a!.id}`)}>
            <Photo img={a!.image} />
            <strong>{a!.title}</strong>
            <span>{a!.meta}</span>
          </a>
        </li>)}
      </ul>
    </section>}

    <section className="category-more section-shell" aria-labelledby="more-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">More {divisionLabel[c.division].toLowerCase()}</span>
          <h2 id="more-title">Explore the range.</h2>
        </div>
        <div className="page-intro-side"><a className="text-link" href={url(`/${c.division}.html`)}>All {divisionLabel[c.division].toLowerCase()} <Arrow diagonal /></a></div>
      </div>
      <CategoryCards items={categoriesOf(c.division)} current={c.id} />
    </section>

    <ContactBand
      eyebrow={`${divisionLabel[c.division]} · ${c.name}`}
      heading={c.division === 'instruments' ? 'Let’s find the right instrument.' : 'Let’s find the right part.'}
      text="Send us the part number, specification or application. Our team will come back with options, pricing and lead times."
      actions={[{ label: 'Send an enquiry', href: enquire(), primary: true }, { label: `All ${divisionLabel[c.division].toLowerCase()}`, href: `${c.division}.html` }]}
    />
  </Layout>;
}
