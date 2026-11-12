// Code-authored static LCD for the poster/fallback. Live LCD is ScopeDisplay.tsx.
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { signalSample } from '../src/scope.ts';
const out = 'model-source/scope-textures';fs.mkdirSync(out,{recursive:true});
const trace=(kind,base,amp,color)=>{
  const points=Array.from({length:512},(_,i)=>`${40+i/511*1005},${base-signalSample(kind,i/511*5,0)*amp}`).join(' ');
  return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
};
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
<defs><pattern id="grid" width="100.5" height="58" patternUnits="userSpaceOnUse"><path d="M100.5 0H0V58" fill="none" stroke="#444e58" stroke-dasharray="2 5"/></pattern></defs>
<rect width="1280" height="720" fill="#17191c"/>
<g font-family="Arial" fill="#dae0e5" font-size="16"><text x="18" y="24">File    Edit    Utility    Help</text>
<rect x="0" y="36" width="1280" height="33" fill="#34373b"/><text x="18" y="60">Waveform View</text><text x="1040" y="60" fill="#75d85f">● Run</text>
<text x="40" y="98" font-size="13" fill="#9ca5ae">INTERACTIVE DEMO</text>
<rect x="40" y="118" width="1005" height="467" fill="#070a0d"/><rect x="40" y="118" width="1005" height="467" fill="url(#grid)"/>
${trace('sine',282,108,'#ffe400')}${trace('sine',470,60,'#00dfe7')}
<rect x="1081" y="91" width="184" height="496" fill="#30343a"/><text x="1092" y="119">Measurements</text>
<text x="1094" y="171" fill="#acb4bf">Frequency</text><text x="1094" y="205" font-size="22" fill="#ffe400">1.000 MHz</text>
<text x="1094" y="280" fill="#acb4bf">Amplitude</text><text x="1094" y="314" font-size="22">3.018 V</text>
<text x="1094" y="390" fill="#acb4bf">Period</text><text x="1094" y="424" font-size="22">1.000 µs</text>
<rect y="605" width="1280" height="115" fill="#34383d"/>
${['#ffe400','#00dfe7','#f46c76','#68dd74','#ffaa42','#729eea','#d49de5','#d1d6db'].map((color,i)=>`<rect x="${12+i*97}" y="615" width="90" height="86" fill="#22272b"/><rect x="${12+i*97}" y="615" width="90" height="4" fill="${color}"/><text x="${20+i*97}" y="642" fill="${color}">Ch ${i+1}</text><text x="${20+i*97}" y="672">${i<2?'1 V/div':'Off'}</text>`).join('')}
<text x="824" y="642">Horizontal</text><text x="824" y="674" font-size="22">0.5 µs/div</text><text x="1010" y="674">6.25 GS/s · 62.5 Mpts</text></g></svg>`;
fs.writeFileSync(`${out}/screen-default.svg`,svg);
fs.writeFileSync(`${out}/screen-default.png`,new Resvg(svg).render().asPng());
console.log('Wrote LCD poster texture');
