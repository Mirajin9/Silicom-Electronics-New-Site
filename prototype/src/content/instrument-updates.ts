// Approved catalogue corrections, 7 October 2026. Kept outside extracted JSON so
// extract:content cannot restore superseded products. Sources: design/research/instrument-updates-2026-10-07.md.
import type { Product } from './index';
const photo = (id: string, alt: string) => ({ src: `/images/products/${id}.webp`, alt });
const logo = (brand: string) => ({ src: `/images/brands/${brand}.webp`, alt: brand === 'elektro-automatik' ? 'EA Elektro-Automatik' : brand });
const enquiry = (brand: string, model: string) => ({ label: 'Request a quote', href: `contact.html?division=instruments&brand=${brand}&demo=${model}` });
export const afg31252: Product = {
  image: photo('tektronix-afg31000', 'Tektronix AFG31000 Series two-channel arbitrary function generator'),
  brandLogo: logo('tektronix'), brandLabel: 'Tektronix · AFG31000 Series', model: 'AFG31252',
  title: 'AFG31252 Arbitrary Function Generator',
  tagline: 'A high-performance two-channel source for precise stimulus, waveform replay and advanced device testing.',
  specs: [['Sine frequency', 'Up to 250 MHz'], ['Channels', '2'], ['Sample rate', 'Up to 2 GS/s'], ['Resolution', '14-bit']],
  bullets: ['16 Mpts per channel in advanced mode; optional 128 Mpts upgrade', 'InstaView monitors the waveform at the device under test', '9-inch touchscreen and built-in ArbBuilder waveform editor', 'Double-pulse test application for MOSFET and IGBT evaluation'],
  useCase: 'Board bring-up · waveform replay · power-device research', link: enquiry('tektronix', 'afg31252'),
};
export const eaPower: Product = {
  image: photo('elektro-automatik-psi9000', 'EA Elektro-Automatik PSI 9000 DT programmable DC power supply'),
  brandLogo: logo('elektro-automatik'), brandLabel: 'EA Elektro-Automatik · Germany', model: 'PSI 9000 DT',
  title: 'PSI 9000 DT Programmable DC Power Supply',
  tagline: 'Autoranging DC power for converters, batteries and automated test benches. Choose a model to suit your voltage, current and power requirements.',
  specs: [['Power range', '320–1500 W, model dependent'], ['Format', 'Desktop'], ['Output', 'Autoranging DC'], ['Control', 'Programmable']],
  bullets: ['Flexible voltage and current operation within the selected model’s power rating', 'Built-in function generator for programmable test profiles', 'Ask our team to match the supply and interfaces to your application'],
  useCase: 'Power electronics · converter validation · production test', link: enquiry('elektro-automatik', 'psi9000-dt'),
};
export const transformer5265: Product = {
  image: photo('microtest-5260n', 'Microtest 5260N Series transformer analyzer, including the 5265N'),
  brandLogo: logo('microtest'), brandLabel: 'Microtest · Taiwan', model: '5265N',
  title: '5265N Transformer Analyzer',
  tagline: 'Measure transformer and winding parameters in one production test setup, with integrated LCR measurement and fixture support.',
  specs: [['Frequency', '10 Hz–200 kHz'], ['Test channels', '20'], ['Basic accuracy', '±0.1%'], ['DC bias', '100 mA with F5620']],
  bullets: ['Inductance, leakage inductance, DCR, ACR, Q, capacitance and turns ratio', 'Pin-short detection and open/short calibration', 'LCR meter mode displays four parameters', '128 test-file storage; USB access for test data and screenshots'],
  useCase: 'Transformer manufacturing · magnetics quality control', link: enquiry('microtest', 'microtest-5265n'),
};
export const dmm6500: Product = {
  image: photo('keithley-dmm6500', 'Keithley DMM6500 bench digital multimeter'),
  brandLogo: logo('keithley'), brandLabel: 'Keithley · A Tektronix Company', model: 'DMM6500',
  title: 'DMM6500 Bench Digital Multimeter',
  tagline: 'Precision bench measurement with a graphical touchscreen for viewing trends, transients and statistics directly on the instrument.',
  specs: [['Resolution', '6½ digits'], ['Functions', '15 built-in'], ['Digitizer', '1 MS/s · 16-bit'], ['Connectivity', 'LAN / LXI · USB']],
  bullets: ['Voltage, current, resistance, capacitance and temperature measurements', 'Capture and examine transient waveforms on the touchscreen', 'Optional scan card expands measurement to 10 channels', 'Optional GPIB, RS-232 and TSP-Link interfaces'],
  useCase: 'Precision measurement · R&D · automated bench testing', link: enquiry('keithley', 'dmm6500'),
};
export const daq6510: Product = {
  image: photo('keithley-daq6510', 'Keithley DAQ6510 data acquisition and logging multimeter system'),
  brandLogo: logo('keithley'), brandLabel: 'Keithley · A Tektronix Company', model: 'DAQ6510',
  title: 'DAQ6510 Data Acquisition & Logging System',
  tagline: 'Combine precision multimeter measurement with multi-channel scanning for monitoring devices and logging long-duration tests.',
  specs: [['Resolution', '6½ digits'], ['Functions', '15 built-in'], ['Capacity', 'Up to 80 channels*'], ['Module slots', '2']],
  bullets: ['Touchscreen setup and visual monitoring of scan progress', 'Log electrical and temperature measurements across a test system', 'Choose from 12 compatible plug-in switching modules', '*Channel capacity depends on the optional modules fitted; modules selected separately'],
  useCase: 'Multi-point measurements · validation · data logging', link: enquiry('keithley', 'daq6510'),
};
export function updatedProducts(original: Product[]): Product[] {
  const scope = original.find(p => p.title === '2 Series MSO Oscilloscope')!;
  return [{...scope,
    specs: scope.specs.map(([key, value]) => [key, key === 'Channels' ? '2 or 4 analog · optional 16 digital' : value]),
    bullets: [...scope.bullets, 'EDU bundles offer education pricing for eligible institutions; ask about the included options and warranty.'],
    useCase: 'Embedded debug · university labs · field testing',
  }, afg31252, eaPower, transformer5265, dmm6500, daq6510];
}
