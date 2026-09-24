# Silicom — React rendition

Status: **all 27 original pages rebuilt in React, plus 12 new category pages, prerendered, for design review**, 24 September 2026.

This implements the approved Industrial Editorial direction. The original site remains in the parent folder. Every route of the original site now has a React template in the homepage's design language, rendered to static HTML at build time and hydrated in the browser. The prototype also has a vector Silicom logo, the existing blue/navy/pale-blue colours, local Archivo and Manrope fonts and live product models.

## Preview

To start development from this folder:

```powershell
npm ci
npm run dev -- --port 5174
```

For a production-build preview:

```powershell
npm run build
npm run preview -- --port 4173
```

Both servers proxy `/api` to the store server on port 4000 (`../server`), so the store's products, cart and checkout work when that server is running. An unknown URL returns 404; neither server falls back to the homepage.

Always use `npm run build`: a bare `vite build` produces only the homepage, and every other URL then 404s.

## GitHub Pages preview (for the team)

GitHub Pages serves the repository root of `main`, the original site, at https://mirajin9.github.io/Silicom-Electronics-New-Site/. The new site is published beside it at **https://mirajin9.github.io/Silicom-Electronics-New-Site/redesign/**.

To update it:

```powershell
npm run build:pages     # writes ../redesign
npm run preview:pages   # check it at http://localhost:4180/Silicom-Electronics-New-Site/redesign/
```

Then commit and push `redesign/`. The preview build is marked `noindex`, so search engines keep treating silicomindia.com as the real site. It reuses the original site's `/assets` and `store.js` from the repository root instead of copying them (`src/base.ts`). The store has no server on Pages, so it shows no products there.

All internal paths go through `url()` in `src/base.ts`, so the same code works at a domain root or in a subfolder (`SITE_BASE`).

## Pages and content

| Route | Template | Notes |
|---|---|---|
| `/` (`index.html`) | `src/pages/Home.tsx` | Intro, live oscilloscope, package viewer |
| `instruments.html`, `components.html` | `src/pages/Division.tsx` | Live model hero, category cards, featured products, brand rows, banners |
| `instruments-*.html`, `components-*.html` (12, new) | `src/pages/Category.tsx` | One page per product category: stock photo hero, product types with the brands that supply them, featured products, partners, applications |
| `applications.html` | `src/pages/Applications.tsx` | Sticky index, application blocks, parts tables linked to brand pages |
| `brands.html` | `src/pages/Brands.tsx` | Filterable brand tiles |
| `brand-*.html` (19) | `src/pages/Brand.tsx` | One template for every brand page |
| `about.html` | `src/pages/About.tsx` | Stats, journey, leadership, offer |
| `contact.html` | `src/pages/Contact.tsx` | Enquiry form (see below) |
| `store.html` | `src/pages/Store.tsx` | The original `store.js` runs inside the new layout |

Shared pieces are in `src/Layout.tsx`, `src/SiteChrome.tsx` (header and footer), `src/ui.tsx` (hero, actions, chips, call-to-action band) and `src/catalogue.tsx` (category cards, product cards, partner logos). Page styles are in `src/pages.css`.

**Navigation.** Instruments and Components in the header open a panel of their categories, with links to the division page and the brands. The panels are in every page's HTML, hidden until opened, so search engines and visitors without JavaScript still get the links. Escape or a click elsewhere closes them. On phones the menu expands each division in place. The footer lists every category.

**Content comes from the original pages.** `npm run extract:content` parses the legacy HTML (`scripts/extract-content.mjs`) and writes `src/content/*.json`, so copy stays with the original site until the migration is final. Brand facts come from `../scripts/generate-brand-pages.py`. Copy that the original site does not have lives in `src/content/categories.ts` (the 12 categories: product types, which partners supply each, photos, related applications) and `src/content/index.ts` (which package model illustrates each component brand). The categories follow the original site's instrument categories, the 2026 line card and company profile, and each partner's range on its brand page.

**Prerendering.** `npm run build` type-checks, builds the client, builds a server bundle (`src/entry-server.tsx`) and runs `scripts/prerender.mjs`. That writes one static HTML file per route with the original page's title, description, canonical URL and Open Graph tags, then copies `robots.txt` and writes `sitemap.xml` (the original plus the category pages). Category pages get their own title, description and canonical URL. `dist/` can be uploaded to Hostinger as-is. Pages are indexable by default; build with `SITE_NOINDEX=1` for a staging copy that search engines should skip.

**Enquiry form.** The form keeps the original ids and field names, pre-fills from links such as `contact.html?brand=…`, validates, and opens a pre-addressed email draft. It does not send anything itself, and the confirmation says so. A server-side sender is still to be chosen.

