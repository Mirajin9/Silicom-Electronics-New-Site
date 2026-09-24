// Compress the Blender GLB masters (model-source/glb) into the web copies (public/models).
// Meshopt geometry compression; materials, textures and node structure are otherwise kept.
// The masters stay uncompressed so Blender and other tools can still open them.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const cli = 'node_modules/@gltf-transform/cli/bin/cli.js';
for (const name of ['scope', 'to220', 'to247', 'qfn', 'sot23']) {
  const input = `model-source/glb/${name}.glb`;
  const output = `public/models/${name}.glb`;
  execFileSync(process.execPath, [cli, 'optimize', input, output,
    '--compress', 'meshopt', '--simplify', 'false', '--palette', 'false', '--texture-compress', 'false'], { stdio: 'ignore' });
  const before = fs.statSync(input).size;
  const after = fs.statSync(output).size;
  console.log(`${name}: ${before.toLocaleString()} -> ${after.toLocaleString()} bytes`);
}
