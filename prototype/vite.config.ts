import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { root, routes } from './scripts/legacy-pages.mjs';
import { categories, categoryRoute } from './src/content/categories';

const pages = [...routes, ...categories.map((c) => `${categoryRoute(c)}.html`)];

const mime: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.js': 'application/javascript', '.webp': 'image/webp', '.avif': 'image/avif' };
// The storefront talks to the Node API (../server, port 4000) for products, cart and payment.
const api = { '/api': 'http://localhost:4000' };

export default defineConfig(({ isSsrBuild }) => ({
  // Every page is its own HTML file: an unknown URL is a 404, not the homepage.
  appType: 'mpa',
  // Deployment folder, e.g. SITE_BASE=/Silicom-Electronics-New-Site/redesign/ for the GitHub Pages preview.
  base: process.env.SITE_BASE || '/',
  define: { 'import.meta.env.SITE_ASSETS_BASE': JSON.stringify(process.env.SITE_ASSETS_BASE || '') },
  server: { proxy: api },
  preview: { proxy: api },
  // SITE_OUT redirects the client build (scripts/build-pages.mjs writes ../redesign).
  build: isSsrBuild ? { outDir: 'dist-ssr', emptyOutDir: true } : { outDir: process.env.SITE_OUT || 'dist', emptyOutDir: true },
  plugins: [{
    name: 'silicom-routes',
    configureServer(server) {
      // In development every original .html route renders on the client from the same template.
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url || '/').split('?')[0]);
        if (pages.includes(url.slice(1))) {
          const template = fs.readFileSync(path.join(import.meta.dirname, 'index.html'), 'utf8')
            .replace('<div id="root"></div>', `<div id="root" data-route="${url.slice(1, -'.html'.length)}"></div>`);
          res.setHeader('Content-Type', 'text/html');
          res.end(await server.transformIndexHtml(url, template));
          return;
        }
        if (url.startsWith('/assets/') || url === '/store.js') {
          const file = path.resolve(root, '.' + url);
          if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
            res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
            fs.createReadStream(file).pipe(res);
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      // The Pages preview uses the original site's copies (see src/base.ts).
      if (isSsrBuild || process.env.SITE_ASSETS_BASE) return;
      const out = path.resolve(import.meta.dirname, process.env.SITE_OUT || 'dist');
      // The site's images, PDFs and logos; internal notes (*.md) are not published.
      fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true, filter: (src) => !src.endsWith('.md') });
      fs.copyFileSync(path.join(root, 'store.js'), path.join(out, 'store.js'));
    },
  }],
}));