**Store.** `store.html` renders the containers `store.js` expects and loads the script unchanged after hydration. It needs the store server for products and checkout.

## Logo

The only supplied logo artwork is two small rasters (`../assets/silicom-logo-full.png`, 477 × 108, and `../assets/silicom-logo-mark.png`, 197 × 453); the brochures embed the same files. `scripts/build-logo.py` rebuilds them as vectors:

- **Arrow:** a centre-line stroke with crisp corners, so it can draw itself on and stays sharp at any size.
- **SE monogram:** traced from the higher-resolution standalone mark. Its hairlines are thinner than a pixel in the source, so the script finds them from the skeleton, reinforces them, then traces and smooths the outline, keeping the corners.
- **Wordmark:** the source is only ~30 px tall, too small to trace cleanly, so it is reset in Alegreya ExtraBold (SIL Open Font License, vendored in `scripts/fonts/`). Each letter is placed at the position and width of the original.

Outputs:

- `public/brand/`: colour, reversed, mono blue, mono white, short and stacked lockups, the standalone mark, a heavier favicon for tab sizes, PNG icons, the 1200 × 630 link-preview image, and `silicom-logo-symbols.svg`, the sprite the header and footer use.
- `src/brand/logo-data.ts`: the paths for the animated React components.
- `../design/logo/silicom-logo-package/`: SVG, PNG, PDF, JPG and ICO files in every colourway, plus a usage guide (`08-documentation/usage-guide.pdf`).

On the site, the header and footer reference the sprite with `<use>`, coloured through `--logo-arrow`, `--logo-se` and `--logo-ink`, so the footer uses the reversed colourway without a white box and no page repeats the path data.

- **First visit of a session (homepage):** the arrow rises from its ribbon notch to the tip, the monogram and wordmark settle in, and the logo docks into the header (`src/brand/BrandIntro.tsx`, about 2 s). Skipped for deep links, inner pages and reduced motion; any click, key or scroll ends it. The 3D viewer waits for it to finish.
- **Loader:** the same mark draws on a loop while a model without a poster loads. It only appears if loading takes longer than a quarter of a second.

```powershell
pip install potracer fonttools   # plus Pillow and numpy
python scripts/build-logo.py
```

## Images

`python scripts/build-images.py` (Pillow and numpy) prepares imagery from `../assets`:

- **Customer logos** (homepage): the supplied files carry very different amounts of empty canvas, so equal boxes made some logos tiny. Each is trimmed to its artwork and given a display size for equal visual weight (equal area, adjusted for how much dark ink it has once greyscaled, within height and width limits). Very light logos are darkened slightly in the greyscale state. Sizes are in `src/content/customers.json`.
- **Partner logos** (brands page, brand rows and pages, category pages): the same sizing, in colour, with white backgrounds made transparent. Sizes are in `src/content/brand-logos.json`. CDIL now shows its logo.
- **Category photos**: the Pexels stock photography already licensed for the site (`../assets/IMAGE-SOURCES-stock.md`), cropped to 4:3 and encoded as WebP at hero, card and menu-thumbnail sizes. These are placeholders until Silicom has its own photography.

## Live models

The oscilloscope (Home, Instruments) and the package viewer (Home, Components) are live in the page (`src/InlineModel.tsx`, `src/ModelViewer.tsx`, configuration in `src/models.ts`):

- **Motion:** a gentle sway around the front view with a slight float. Hovering turns the product to face the visitor. Dragging rotates it, with tilt on desktop. A pose the visitor chooses is held while they hover and for 3 s after, then the sway resumes.
- **Touch:** sideways swipes rotate the model. Vertical swipes keep scrolling the page (`touch-action: pan-y`).
- **Controls:** keyboard arrows and Home, plus rotate, reset and pause buttons. Reduced-motion users get a still model that only moves when they turn it.
- **Oscilloscope poster:** the camera replicates the Blender poster's orthographic camera, so the live model cross-fades in place. AgX tone mapping matches the poster's colour transform.
- **Packages:** one persistent canvas swaps between models, preloading all four, with no blank frame between them. A rim light and a soft glow separate the black epoxy from the navy background.
- **Fallbacks:** browsers on software WebGL, or without WebGL, get the still image instead.

## 3D assets

Blender exports the uncompressed masters to `model-source/glb/`. `npm run optimize:models` writes Meshopt-compressed copies to `public/models/` for the web. Blender and most tools cannot open Meshopt files, so share the masters.

