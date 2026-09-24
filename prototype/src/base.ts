/** Resolves a site-root path ("/contact.html", "/images/…") against the deployment base, so the
 *  same code works at a domain root (Hostinger) and in a subfolder (the GitHub Pages preview).
 *  The base comes from Vite's `base` option (SITE_BASE at build time). */
const base = import.meta.env.BASE_URL;
/** The original site's files (/assets/…, /store.js). The GitHub Pages preview sits in a folder
 *  beside the original site and uses its copies (SITE_ASSETS_BASE) instead of duplicating them. */
const shared = import.meta.env.SITE_ASSETS_BASE || base;

export const url = (path: string) => {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return (/^\/(assets\/|store\.js)/.test(path) ? shared : base) + path.slice(1);
};
