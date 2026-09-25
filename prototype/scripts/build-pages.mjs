// Builds the GitHub Pages copy of the new site into dist-pages/. Pages publishes the gh-pages
// branch at https://mirajin9.github.io/Silicom-Electronics-New-Site/: the new site only, with its
// own copy of the original site's images (../assets) and store.js. It is marked noindex so search
// engines keep treating silicomindia.com as the real site. Check it with `npm run preview:pages`,
// then publish it with `npm run deploy:pages`.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repo = 'Silicom-Electronics-New-Site';
const base = `/${repo}/`;
const proto = path.resolve(import.meta.dirname, '..');
const out = path.join(proto, 'dist-pages');

execSync('npm run build', {
  cwd: proto,
  stdio: 'inherit',
  env: { ...process.env, SITE_OUT: out, SITE_BASE: base, SITE_NOINDEX: '1' },
});
// A crawler only reads these at the domain root; in a subfolder they would just mislead.
for (const f of ['sitemap.xml', 'robots.txt']) fs.rmSync(path.join(out, f), { force: true });
// Publish the files as they are, rather than through Jekyll (which drops names starting with "_").
fs.writeFileSync(path.join(out, '.nojekyll'), '');
// Pages serves 404.html for any missing path. The new site used to be published under /redesign/,
// so links shared from there go to the same page at the root.
fs.writeFileSync(path.join(out, '404.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Page not found | Silicom Electronics</title>
<script>
  (function () {
    var old = '${base}redesign/';
    if (location.pathname.indexOf(old) === 0) {
      location.replace('${base}' + location.pathname.slice(old.length) + location.search + location.hash);
    }
  })();
</script>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f8fe; color: #0d1330;
    font: 16px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { padding: 32px 16px; text-align: center; }
  h1 { margin: 0 0 8px; font-size: 28px; }
  p { margin: 0 0 20px; color: #51566e; }
  a { display: inline-block; padding: 12px 20px; background: #0d1330; color: #fff; text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
<main>
  <h1>Page not found</h1>
  <p>This page has moved or no longer exists.</p>
  <a href="${base}">Go to the Silicom Electronics home page</a>
</main>
</body>
</html>
`);
console.log(`GitHub Pages build written to ${path.relative(process.cwd(), out)}`);
