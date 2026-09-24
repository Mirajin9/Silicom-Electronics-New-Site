# Brand and visual system proposal

Status: proposed system for the first design rendition. Existing identity values were read from `styles.css`; assets were visually inspected.

## Design read

- Artifact: complete B2B distribution website with a component store.
- Audience: engineers, procurement teams, EMS/OEM buyers, lab managers, academia, and international manufacturers evaluating an Indian distributor.
- Mode: visual overhaul, preserving brand identity, source information, routes, and commercial functions.
- Visual language: industrial editorial; substantial grotesque typography, technical precision, real products, and spacious composition.
- Visual variance 7/10: different section compositions with a stable navigation and alignment grid.
- Motion 4/10 overall, 6/10 in one optional product scene: reading remains calm; movement concentrates on physical product understanding.
- Information density 4/10 on the homepage, 7/10 in catalogues: overview first, substantial specifications where they are useful.
- Asset dependence 9/10: actual logo, manufacturer products, credible models, and real facility photography.
- Brand fidelity 9/10 for logo/colours/content, with a new visual layout system.

## Positioning decisions

| Surface | Narrative role | Viewing context | Temperature | Capacity |
|---|---|---|---|---|
| Homepage opening | Establish range and confidence | Laptop first; immediate phone adaptation | Authoritative, energetic | One headline, one product, concise support, enquiry action, division links |
| Product viewer | Show physical quality and useful detail | Desktop pointer; explicit touch activation | Calm, precise | Model plus a short caption; controls outside the canvas |
| Catalogue | Help buyers identify a family, brand, or part | Desktop procurement and mobile lookup | Efficient, matter-of-fact | Search/filter controls, scannable lists, visible key facts |
| Application guide | Connect a design to a relevant kit | Both screen sizes | Helpful and technical | One application detail at a time, with a persistent index |
| Company/enquiry | Establish credibility and enable contact | Both screen sizes | Direct, human | Real information and clear next step |

## Existing colour system to retain

| Role | Existing value | Proposed use |
|---|---|---|
| White | `#FFFFFF` | Main surface and visual breathing room |
| Pale blue | `#E9F1FC` | Application/product support sections |
| Light blue-white | `#F4F8FE` | Subtle rows and alternating surfaces |
| Master/instruments blue | `#0B6FD3` | Primary actions, instrument wayfinding, selected chapter bands |
| Blue text | `#07529D` | Readable smaller blue labels |
| Navy | `#0A2A52` / `#061A33` | Product theatre and footer, already present in the site |
| Primary ink | `#0B1020` | Main headings and body emphasis |
| Secondary ink | `#2A2F44` | Body text |
| Muted text | `#51566E` | Supporting text |
| Metallic grey | `#7D8794` | Decorative detail and materials, not small low-contrast text |
| Components teal | `#0D9488` | Components labels/rules/active states; darker existing `#0A6B62` for small text |
| Applications amber | `#E08A1E` | Application markers and surfaces; use ink for text on amber |
| Brands indigo | `#6D5CFF` | Restrained brand-directory wayfinding |

Existing colours are retained as semantic roles. Blue and white remain dominant. The smaller division accents do not need to flood every section. Contrast must be checked for each actual foreground/background combination.

## Typography

Recommended display face: **Archivo**, weight 800–900, normal or slightly expanded width. Use its real font width variants/axis; do not stretch letters with transforms. Compare a Barlow Semi Condensed alternative in the design studies.

Supporting face: **Manrope**, weight 400–600. Body text stays at 16–18 px and line-height about 1.55–1.7. Technical values use tabular numerals where available. Keep to two font families in the selected system.

| Role | Desktop starting range | Mobile starting range | Treatment |
|---|---|---|---|
| Hero | 88–144 px | 44–64 px | Heavy, short lines, roughly 0.98–1.04 line height |
| Section heading | 52–80 px | 32–44 px | Heavy; sentence case or deliberate uppercase |
| Category/product heading | 24–32 px | 22–28 px | More space and regular proportions |
| Body | 17–18 px | 16–18 px | Normal casing, comfortable width, approximately 55–70 characters |
| Utility label | 12–14 px | 12–14 px | Medium weight; moderate tracking |

These are starting ranges, adjusted to the actual words at each breakpoint. The longest headline must be tested at narrow widths; do not fix overflow with clipping. All-caps treatment is concentrated in short statements so that technical copy retains readability.

Font sources: [Archivo by Omnibus-Type](https://github.com/Omnibus-Type/Archivo), [Manrope](https://fonts.google.com/specimen/Manrope), [Barlow](https://github.com/jpt/barlow). Self-host the chosen WOFF2 assets and retain their licence files.

## Layout and motion

- 8 px spacing base; 24/32/48/64/96/128 px spacing steps as appropriate.
- Content max-width around 1440 px; desktop gutters 48–64 px, phone gutters 20–24 px.
- Twelve-column desktop grid, four-column phone grid; product stage may bleed across a section edge without obscuring text.
- Main panels 0–4 px radius; controls 4–8 px. Preserve the physical bevels of actual products in the imagery.
- Clear 1 px rules and aligned edges replace repeated heavy card shadows. Use soft grounded shadows for products and real elevations only.
- Interface feedback about 150–250 ms; entrance transitions about 300–500 ms, `cubic-bezier(0.16,1,0.3,1)`. Avoid animating layout dimensions.
- Reduced-motion preference disables auto-rotation, parallax, and staged entrances. All content remains present immediately.
- Native scrolling. Animation must never trap users in a scene or delay access to navigation.

## Identity and imagery inventory

| Asset | Existing file | Handling |
|---|---|---|
| Full Silicom wordmark | `assets/silicom-logo-full.png` | Real supplied identity; preserve red/grey mark and wordmark proportions |
| Standalone mark | `assets/silicom-logo-mark.png` | Header compact use and local loading state |
| Original logo | `uploads/silicom electronics logo.png` | Reference for quality comparisons |
| Partner logos | `assets/brand-logos/` and `uploads/Supplier Brand Logos/` | Preserve actual identity and colour; standardise optical size and clear space |
| Customer marks | `assets/customers/` and `uploads/Customer Logos/` | Use existing relationships and approved context; preserve a route to the full set |
| Facilities | `assets/company/` and original warehouse/reception uploads | Company and service proof |
| Scope references | `3d model references/` | Four supplied front/angle/side/back views, 520 px wide |
| Existing 2 Series assets | `assets/products/instruments/tektronix-*` and `uploads/Tektronix mso series 2 image.jpg` | Keep correctly labelled as 2 Series product imagery |
| Existing product imagery | `assets/products/instruments/`, `assets/brands/products/` | Retain in relevant catalogue entries; replace inconsistent hero choices deliberately |

The full supplied Silicom wordmark is a small raster asset. Use it at appropriate display size initially; a faithful vector/source-quality version is a later craft task. Do not invent a new logo or replace the supplied lettering with the website heading font. A loader may animate the existing image wrapper without redrawing its mark.

## Avoid drift

Do not introduce a different brand palette, comical letterforms, sticker shapes, excessive pill controls, neon glows, decorative fake specifications, or a carousel as the only way to find a category. A semiconductor package can be visually enlarged for clarity, but any comparative-size view must use a declared scale.
