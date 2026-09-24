import { Layout } from '../Layout';
import { about, brands } from '../content';
import { ContactBand, PageHero, Photo, Title } from '../ui';
import { url } from '../base';

export default function AboutPage() {
  const { hero, image, why, journey, leadership, offer, cta } = about;
  // The original page said 16 partners; the site lists every partner, so count them.
  const stats = hero.stats.map((s) => /brand partners/i.test(s.label) ? { ...s, value: String(brands.length) } : s);
  return <Layout page="about">
    <PageHero
      kicker={`${hero.badge} · ${hero.tag}`}
      aside="Kirti Nagar · New Delhi"
      title={<Title parts={hero.title} />}
      lede={hero.lede}
      media={<div className="about-photos">
        <img src={url("/assets/company/reception.jpg")} alt="Silicom Electronics reception, Kirti Nagar, New Delhi" loading="eager" />
        <Photo img={image} />
      </div>}
    >
      <dl className="stat-row">{stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
    </PageHero>

    <section className="about-why section-shell">
      <div className="page-intro">
        <div><span className="eyebrow">{why.eyebrow}</span><h2>{why.heading}</h2></div>
      </div>
      <div className="numbered-grid">
        {why.items.map((w, i) => <div key={w.title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{w.title}</h3><p>{w.text}</p></div>)}
      </div>
    </section>

    <section className="journey section-shell">
      <div className="page-intro">
        <div><span className="eyebrow">{journey.eyebrow}</span><h2>{journey.heading}</h2></div>
      </div>
      <ol className="timeline">
        {journey.rows.map((r) => <li key={r.year}><span className="timeline-year">{r.year}</span><div><h3>{r.title}</h3><p>{r.text}</p></div></li>)}
      </ol>
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
