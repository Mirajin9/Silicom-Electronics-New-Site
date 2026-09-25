import { renderToString } from 'react-dom/server';
import { loadPage } from './routes';
import { categories, categoryRoute } from './content/categories';
import { brandBySlug } from './content';
import { ADLER_ROUTE, ADLER_URL, moreFaq } from './content/adler';
import { paceMeta } from './content/pace';

/** Used by scripts/prerender.mjs to write each route's static HTML. */
export async function render(route: string) {
  return renderToString(await loadPage(route));
}

const site = 'https://www.silicomindia.com';
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Routes the original site did not have, with their search and link-preview metadata. */
const categoryPages = categories.map((c) => {
  const route = categoryRoute(c);
  const title = `${c.name} — ${c.division === 'instruments' ? 'Test & Measurement Instruments' : 'Electronic Components'} | Silicom Electronics`;
  const url = `${site}/${route}.html`;
  const description = escape(c.lede);
  return {
    route,
    metadata: [
      `<title>${escape(title)}</title>`,
      `<meta name="description" content="${description}">`,
      `<link rel="canonical" href="${url}">`,
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="Silicom Electronics">',
      `<meta property="og:title" content="${escape(title)}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${site}/brand/og-image.png">`,
    ].join('\n'),
  };
});

const jsonLd = (data: object) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** ADLER keeps the URL, title and description wording the current silicomindia.com page ranks with. */
const adlerTitle = 'Adler Electronics Components Distributor in India - EV & Solar Fuses | Silicom';
const adlerDescription = 'Authorised Adler distributor in India. IATF 16949 EV and automotive fuses, 1500 V solar PV fuse links and fuse holders, in stock at Silicom Electronics, New Delhi.';
const adlerPage = {
  route: ADLER_ROUTE,
  metadata: [
    `<title>${escape(adlerTitle)}</title>`,
    `<meta name="description" content="${escape(adlerDescription)}">`,
    `<link rel="canonical" href="${ADLER_URL}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Silicom Electronics">',
    `<meta property="og:title" content="${escape(adlerTitle)}">`,
    `<meta property="og:description" content="${escape(adlerDescription)}">`,
    `<meta property="og:url" content="${ADLER_URL}">`,
    `<meta property="og:image" content="${site}/brand/og-image.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escape(adlerTitle)}">`,
    `<meta name="twitter:description" content="${escape(adlerDescription)}">`,
    jsonLd({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Components', item: `${site}/components.html` },
        { '@type': 'ListItem', position: 3, name: 'Circuit Protection', item: `${site}/components-protection.html` },
        { '@type': 'ListItem', position: 4, name: 'ADLER', item: ADLER_URL },
      ],
    }),
    jsonLd({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [...moreFaq, ...brandBySlug('adler').faq.items].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }),
  ].join('\n'),
};

const pacePage = {
  route: 'brand-pace',
  metadata: [
    `<title>${escape(paceMeta.title)}</title>`,
    `<meta name="description" content="${escape(paceMeta.description)}">`,
    `<link rel="canonical" href="${site}/brand-pace.html">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Silicom Electronics">',
    `<meta property="og:title" content="${escape(paceMeta.title)}">`,
    `<meta property="og:description" content="${escape(paceMeta.description)}">`,
    `<meta property="og:url" content="${site}/brand-pace.html">`,
    `<meta property="og:image" content="${site}/brand/og-image.png">`,
    jsonLd({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: brandBySlug('pace').faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }),
  ].join('\n'),
};

export const newPages = [...categoryPages, adlerPage, pacePage];
/** Original pages whose canonical URL moves: search engines should credit the established URL. */
export const canonicalMoves: Record<string, string> = { 'brand-adler.html': ADLER_URL };

