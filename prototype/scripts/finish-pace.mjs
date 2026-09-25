// Preserve the individually named tip meshes and all six station groups while optimizing.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { validateBytes } from 'gltf-validator';

const results = [];
for (const name of ['pace-ads200', 'pace-blue-tips']) {
  execFileSync(process.execPath, ['node_modules/@gltf-transform/cli/bin/cli.js', 'optimize',
    `model-source/glb/${name}.glb`, `public/models/${name}.glb`,
    '--compress', 'meshopt', '--flatten', 'false', '--join', 'false', '--instance', 'false',
    // WebP textures (EXT_texture_webp) nearly halve the station: the sponge photo texture dominates it.
    '--simplify', 'false', '--palette', 'false', '--texture-compress', 'webp'], { stdio: 'ignore' });
  const bytes = await fs.readFile(`public/models/${name}.glb`);
  const jsonLength = bytes.readUInt32LE(12);
  const doc = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const nodes = doc.nodes.map(n => n.name).filter(Boolean);
  if (name === 'pace-blue-tips') {
    for (let i = 1; i <= 16; i++) {
      const key = `TIP_${String(i).padStart(2, '0')}`;
      if (nodes.filter(n => n === key).length !== 1) throw new Error(`Lost independent tip node ${key}`);
    }
  }
  const report = await validateBytes(new Uint8Array(bytes), { uri: `${name}.glb` });
  results.push({ model: name, bytes: bytes.length, triangles: report.info.totalTriangleCount,
    drawCalls: report.info.drawCallCount, errors: report.issues.numErrors,
    warnings: report.issues.numWarnings, nodes, messages: report.issues.messages });
}
await fs.writeFile('model-source/pace-validation.json', JSON.stringify(results, null, 2));
console.table(results.map(({ nodes, messages, ...row }) => row));
if (results.some(r => r.errors || r.warnings)) process.exitCode = 1;
// The website reads framing and tip labels from src (files in public/ cannot be imported).
await fs.copyFile('public/models/pace-manifest.json', 'src/pace-models.json');

