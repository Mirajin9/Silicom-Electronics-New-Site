import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, Mesh, MeshBasicMaterial, SRGBColorSpace, type Group } from 'three';
import { signalSample, signalSpectrum, type ScopeSettings } from './scope';

/** A real texture on the existing model's LCD: it rotates with the instrument. */
export function ScopeDisplay({ object, settings, reduced }: { object: Group; settings: ScopeSettings; reduced: boolean }) {
  const { invalidate } = useThree();
  const phase = useRef(0), last = useRef(-1);
  const display = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    texture.flipY = false; texture.anisotropy = 4;
    return { canvas, texture, material: new MeshBasicMaterial({ map: texture, toneMapped: false }) };
  }, []);
  useEffect(() => {
    const lcd = object.getObjectByName('SCOPE_SCREEN') as Mesh | undefined;
    if (!lcd) return;
    const original = lcd.material; lcd.material = display.material;
    return () => { lcd.material = original; };
  }, [object, display]);
  useEffect(() => {
    drawScreen(display.canvas, settings, phase.current); display.texture.needsUpdate = true; invalidate();
  }, [settings.waveform, settings.running, settings.spectrum, settings.timebase, display, invalidate]);
  useEffect(() => () => { display.material.dispose(); display.texture.dispose(); }, [display]);
  useFrame((state, delta) => {
    if (!settings.running || reduced) return;
    phase.current += Math.min(delta, .05) * 1.3;
    if (state.clock.elapsedTime - last.current < 1 / 24) return;
    last.current = state.clock.elapsedTime;
    drawScreen(display.canvas, settings, phase.current); display.texture.needsUpdate = true;
  });
  return null;
}

function drawScreen(canvas: HTMLCanvasElement, settings: ScopeSettings, phase: number) {
  const c = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  c.fillStyle = '#17191c'; c.fillRect(0, 0, W, H);
  c.font = '16px Arial'; c.textBaseline = 'middle';
  c.fillStyle = '#d9dcdf'; c.fillText('File    Edit    Utility    Help', 18, 17);
  c.fillStyle = '#34373b'; c.fillRect(0, 36, W, 33);
  c.fillStyle = '#f4f5f6'; c.fillText('Waveform View', 18, 53);
  c.fillStyle = settings.running ? '#75d85f' : '#f38b86'; c.fillText(settings.running ? '●  Run' : '■  Stopped', 1035, 53);
  c.fillStyle = '#a8afb6'; c.font = '13px Arial'; c.fillText('INTERACTIVE DEMO', 18, 90);
  const plot = { x: 54, y: 118, w: 1005, h: settings.spectrum ? 257 : 467 };
  const grid = (x: number, y: number, w: number, h: number) => {
    c.fillStyle = '#070a0d'; c.fillRect(x,y,w,h); c.strokeStyle = '#343b42'; c.lineWidth = 1;
    c.setLineDash([2, 6]);
    for (let i=0;i<=10;i++) { const a=x+w*i/10;c.beginPath();c.moveTo(a,y);c.lineTo(a,y+h);c.stroke(); }
    for (let i=0;i<=8;i++) { const a=y+h*i/8;c.beginPath();c.moveTo(x,a);c.lineTo(x+w,a);c.stroke(); }
    c.setLineDash([]); c.strokeStyle = '#5b636c'; c.strokeRect(x,y,w,h);
  };
  grid(plot.x,plot.y,plot.w,plot.h);
  const samples = Array.from({length:512},(_,i)=>signalSample(settings.waveform,i/511*10*settings.timebase,phase));
  const trace = (values: number[], y: number, amplitude: number, color: string) => {
    c.strokeStyle = color; c.lineWidth = 2.2; c.shadowColor = color; c.shadowBlur = 3;
    c.beginPath();values.forEach((v,i)=>{const x=plot.x+i/(values.length-1)*plot.w;const a=y-v*amplitude;i?c.lineTo(x,a):c.moveTo(x,a);});c.stroke();c.shadowBlur=0;
  };
  trace(samples,plot.y+plot.h*.36,plot.h*.23,'#ffe400');
  trace(samples.map((_,i)=>.65*Math.sin(i/511*10*settings.timebase*Math.PI*2+phase+.8)),plot.y+plot.h*.76,plot.h*.12,'#00e0e7');
  c.font='bold 18px Arial';c.fillStyle='#ffe400';c.fillText('1',25,plot.y+plot.h*.36);c.fillStyle='#00e0e7';c.fillText('2',25,plot.y+plot.h*.76);
  if (settings.spectrum) {
    const y=414,h=171;grid(plot.x,y,plot.w,h);
    const spectrum=signalSpectrum(samples);
    c.strokeStyle='#f5a84d';c.lineWidth=2;c.beginPath();
    spectrum.forEach((v,i)=>{const x=plot.x+i/(spectrum.length-1)*plot.w;const yy=y+12+(-v/70)*(h-24);i?c.lineTo(x,yy):c.moveTo(x,yy);});c.stroke();
    c.font='15px Arial';c.fillStyle='#f5b965';c.fillText('Spectrum View · FFT',plot.x+12,y+20);
  }
  c.fillStyle='#30343a';c.fillRect(1081,91,184,496);c.font='16px Arial';c.fillStyle='#f4f4f4';c.fillText('Measurements',1092,113);
  const amplitude = ((Math.max(...samples) - Math.min(...samples)) * 1.84).toFixed(3) + ' V';
  for (const [i,label,value] of [[0,'Frequency','1.000 MHz'],[1,'Amplitude',amplitude],[2,'Period','1.000 µs']] as const) {
    const y=154+i*92;c.fillStyle='#acb4bf';c.fillText(label,1094,y);c.fillStyle=i?'#d9e1e7':'#ffe400';c.font='19px Arial';c.fillText(value,1094,y+28);c.font='16px Arial';
  }
  c.fillStyle='#34383d';c.fillRect(0,605,W,115);
  for(let i=0;i<8;i++){
    const x=12+i*97;c.fillStyle='#22272b';c.fillRect(x,615,90,86);
    c.fillStyle=['#ffe400','#00d6e2','#f46c76','#68dd74','#ffab42','#729eea','#d49de5','#d1d6db'][i];c.fillRect(x,615,90,4);
    c.font='15px Arial';c.fillText('Ch '+(i+1),x+8,637);c.fillStyle='#e4e7e9';c.fillText(i<2?'1 V/div':'Off',x+8,665);
  }
  c.fillStyle='#e7e9ec';c.font='16px Arial';c.fillText('Horizontal',824,634);c.font='21px Arial';c.fillText(settings.timebase+' µs/div',824,665);
  c.font='14px Arial';c.fillStyle='#b8c0c8';c.fillText('6.25 GS/s  ·  62.5 Mpts',1010,667);
  c.fillStyle=settings.running?'#79d957':'#e37c75';c.fillRect(1170,614,96,29);c.fillStyle='#0c170b';c.font='bold 14px Arial';c.fillText(settings.running?'Triggered':'Stopped',1181,630);
}
