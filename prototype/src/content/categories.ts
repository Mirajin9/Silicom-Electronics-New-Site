// Product categories: the header menus, the division pages' category index and one page
// per category (instruments-*.html, components-*.html). The groupings follow the original
// site's instrument categories, the 2026 line card and company profile, and each partner's
// range on its brand page. Kept free of the large content files so the header can use it.
import type { ModelId } from '../models';

export type CategoryType = {
  name: string;
  text: string;
  /** Brand pages (slugs) that supply this type. */
  brands: string[];
  /** Line-card partners without a brand page on the site. */
  others?: string[];
  image?: string;
};
export type Category = {
  id: string;
  division: 'instruments' | 'components';
  name: string;
  /** One line for the header menu and category cards. */
  menu: string;
  headline: [string, string];
  lede: string;
  photoAlt: string;
  types: CategoryType[];
  /** Featured product titles from the division page. */
  products?: string[];
  /** Application ids on applications.html. */
  applications: string[];
  /** Package render shown for component categories. */
  model?: ModelId;
};

export const categoryRoute = (c: Pick<Category, 'id' | 'division'>) => `${c.division}-${c.id}`;
export const categoryHref = (c: Pick<Category, 'id' | 'division'>) => `/${categoryRoute(c)}.html`;
export const categoryPhoto = (c: Pick<Category, 'id'>, size: '' | '-card' | '-thumb' = '') => `/images/categories/${c.id}${size}.webp`;

const P = '/assets/brands/products/';
const I = '/assets/products/instruments/';

