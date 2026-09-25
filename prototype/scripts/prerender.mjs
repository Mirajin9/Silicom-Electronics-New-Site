// Writes every route as static HTML (dist/<route>.html), so search engines, link
// previews and visitors without JavaScript get the full page. The browser then hydrates it.
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr). Metadata comes from
// the original pages, so titles, descriptions, canonical URLs and structured data carry over.
// Set SITE_NOINDEX=1 for a staging build that search engines should not index.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { routes, extract, root } from './legacy-pages.mjs';

const proto = path.resolve(import.meta.dirname, '..');
const dist = path.resolve(proto, process.env.SITE_OUT || 'dist');
const ssr = path.join(proto, 'dist-ssr');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render, newPages, canonicalMoves } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href);
const noindex = process.env.SITE_NOINDEX === '1';
const robots = noindex ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index, follow">';

// A page whose canonical URL has moved keeps its content but points search engines at the new URL.
function moveCanonical(file, head) {
  const to = canonicalMoves[file];
  if (!to) return head;
  return head.replace(/(<link rel="canonical" href=")[^"]*"/, `$1${to}"`).replace(/(<meta property="og:url" content=")[^"]*"/, `$1${to}"`);
}

const pages = [
  ...['index.html', ...routes].map((file) => ({
    file,
    // Social previews use the rebuilt logo rather than the old low-resolution PNG.
    head: moveCanonical(file, extract(file).metadata.replace(/https:\/\/www\.silicomindia\.com\/assets\/silicom-logo-full\.png/g, 'https://www.silicomindia.com/brand/og-image.png')),
  })),
  ...newPages.map((p) => ({ file: `${p.route}.html`, head: p.metadata })),
];

let bytes = 0;
for (const { file, head } of pages) {
  const route = file.replace(/\.html$/, '');
  const body = await render(route);
  const page = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta name="robots"[^>]*>/, '')
    .replace('</head>', `${robots}\n${head}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-route="${route}">${body}</div>`);
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.writeFileSync(path.join(dist, file), page);
  bytes += page.length;
}
fs.copyFileSync(path.join(root, 'robots.txt'), path.join(dist, 'robots.txt'));
// The original sitemap plus the new category pages.
const entries = newPages.map((p) => `  <url><loc>https://www.silicomindia.com/${p.route}.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
const moved = new RegExp(`\\s*<url><loc>https://www\\.silicomindia\\.com/(${Object.keys(canonicalMoves).join('|').replace(/\./g, '\\.')})</loc>.*?</url>`, 'g');
fs.writeFileSync(path.join(dist, 'sitemap.xml'), fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').replace(moved, '').replace('</urlset>', `${entries}\n</urlset>`));
fs.rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${pages.length} pages (${Math.round(bytes / 1024)} KB of HTML)${noindex ? ', noindex' : ''}`);
