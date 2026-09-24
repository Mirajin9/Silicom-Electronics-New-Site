// Reads the original site's pages (the parent folder): the route list, each page's body
// content and its <head> metadata. The build keeps every route and its search metadata;
// check-migration.mjs compares the new pages against these bodies.
import fs from 'node:fs';
import path from 'node:path';
import { parse, serializeOuter } from 'parse5';

export const root = path.resolve(import.meta.dirname, '../..');
export const routes = fs.readdirSync(root).filter((n) => /^(brand-[a-z-]+|instruments|components|applications|brands|about|contact|store)\.html$/.test(n));

const attr = (n, k) => n.attrs?.find((a) => a.name === k)?.value || '';
const has = (n, c) => attr(n, 'class').split(/\s+/).includes(c);
function children(n, predicate, result = []) {
  if (predicate(n)) result.push(n);
  for (const c of n.childNodes || []) children(c, predicate, result);
  return result;
}

export function extract(name) {
  const doc = parse(fs.readFileSync(path.join(root, name), 'utf8').replace(/^﻿/, ''));
  const body = children(doc, (n) => n.tagName === 'body')[0];
  const head = children(doc, (n) => n.tagName === 'head')[0];
  const nodes = body.childNodes.filter((n) => n.tagName && !['script', 'style', 'link', 'meta', 'title', 'footer'].includes(n.tagName) && !['nav-shell', 'bg-mesh', 'skip-link'].some((c) => has(n, c)));
  const html = nodes.map(serializeOuter).join('\n').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const metadata = head.childNodes
    .filter((n) => ['title', 'meta'].includes(n.tagName) || (n.tagName === 'link' && attr(n, 'rel') === 'canonical') || (n.tagName === 'script' && attr(n, 'type') === 'application/ld+json'))
    // The new pages set their own charset, viewport, theme colour and robots policy.
    .filter((n) => !(n.tagName === 'meta' && (attr(n, 'charset') || ['viewport', 'theme-color', 'robots'].includes(attr(n, 'name')))))
    .map(serializeOuter)
    .join('\n');
  return { slug: name.replace('.html', ''), html, metadata };
}
