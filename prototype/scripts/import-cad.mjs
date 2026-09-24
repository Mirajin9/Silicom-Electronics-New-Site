import fs from "node:fs";
import { createRequire } from "node:module";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
const require = createRequire(import.meta.url);
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((r) => {
      this.result = r;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((r) => {
      this.result = `data:${blob.type};base64,${Buffer.from(r).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
console.log("Loading OpenCascade and manufacturer STEP.");
const occt = await require("occt-import-js")();
const source = fs.readFileSync("working/5-6-series.stp");
const result = occt.ReadStepFile(source, null);
if (!result.success) throw new Error("CAD import failed");
console.log(`Imported ${result.meshes.length} meshes.`);
const group = new THREE.Group();
const inventory = [];
for (const [i, m] of result.meshes.entries()) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(m.attributes.position.array, 3),
  );
  if (m.attributes.normal)
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(m.attributes.normal.array, 3),
    );
  geometry.setIndex(m.index.array);
  if (!m.attributes.normal) geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const color = new THREE.Color(...(m.color || [0.7, 0.7, 0.7]));
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 }),
  );
  mesh.name = `${i}_${m.name || "part"}`;
  group.add(mesh);
  inventory.push({
    i,
    name: m.name,
    color: m.color,
    vertices: m.attributes.position.array.length / 3,
    triangles: m.index.array.length / 3,
    min: geometry.boundingBox.min.toArray(),
    max: geometry.boundingBox.max.toArray(),
  });
}
fs.writeFileSync(
  "working/cad-inventory.json",
  JSON.stringify({ root: result.root, meshes: inventory }, null, 2),
);
if (!inventory.some((mesh) => mesh.triangles > 0)) {
  throw new Error(
    "The STEP assembly imported without surface triangles. No usable GLB was exported; inspect working/cad-inventory.json.",
  );
}
const buffer = await new GLTFExporter().parseAsync(group, { binary: true });
fs.writeFileSync("working/manufacturer-raw.glb", Buffer.from(buffer));
console.log(
  JSON.stringify(
    {
      meshes: inventory.length,
      triangles: inventory.reduce((s, m) => s + m.triangles, 0),
      bytes: buffer.byteLength,
      bounds: new THREE.Box3().setFromObject(group),
    },
    null,
    2,
  ),
);
