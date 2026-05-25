// Downscale the largest embedded raster from each flyer so Read can ingest it.
import sharp from "sharp";
import path from "node:path";

const SRC = path.resolve("scripts/flyer-renders");
const targets = [
  // Full-page flyer rasters identified by file size
  { in: "CABLE_TESTER_FLYER_img7.jpeg",       out: "cable-tester-page.png",  w: 1400 },
  { in: "microtest_transformer_img4.png",     out: "transformer-page.png",   w: 1400 },
  { in: "mso_sseries_edu_poster_img3.jpeg",   out: "mso-edu-page.png",       w: 1400 },
  // Secondary / spec panels in case main pages are pure imagery
  { in: "CABLE_TESTER_FLYER_img14.png",       out: "cable-tester-aux.png",   w: 1400 },
  { in: "microtest_transformer_img5.png",     out: "transformer-aux.png",    w: 1400 },
  { in: "mso_sseries_edu_poster_img4.png",    out: "mso-edu-aux.png",        w: 1400 }
];

for (const t of targets) {
  const ip = path.join(SRC, t.in);
  const op = path.join(SRC, t.out);
  await sharp(ip)
    .resize({ width: t.w, withoutEnlargement: false })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(op);
  console.log(`✓ ${t.in} → ${op}`);
}
