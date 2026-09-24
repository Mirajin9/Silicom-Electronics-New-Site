// Checks the built site (dist/) against the original pages: every text string, link,
// anchor id and form field of each original page must exist on the new page, and every
// internal link and #anchor across the site must resolve. Run after `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { root, routes, extract } from './legacy-pages.mjs';

const out = path.join(root, 'prototype/dist');
const walk = (n, fn, r = []) => { if (fn(n)) r.push(n); for (const c of n.childNodes || []) walk(c, fn, r); return r; };
const attr = (n, k) => n.attrs?.find((a) => a.name === k)?.value;
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const text = (n) => (n.nodeName === '#text' ? n.value : (n.childNodes || []).filter((c) => c.tagName !== 'script').map(text).join(' '));
// Old pages linked relatively (contact.html); new ones from the root (/contact.html).
const normHref = (h) => (h === '/' ? 'index.html' : h.replace(/^\//, ''));

// Wording deliberately changed in the redesign, with the reason.
const REWORDED = {
  'A few instruments engineers ask us for most — click to expand and browse the highlights.': 'featured products are shown open; the "click to expand" instruction is dropped',
  'Components applications show which parts Silicom carries per design. T&M applications show which instruments prove your work. Click any card to expand.': 'every application is shown open; the "click to expand" instruction is dropped',
  "Thanks — we've logged your enquiry. We'll be in touch within one working day.": 'the form opens an email draft, so the confirmation now says that truthfully',
  '16': 'About now counts the 19 brand partners the site lists (it said 16)',
};
// Links that intentionally point somewhere else now.
const RELINKED = {
  'assets/heroes/instruments.jpg': 'hero photos replaced by live 3D models and real photography',
};

const failures = [];
let textCount = 0, linkCount = 0, idCount = 0, fieldCount = 0;
for (const name of ['index.html', ...routes]) {
  if (name === 'index.html') continue; // the homepage was rewritten by design in rendition 01
  const source = parse(extract(name).html);
  const dest = parse(fs.readFileSync(path.join(out, name), 'utf8'));
  const destText = norm(text(dest));
  for (const n of walk(source, (n) => n.nodeName === '#text')) {
    const value = norm(n.value);
    if (value.length < 3 || REWORDED[value]) continue;
    textCount++;
    if (!destText.includes(value)) failures.push(`${name}: missing text: ${value.slice(0, 100)}`);
  }
  const destHrefs = new Set(walk(dest, (n) => !!attr(n, 'href')).map((n) => normHref(attr(n, 'href'))));
  for (const n of walk(source, (n) => n.tagName === 'a' && !!attr(n, 'href'))) {
    const href = normHref(attr(n, 'href'));
    linkCount++;
    if (!destHrefs.has(href) && !RELINKED[href]) failures.push(`${name}: missing link ${href}`);
  }
  // Anchor ids and form field names (ids inside inline SVG icons are not linkable).
  const inSvg = (n) => { for (let p = n; p; p = p.parentNode) if (p.tagName === 'svg') return true; return false; };
  for (const key of ['id', 'name']) {
    for (const n of walk(source, (n) => !!attr(n, key) && !inSvg(n))) {
      const value = attr(n, key);
      key === 'id' ? idCount++ : fieldCount++;
      if (!walk(dest, (d) => attr(d, key) === value).length) failures.push(`${name}: missing ${key}="${value}"`);
    }
  }
}

// Every internal link and anchor across the built site (new pages included) must resolve.
const broken = [];
for (const name of fs.readdirSync(out).filter((n) => n.endsWith('.html'))) {
  const doc = parse(fs.readFileSync(path.join(out, name), 'utf8'));
  for (const a of walk(doc, (n) => n.tagName === 'a' && !!attr(n, 'href'))) {
    const href = attr(a, 'href');
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    const url = new URL(href, 'https://local/' + name);
    const file = url.pathname.replace(/^\//, '') || 'index.html';
    if (!fs.existsSync(path.join(out, file))) { broken.push(`${name}: ${href}`); continue; }
    if (url.hash && file.endsWith('.html')) {
      const target = file === name ? doc : parse(fs.readFileSync(path.join(out, file), 'utf8'));
      if (!walk(target, (n) => attr(n, 'id') === decodeURIComponent(url.hash.slice(1))).length) broken.push(`${name}: ${href} (missing anchor)`);
    }
  }
}

const report = { routes: routes.length + 1, textCount, linkCount, idCount, fieldCount, reworded: REWORDED, failures, broken };
fs.writeFileSync(path.join(root, 'design/reviews/migration-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, reworded: Object.keys(REWORDED).length }, null, 2));
if (failures.length || broken.length) process.exitCode = 1;
