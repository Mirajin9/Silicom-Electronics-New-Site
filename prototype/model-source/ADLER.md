# ADLER display model library

Four original, editable models reconstructed for the Silicom website, 25 September 2026.

| Model | Selected appearance | Nominal dimensions |
| --- | --- | --- |
| BH300 | BH300-02, blue raised pull handle and red indicator | Housing length 126.2 mm, nominal width 21.8 mm; closed case height 53 mm, raised handle approximately 69 mm |
| BH400 | White raised operating handle, red DIN release tab, no BH401 indicator | Housing length 110.4 mm, nominal width 34.9 mm; raised handle approximately 67 mm |
| A94 | Blue cylindrical cartridge with silver end caps | Diameter 22 mm, length 58 mm |
| A84 | Blue cylindrical cartridge with silver end caps | Diameter 14.2 mm, length 51 mm |

## Deliverables

- `adler-bh300.blend`, `adler-bh400.blend`, `adler-a94.blend`, `adler-a84.blend`: individually editable Blender files, with named parts, packed label textures, lighting and cameras.
- `glb/adler-*.glb`: uncompressed masters.
- `../public/models/adler-*.glb`: optimized website assets using meshopt compression.
- `adler-renders/`: transparent PNG render masters.
- `../public/images/adler/`: WebP fallback posters and a collection overview, made from the renders by `finish-adler.py`.
- `adler-manifest.json`: export dimensions, matching camera frames and source byte counts.
- `adler-textures/`: generated label atlases, embedded in the GLBs and Blender files.

The existing site's model convention is **one source/glTF unit = 10 mm**. Models are display assets, not fit-check or manufacturing CAD. Holder profiles use catalogue dimensions; small mouldings, rear surfaces, recess depths, shell seams, hidden contacts and internal parts are simplified or inferred from the photographs. The rear repeats visible side markings. The holders are static with raised handles; no opening animation or internal switching mechanism is claimed.

## Reference provenance

The five user-supplied reference images identify the intended appearance. The second attachment is the BH300 operating diagram; the third is the BH400/BH401 image. Instructions printed in the diagram were treated only as visual reference.

The local manufacturer catalogue `uploads/Company Profiles/Adler-PV Catalog 202411.pdf` supplies the dimensional outlines:

- PDF pages 17 and 19: A84 identity and cylindrical dimensions.
- PDF page 32: A94 identity and cylindrical dimensions.
- PDF page 58: BH300 outline and nominal measurements.
- PDF page 59: BH400 outline and variant distinction.

The emblem derives from the existing supplied `assets/brand-logos/adler.png`. The mesh and label layout are original reconstructions. ADLER identity remains the manufacturer's. Markings identify photographed examples, not stock or certification guarantees; certification logos and certification numbers were deliberately not recreated. The A94 photograph shows 80 A / 1500 Vdc, while the November 2024 catalogue lists 1300 Vdc for 70/80 A. Verify the selected sale SKU against its current datasheet; the visual asset does not resolve that revision difference.

## Rebuild

From `prototype/`:

```powershell
python scripts/build-adler-textures.py
& 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe' --background --python scripts/build-adler.py
python scripts/finish-adler.py
node scripts/optimize-models.mjs adler-bh300 adler-bh400 adler-a94 adler-a84
npm run validate:models
npm run build
```

`build-adler.py` also writes `src/adler-frames.json` so browser framing matches the rendered posters. `AdlerBrowser.tsx` integrates the models in the ADLER brand-page hero with product selection, keyboard/drag rotation, motion controls and static fallback. Only the selected asset loads.