| Asset | Master GLB | Web GLB | Triangles | Source |
|---|---:|---:|---:|---|
| Tektronix 5 Series B study | 2,490,524 bytes | 422,728 bytes | 86,357 | `model-source/tektronix-5b-study.blend` |
| TO-220AB | 76,788 bytes | 18,192 bytes | 2,140 | `model-source/semiconductor-families.blend` |
| TO-247AD | 80,664 bytes | 19,036 bytes | 2,212 | same scene |
| QFN-32 | 69,584 bytes | 9,952 bytes | 400 | same scene |
| SOT-23 | 47,732 bytes | 12,512 bytes | 1,880 | same scene |

**Packages** (`scripts/build-packages.py`) are built at typical JEDEC outline dimensions (1 Blender unit = 10 mm), listed at the top of the script:

- **TO-247:** now its own form: a larger body with the mounting hole through the moulding, an exposed metal back instead of a tab, and wider leads at 5.45 mm pitch.
- **TO-220:** a separate nickel tab with its hole, leads at 2.54 mm pitch.
- **QFN-32:** pads flush with the sides and an exposed thermal pad.
- **SOT-23:** gull-wing leads.

The invented part markings are gone. The parts carry only moulding details: ejector-pin marks on the through-hole bodies and a pin-1 dot on the QFN. The viewer shows each body size, and says the parts are enlarged and that availability depends on the part. The same script renders a still of each package (`public/images/packages/`), used on brand pages and tiles for component brands without photography.

**Oscilloscope** (`scripts/build-scope.py`): the rear shell is now Tektronix blue, with a cooling-slot grid, an I/O plate (mains inlet, auxiliary BNCs, USB, LAN, DisplayPort, DVI and a serial label), the handle's hinge brackets and rear feet that sit on the ground. The front view and poster camera are unchanged. It was constructed from the supplied photographs; the official STEP assembly could not be imported (1,002 empty meshes). **No manufacturer CAD geometry is used.** The controls, legends and screen waveforms are reference-based approximations.

Regenerate with Blender 5.x:

```powershell
blender --background --python scripts/build-scope.py
blender --background --python scripts/build-packages.py
npm run optimize:models
python scripts/optimize-posters.py
npm run validate:models
```

`optimize-posters.py` requires Pillow and encodes the generated renders as WebP; it leaves source PNGs unchanged. All modelling is local and uses no external Blender add-ons. The source fonts retain their upstream licenses in the installed Fontsource packages.

## Not done yet

- **Store server locally:** `../server` uses `better-sqlite3`, which is compiled for Node 22 and fails to load on Node 24. Use Node 22, or upgrade `better-sqlite3`, to run it. The store UI was tested against mocked API responses.
- **Enquiry delivery:** the form opens an email draft; nothing is sent server-side.
- **Payments and checkout** have not been validated end to end.
- **Hostinger deployment** has not taken place. Nothing has been published.
- **Content bundle:** every page hydrates with all page content (about 29 KB gzip). Splitting it per page is a later optimisation.

## Validation completed

- TypeScript and production build pass; 39 pages prerendered (27 original, 12 category), 992 KB of HTML in total. The header's category panels add about 4 KB to each page.
- `npm run check:content` (`scripts/check-migration.mjs`) compares every legacy page with its prerendered page. All 27 routes, 2,559 text strings, 379 links, 72 ids and 8 form fields are preserved, and no link or anchor on any of the 39 built pages is broken. Four intentional rewordings are allowlisted in the script: two "click to expand" instructions for cards that no longer need clicking, the old enquiry confirmation, and the partner count (now counted from the brand list: 19).
- Khronos glTF validator: **0 errors and 0 warnings for each of the five web models**.
- Headless Chrome on the production build:
  - **Intro:** the draw-on, dock and header hand-off play in order on the prerendered homepage; inner pages have none.
  - **Hydration:** no console or hydration errors on any route.
  - **Poster to live model:** the oscilloscope's bounding box matches within 2 px.
  - **Package switching:** never blanks.
  - **Pointer behaviour:** idle sway, hover turn, drag-and-hold and resume, at 120 fps with the GPU enabled.
  - **Touch:** a vertical swipe over a model scrolls the page as over text; a sideways swipe rotates the model.
  - **Menus:** the Instruments and Components panels open on click, switch, close on Escape (focus returns to the button) and on an outside click, and their links navigate. The phone menu expands each division.
  - **Narrow screens:** no element extends past the viewport on any of the 39 pages at 375 px or 320 px, or at 1440 px.
  - **Software rendering:** SwiftShader falls back to the poster.
  - **Store (mocked API):** products, brand filters, product panel, add to cart and the cart drawer work.
- JavaScript, gzip: 74 KB shared (including the menu data), 28 KB page content, 1 to 5 KB per page template. The 3D viewer is about 282 KB, loaded only when a model scrolls near. These are lab figures, not field measurements.

The content migration checklist, legacy issues and form requirements are in the main design plan.