export const categories: Category[] = [
  // ------------------------------------------------------------------ instruments
  {
    id: 'oscilloscopes', division: 'instruments', name: 'Oscilloscopes',
    menu: 'Benchtop, mixed-signal and handheld scopes, and signal generators',
    headline: ['Oscilloscopes', 'from the teaching lab to GHz debug.'],
    lede: 'Two-, four- and eight-channel digital and mixed-signal oscilloscopes, handheld scopes and the function generators that go with them, from Tektronix, UNI-T and Scientific. Demo units and application support come from our New Delhi team.',
    photoAlt: 'Digital oscilloscope on a laboratory bench',
    types: [
      { name: 'Benchtop oscilloscopes', text: 'Two- and four-channel digital storage oscilloscopes for R&D benches, service and teaching labs.', brands: ['tektronix', 'uni-t', 'scientific'], image: `${P}tektronix.jpg` },
      { name: 'Mixed-signal & logic analysis', text: 'Analog and digital channels together, with serial-bus decode for embedded, FPGA and power-integrity debug.', brands: ['tektronix'], image: `${I}tektronix-2-series-mso.jpg` },
      { name: 'Handheld oscilloscopes', text: 'Battery-powered scopes for field service, installation and maintenance work.', brands: [] },
      { name: 'Function & arbitrary generators', text: 'AFGs and function generators for stimulus, clocking and waveform replay during board bring-up.', brands: ['tektronix', 'uni-t', 'scientific'] },
    ],
    products: ['MSO 2 Series EDU Oscilloscope', '2 Series MSO Oscilloscope'],
    applications: ['app-signal-debug', 'app-high-bw', 'app-edu'],
  },
  {
    id: 'power', division: 'instruments', name: 'Power Supplies & Loads',
    menu: 'Programmable DC supplies, regenerative loads and grid simulation',
    headline: ['Power supplies & loads', 'to source, sink and simulate.'],
    lede: 'Programmable and bidirectional DC supplies, bench supplies, electronic and regenerative loads, and grid and AC sources for converter, battery, EV and solar test, from Elektro-Automatik, Tektronix, Keithley, UNI-T and Scientific.',
    photoAlt: 'Cylindrical battery cells',
    types: [
      { name: 'Programmable DC power supplies', text: 'High-power autoranging supplies for converter, battery and component test.', brands: ['elektro-automatik', 'tektronix', 'uni-t'], image: `${P}elektro-automatik.jpg` },
      { name: 'Bench & multi-channel supplies', text: 'Linear and multi-channel bench supplies for design, test and education.', brands: ['keithley', 'scientific', 'uni-t'], image: `${I}keithley-2230-dc-power-supply.jpg` },
      { name: 'Bidirectional source / sink', text: 'Two-quadrant instruments that source and sink power for battery cycling and charge/discharge profiles.', brands: ['elektro-automatik'] },
      { name: 'Electronic & regenerative loads', text: 'DC electronic loads, and regenerative loads that return absorbed energy to the mains for low-heat, high-power testing.', brands: ['elektro-automatik', 'tektronix', 'uni-t'] },
      { name: 'Grid simulators & AC sources', text: 'Grid and photovoltaic profile emulation for inverter and charger test.', brands: ['elektro-automatik'] },
      { name: 'Battery testers', text: 'Battery test instruments for cell and pack characterisation.', brands: ['tektronix'] },
    ],
    products: ['2220 / 2230 Multi-Channel DC Power Supply'],
    applications: ['app-ev-power'],
  },
  {
    id: 'rf', division: 'instruments', name: 'RF & Spectrum',
    menu: 'Spectrum, network, cable and antenna analyzers',
    headline: ['RF & spectrum analysis', 'from the bench to the tower.'],
    lede: 'Spectrum and vector network analyzers, cable and antenna analyzers, RF signal generators and field instruments for telecom, defence and RF component work, from Anritsu, UNI-T and Scientific.',
    photoAlt: 'Signal test instruments on a laboratory bench',
    types: [
      { name: 'Spectrum analyzers', text: 'Benchtop and handheld analyzers for interference hunting and signal characterisation.', brands: ['anritsu', 'uni-t', 'scientific'], image: `${P}anritsu.jpg` },
      { name: 'Vector network analyzers', text: 'S-parameter, component and material measurement.', brands: ['anritsu'] },
      { name: 'Cable & antenna analyzers', text: 'Site Master-class analyzers for feeder, tower and antenna commissioning.', brands: ['anritsu'] },
      { name: 'RF signal generators', text: 'Signal sources for receiver test and RF component characterisation.', brands: ['anritsu'] },
      { name: 'EMI / EMC test systems', text: 'Pre-compliance and compliance test set-ups for conducted and radiated emissions.', brands: [] },
    ],
    applications: ['app-rf-telecom'],
  },
  {
    id: 'production', division: 'instruments', name: 'Production Test',
    menu: 'LCR, hipot, transformer, cable-harness and motor testers',
    headline: ['Production test', 'for the end of the line.'],
    lede: 'LCR meters, hipot and electrical-safety testers, transformer, cable-harness and motor testers, and complete production test systems for transformer and wire-harness lines. Led by Microtest, with UNI-T and Scientific.',
    photoAlt: 'Power transformer and insulators',
    types: [
      { name: 'LCR meters & impedance analyzers', text: 'Benchtop and automated LCR meters for passive component and impedance measurement.', brands: ['microtest', 'uni-t'], image: `${P}microtest.jpg` },
      { name: 'Transformer & coil testers', text: 'Turns ratio, leakage inductance and winding test for magnetics production.', brands: ['microtest'], image: `${I}microtest-5465-transformer-analyzer.png` },
      { name: 'Cable & harness testers', text: 'Multi-pin cable, harness and USB-C / E-marker testers with hipot screening.', brands: ['microtest'], image: `${I}microtest-8761-cable-harness-tester.png` },
      { name: 'Hipot & electrical-safety testers', text: 'Withstand, insulation and safety tests for QA and compliance.', brands: ['microtest', 'uni-t', 'scientific'] },
      { name: 'Motor testing systems', text: 'Stator and rotor test for motor winding lines.', brands: ['microtest'] },
      { name: 'Production test systems', text: 'Complete test stations for transformer and wire-harness manufacturing.', brands: ['microtest'] },
    ],
    products: ['5465 Transformer Analyzer'],
    applications: ['app-transformer', 'app-cable-harness'],
  },
  {
    id: 'meters', division: 'instruments', name: 'Multimeters & Meters',
    menu: 'Bench, handheld, clamp and panel meters, and data loggers',
    headline: ['Multimeters & meters', 'for the bench, the panel and the field.'],
    lede: 'Precision and bench digital multimeters, handheld and clamp meters, panel meters, insulation testers and data loggers, from Tektronix, Keithley, UNI-T, Scientific, Rishabh and Krykard.',
    photoAlt: 'Electrician testing a panel with a multimeter',
    types: [
      { name: 'Precision & bench multimeters', text: 'High-resolution bench DMMs that also integrate into automated test stations.', brands: ['tektronix', 'keithley', 'uni-t', 'scientific'] },
      { name: 'Handheld & clamp meters', text: 'Digital multimeters, clamp meters and process meters for field and maintenance work.', brands: ['uni-t', 'rishabh', 'krykard'], image: `${P}uni-t.jpg` },
      { name: 'Panel meters', text: 'Analog and digital panel meters for switchboards and control panels.', brands: ['rishabh'] },
      { name: 'Insulation & electrical testers', text: 'Insulation, continuity and electrical testers for contractors and utilities.', brands: ['rishabh'] },
      { name: 'Data loggers', text: 'Multimeter, temperature and electrical data loggers for monitoring.', brands: ['krykard'] },
    ],
    applications: ['app-field-electrical'],
  },
  {
    id: 'smu', division: 'instruments', name: 'SMU & Power Analysis',
    menu: 'Source-measure units, parameter, power and power-quality analyzers',
    headline: ['Source-measure & power analysis', 'down to the picoamp.'],
    lede: 'Source measure units, semiconductor parameter analyzers, electrometers and low-current meters, and power, energy and power-quality analyzers, from Keithley, Tektronix, Microtest, Krykard and Rishabh.',
    photoAlt: 'Engineer working with test instruments in a lab',
    types: [
      { name: 'Source measure units (SMU)', text: 'Single and multi-channel SMUs that source and measure current and voltage for device characterisation.', brands: ['keithley', 'tektronix'], image: `${P}keithley.jpg` },
      { name: 'Semiconductor parameter analyzers', text: 'I-V and C-V characterisation with switching systems.', brands: ['keithley'] },
      { name: 'Electrometers & low-current meters', text: 'Electrometers, picoammeters and nanovoltmeters for leakage and low-level measurement.', brands: ['keithley'] },
      { name: 'Power analyzers', text: 'Power measurement for converters, motors and end-of-line test.', brands: ['microtest', 'rishabh'] },
      { name: 'Power quality & energy analyzers', text: 'Harmonics, sag and swell, flicker and energy-audit logging.', brands: ['krykard', 'rishabh'], image: `${P}krykard.jpg` },
    ],
    applications: ['app-smu-semi'],
  },

  // ------------------------------------------------------------------ components
  {
    id: 'mosfets', division: 'components', name: 'MOSFETs & SiC',
    menu: 'Trench, SGT, super-junction, SiC and GaN switches',
    headline: ['MOSFETs & SiC', 'for every stage of the power path.'],
    lede: 'Low-voltage trench and SGT, high-voltage super-junction (Cool MOS) and silicon-carbide MOSFETs, and GaN devices, for SMPS, chargers, motor drives, solar and EV power.',
    photoAlt: 'Power supply board with power semiconductors and magnetics',
    types: [
      { name: 'Trench & SGT MOSFETs', text: '20–200 V trench and shielded-gate MOSFETs for synchronous rectification and efficient switching.', brands: ['donghai-wxdh', 'mot-inmark', 'jilin-sino'] },
      { name: 'High-voltage & super-junction MOSFETs', text: '500–900 V Cool MOS and high-voltage MOSFETs for the primary switch in SMPS, adapters and chargers.', brands: ['reasunos', 'donghai-wxdh', 'mot-inmark', 'jilin-sino'] },
      { name: 'SiC MOSFETs', text: '650–1200 V silicon-carbide MOSFETs for high-frequency, high-efficiency conversion.', brands: ['donghai-wxdh', 'reasunos', 'shikues'] },
      { name: 'GaN devices', text: '650 V gallium-nitride switches for compact fast chargers and high-frequency power.', brands: ['shikues', 'jilin-sino'] },
      { name: 'General-purpose MOSFETs', text: 'MOSFETs for BLDC drives, appliances and general switching.', brands: ['cdil', 'shikues'] },
    ],
    applications: ['app-smps', 'app-gan-charger', 'app-solar', 'app-ev-ac-charger'],
    model: 'to247',
  },
  {
    id: 'transistors', division: 'components', name: 'IGBTs & Transistors',
    menu: 'IGBTs, IGBT and power modules, power transistors',
    headline: ['IGBTs, modules & transistors', 'for drives and high-power switching.'],
    lede: 'Trench IGBTs, IGBT and intelligent power modules, power and small-signal transistors and SCRs for motor drives, inverters, appliances and industrial power.',
    photoAlt: 'Industrial electric motor',
    types: [
      { name: 'IGBTs', text: 'Trench and field-stop IGBTs from 360 to 1350 V for motor drives and high-power switching.', brands: ['donghai-wxdh', 'jilin-sino', 'shikues'] },
      { name: 'IGBT & power modules', text: 'IGBT modules, intelligent power modules with built-in protection, and power modules.', brands: ['donghai-wxdh', 'jilin-sino', 'cdil'] },
      { name: 'Power transistors', text: 'Bipolar power transistors for linear and switching stages.', brands: ['donghai-wxdh', 'jilin-sino'] },
      { name: 'Small-signal transistors & SCRs', text: 'General-purpose bipolar transistors, SCRs and switching devices.', brands: ['jilin-sino', 'cdil'] },
    ],
    applications: ['app-bldc', 'app-solar', 'app-ev-2w'],
    model: 'to220',
  },
  {
    id: 'diodes', division: 'components', name: 'Diodes & Rectifiers',
    menu: 'Bridges, Schottky, fast-recovery and SiC diodes',
    headline: ['Diodes & rectifiers', 'from the mains input to the output stage.'],
    lede: 'SMD and DIP bridge rectifiers, Schottky, fast-recovery and power diodes, SiC Schottky diodes and small-signal diodes for input, boost and output stages.',
    photoAlt: 'Circuit board with capacitors, inductors and connectors',
    types: [
      { name: 'Bridge rectifiers', text: 'SMD and DIP bridges, including low-VF bridges for compact, efficient input stages.', brands: ['asemi'] },
      { name: 'Schottky diodes', text: 'SMD and power Schottky diodes for low-loss rectification.', brands: ['asemi', 'jilin-sino'] },
      { name: 'Fast-recovery & power diodes', text: 'Fast-recovery diodes, rectifiers and TO-packaged power diodes.', brands: ['asemi', 'jilin-sino', 'mot-inmark'] },
      { name: 'SiC Schottky diodes', text: '650–1200 V silicon-carbide diodes for PFC and boost stages.', brands: ['shikues', 'mot-inmark', 'jilin-sino'] },
      { name: 'Small-signal & Zener diodes', text: 'SOT-23 and SOD small-signal, switching and Zener diodes.', brands: ['asemi', 'jilin-sino', 'cdil'] },
    ],
    applications: ['app-led-driver', 'app-smps', 'app-gan-charger'],
    model: 'sot23',
  },
  {
    id: 'protection', division: 'components', name: 'Circuit Protection',
    menu: 'TVS, varistors, surge parts and EV & solar fuses',
    headline: ['Circuit protection', 'against surges, faults and overloads.'],
    lede: 'TVS diodes and ESD arrays, metal-oxide and zinc-oxide varistors, surge and over-voltage parts, and EV, solar and low-voltage fuses for mains, DC-string and battery protection.',
    photoAlt: 'Electricity meters on a building wall',
    types: [
      { name: 'TVS diodes & ESD arrays', text: 'Transient-voltage suppressors for data lines, supply rails and automotive inputs.', brands: ['jilin-sino', 'reasunos', 'cdil', 'asemi'] },
      { name: 'Varistors (MOV / ZOV)', text: 'Metal-oxide and zinc-oxide varistors such as 7D561 and 7D621, across clamping voltages and energy ratings.', brands: ['surging'] },
      { name: 'Surge & over-voltage protection', text: 'Parts for mains, DC-string and outdoor surge protection.', brands: ['surging'] },
      { name: 'EV fuses', text: 'High-current DC fuses for battery, powertrain and on-board charger protection.', brands: ['adler'] },
      { name: 'PV & low-voltage block fuses', text: 'String and array fuses for solar, and NH and block fuses for distribution.', brands: ['adler'] },
      { name: 'EV charging protection', text: 'Protection components for AC and DC charging equipment.', brands: ['adler'] },
    ],
    applications: ['app-smart-meter', 'app-ev-ac-charger', 'app-solar'],
  },
  {
    id: 'passives', division: 'components', name: 'Passives',
    menu: 'MLCCs, chip resistors and capacitors',
    headline: ['Passive components', 'for high-volume SMD assembly.'],
    lede: 'Multilayer ceramic capacitors, thick-film chip resistors, electrolytic and film capacitors and other SMD passives in standard case sizes, from MLCC Base.',
    photoAlt: 'Close-up of a printed circuit board',
    types: [
      { name: 'MLCC capacitors', text: 'Multilayer ceramic capacitors across standard case sizes, dielectrics and voltage ratings.', brands: ['mlcc-base'] },
      { name: 'Chip resistors', text: 'Thick-film SMD resistors for general-purpose and high-volume use.', brands: ['mlcc-base'] },
      { name: 'Electrolytic & film capacitors', text: 'Bulk and film capacitors for power input and filtering.', brands: ['mlcc-base'] },
      { name: 'Other SMD passives', text: 'Further passive parts for surface-mount assembly.', brands: ['mlcc-base'] },
    ],
    applications: ['app-led-driver', 'app-smart-meter', 'app-smps'],
  },
  {
    id: 'ics', division: 'components', name: 'Power ICs & Drivers',
    menu: 'GaN ICs, PWM controllers, BLDC and LED drivers',
    headline: ['Power ICs & drivers', 'to complete the design.'],
    lede: 'GaN power ICs, PWM controllers, gate drivers, power-boosting ICs, BLDC motor drivers and LED driver and lighting ICs, with complete BLDC solutions and SKD / CKD kits.',
    photoAlt: 'Integrated circuits on a circuit board',
    types: [
      { name: 'GaN power ICs', text: 'Integrated GaN power stages for compact USB-PD chargers.', brands: ['shikues'] },
      { name: 'PWM controllers', text: 'PWM controllers for flyback, forward and PFC converters.', brands: ['shikues'] },
      { name: 'Gate drivers & control ICs', text: 'Gate-driver and intelligent control ICs to complete the power stage.', brands: ['donghai-wxdh'] },
      { name: 'Power-boosting ICs', text: 'Boost ICs for power and lighting designs.', brands: ['reasunos'] },
      { name: 'BLDC motor drivers', text: 'Motor-driver devices and complete BLDC solutions for fans, pumps and appliances.', brands: ['cdil'], others: ['Grande Micro'] },
      { name: 'LED drivers & lighting ICs', text: 'LED driver and lighting ICs, and complete lighting solutions.', brands: [], others: ['Westech International', 'Grande Micro'] },
      { name: 'SKD & CKD kits', text: 'Semi- and completely-knocked-down kits for local assembly.', brands: [], others: ['Grande Micro'] },
    ],
    applications: ['app-gan-charger', 'app-bldc', 'app-led-driver', 'app-appliance'],
    model: 'qfn',
  },
];

export const categoriesOf = (division: Category['division']) => categories.filter((c) => c.division === division);
export const categoryByRoute = (route: string) => categories.find((c) => categoryRoute(c) === route);
/** The brands a category draws on, in order of first mention. */
export const categoryBrands = (c: Category) => [...new Set(c.types.flatMap((t) => t.brands))];
