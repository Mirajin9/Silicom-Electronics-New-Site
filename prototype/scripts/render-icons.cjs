// Renders SVGs to PNG for build-logo.py. Argument: a JSON file of [svgPath, pngPath, width, background|null].
const fs = require('node:fs');
const { Resvg } = require('@resvg/resvg-js');

for (const [source, target, width, background] of JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))) {
  const options = { fitTo: { mode: 'width', value: width }, ...(background ? { background } : {}) };
  fs.writeFileSync(target, new Resvg(fs.readFileSync(source), options).render().asPng());
}
