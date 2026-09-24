import type { ReactNode } from 'react';
import { url } from './base';

export type Link = { label: string; href: string; primary?: boolean };
export type Img = { src: string; alt: string } | null;
export type TitlePart = { text: string; accent: boolean };

/** Old pages used relative links (contact.html); the new site serves every route from the root. */
export const href = (h: string) => url(/^(#|\/|[a-z]+:)/.test(h) ? h : '/' + h);

export const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
    <path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** Content strings from the original site may carry inline sub/sup/strong markup. */
export const Rich = ({ html, as: Tag = 'span', className }: { html: string; as?: 'span' | 'p' | 'li' | 'div'; className?: string }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

export function Actions({ links, className = 'hero-actions' }: { links: Link[]; className?: string }) {
  if (!links.length) return null;
  return <div className={className}>
    {links.map((l) => l.primary
      ? <a key={l.href + l.label} className="button primary" href={href(l.href)}>{l.label} <Arrow /></a>
      : <a key={l.href + l.label} className="text-link" href={href(l.href)}>{l.label} <Arrow diagonal /></a>)}
  </div>;
}

export const Chips = ({ items, className = 'chips' }: { items: string[]; className?: string }) =>
  items.length ? <ul className={className}>{items.map((c) => <li key={c}>{c}</li>)}</ul> : null;

export const Title = ({ parts }: { parts: TitlePart[] }) => <>
  {parts.map((p, i) => p.accent ? <span key={i} className="blue-word">{p.text.trim()}</span> : <span key={i}>{p.text}</span>)}
</>;

/** Opening section of an inner page, in the homepage's language: a kicker rule,
 *  a heavy headline, supporting copy, actions and a media column. */
export function PageHero({ kicker, aside, title, lede, actions, media, children, dark = false, id = 'main' }: {
  kicker: ReactNode; aside?: ReactNode; title: ReactNode; lede?: string; actions?: Link[]; media?: ReactNode; children?: ReactNode; dark?: boolean; id?: string;
}) {
  return <section className={`page-hero section-shell${dark ? ' page-hero-dark' : ''}${media ? '' : ' page-hero-solo'}`} id={id} tabIndex={-1}>
    <div className="hero-kicker"><span>{kicker}</span>{aside && <span className="hero-location">{aside}</span>}</div>
    <div className="page-hero-body">
      <div className="page-hero-copy">
        <h1>{title}</h1>
        {lede && <p className="page-lede">{lede}</p>}
        {actions && <Actions links={actions} />}
        {children}
      </div>
      {media && <div className="page-hero-media">{media}</div>}
    </div>
  </section>;
}

/** The homepage's closing blue band, reused as every page's call to action. */
export function ContactBand({ eyebrow, heading, text, actions }: { eyebrow?: string; heading: string; text?: string; actions: Link[] }) {
  return <section className="contact-band page-band section-shell">
    {eyebrow && <span>{eyebrow}</span>}
    <div>
      <h2>{heading}</h2>
      {text && <p>{text}</p>}
    </div>
    <div className="page-band-actions">
      {actions.map((l) => <a key={l.href + l.label} className={l.primary ? 'button light' : 'band-link'} href={href(l.href)}>{l.label} <Arrow diagonal={!l.primary} /></a>)}
    </div>
  </section>;
}

export const Photo = ({ img, className, eager = false, sizes }: { img: Img; className?: string; eager?: boolean; sizes?: string }) =>
  img ? <img className={className} src={url(img.src)} alt={img.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" sizes={sizes} /> : null;
