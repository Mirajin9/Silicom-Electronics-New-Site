/** Resolves a site-root path ("/contact.html", "/images/…") against the deployment base, so the
 *  same code works at a domain root (Hostinger) and in a subfolder (GitHub Pages).
 *  The base comes from Vite's `base` option (SITE_BASE at build time). */
const base = import.meta.env.BASE_URL;
/** The original site's files (/assets/…, /store.js). Normally copied into the build; a build set
 *  with SITE_ASSETS_BASE uses copies already published there instead. */
const shared = import.meta.env.SITE_ASSETS_BASE || base;

export const url = (path: string) => {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return (/^\/(assets\/|store\.js)/.test(path) ? shared : base) + path.slice(1);
};
