import assert from 'node:assert/strict';
import { signalSample, signalSpectrum } from '../src/scope.ts';

// Independent signal properties: fundamental, odd square-wave harmonics,
// even PWM harmonics, and high-frequency components in the noisy preset.
const spectrum = kind => signalSpectrum(Array.from({length:512},(_,i)=>signalSample(kind,i/512*8,0)));
const sine=spectrum('sine'), square=spectrum('square'), pulse=spectrum('pulse'), noise=spectrum('noise');
assert.equal(sine.indexOf(Math.max(...sine))+1,8);
assert(sine[23] < -55);
assert(square[23] > -15);
assert(pulse[15] > -15);
assert(noise.some((v,i)=>i>60 && v>-25));
console.log('Scope signal checks passed: fundamental, square/PWM harmonics and noisy-signal spectrum.');
