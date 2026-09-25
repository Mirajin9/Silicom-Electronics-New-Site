// The ADLER page (/electronic-components/adler.html, the URL the current silicomindia.com
// page ranks on) and the ADLER promotions on the Components, Circuit Protection and
// Applications pages. Facts come from ADLER's PV (2024-11) and EV (2023-10) catalogues and
// adlerelectric.com; the stock range from ADLER MARKETING PLAN MASTER/data/product_master.csv.
// Prices are deliberately not published.

export const ADLER_ROUTE = 'electronic-components/adler';
export const ADLER_PATH = `/${ADLER_ROUTE}.html`;
export const ADLER_URL = `https://www.silicomindia.com${ADLER_PATH}`;
const img = (name: string) => `/images/products/adler-${name}.webp`;

export type StockItem = {
  part: string; series: string; name: string; image: string;
  specs: [string, string][];
  holder?: string; note?: string;
};

/** Silicom's ADLER stock range. */
export const stock: StockItem[] = [
  { part: 'A852300b00', series: 'A85', name: 'gPV fuse link, 30 A, 1500 Vdc', image: img('a85'),
    specs: [['Size', '10 × 85 mm'], ['Body', 'Glass-fibre'], ['Breaking capacity', '30 kA'], ['Use', 'PV strings, combiner boxes']],
    holder: 'BH300-1', note: 'Also 4, 5, 20, 25 and 32 A to order.' },
  { part: 'A652500b00', series: 'A65', name: 'gPV fuse link, 50 A, 1500 Vdc', image: img('a65'),
    specs: [['Size', '14 × 85 mm'], ['Body', 'Ceramic'], ['Breaking capacity', '50 kA'], ['Use', 'High-power PV strings']],
    holder: 'BH300-1' },
  { part: 'A942600b00 · A942650b00', series: 'A94', name: 'gPV fuse links, 60 A and 65 A, 1500 Vdc', image: img('a94'),
    specs: [['Size', '22 × 58 mm'], ['Type', 'Cartridge'], ['Breaking capacity', '50 kA'], ['Use', 'Array and inverter inputs']],
    holder: 'BH400', note: 'A94 40 A to order.' },
  { part: 'A832300710', series: 'A83', name: 'gPV fuse link, 30 A, 1100 Vdc', image: img('a83'),
    specs: [['Size', '10.3 × 38 mm'], ['Type', 'Cylindrical'], ['Breaking capacity', '30 kA'], ['Use', 'String and battery protection']] },
  { part: 'BH300-1', series: 'BH300', name: 'Fuse holder, 1500 Vdc, up to 50 A', image: img('bh300'),
    specs: [['Takes', '10 × 85 and 14 × 85 mm links'], ['Mounting', 'DIN rail, 1-pole'], ['Safety', 'Touch-safe'], ['Short-circuit rating', '50 kA']] },
  { part: 'BH400', series: 'BH400', name: 'Fuse holder, 1500 Vdc, up to 80 A', image: img('bh400'),
    specs: [['Takes', '22 × 58 mm links'], ['Mounting', 'DIN rail, 1-pole'], ['Safety', 'Touch-safe'], ['Indicator', 'BH401 version']] },
];

/** Short labels for promotions elsewhere on the site. */
export const stockChips = ['A85 30 A · 1500 V', 'A65 50 A · 1500 V', 'A94 60 / 65 A · 1500 V', 'A83 30 A · 1100 V', 'BH300-1 holder', 'BH400 holder'];

export type RangeSection = {
  id: string; eyebrow: string; heading: string; text: string; photo: string; photoAlt: string;
  families: { name: string; text: string; image?: string }[];
  applications: { label: string; href: string }[];
};

/** ADLER's fuse links and fuse holders, by market. */
export const ranges: RangeSection[] = [
  {
    id: 'solar', eyebrow: 'Solar · photovoltaic', heading: 'PV fuse links and fuse holders, up to 2000 Vdc.',
    text: 'gPV fuse links protect PV strings, combiner boxes and inverter inputs against reverse and fault currents. ADLER’s gPV links carry IEC 60269-6 and UL 248-19 approvals and range from 1 A string fuses to 400 A NH fuses.',
    photo: '/images/adler/range-pv-fuses.webp', photoAlt: 'ADLER photovoltaic fuse links and NH fuses',
    families: [
      { name: 'Cylindrical gPV fuse links', text: 'Sizes from 10 × 38 to 22 × 85 mm, rated 1000 to 2000 Vdc, with cartridge, bolt-tag and PCB terminals.', image: img('a85') },
      { name: 'NH gPV fuses', text: 'NH-type blade fuses for large combiner boxes and central inverters.' },
      { name: 'Fuse holders', text: 'BH100 to BH600 touch-safe DIN-rail holders, with indicator versions, for every link size.', image: img('bh300') },
      { name: 'Terminal blocks and busbars', text: 'BHT terminal blocks and BHB busbars to build complete string protection.' },
      { name: 'Surge protection', text: 'ASPD PV surge protection devices for 1000 and 1500 Vdc.' },
    ],
    applications: [{ label: 'Solar string inverter', href: '/applications.html#app-solar' }],
  },
  {
    id: 'automotive', eyebrow: 'Automotive · EV · charging', heading: 'EV and automotive fuses, made under IATF 16949.',
    text: 'High-speed DC fuses for battery packs, powertrains, on-board chargers, DC-DC converters and charging equipment, rated from 200 Vdc to 1500 Vdc.',
    photo: '/images/adler/range-ev-fuses.webp', photoAlt: 'ADLER EV and automotive fuses',
    families: [
      { name: 'EV main fuses', text: 'Automotive-grade main fuses for EV battery and powertrain protection, up to 1000 Vdc.', image: img('ev-bolt-down') },
      { name: 'EV auxiliary fuses', text: 'Compact fuses for auxiliary circuits at 500 Vdc and 800 Vdc, up to 50 A.' },
      { name: 'Mini and MIDI blade fuses', text: 'Automotive blade fuses to ISO 8820-3, colour coded by rating.', image: img('ev-mini-blade') },
      { name: 'EVSE charger fuses', text: 'AT-series fuses for AC and DC charging stations.', image: img('evse-at1') },
      { name: 'Bolt-down fuses and EV fuse holders', text: 'Bolt-down fuses, BFR and BHR EV fuse holders and mounts.', image: img('ev-bfr-holder') },
    ],
    applications: [
      { label: 'EV AC charger', href: '/applications.html#app-ev-ac-charger' },
      { label: 'EV 2W / 3W charger', href: '/applications.html#app-ev-2w' },
    ],
  },
];

