# Existing 5 Series B interactive upgrade

Updated 8 November 2026 after approval to retain and improve the existing model. The former MSO68B replacement proposal is superseded.

## Model retained

The existing Tektronix MSO58B / 5 Series B study is shown as a 2 GHz configuration. `prototype/model-source/tektronix-5b-study.blend` is preserved. `tektronix-5b-refined.blend` refines that source's enclosure, handle, feet and bezel.

Manufacturer photographs, port diagrams and source URLs are recorded in `prototype/model-source/scope-references/README.md`. The model adds detailed BNC contacts and threads, knob grip flutes, LED rings, input wells, port shells, labels, surface grain and a separate UV-mapped LCD.

## Implemented interaction

1. Six specification hotspots: screen, inputs, trigger/acquisition, front USB, rear USB/LAN and display/reference connections. Hover or focus shows facts; click pins a feature. Hidden-side markers are occluded by a lightweight enclosure proxy. The feature picker provides the same access on phones and turns the model toward the selected side.
2. Front/Back views, free drag rotation, keyboard arrows, Home/reset and motion pause. An inspection pose is retained until reset or another user turn.
3. Sine, square, PWM pulse and noisy-signal presets animate on the model's LCD and follow its perspective during rotation.
4. Run/Stop freezes acquisition. The 0.5, 1 and 2 microseconds/div choices change the time window. Spectrum View adds an FFT computed from the same samples with a Hann window.
5. Signals are labelled as demonstrations. Manufacturer capabilities are separate from simulated readouts. Optional logic probes and the AFG option are identified in the specification text.

The existing viewport budget is retained. Small phones use the picker instead of overlapping markers. Rendering stops outside the viewport and in hidden tabs; reduced motion keeps the trace still. Unsupported/software graphics retain the poster.

## Rebuild and validation

The web model is approximately 1.66 MB, with 281343 triangles and 26 draw calls. All eleven project models pass glTF validation with zero errors and warnings. Signal checks: `node scripts/check-scope.mjs` from `prototype`.

Rebuild from the original study:

```powershell
node scripts/make-scope-textures.mjs
blender --background --python scripts/refine-scope.py
blender --background --python scripts/finish-scope.py
node scripts/optimize-models.mjs scope
python scripts/optimize-posters.py scope-hero scope-detail scope-rear
npm run validate:models
npm run build
```

This is a photo-guided visualisation, not dimensionally certified CAD. The screen uses a minimal UI based on manufacturer references. The user's Tektronix UI examples can guide a later visual matching pass. Full menu emulation, probe insertion and calibration are outside this implementation.
