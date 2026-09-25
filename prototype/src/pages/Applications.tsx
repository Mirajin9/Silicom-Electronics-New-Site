import { Layout } from '../Layout';
import { applications, brands } from '../content';
import { Arrow, ContactBand, PageHero, Photo, Rich, Title, href } from '../ui';
import { url } from '../base';
import { brandPath } from '../content/categories';
import { AdlerSpotlight } from '../catalogue';

/** Link a part's source ("Jilin Sino / CDIL") to the brand pages it names. */
function Sources({ text }: { text: string }) {
  const bySlug = (name: string) => brands.find((b) => b.name.toLowerCase() === name.trim().toLowerCase());
  const whole = bySlug(text);
  const parts = whole ? [text] : text.split(' / ');
  return <>{parts.map((name, i) => {
    const b = bySlug(name);
    return <span key={name}>{i > 0 && ' / '}{b ? <a href={url(brandPath(b.slug))}>{name.trim()}</a> : name.trim()}</span>;
  })}</>;
}

/** Solar and EV designs where ADLER fuses and holders protect the DC path. */
const ADLER_APPLICATIONS = ['app-solar', 'app-ev-ac-charger', 'app-ev-2w'];

export default function ApplicationsPage() {
  const { hero, head, groups, cta } = applications;
  // The original's tabs expanded one card at a time; every application is now open.
  const intro = head.text.replace(/ Click any card to expand\.$/, '');
  return <Layout page="applications">
    <PageHero
      kicker={`${hero.badge} · ${hero.tag}`}
      aside="18 designs · 2 divisions"
      title={<Title parts={hero.title} />}
      lede={hero.lede}
      actions={hero.actions}
      media={<Photo img={hero.image} className="page-hero-photo" eager />}
    />
    <section className="apps section-shell" id="apps" aria-labelledby="apps-title">
      <div className="page-intro">
        <div>
          <span className="eyebrow">{head.eyebrow}</span>
          <h2 id="apps-title">{head.heading}</h2>
        </div>
        <div className="page-intro-side">
          <p>{intro}</p>
          {head.actions[0] && <a className="text-link" href={href(head.actions[0].href)}>{head.actions[0].label} <Arrow diagonal /></a>}
        </div>
      </div>
      <div className="apps-layout">
        <nav className="apps-index" aria-label="Applications">
          {groups.map((g) => <div key={g.id}>
            <a className="apps-index-group" href={`#tab-${g.id}`}>{g.label}</a>
            <ol>{g.items.map((a) => <li key={a.id}><a href={`#${a.id}`}>{a.title}</a></li>)}</ol>
          </div>)}
        </nav>
        <div className="apps-groups">
          {groups.map((g) => <section key={g.id} id={`tab-${g.id}`} className="apps-group" aria-labelledby={`group-${g.id}`}>
            <h2 className="apps-group-title" id={`group-${g.id}`}>{g.label}</h2>
            {g.items.map((a, i) => <article key={a.id} id={a.id} className="app-block">
              <header className="app-block-head">
                <span className="app-num">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{a.title}</h3><p>{a.meta}</p></div>
              </header>
              <div className="app-block-body">
                <Photo img={a.image} className="app-photo" />
                <table className="parts">
                  <thead><tr><th scope="col">Part</th><th scope="col">Package / detail</th><th scope="col">Source</th></tr></thead>
                  <tbody>{a.parts.map((p) => <tr key={p.name + p.source}>
                    <td><Rich html={p.name} /></td>
                    <td><Rich html={p.detail} /></td>
                    <td><Sources text={p.source} /></td>
                  </tr>)}</tbody>
                </table>
              </div>
              {ADLER_APPLICATIONS.includes(a.id) && <AdlerSpotlight compact />}
              <footer className="app-block-foot">
                <span>{a.note}</span>
                <a className="text-link" href={href(a.link.href)}>{a.link.label} <Arrow diagonal /></a>
              </footer>
            </article>)}
          </section>)}
        </div>
      </div>
    </section>
    <ContactBand {...cta} />
  </Layout>;
}