export const credentials = [
  { title: 'IATF 16949', text: 'ADLER manufactures its fuses under an IATF 16949 quality system, the automotive industry’s standard, for both its EV and solar ranges.' },
  { title: 'ISO 9001:2015', text: 'Certified quality management across ADLER’s engineering, manufacturing and testing.' },
  { title: 'UL, IEC and TÜV', text: 'PV fuse links are approved to UL 248-19 and IEC 60269-6, blade fuses meet ISO 8820-3, and ranges carry TÜV marks. ADLER reports being the first to receive UL certification for 2000 Vdc fuses. Each datasheet lists the exact approvals.' },
  { title: 'German engineering', text: 'Headquartered in Leipzig with engineering in Regensburg; manufacturing and testing in Dongguan and Xi’an, China.' },
];

/** The current silicomindia.com ADLER page's copy, updated: ADLER makes fuses, not MOVs. */
export const seoCopy = {
  intro: [
    'ADLER’s expertise in manufacturing EV fuses and solar PV fuses places it at the forefront of protection for the electric-vehicle market and other critical DC applications. Its focus on superior protection and reliability is crucial for advancing safe electrical environments.',
    'By integrating cutting-edge techniques in its manufacturing process, ADLER delivers reliable, defect-free components that meet the demands of modern electronics applications.',
  ],
  distributor: [
    'Silicom Electronics Pvt. Ltd. is ADLER’s authorised distributor in India and a leading electronic components distributor, focused on imported products for the electronics manufacturing industry. A wide range of premium parts is in demand from our clients for manufacturing electronic products.',
    'We supply ADLER EV fuses, solar PV fuse links and fuse holders that are rigorously tested and certified for high performance, and hold stock in New Delhi for prototypes and production. Silicom is the preferred choice of thousands of clients for authentic components at competitive prices.',
  ],
  about: 'For three decades, Silicom Electronics Pvt. Ltd. has been a top electronic components distributor, supplying good-quality semiconductors, integrated circuits, sensors, connectors and protection devices to manufacturers, designers and engineers building electronic products.',
};

/** Questions added to the original ADLER page's FAQ. */
export const moreFaq = [
  { q: 'Is Silicom Electronics an authorised distributor of ADLER fuses?', a: 'Yes. Silicom Electronics Pvt. Ltd. is ADLER’s authorised distributor in India for ADLER fuses and accessories, supplying genuine ADLER parts with technical support from New Delhi.' },
  { q: 'Which ADLER fuses and fuse holders are in stock?', a: 'Silicom stocks the A85 30 A and A65 50 A 1500 Vdc fuse links, the A94 60 A and 65 A 1500 Vdc fuse links, the A83 30 A 1100 Vdc fuse link, and the BH300-1 and BH400 fuse holders. Other ratings and series are supplied to order.' },
  { q: 'Can you supply ADLER fuse holders and fuse links together?', a: 'Yes. We match every fuse link with its holder: A85 and A65 links fit the BH300-1 holder, and A94 links fit the BH400 holder. Send us your string current and voltage and we will recommend the set.' },
  { q: 'Are ADLER fuses IATF 16949 certified?', a: 'ADLER manufactures its EV and solar fuses under an IATF 16949 quality system and is ISO 9001:2015 certified. Individual ranges also carry UL 248-19, IEC 60269-6, ISO 8820-3 and TÜV approvals; the datasheet for each part lists them.' },
  { q: 'Where is ADLER from?', a: 'ADLER Elektrotechnik is headquartered in Leipzig, Germany, with engineering in Regensburg and manufacturing and testing in Dongguan and Xi’an, China.' },
];

/** Semiconductor partners to pair with ADLER protection. */
export const pairWith = [
  { slug: 'jilin-sino', name: 'Jilin Sino', text: 'Reliable Schottky and fast-recovery diodes, transistors and power transistors, plus MOSFETs, IGBTs and TVS.' },
  { slug: 'shikues', name: 'Shikues', text: 'High-quality SiC diodes, MOSFETs and IGBTs for power conversion, plus GaN power ICs and PWM controllers.' },
];
