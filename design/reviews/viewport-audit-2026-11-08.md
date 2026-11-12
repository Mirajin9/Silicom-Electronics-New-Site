# Website viewport audit

Completed locally on 8 November 2026 in the active React site (`prototype`). No deployment was performed.

## Layout findings and changes

The previous homepage used a 608 px minimum hero body, 610 px division cards, a 460 px model stage plus several controls, large section padding, and a portrait application image that participated in the grid's intrinsic sizing. Together these made several sections taller than a laptop viewport.

The new `viewport.css` centralises viewport-height typography, media frames and spacing. Images are contained by their frames instead of determining section height. The five homepage application tabs share identical image dimensions; the EV image now shows the charger within a compact frame. No content is clipped to force a section to fit.

Measured section heights at 1280 × 720 (80 px sticky header):

| Homepage section | Before | After |
|---|---:|---:|
| Hero | 721 px | 552 px |
| Divisions | 1027 px | 550 px |
| Applications | 728 px | 486 px |
| Package viewer | 799 px | 497 px |
| Company | 921 px | 590 px |

All default homepage sections fit within the remaining 640 px. At 1280 × 600, the header becomes 68 px and the tallest homepage section is 516 px within 532 px of available space. At 320 × 740, the tallest default section is 663 px within 672 px of available space.

## Content and browsing

- About now opens with the college-friends origin in 1994, describes global partners including Tektronix and service to respected institutes, and sets out professional standards and dependable supply. The timeline is removed. Leadership and contact information remain.
- Category cards use compact rows. Featured products show one complete card at a time with model selectors and previous/next controls. All six product cards remain in the prerendered HTML.
- Brand grids show one row at a time: three cards on desktop, two on tablet, one on phones. All ten component partners use their own logo as the main visual. Filtering resets the page, and the last page cannot become empty after resizing.
- Phones can switch between instrument/component division cards, and between overview and model views in the division and ADLER heroes. All content remains available without stacking every view into one long section.
- The oscilloscope category image is an MSO58B cutout derived from Tektronix's official datasheet. Alpha is retained in 4:3 WebP assets at 1400, 720 and 192 px widths. The original and the image-tool derivative are retained in `prototype/image-source/instruments`; source and prompt notes are in `prototype/image-source/SOURCES.md`.

Expanded details, large text settings and long catalogue/reference content can grow naturally. This change bounds the default showcase and browsing views rather than forcing all content into fixed-height containers.

## Verification

- TypeScript and production build passed; 42 pages prerendered.
- Existing migration/content check passed: 2448 text checks, 376 links, 72 IDs and 8 form fields; zero failures or broken links. Only the explicitly rewritten About opening, value grid and timeline are exempted from the old-copy comparison; replacement copy and timeline removal are checked.
- All 988 image references across the 42 generated pages resolve to files. No duplicate IDs.
- Seven representative routes checked at five production viewports: 1280 × 720, 1280 × 600, 768 × 1024, 390 × 844 and 320 × 740. No horizontal page overflow in the 35 checks. Additional 1366 × 768 development preview checked.
- All six featured products and their enquiry destinations checked through the pager.
- All ten component logos checked across the four desktop component pages and phone paging checked.
- All five homepage application tabs measured 317 px image height and 486 px section height at 1280 × 720. Keyboard ArrowRight selected the next tab correctly.
- Phone model view switching and mobile navigation checked. No browser console errors observed in the production checks.
- Existing Vite configuration and large 3D chunk warnings remain; they did not prevent the build.

Machine-readable results: `viewport-audit-2026-11-08.json`. Screenshot: `viewport-home-applications-2026-11-08.png`.

The interactive MSO68B upgrade is a separate review proposal in `../interactive-oscilloscope-plan.md`: six hotspots, four waveform presets, front/rear views, three small demonstrations and a model-accuracy review before implementation.
