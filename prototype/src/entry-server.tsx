import { renderToString } from 'react-dom/server';
import { loadPage } from './routes';
import { categories, categoryRoute } from './content/categories';

/** Used by scripts/prerender.mjs to write each route's static HTML. */
export async function render(route: string) {
  return renderToString(await loadPage(route));
}

const site = 'https://www.silicomindia.com';
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Routes the original site did not have, with their search and link-preview metadata. */
export const newPages = categories.map((c) => {
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
