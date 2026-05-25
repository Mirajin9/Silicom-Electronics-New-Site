# Logo Background Removal & Carousel Rework Plan

## Overview
Three interconnected changes: (1) remove backgrounds from all logos programmatically, (2) convert the customer showcase from a static grid to an auto-scrolling carousel, and (3) remove the brands carousel from the homepage while ensuring brands are properly visible with logos on instruments/components pages.

---

## Step 1: Set Up Background Removal Tooling

**Create `package.json`** at project root:
```json
{
  "name": "silicom-site",
  "private": true,
  "scripts": {
    "remove-bgs": "node scripts/remove-backgrounds.mjs"
  },
  "dependencies": {
    "@imgly/background-removal-node": "^1.7.0",
    "sharp": "^0.33.0"
  }
}
```

**Create `scripts/remove-backgrounds.mjs`** — a script that:
- Targets all files in `assets/brand-logos/` and `assets/customers/`
- Skips already-transparent files (`anritsu.svg`, `silicom-logo-mark.png`)
- Uses `@imgly/background-removal-node` to remove backgrounds
- Outputs clean PNGs back to the same directories (overwriting originals)
- Also processes `uni-t.jpg` → converts to PNG with sharp first, then removes background, saves as `uni-t.png`
- Cleans up: delete the old `uni-t.jpg` after conversion

**Run**: `npm install` then `npm run remove-bgs`

### Files to process (~30 total):

**`assets/brand-logos/`** — `adler.png`, `asemi-asm.png`, `donghai-wxdh.png`, `elektro-automatik.png`, `jilin-sino.png`, `keithley.webp`, `metrix.png`, `microtest.png`, `mlcc-base.png`, `mot-inmark.png`, `reasunos.png`, `rishabh.png`, `scientific.png`, `shikues.png`, `surging.png`, `tektronix.png`, `uni-t.jpg` (convert to PNG)

**`assets/customers/`** — `fiem.png`, `hella.png`, `hfcl.png`, `iiser-mohali.png`, `iit-delhi.png`, `iit-jammu.png`, `iit-roorkee.png`, `indication-instruments.png`, `inst.png`, `interface.png`, `kaynes.png`, `marelli.png`, `stryker.png`, `syrma-sgs.png`, `vvdn.png`, `waaree.png`

---

## Step 2: Update `uni-t.jpg` References to `uni-t.png`

After background removal converts `uni-t.jpg` to `uni-t.png`:

- `index.html`: Change `logo: "assets/brand-logos/uni-t.jpg"` → `"assets/brand-logos/uni-t.png"`
- `instruments.html`: Change `src="assets/brand-logos/uni-t.jpg"` → `"assets/brand-logos/uni-t.png"`

---

## Step 3: Remove Brands Carousel from `index.html`

### 3a. Remove HTML section
Delete the entire "Authorized partners" section with the brand carousel.

### 3b. Remove inline JS
Delete the `(function() { ... })()` block that builds brand cards for the carousel.

### 3c. Remove CSS from `styles.css`
Delete these CSS blocks:
- `.brand-carousel` rules
- `.brand-track` rules
- `.brand-card` rules
- `.brand-card.has-logo`, `.brand-card img`, `.brand-card .brand-name`, `.brand-card .brand-sub`

**Keep** `@keyframes scroll-x` — the customer carousel will reuse it.

---

## Step 4: Add Logo Images to `components.html` Segment Cards

Currently the "All component brand partners" section uses text-only `.segment-card` entries. Each card should display its brand logo above the brand name.

**Brands and their logo files:**
| Brand | Logo file | Notes |
|---|---|---|
| ASEMI (ASM) | `asemi-asm.png` | — |
| Donghai / WXDH | `donghai-wxdh.png` | — |
| Shikues | `shikues.png` | — |
| Jilin Sino | `jilin-sino.png` | — |
| CDIL | — | No logo file; keep wordmark-only |
| Surging | `surging.png` | — |
| Adler EV | `adler.png` | — |
| MLCCBASE | `mlcc-base.png` | — |
| Reasunos | `reasunos.png` | — |
| MOT Inmark | `mot-inmark.png` | — |

Each card gets an `<img>` tag before the wordmark. Add CSS to make `.segment-card` a flex column with centered alignment.

---

## Step 5: Convert Customer Showcase to Auto-Scrolling Carousel

### 5a. Replace static grid HTML with carousel structure:
```html
<div class="customer-carousel reveal">
  <div class="customer-track" id="customer-track"></div>
</div>
```

### 5b. Add inline JS that builds 16 customer tiles and appends them to the track.

### 5c. Add CSS:
- `.customer-carousel` — overflow hidden, edge fade mask
- `.customer-track` — flex with `scroll-x` animation (40s, paused on hover)
- `.customer-tile` — glass card (200×96px) with hover lift + desaturation removal
- Reuse existing `@keyframes scroll-x`

---

## Step 6: Verify

1. Run `npm run remove-bgs` — all logos get transparent backgrounds
2. Open `index.html` — brand carousel gone, customer carousel auto-scrolls
3. Open `components.html` — segment cards show brand logos
4. Open `instruments.html` — partner logo grid works, uni-t.png reference correct
5. Hover effects work on customer tiles
