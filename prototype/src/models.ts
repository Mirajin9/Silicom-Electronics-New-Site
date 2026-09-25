import adlerFrames from './adler-frames.json';
import paceModels from './pace-models.json';

export type ModelId = 'scope' | 'to220' | 'to247' | 'qfn' | 'sot23' | 'adler-bh300' | 'adler-bh400' | 'adler-a94' | 'adler-a84' | 'pace-ads200';

type Frame =
  // Matches an orthographic Blender render, so the live model can replace the poster in place.
  | { kind: 'poster'; width: number; height: number; target: [number, number, number] }
  // Fits the model's bounding sphere, so no rotation can clip it.
  | { kind: 'fit'; padding: number };

export type ModelSpec = {
  id: ModelId;
  label: string;
  url: string;
  /** Direction from the model to the camera. */
  view: [number, number, number];
  frame: Frame;
  /** Shown until the live model is ready; also the no-WebGL fallback. */
  poster?: string;
  fallback: string;
  /** Idle sway either side of the front view, in radians. */
  sway: number;
  /** Back light that separates dark parts from a dark background. */
  rim?: boolean;
  /** Tone mapping: AgX matches the Blender posters; ACES keeps black epoxy deep. */
  tone: 'agx' | 'aces';
};

const pkg = (id: ModelId, label: string): ModelSpec => ({
  id,
  label,
  url: `/models/${id}.glb`,
  view: [4, 3.4, 7],
  frame: { kind: 'fit', padding: 1.1 },
  fallback: '/images/package-theatre.webp',
  sway: 0.65,
  rim: true,
  tone: 'aces',
});

export const MODELS: Record<ModelId, ModelSpec> = {
  scope: {
    id: 'scope',
    label: 'Tektronix 5 Series B oscilloscope',
    url: '/models/scope.glb',
    // Blender camera for scope-hero (scripts/build-scope.py): ortho scale 6.25 at 1400 x 1100,
    // from (6, -12, 5.5) towards (0, 0, 1.62), converted to glTF's Y-up axes.
    view: [6, 3.88, 12],
    frame: { kind: 'poster', width: 6.25, height: (6.25 * 1100) / 1400, target: [0, 1.62, 0] },
    poster: '/images/scope-hero.webp',
    fallback: '/images/scope-hero.webp',
    sway: 0.4,
    tone: 'agx',
  },
  to220: pkg('to220', 'TO-220 package'),
  to247: pkg('to247', 'TO-247 package'),
  qfn: pkg('qfn', 'QFN package'),
  sot23: pkg('sot23', 'SOT-23 package'),
  'adler-bh300': adler('bh300', 'ADLER BH300 fuse holder'),
  'adler-bh400': adler('bh400', 'ADLER BH400 fuse holder'),
  'adler-a94': adler('a94', 'ADLER A94 cylindrical fuse link'),
  'adler-a84': adler('a84', 'ADLER A84 cylindrical fuse link'),
  // Built with ChatGPT (scripts/build-pace.py); framing from its poster camera (src/pace-models.json).
  'pace-ads200': {
    id: 'pace-ads200', label: 'PACE ADS200 PLUS soldering station', url: '/models/pace-ads200.glb',
    view: paceModels['pace-ads200'].view as [number, number, number],
    frame: { kind: 'poster', width: paceModels['pace-ads200'].frame.width, height: paceModels['pace-ads200'].frame.height,
      target: paceModels['pace-ads200'].frame.target as [number, number, number] },
    poster: '/images/pace/pace-ads200.webp', fallback: '/images/pace/pace-ads200.webp',
    sway: 0.28, tone: 'agx',
  },
};

function adler(name: 'bh300' | 'bh400' | 'a94' | 'a84', label: string): ModelSpec {
  return {
    id: `adler-${name}`, label, url: `/models/adler-${name}.glb`,
    view: name.startsWith('bh') ? [4, 4.6, 9] : [2.6, 4.8, 9],
    frame: { kind: 'poster', ...adlerFrames[name], target: adlerFrames[name].target as [number, number, number] },
    poster: `/images/adler/${name}.webp`, fallback: `/images/adler/${name}.webp`,
    sway: .22, tone: 'agx',
  };
}

/** Pointer, keyboard and button input, written by the DOM and read by the 3D frame loop. */
export type ViewerInput = {
  dragging: boolean;
  pointerId: number;
  pointerType: string;
  lastX: number;
  lastY: number;
  dx: number;
  dy: number;
  hovered: boolean;
  /** The visitor has turned the model; hold that pose rather than resuming the sway. */
  posed: boolean;
  lastInteraction: number;
  turn: number;
  reset: boolean;
  invalidate?: () => void;
};

export const createInput = (): ViewerInput => ({
  dragging: false,
  pointerId: -1,
  pointerType: 'mouse',
  lastX: 0,
  lastY: 0,
  dx: 0,
  dy: 0,
  hovered: false,
  posed: false,
  lastInteraction: 0,
  turn: 0,
  reset: false,
});
