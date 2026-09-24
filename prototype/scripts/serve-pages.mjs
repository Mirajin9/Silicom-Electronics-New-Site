// Serves the repository root the way GitHub Pages does, under /Silicom-Electronics-New-Site/,
// so the Pages preview (../redesign, from `npm run build:pages`) can be checked before it is
// pushed: http://localhost:4180/Silicom-Electronics-New-Site/redesign/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const repo = 'Silicom-Electronics-New-Site';
const root = path.resolve(import.meta.dirname, '../..');
const port = Number(process.env.PORT) || 4180;
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary', '.pdf': 'application/pdf',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain',
};

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/' || pathname === `/${repo}`) {
    res.writeHead(302, { Location: `/${repo}/redesign/` }).end();
    return;
  }
  let file = pathname.startsWith(`/${repo}/`) ? path.join(root, pathname.slice(repo.length + 2)) : '';
  if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file || !file.startsWith(root) || !fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
    return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`GitHub Pages preview: http://localhost:${port}/${repo}/redesign/`));
