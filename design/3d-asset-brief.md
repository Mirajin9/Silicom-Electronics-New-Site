# 3D asset production brief

Status: source research and production specification. No finished `.blend` or `.glb` model has been created in this planning pass.

## Tektronix reference findings

The dedicated `3d model references/` folder contains:

| Supplied file | Size | Use |
|---|---|---|
| `5-series-b-mso-mixed-signal-oscilloscopef__front-view.jpg` | 520 × 380 | Front silhouette, screen, eight input positions, control bank |
| `5-series-b-mso__front-angle-view.jpg` | 520 × 380 | Body depth, front bevels, feet and side relationship |
| `5-series-b-mso-mixed-signal-oscilloscope--side-view.jpg` | 520 × 380 | Vents, handle pivot, side profile |
| `5-Series-MSO-Mixed-Signal-Oscilloscope-Back-View.jpg` | 520 × 366 | Rear vents and connection-panel reference; filename indicates original 5 Series, so check against the selected B revision |

The front references show an **eight-input 5 Series B-style scope**. Treat that as the target visual configuration, pending the exact model/revision check. Existing 2 Series photos elsewhere in the project describe a different instrument and must remain separate.

### Official CAD source acquired

Downloaded from [Tektronix's mechanical CAD library](https://www.tek.com/en/support/cad):

`research/manufacturer/tektronix-mso-5-6-series-cad.zip` — 50,574,732 bytes.

Archive entries:

- `5_6 Series MSO.stp` — 147,123,683 bytes uncompressed.
- `6B_SERIES_8CH_MSO_STP.stp` — 118,601,597 bytes uncompressed.

The first file is a promising chassis reference; the second is labelled 6B and must not be passed off as 5B. The archive inventory and SHA-256 are recorded in the adjacent `.manifest.json`. The files have not yet been tessellated or visually compared, so exact compatibility is unverified. Keep original CAD as a working source; browser deliverables will be much smaller derived meshes.

Before distributing a derived asset, record the applicable manufacturer asset terms. The archive listing contains two STEP files and no separate licence file.

### Scope model specification

Model real geometry for the body silhouette, shell seams, feet, handle, handle pivots, screen recess, major controls, front connectors, USB openings, and visible vents. Use textures/normal maps for details that do not affect the silhouette at website scale.

Create separate named parts for body, handle, feet, bezel, screen, connector bank, controls, and rear/side panels. Keep realistic off-white polymer, satin metal, dark screen glass, cyan housing details, and the manufacturer branding seen in the approved reference. Silicom's page palette must not recolour the physical product.

The 520 px reference images support a shape blockout, not sharp close-up front-panel textures. Acquire official high-resolution images, screen references and exact dimensional documentation before final detail work. Use illustrative screen content only when it is clearly a visual demo in the asset metadata; do not invent a measurement specification or capability.

## Semiconductor library

The supplied **WXDH Profile, PDF page 8**, visibly shows DFN, QFN, TO-92, TO-126, TO-251, TO-220F/M/C, TO-252, TO-263, TO-247, TO-3P, SOT-363, SOT-8, SOT-223, SOT-23 and SOT-323. This is the strongest local visual family reference.

The supplied **Jilin Sino MOSFET catalogue**, page 16, additionally lists package families; page 38 contains small-signal/protection package references. Text extraction is saved in `research/catalogue-package-references.json`; its raw matches are search aids, not validated dimensions.

Use supplier datasheet mechanical outlines for actual dimensions, lead count, pad positions and package variants. For generic geometry, [Nexperia's DPAK/SOT428 package page](https://www.nexperia.com/packages/SOT428) and [onsemi's TO-220F outline](https://www.onsemi.com/download/package-drawing/pdf/221at.pdf) are examples of appropriate primary-source references. Do not mix their dimensions into a supplier-specific SKU without checking the selected datasheet.

| Priority | Package | Why it belongs | Treatment |
|---|---|---|---|
| First proof | TO-220 / TO-220F | Recognisable power-device silhouette, present in the supplier references | Exposed-metal and fully insulated variants must remain distinct |
| First set | TO-247 | Large power semiconductor for a strong hero composition | Verify selected 3-/4-lead variant before modelling |
| First set | TO-252 / DPAK | Surface-mount power package | Model tab, body bevel and formed leads |
| First set | TO-263 / D2PAK | Larger surface-mount power package | Keep its proportions separate from DPAK |
| First set | SOT-23 and SOT-223 | Small-signal and power/regulator-style package silhouettes | Correct pins/tabs; do not infer electrical function from outline alone |
| First set | DFN and QFN | Modern leadless packages in WXDH's portfolio | Pin-one feature, exposed pad and perimeter contacts from a selected outline |
| Follow-on | SOIC/SOP-8 | Controller/IC-style imagery, supported by catalogue families | Choose the exact outline; the WXDH sheet's “SOT-8” label alone is not a dimension specification |
| Follow-on | SOD-123 / SOD-323 | Diode/protection family referenced in Jilin material | Orientation band and leads need a chosen part/reference |
| Follow-on | TO-92 / TO-126 / TO-251 / TO-3P | Extend the supplier library where page content benefits | Reuse materials and lighting; retain distinct shapes |

MLCCs, resistors, MOVs and fuses can be a later complementary asset set. Label them as passives/protection devices rather than semiconductor packages.

## Production pipeline

1. **Identity check:** match the selected scope front/rear/side revision and exact package variants to primary references.
2. **CAD assessment:** open STEP in a suitable CAD tool, inspect orientation and units, then tessellate to a mesh. Blender is the material/mesh finishing stage; do not assume it imports STEP natively.
3. **Shape blockout:** compare front, side, rear and three-quarter silhouettes to the references. Use untextured renders so material polish cannot conceal proportion errors.
4. **Mesh cleanup:** remove unseen CAD internals, simplify repeated details, correct normals, bevel visible edges, and retain separate animation parts. If the CAD does not match, rebuild the visible shell against the references.
5. **Materials and texturing:** physically plausible polymer and metal; atlas small labels; use supplied or verified manufacturer identity. Avoid invented part numbers and material effects that obscure package detail.
6. **Studio treatment:** one consistent camera family and lighting rig; useful edge highlights, soft grounded shadows, controlled screen reflections.
7. **Export and optimisation:** glTF/GLB, sensible mesh compression, KTX2/Basis texture compression where supported, poster renders and a mobile variant. Record source/provenance and the asset version.
8. **Browser validation:** inspect fidelity, controls, frame cost, loading, WebGL failure, reduced motion and phone fallback. Validate glTF structure and test the exact shipped compressed assets.

## Proposed delivery budgets

These are project targets to validate in the prototype, not measured results or universal rules.

| Asset | Starting geometry target | Transfer target |
|---|---:|---:|
| Desktop scope | Approximately 40k–80k triangles | Approximately 1.5–3 MB including compressed textures |
| Mobile scope alternative | Approximately 15k–30k triangles | Approximately 0.6–1.2 MB, loaded only when useful |
| Individual package | Approximately 1k–5k triangles | Approximately 50–250 KB; shared materials/atlases where practical |
| First-screen poster | Responsive raster export | Approximately 100–250 KB at the relevant display size |

Budget the 3D engine bundle separately from the GLB. Keep it out of the critical text/navigation path. Prefer baked contact shadows, limited lights, and modest device-pixel ratio over expensive post-processing. Stop rendering when idle or offscreen; allow users to pause movement.

## Final deliverables per approved asset

- Editable Blender source, plus any procedural generation script and its parameters.
- Optimised GLB and, where useful, a lower-detail variant.
- Transparent/grounded poster renders at responsive sizes.
- Asset metadata: identity, selected variant, units, source URLs/files, known approximations, licence/provenance, triangle count, texture resolution, byte size and version.
- A small React viewer interface with loading, unavailable, error, static and interactive states.

## Acceptance

The scope must match the approved product's silhouette, input count, control-bank position and material colours in all intended camera views. Package models must match their selected outline and terminal arrangement. Text must remain readable outside the canvas; motion and 3D availability cannot determine access to product information or enquiries.

A generic marketing model should be identified as a package-family illustration in metadata and appropriate captions. A SKU-specific asset needs the corresponding manufacturer's outline and markings. Website models are visual assets, not fit-check CAD deliverables.
