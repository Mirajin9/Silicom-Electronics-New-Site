import { Layout } from '../Layout';
import { about, brands } from '../content';
import { ContactBand, PageHero, Photo } from '../ui';
import { url } from '../base';

export default function AboutPage() {
  const { hero, image, leadership, offer, cta } = about;
  // The original page said 16 partners; the site lists every partner, so count them.
  const stats = hero.stats.map((s) => /brand partners/i.test(s.label) ? { ...s, value: String(brands.length) } : s);
  return <Layout page="about">
    <PageHero
      kicker={`${hero.badge} · ${hero.tag}`}
      aside="Kirti Nagar · New Delhi"
      title={<>Built on friendship.<br /><span className="blue-word">Trusted by engineers.</span></>}
      lede="Started by college friends in New Delhi in 1994, Silicom Electronics brings together reliable electronic components, precision instruments and the people who know them."
      media={<div className="about-photos">
        <img src={url("/assets/company/reception.jpg")} alt="Silicom Electronics reception, Kirti Nagar, New Delhi" loading="eager" />
        <Photo img={image} />
      </div>}
    >
      <dl className="stat-row">{stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
    </PageHero>

    <section className="about-story section-shell" aria-labelledby="story-title">
      <div className="page-intro">
        <div><span className="eyebrow">Our story, since 1994</span><h2 id="story-title">A shared beginning.<br /><span>A lasting commitment.</span></h2></div>
      </div>
      <div className="about-story-copy">
        <p>Silicom began with a group of college friends and a shared interest in electronics. From those early days in 1994, we have grown through long-standing relationships with customers, manufacturers and the engineering community.</p>
        <p>Today, we work with global partners, including test and measurement pioneers such as Tektronix, to provide carefully selected products and services to respected institutes, research laboratories and industry. Our focus remains personal: understand the requirement, recommend a dependable solution and support it professionally.</p>
      </div>
    </section>

    <section className="about-why section-shell" aria-labelledby="standards-title">
      <div className="page-intro">
        <div><span className="eyebrow">What you can expect</span><h2 id="standards-title">Professional standards.<br /><span>Dependable supply.</span></h2></div>
      </div>
      <div className="numbered-grid">
        {[
          ['Curated for your application', 'Components, instruments and services selected around the needs of your design, laboratory or production line.'],
          ['Reliable global partners', 'Established manufacturers and dependable products, supported by clear specifications and informed recommendations.'],
          ['People who follow through', 'Practical technical guidance, demonstrations and responsive support from our New Delhi team.'],
        ].map(([title, text], i) => <div key={title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></div>)}
      </div>
    </section>

    <section className="leadership section-shell">
      <div className="page-intro">
        <div><span className="eyebrow">{leadership.eyebrow}</span><h2>{leadership.heading}</h2></div>
      </div>
      <div className="leader-grid">
        {leadership.people.map((p) => <article key={p.name} className="leader">
          <div className="leader-head">
            <span className="leader-avatar" aria-hidden={!p.photo}>{p.photo ? <img src={url(p.photo.src)} alt={p.photo.alt} /> : p.initials}</span>
            <div><h3>{p.name}</h3><p>{p.role}</p></div>
          </div>
          <p>{p.bio}</p>
          <ul className="leader-contacts">{p.contacts.map((c) => <li key={c}>
            {c.includes('@') ? <a href={`mailto:${c}`}>{c}</a> : <a href={`tel:${c.replace(/\s+/g, '')}`}>{c}</a>}
          </li>)}</ul>
        </article>)}
      </div>
    </section>

    <section className="offer section-shell">
      <div className="page-intro">
        <div><span className="eyebrow">{offer.eyebrow}</span><h2>{offer.heading}</h2></div>
      </div>
      <div className="offer-grid">
        {offer.items.map((o) => <div key={o.title}><span className="eyebrow">{o.eyebrow}</span><h3>{o.title}</h3><p>{o.text}</p></div>)}
      </div>
    </section>
    <ContactBand {...cta} eyebrow={cta.eyebrow || 'Silicom Electronics'} />
  </Layout>;
}
