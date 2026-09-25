import fs from "node:fs/promises";
import { validateBytes } from "gltf-validator";

const results = [];
for (const name of ["scope", "to220", "to247", "qfn", "sot23", "adler-bh300", "adler-bh400", "adler-a94", "adler-a84", "pace-ads200", "pace-blue-tips"]) {
  const bytes = await fs.readFile(`public/models/${name}.glb`);
  const report = await validateBytes(new Uint8Array(bytes), {
    uri: `${name}.glb`,
  });
  results.push({
    model: name,
    bytes: bytes.length,
    errors: report.issues.numErrors,
    warnings: report.issues.numWarnings,
    triangles: report.info.totalTriangleCount,
    drawCalls: report.info.drawCallCount,
    messages: report.issues.messages,
  });
}
await fs.mkdir("working", { recursive: true });
await fs.writeFile(
  "working/model-validation.json",
  JSON.stringify(results, null, 2),
);
console.table(results.map(({ messages, ...summary }) => summary));
if (results.some((r) => r.errors || r.warnings)) process.exitCode = 1;
