// Extracts the content of the original site's pages into src/content/*.json, so the
// React templates render the same words, links and images in the new design.
// Run from prototype/: node scripts/extract-content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.resolve(import.meta.dirname, '../src/content');

const load = (name) => parse(fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/^﻿/, ''));
const attr = (n, k) => n?.attrs?.find((a) => a.name === k)?.value ?? '';
const classes = (n) => attr(n, 'class').split(/\s+/);
const has = (c) => (n) => classes(n).includes(c);
const tag = (t) => (n) => n.tagName === t;
const all = (n, pred, out = []) => {
  for (const c of n?.childNodes || []) {
    if (c.tagName === 'template') continue;
    if (pred(c)) out.push(c);
    all(c, pred, out);
  }
  return out;
};
const one = (n, pred) => all(n, pred)[0];
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const raw = (n) => (n.nodeName === '#text' ? n.value : ['script', 'style', 'svg'].includes(n.tagName) ? '' : (n.childNodes || []).map(raw).join(''));
const text = (n) => (n ? clean(raw(n)) : '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Inner markup keeping only inline formatting the templates render (sub, sup, strong, em, br). */
const rich = (n, skip = () => false) => clean((n.childNodes || []).map((c) => {
  if (skip(c)) return '';
  if (c.nodeName === '#text') return esc(c.value);
  if (['sub', 'sup', 'strong', 'em'].includes(c.tagName)) return `<${c.tagName}>${rich(c)}</${c.tagName}>`;
  if (c.tagName === 'br') return '<br>';
  if (['script', 'style', 'svg'].includes(c.tagName)) return '';
  return rich(c, skip);
}).join(''));
const fallbackOf = (img) => (attr(img, 'onerror').match(/src='([^']+)'/) || [])[1] || null;
const exists = (src) => src && fs.existsSync(path.join(ROOT, src.replace(/^\//, '')));
/** The original used onerror to swap in a fallback or hide missing photos. Resolve that
 *  now: the photo if it exists, else its fallback, else no image. */
const image = (n) => {
  const img = n && (n.tagName === 'img' ? n : one(n, tag('img')));
  if (!img) return null;
  const src = [attr(img, 'src'), fallbackOf(img)].find(exists);
  return src ? { src: '/' + src.replace(/^\//, ''), alt: attr(img, 'alt') } : null;
};
const link = (a) => ({ label: text(a), href: attr(a, 'href'), primary: has('btn-primary')(a) });
const actions = (n) => all(n, (c) => c.tagName === 'a' && (has('btn')(c) || has('btn-arrow')(c))).map(link);
const sections = (doc) => all(doc, tag('section'));

function hero(section) {
  const h1 = one(section, tag('h1'));
  const badge = one(section, has('hero-tag-badge'));
  const tagEl = one(section, has('hero-tag'));
  return {
    badge: text(badge),
    tag: tagEl ? clean(text(tagEl).replace(text(badge), '')) : '',
    // The headline as segments; `accent` marks the part set in blue.
    title: (h1.childNodes || []).map((c) => ({ text: raw(c).replace(/\s+/g, ' '), accent: has('hero-grad')(c) })).filter((s) => s.text.trim()),
    lede: text(one(section, has('lede'))),
    actions: actions(one(section, has('hero-actions')) || { childNodes: [] }),
    // A short note after the actions, e.g. "New — Spot & hobby buying: …".
    note: (() => { const p = one(section, (c) => c.tagName === 'p' && one(c, tag('strong')) && !has('lede')(c)); return p ? rich(p) : null; })(),
    image: image(one(section, has('image-slot'))),
  };
}
function head(n) {
  const h = one(n, has('section-head')) || n;
  return {
    eyebrow: text(one(h, has('eyebrow'))),
    heading: text(one(h, (c) => /^h[23]$/.test(c.tagName))),
    text: text(one(h, (c) => c.tagName === 'p')),
    actions: actions(h),
  };
}
function banner(n) {
  return {
    eyebrow: text(one(n, has('eyebrow'))),
    heading: text(one(n, (c) => /^h[23]$/.test(c.tagName))),
    text: text(one(n, (c) => c.tagName === 'p')),
    chips: all(n, has('chip')).map(text),
    actions: actions(n),
  };
}
const cta = (n) => banner(one(n, has('cta-metal')) || n);

// ---------------------------------------------------------------- divisions
function brandCards(section) {
  return all(section, has('category-card')).map((card) => {
    const links = all(one(card, has('brand-card-foot')), tag('a')).map(link);
    const page = links.find((l) => l.href.startsWith('brand-'));
    return {
      slug: page ? page.href.replace(/^brand-|\.html$/g, '') : null,
      logo: image(one(card, has('brand-card-logo'))),
      title: text(one(card, has('category-title'))),
      meta: text(one(card, has('category-meta'))),
      categories: all(card, has('brand-cat-pill')).map(link),
      note: text(one(one(card, has('brand-card-foot')), tag('span'))),
      links,
    };
  });
}
function featured(section) {
  return all(section, has('product-feature-card')).map((card) => ({
    image: image(one(card, has('product-feature-image'))),
    brandLogo: image(one(card, has('product-feature-brand'))),
    brandLabel: text(one(one(card, has('product-feature-brand')), tag('span'))),
    model: text(one(card, has('product-feature-model'))),
    title: text(one(card, has('product-feature-title'))),
    tagline: text(one(card, has('product-feature-tagline'))),
    specs: all(card, has('product-feature-spec')).map((s) => [text(one(s, has('product-feature-spec-label'))), text(one(s, has('product-feature-spec-value')))]),
    bullets: all(one(card, has('product-feature-bullets')), tag('li')).map((li) => rich(li)),
    useCase: text(one(one(card, has('product-feature-foot')), tag('span'))),
    link: link(one(one(card, has('product-feature-foot')), tag('a'))),
  }));
}
function division(name) {
  const doc = load(name);
  const s = sections(doc);
  const data = { hero: hero(s[0]) };
  const featuredSection = s.find((x) => one(x, has('product-feature-card')));
  if (featuredSection) {
    const sum = one(featuredSection, has('products-disclosure-head'));
    data.featured = { head: { eyebrow: text(one(sum, has('eyebrow'))), heading: text(one(sum, tag('h2'))), text: text(one(sum, tag('p'))) }, products: featured(featuredSection) };
  }
  const brandsSection = s.find((x) => attr(x, 'id') === 'brands');
  const note = one(brandsSection, has('eyebrow')) && all(brandsSection, (c) => c.tagName === 'span' && text(c).includes('Demo units'))[0];
  data.brands = { head: head(brandsSection), note: note ? text(note) : null, cards: brandCards(brandsSection) };
  data.banners = s.filter((x) => one(x, has('gap-banner'))).map((x) => ({ id: attr(x, 'id') || null, ...banner(one(x, has('gap-banner'))) }));
  data.cta = cta(s.find((x) => one(x, has('cta-metal'))));
  return data;
}

// ---------------------------------------------------------------- applications
function applications() {
  const doc = load('applications.html');
  const s = sections(doc);
  const apps = s.find((x) => attr(x, 'id') === 'apps');
  const groups = all(apps, has('app-tab')).map((tab) => {
    const id = attr(tab, 'data-target');
    const panel = one(apps, (c) => attr(c, 'id') === `tab-${id}`);
    return {
      id,
      label: text(tab),
      items: all(panel, has('category-card')).map((card) => ({
        id: attr(card, 'id'),
        title: text(one(card, has('category-title'))),
        meta: text(one(card, has('category-meta'))),
        image: image(one(card, has('image-slot'))),
        parts: all(card, has('app-item')).map((row) => {
          const name = one(row, has('app-item-name'));
          const pkg = one(row, has('app-item-pkg'));
          return { name: rich(name, (c) => c === pkg), detail: pkg ? rich(pkg) : '', source: text(one(row, has('app-item-source'))) };
        }),
        note: text(one(one(card, has('app-item-foot')), tag('span'))),
        link: link(one(one(card, has('app-item-foot')), tag('a'))),
      })),
    };
  });
  return { hero: hero(s[0]), head: head(apps), groups, cta: cta(s.find((x) => one(x, has('cta-metal')))) };
}

// ---------------------------------------------------------------- brands index
function brandsIndex() {
  const doc = load('brands.html');
  const s = sections(doc);
  const tiles = all(doc, has('brand-tile')).map((t) => {
    const a = one(t, has('tile-link'));
    return {
      slug: attr(a, 'href').replace(/^brand-|\.html$/g, ''),
      cat: attr(t, 'data-cat'),
      linkLabel: text(a),
      image: image(one(t, has('brand-tile-photo'))),
      logo: image(one(t, has('brand-logo-inline'))),
      name: text(one(t, has('wordmark'))),
      catLabel: text(one(t, has('brand-tile-cat'))),
      description: text(one(t, (c) => c.tagName === 'p')),
      chips: all(t, has('chip')).map(text),
      viewLabel: text(one(t, has('brand-tile-viewlink'))),
    };
  });
  const filters = all(one(doc, has('brand-tabs')), tag('button')).map((b) => ({ id: attr(b, 'data-filter'), label: text(b) }));
  return { hero: hero(s[0]), filters, tiles, banner: banner(one(doc, has('gap-banner'))), cta: cta(s.find((x) => one(x, has('cta-metal')))) };
}

// ---------------------------------------------------------------- brand pages
function brandPage(slug) {
  const doc = load(`brand-${slug}.html`);
  const s = sections(doc);
  const h = hero(s[0]);
  const heroSide = one(s[0], (c) => c.tagName === 'div' && one(c, has('brand-hero-logo')) && !has('hero-stack')(c) && !has('hero-split')(c));
  const byEyebrow = (re) => s.find((x) => re.test(text(one(x, has('eyebrow')))));
  const about = byEyebrow(/^About /);
  const range = byEyebrow(/^Product range/);
  const apps = byEyebrow(/^Applications/);
  const why = byEyebrow(/^Why source/);
  const faq = byEyebrow(/FAQ$/);
  const quote = s.find((x) => one(x, has('cta-metal')));
  const related = byEyebrow(/^Related /);
  return {
    slug,
    breadcrumb: all(one(s[0], has('brand-breadcrumb')), (c) => c.tagName === 'a' || (c.tagName === 'span' && text(c) !== '/')).map((c) => ({ label: text(c), href: attr(c, 'href') || null })),
    hero: { ...h, chips: all(one(s[0], has('hero-stack')), has('chip')).map(text) },
    heroImage: image(one(heroSide, has('image-slot'))),
    logo: image(one(heroSide, has('brand-hero-logo'))),
    glance: {
      eyebrow: text(one(heroSide, has('eyebrow'))),
      rows: all(heroSide, (c) => c.tagName === 'div' && has('muted')(c) && one(c, tag('strong'))).map((r) => [text(one(r, tag('strong'))).replace(/:$/, ''), clean(text(r).replace(text(one(r, tag('strong'))), ''))]),
    },
    about: { ...head(about), paragraphs: all(one(about, has('glass')), tag('p')).map(text) },
    range: { ...head(range), rows: all(range, has('app-cov-row')).map((r) => [text(one(r, has('wordmark'))), text(one(r, has('muted')))]) },
    applications: { eyebrow: text(one(apps, has('eyebrow'))), heading: text(one(apps, tag('h2'))), chips: all(apps, has('chip')).map(text) },
    why: { ...head(why), items: all(why, has('value-card')).map((c) => ({ icon: text(one(c, has('vc-icon'))), title: text(one(c, has('wordmark'))), text: text(one(c, tag('p'))) })) },
    faq: { ...head(faq), items: all(faq, has('faq-item')).map((d) => ({ q: text(one(d, tag('summary'))), a: text(one(d, has('faq-body'))) })) },
    cta: cta(quote),
    related: { eyebrow: text(one(related, has('eyebrow'))), items: all(related, has('rel-brand')).map((a) => ({ slug: attr(a, 'href').replace(/^brand-|\.html$/g, ''), name: text(one(a, has('wordmark'))), label: text(one(a, has('muted'))) })) },
  };
}

// ---------------------------------------------------------------- about
function about() {
  const doc = load('about.html');
  const s = sections(doc);
  const h = hero(s[0]);
  h.stats = all(s[0], has('hero-stat')).map((x) => ({ value: text(one(x, has('hero-stat-num'))), label: text(one(x, has('hero-stat-label'))) }));
  const byHeading = (re) => s.find((x) => re.test(text(one(x, tag('h2')))));
  const why = byHeading(/distribution partner/);
  const journey = byHeading(/single-brand distributor/);
  const leaders = byHeading(/directors/);
  const offer = byHeading(/international brands/);
  return {
    hero: h,
    image: image(s[1]),
    why: { ...head(why), items: all(why, (c) => has('glass')(c) && one(c, tag('h3'))).map((c) => ({ title: text(one(c, tag('h3'))), text: text(one(c, tag('p'))) })) },
    journey: { ...head(journey), rows: all(journey, has('timeline-row')).map((r) => ({ year: text(one(r, has('timeline-year'))), title: text(one(r, has('timeline-title'))), text: text(one(r, has('timeline-desc'))) })) },
    leadership: {
      ...head(leaders),
      people: all(leaders, has('leader-card')).map((c) => {
        const avatar = one(c, has('leader-avatar'));
        const nameBlock = avatar.parentNode.childNodes.filter((n) => n.tagName === 'div')[1];
        const lines = nameBlock ? nameBlock.childNodes.filter((n) => n.tagName === 'div').map(text) : [];
        return {
          initials: clean(avatar.childNodes.filter((n) => n.nodeName === '#text').map((n) => n.value).join('')),
          photo: image(avatar),
          name: lines[0], role: lines[1],
          bio: text(one(c, tag('p'))),
          contacts: all(c, has('pill')).map(text),
        };
      }),
    },
    offer: { ...head(offer), items: all(offer, (c) => has('glass')(c) && one(c, tag('h3'))).map((c) => ({ eyebrow: text(one(c, has('eyebrow'))), title: text(one(c, tag('h3'))), text: text(one(c, tag('p'))) })) },
    cta: cta(s.find((x) => one(x, has('cta-metal')))),
  };
}

// ---------------------------------------------------------------- write
const write = (name, data) => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1) + '\n');
};
// Brand facts (name, category, origin) come from the original brand-page generator's data.
const exportBrands = "import importlib.util, json, sys; s = importlib.util.spec_from_file_location('g', sys.argv[1]); g = importlib.util.module_from_spec(s); s.loader.exec_module(g); print(json.dumps(g.BRANDS))";
const source = JSON.parse(execFileSync('python', ['-c', exportBrands, path.join(ROOT, 'scripts', 'generate-brand-pages.py')], { encoding: 'utf8' }));
write('instruments.json', division('instruments.html'));
write('components.json', division('components.html'));
write('applications.json', applications());
write('brands.json', { index: brandsIndex(), brands: source.map((b) => ({ name: b.name, cat: b.cat, catLabel: b.cat_label, origin: b.origin, ...brandPage(b.slug) })) });
write('about.json', about());
console.log('content written to', path.relative(process.cwd(), OUT));

// The storefront's own styles (store.js renders its product grid, modal and cart with
// these classes). Its colour and shape variables are mapped to the new design in pages.css.
fs.mkdirSync(path.resolve(OUT, '../legacy'), { recursive: true });
fs.writeFileSync(path.resolve(OUT, '../legacy/store.css'),
  '/* Copied from ../store.css by scripts/extract-content.mjs. Edit the original, then re-run. */\n' + fs.readFileSync(path.join(ROOT, 'store.css'), 'utf8'));
