---
name: redesign-2026-06
description: State and key mechanisms of the June 2026 Silicom site redesign (imagery, colour-coding, simplified nav)
metadata:
  type: project
---

June 2026 redesign of the Silicom Electronics static site, prompted by client feedback that it was "confusing and dull." Changes made (uncommitted in working tree as of 2026-06-12):

- **Section colour-coding**: `styles.css` defines `--c-instruments/-components/-applications/-brands` and remaps `--accent` via `body[data-section="…"]`. Set `data-section` on a page's `<body>` to recolour the whole page (blue / teal / amber / indigo). Home/about/contact stay master blue.
- **Applications consolidated**: new `applications.html` is the single hub (9 app cards moved out of components.html). The animated **orbital circle was removed from BOTH components.html and instruments.html** (client kept the homepage 3D carousel). Orbital JS handler was removed from `site.js`. brands.html's app-coverage rows were removed; a cross-link band replaced each.
- **Brand pages are GENERATED** by `scripts/generate-brand-pages.py` (it also patches brands.html idempotently + writes sitemap.xml/robots.txt). Edit the generator and re-run `python scripts/generate-brand-pages.py` — do NOT hand-edit `brand-*.html`.
- **Images pending from client**: see `IMAGES-NEEDED.md` (44 images). Every photo slot uses inline `onerror` to fall back to an existing SVG illustration or hide gracefully, so missing images never show broken icons. Folders: `assets/heroes|applications|instruments|brands/products|company`.
- **Backup/restore point**: git tag `pre-redesign-2026-06` + zip in `backups/` (gitignored). Restore with `git checkout pre-redesign-2026-06`.

**Grounding pass (2026-06-16)** — client still felt it was "dull/complicated", wanted "more solid white + blue, grounded, unique, keep glass". Changes in `styles.css` `:root`:
- `--bg-1` now solid white, `--bg-2/3` clean pale blue (was washed grey `#f6f8fb/#edf2f7`).
- Glass fills raised to near-opaque (0.86/0.94/0.70) + `--glass-border` changed to a blue-ink hairline `rgba(13,38,75,0.10)` so panels have a visible edge on white (the old white-on-white border was invisible = "floaty"). Glass blur/sheen kept.
- New `--brand-grad` (vivid blue→deep blue) replaces the muddy `accent→accent-2` (blue→grey) on the PROMINENT actions only: `.btn-primary`, `.nav-cta`, `.hero-tag-badge`. Small decorative gradients (bullets, dots, toggles, tile eyebrows) intentionally LEFT as `accent→accent-2` so they follow the per-section wayfinding colour.
- `.bg-mesh` rebuilt: white→blue base + one confident blue glow + a subtle **blueprint grid** (`.bg-mesh::before`, 64px, masked) for on-brand "instrumentation" grounding. `.bg-grain` opacity dropped 0.4→0.12.
- Footer is now a **solid deep-blue panel** (`linear-gradient(165deg,#0a2a52…#061a33)`) with ink tokens remapped locally to light + a 3px `--brand-grad` top rule. Grounds the bottom of every page.
- Accessibility: added global `:focus-visible` ring + white-on-blue ring for primary buttons; `.skip-link` styles + a "Skip to content" link and `id="main" tabindex="-1"` on the first hero `<section>` of every page (the brand-page generator emits these too — re-run safe); `color-scheme: light dark`; darkened `--ink-3`→`#51566e` / `--ink-4`→`#6c7287` for WCAG AA.
- Simplicity: removed the duplicate `.quick-route` band from `index.html` (the hero already lists the same 3 routes); hero primary CTA is now solid `btn-primary` (was two ghost buttons = no clear primary).

Known PRE-EXISTING (not from this redesign): the Components nav dropdown + footer link to `components.html#mosfets/#diodes/#protection/#passives`, but those section IDs never existed — links load the page without scrolling.

PowerShell 5.1 gotcha hit during this work: `Get-Content`/`Set-Content` corrupt UTF-8 `·`/`–` in no-BOM files. Use `[System.IO.File]::ReadAllText`/`WriteAllText` with `UTF8Encoding($hadBom)` for these HTML/JS files.
