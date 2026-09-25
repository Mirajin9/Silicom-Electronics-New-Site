import { Layout } from '../Layout';
import { brandBySlug } from '../content';
import { brandPath } from '../content/categories';
import { credentials, moreFaq, pairWith, ranges, seoCopy, stock } from '../content/adler';
import { AdlerBrowser } from '../AdlerBrowser';
import { PartnerLogo } from '../catalogue';
import { Actions, Arrow, Chips, ContactBand, Title } from '../ui';
import { url } from '../base';

/** ADLER, at the URL the current silicomindia.com page ranks on (/electronic-components/adler.html).
 *  brand-adler.html renders the same page, with its canonical URL pointing here. It keeps every
 *  part of the original ADLER brand page and adds the stock range, the solar and automotive
 *  ranges, ADLER's credentials and the 3D models. */
export default function AdlerPage() {
  const b = brandBySlug('adler');
  const enquire = (part?: string) => `/contact.html?brand=adler${part ? `&model=${encodeURIComponent(part)}` : ''}`;
  return <Layout page="components">
    <section className="page-hero brand-hero adler-hero section-shell" id="main" tabIndex={-1}>
      <div className="hero-kicker">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href={url('/')}>Home</a><span aria-hidden="true"> / </span>
          <a href={url('/components.html')}>Components</a><span aria-hidden="true"> / </span>
          <a href={url('/components-protection.html')}>Circuit Protection</a><span aria-hidden="true"> / </span>
          <span aria-current="page">ADLER</span>
        </nav>
        <span className="hero-location">{b.hero.badge} · {b.hero.tag}</span>
      </div>
      <div className="page-hero-body">
        <div className="page-hero-copy">
          <span className="adler-badges"><span>Authorised distributor</span><span>IATF 16949</span><span>In stock</span></span>
          <h1>Adler Electronics Components</h1>
          <p className="category-strap">Automotive and solar fuses from Germany’s ADLER, in stock in India.</p>
          <p className="page-lede">{b.hero.lede}</p>
          <Actions links={b.hero.actions} />
          <Chips items={b.hero.chips} />
        </div>
        <div className="page-hero-media brand-hero-media">
          <AdlerBrowser />
          <div className="brand-glance">
            <div className="brand-glance-logo"><PartnerLogo slug="adler" name={b.name} alt={b.logo?.alt ?? b.name} /></div>
            <div>
              <span className="eyebrow">{b.glance.eyebrow}</span>
              <dl>
                {b.glance.rows.map(([k, v]) => <div key={k}><dt>{`${k}:`}</dt><dd>{v}</dd></div>)}
                <div><dt>Headquarters:</dt><dd>Leipzig, Germany</dd></div>
                <div><dt>Quality:</dt><dd>IATF 16949 · ISO 9001:2015</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="adler-stock-section section-shell" id="stock" aria-labelledby="stock-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">In stock at Silicom · New Delhi</span>
          <h2 id="stock-title">Fuse links and fuse holders,<br /><span>ready to supply.</span></h2>
        </div>
        <div className="page-intro-side">
          <p>Silicom is ready to supply ADLER fuse links and fuse holders from stock, matched as sets. Other ratings and series are supplied to order.</p>
        </div>
      </div>
      <div className="adler-stock-grid">
        {stock.map((s) => <article key={s.part} className="adler-stock-card">
          <div className="adler-stock-media"><img src={url(s.image)} alt={`ADLER ${s.series} ${s.name}`} width="900" height="675" loading="lazy" /></div>
          <div className="adler-stock-body">
            <span className="adler-stock-tag">In stock</span>
            <h3><span>{s.series}</span> {s.name}</h3>
            <p className="adler-part">Part no. {s.part}</p>
            <dl className="spec-grid">{s.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            {(s.holder || s.note) && <p className="adler-stock-note">{s.holder && <>Fits the <strong>{s.holder}</strong> holder. </>}{s.note}</p>}
            <a className="text-link" href={url(enquire(s.part))}>Ask for price <Arrow diagonal /></a>
          </div>
        </article>)}
      </div>
    </section>

    {ranges.map((r, i) => <section key={r.id} className={`adler-range section-shell${i % 2 ? ' is-reversed' : ''}`} id={r.id} aria-labelledby={`${r.id}-title`}>
      <div className="adler-range-media"><img src={url(r.photo)} alt={r.photoAlt} width="1400" height="1050" loading="lazy" /></div>
      <div className="adler-range-copy">
        <span className="eyebrow">{r.eyebrow}</span>
        <h2 id={`${r.id}-title`}>{r.heading}</h2>
        <p>{r.text}</p>
        <ul className="adler-families">
          {r.families.map((f) => <li key={f.name}>
            {f.image && <img src={url(f.image)} alt="" width="900" height="675" loading="lazy" />}
            <div><strong>{f.name}</strong><span>{f.text}</span></div>
          </li>)}
        </ul>
        <p className="adler-apps">Used in {r.applications.map((a, k) => <span key={a.href}>{k > 0 && ', '}<a href={url(a.href)}>{a.label}</a></span>)}.</p>
      </div>
    </section>)}

    <section className="brand-about adler-distributor section-shell" aria-labelledby="distributor-title">
      <div>
        <span className="eyebrow">{b.about.eyebrow}</span>
        <h2 id="distributor-title">Adler Electronics Components Distributor</h2>
        <p className="adler-legacy-title"><Title parts={b.hero.title} /></p>
      </div>
      <div className="brand-about-text">
        {seoCopy.intro.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        {seoCopy.distributor.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        <h3>{b.about.heading}</h3>
        {b.about.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      </div>
    </section>

    <section className="adler-credentials section-shell" aria-labelledby="credentials-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Why ADLER</span>
          <h2 id="credentials-title">Reliable protection,<br /><span>certified for automotive and solar.</span></h2>
        </div>
      </div>
      <div className="numbered-grid">
        {credentials.map((c, i) => <div key={c.title}>
          <span className="family-num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{c.title}</h3>
          <p>{c.text}</p>
        </div>)}
      </div>
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

    <section className="adler-pair-band section-shell" aria-labelledby="pair-title">
      <div>
        <span className="eyebrow">Complete the power path</span>
        <h2 id="pair-title">Pair ADLER protection with reliable semiconductors.</h2>
      </div>
      <div className="adler-pair-list">
        {pairWith.map((p) => <a key={p.slug} href={url(brandPath(p.slug))}>
          <span className="partner-logo"><PartnerLogo slug={p.slug} name={p.name} /></span>
          <strong>{p.name}</strong>
          <span>{p.text}</span>
          <span className="partner-go">{p.name} diodes and transistors <Arrow /></span>
        </a>)}
      </div>
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

    <section className="brand-faq section-shell" id="faq">
      <div>
        <span className="eyebrow">{b.faq.eyebrow}</span>
        <h2>{b.faq.heading}</h2>
      </div>
      <div className="faq-list">
        {[...moreFaq, ...b.faq.items].map((f) => <details key={f.q}><summary><span>{f.q}</span><span className="faq-toggle" aria-hidden="true" /></summary><p>{f.a}</p></details>)}
      </div>
    </section>

    <ContactBand {...b.cta} />

    <section className="related section-shell" aria-labelledby="related-title">
      <span className="eyebrow" id="related-title">{b.related.eyebrow}</span>
      <div className="related-list">
        {b.related.items.map((r) => <a key={r.slug} href={url(brandPath(r.slug))}>
          <strong>{r.name}</strong><span>{r.label}</span><Arrow diagonal />
        </a>)}
      </div>
      <p className="adler-about-silicom"><strong>About Silicom Electronics Pvt. Ltd.</strong> {seoCopy.about}</p>
    </section>
  </Layout>;
}
