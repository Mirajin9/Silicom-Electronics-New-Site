// Rasterize the 3 SVG flyer posters to PNGs so they can be read/transcribed
// for the in-page Featured Product sections on instruments.html.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.resolve("uploads/Images of Instruments");
const OUT_DIR = path.resolve("scripts/flyer-renders");

const FLYERS = [
  { in: "CABLE TESTER FLYER.svg",   out: "cable-tester-flyer.png" },
  { in: "microtest transformer.svg", out: "transformer-flyer.png" },
  { in: "mso sseries edu poster.svg", out: "mso-edu-flyer.png" }
];

await fs.mkdir(OUT_DIR, { recursive: true });

for (const f of FLYERS) {
  const inPath  = path.join(SRC_DIR, f.in);
  const outPath = path.join(OUT_DIR, f.out);
  // Use a moderate width so the PNG is readable but stays under Read tool's size cap.
  await sharp(inPath, { density: 150 })
    .resize({ width: 1100, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${f.in} → ${outPath}`);
}
