// Compress full-page flyer PNGs so Read can view them; tile each into 2 halves (top/bottom)
// because A4 portrait at 1200px wide is too tall for a single Read.
import sharp from "sharp";
import path from "node:path";

const D = path.resolve("scripts/flyer-renders");
const inputs = ["flyer-cable-tester.png", "flyer-transformer.png", "flyer-mso-edu.png"];

for (const f of inputs) {
  const ip = path.join(D, f);
  const meta = await sharp(ip).metadata();
  const halfH = Math.floor(meta.height / 2);
  const base = f.replace(/\.png$/, "");
  // top half
  await sharp(ip).extract({ left: 0, top: 0, width: meta.width, height: halfH })
    .resize({ width: 900 })
    .jpeg({ quality: 72 })
    .toFile(path.join(D, base + "-top.jpg"));
  // bottom half
  await sharp(ip).extract({ left: 0, top: halfH, width: meta.width, height: meta.height - halfH })
    .resize({ width: 900 })
    .jpeg({ quality: 72 })
    .toFile(path.join(D, base + "-bot.jpg"));
  console.log(`✓ split & compressed ${f}  (${meta.width}x${meta.height})`);
}
