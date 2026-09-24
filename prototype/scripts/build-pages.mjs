// Builds the GitHub Pages preview of the new site into ../redesign. Pages serves the repository
// root of main (the original site) at https://mirajin9.github.io/Silicom-Electronics-New-Site/,
// so the new site appears at …/redesign/, beside it. It shares the original site's /assets and
// store.js rather than copying them (see src/base.ts), and is marked noindex so search engines
// keep treating silicomindia.com as the real site. Commit ../redesign to publish.
// Preview it locally first with `npm run preview:pages`.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repo = 'Silicom-Electronics-New-Site';
const proto = path.resolve(import.meta.dirname, '..');
const out = path.resolve(proto, '..', 'redesign');

execSync('npm run build', {
  cwd: proto,
  stdio: 'inherit',
  env: { ...process.env, SITE_OUT: out, SITE_BASE: `/${repo}/redesign/`, SITE_ASSETS_BASE: `/${repo}/`, SITE_NOINDEX: '1' },
});
// A crawler only reads these at the domain root; in a subfolder they would just mislead.
for (const f of ['sitemap.xml', 'robots.txt']) fs.rmSync(path.join(out, f), { force: true });
// Pages runs Jekyll over the branch, which drops any file or folder starting with "_" or ".".
const skipped = fs.readdirSync(out, { recursive: true }).filter((f) => /^[_.]/.test(path.basename(f)));
if (skipped.length) throw new Error(`GitHub Pages (Jekyll) would not publish: ${skipped.join(', ')}`);
console.log(`GitHub Pages preview written to ${path.relative(process.cwd(), out)}`);
