# Existing oscilloscope upgrade review

The MSO58B study was retained and refined using Tektronix's datasheet and Quick Start photographs. The original Blender source is unchanged; the refined source, source references and rebuild scripts are retained locally. No deployment was performed.

## Appearance and interaction

- Retained enclosure, carry handle, feet and bezel, with corrected proportions and materials.
- Added knob grip flutes, channel-key arrangement, input wells, detailed BNC connectors, surface grain, port shells, labels, rear cooling grid and reference-based I/O.
- Separate LCD surface displays sine, square, PWM and noisy signals. Run/Stop and timebase affect the display; Spectrum View computes an FFT from the same samples.
- Six feature markers support hover, keyboard focus and pinning. A feature picker provides the same specifications on phones. Selecting a rear feature turns the instrument; hidden-side markers are occluded.
- Front/Back, free rotation, keyboard arrows, Home/reset and motion pause remain available. The chosen inspection pose is retained.

## Verification

Production build passed and prerendered 42 pages. Content checks found no preservation failures or broken links. Signal checks passed for the fundamental, square/PWM harmonics and noisy-signal spectrum. All eleven web models passed glTF validation with zero errors and warnings. The scope is 1,663,768 bytes, 281,343 triangles and 26 draw calls.

Browser checks covered marker pin/close, six feature options, Escape, four waveform choices, Run/Stop, FFT, timebase and front/back inspection, including stopped acquisition and paused motion. No console errors were recorded. Phone feature popovers stayed inside the viewport. The Instruments phone model view was checked after removing the decorative orbit that overlapped its view tabs.

| Page/view | Viewport | Hero height | Header | Horizontal overflow |
|---|---|---:|---:|---|
| Home | 1280 × 720 | 572 px | 80 px | None |
| Home | 1280 × 600 | 516 px | 80 px | None |
| Home | 390 × 844 | 676 px | 64 px | None |
| Home | 320 × 740 | 630 px | 64 px | None |
| Instruments / model | 320 × 740 | 388 px | 64 px | None |

Evidence: `scope-interactive-front-2026-11-08.png`, `scope-interactive-rear-2026-11-08.png` and `scope-interactive-mobile-2026-11-08.png`. The JSON alongside this report records the measurements. Manufacturer URLs and configuration facts are in `../../prototype/model-source/scope-references/README.md`.

The model is a photo-guided visualisation, not certified CAD. Waveforms are labelled demonstrations. The user's forthcoming UI references can guide a later visual matching pass.
