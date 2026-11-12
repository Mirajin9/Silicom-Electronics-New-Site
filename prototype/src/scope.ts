/** MSO58B, 2 GHz configuration. Manufacturer references: model-source/scope-references/README.md. */
export type Waveform = 'sine' | 'square' | 'pulse' | 'noise';
export type ScopeSettings = { waveform: Waveform; running: boolean; spectrum: boolean; timebase: number };
export const waveforms: { id: Waveform; label: string }[] = [
  { id: 'sine', label: 'Sine' }, { id: 'square', label: 'Square' },
  { id: 'pulse', label: 'PWM pulse' }, { id: 'noise', label: 'Noisy signal' },
];
export const scopeFeatures = [
  { id: 'display', label: 'HD touchscreen', value: '15.6″ · 1920 × 1080', text: 'A capacitive touchscreen with waveform, measurement and Spectrum View controls.', side: 'front', position: [-.90, 2.60, 1.035] },
  { id: 'inputs', label: 'Eight FlexChannel inputs', value: '8 analog · up to 64 digital', text: 'Each input accepts one analog signal or eight digital signals with an optional TLP058 logic probe.', side: 'front', position: [-.45, .77, 1.16] },
  { id: 'trigger', label: 'Trigger & acquisition', value: '2 GHz · 6.25 GS/s', text: 'This MSO58B configuration has 2 GHz bandwidth and a maximum 6.25 GS/s sample rate on all channels.', side: 'front', position: [1.96, 2.43, 1.14] },
  { id: 'front-usb', label: 'Front USB ports', value: '1 × USB 3.0 · 2 × USB 2.0', text: 'Save waveforms and screenshots, or connect a keyboard and mouse.', side: 'front', position: [1.72, .50, 1.06] },
  { id: 'rear-usb', label: 'Rear connectivity', value: '4 USB hosts · USB device · LAN', text: 'Two USB 2.0 and two USB 3.0 host ports, a USB 3.0 device port and Gigabit Ethernet support bench integration.', side: 'back', position: [.38, .73, -1.16] },
  { id: 'reference', label: 'Display & reference I/O', value: 'DisplayPort · DVI-D · 10 MHz Ref In', text: 'Connect an external display or a precision reference. The AFG output requires the optional generator.', side: 'back', position: [-.60, 1.10, -1.17] },
] as const;
export type ScopeFeatureId = typeof scopeFeatures[number]['id'];
export type ScopeInteraction = {
  settings: ScopeSettings;
  selected: ScopeFeatureId | null;
  onHover: (feature: ScopeFeatureId | null) => void;
  onSelect: (feature: ScopeFeatureId) => void;
};

/** A deterministic signal shared by the time view and its computed FFT. */
export function signalSample(kind: Waveform, t: number, phase: number) {
  const a = t * Math.PI * 2 + phase;
  if (kind === 'square') return Math.tanh(Math.sin(a) * 16) * .78;
  if (kind === 'pulse') return ((t + phase / (2 * Math.PI)) % 1 + 1) % 1 < .28 ? .85 : -.55;
  if (kind === 'noise') return .64 * Math.sin(a) + .17 * Math.sin(a * 13.37 + 2) + .11 * Math.sin(a * 29.13 + 5) + .08 * Math.sin(a * 47.17);
  return .82 * Math.sin(a);
}

/** Radix-two FFT with a Hann window. Returns amplitude in dB relative to the peak. */
export function signalSpectrum(samples: number[]) {
  const n = samples.length, re = samples.map((v, i) => v * (.5 - .5 * Math.cos(2 * Math.PI * i / (n - 1)))), im = new Array<number>(n).fill(0);
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; }
  }
  for (let length = 2; length <= n; length *= 2) {
    const angle = -2 * Math.PI / length;
    for (let i = 0; i < n; i += length) {
      for (let j = 0; j < length / 2; j++) {
        const a = angle * j, c = Math.cos(a), s = Math.sin(a), k = i + j, l = k + length / 2;
        const r = re[l] * c - im[l] * s, v = re[l] * s + im[l] * c;
        re[l] = re[k] - r; im[l] = im[k] - v; re[k] += r; im[k] += v;
      }
    }
  }
  const magnitude = re.slice(1, n / 2).map((r, i) => Math.hypot(r, im[i + 1]));
  const peak = Math.max(...magnitude, 1e-9);
  return magnitude.map(v => Math.max(-70, 20 * Math.log10(Math.max(v, 1e-9) / peak)));
}
