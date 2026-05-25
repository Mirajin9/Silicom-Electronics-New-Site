import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = path.resolve("uploads/Images of Instruments");
const OUT = path.resolve("scripts/flyer-renders");
await fs.mkdir(OUT, { recursive: true });

const FILES = [
  { in: "CABLE TESTER FLYER.svg",     out: "flyer-cable-tester.png" },
  { in: "microtest transformer.svg",  out: "flyer-transformer.png" },
  { in: "mso sseries edu poster.svg", out: "flyer-mso-edu.png" }
];

for (const f of FILES) {
  const svg = await fs.readFile(path.join(SRC, f.in));
  const resvg = new Resvg(svg, {
    background: "white",
    fitTo: { mode: "width", value: 1200 }
  });
  const pngData = resvg.render().asPng();
  await fs.writeFile(path.join(OUT, f.out), pngData);
  console.log(`✓ ${f.in} → ${f.out}  (${pngData.length} bytes)`);
}
