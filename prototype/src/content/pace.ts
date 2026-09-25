// PACE (paceworldwide.com), added in the redesign: PACE lists Silicom Electronics Pvt. Ltd.,
// New Delhi, as its National Distributor for India (paceworldwide.com/reps-distributors, Asia).
// Company facts from paceworldwide.com/company-history; products from its catalogue pages.
// Photos: image-source/pace (see image-source/SOURCES.md). Same shapes as the extracted brands.
import type { Brand, BrandCard, Tile } from './index';

const photo = (name: string, alt: string) => ({ src: `/images/products/pace-${name}.webp`, alt });
const logo = { src: '/images/brands/pace.webp', alt: 'PACE logo' };

export const paceBrand: Brand = {
  slug: 'pace', name: 'PACE', cat: 'instruments', catLabel: 'Soldering & Rework', origin: 'USA',
  breadcrumb: [{ label: 'Home', href: 'index.html' }, { label: 'Brands', href: 'brands.html' }, { label: 'PACE', href: null }],
  hero: {
    badge: 'SOLDERING & REWORK',
    tag: 'PACE national distributor for India',
    title: [{ text: 'PACE', accent: true }, { text: ' distributor in India — soldering, rework & fume extraction. ', accent: false }],
    lede: 'Soldering stations, desoldering and rework systems, BGA and hot-air rework, and fume extraction from PACE, USA. Silicom Electronics is PACE’s authorised national distributor for India, with demonstrations, pricing and support from New Delhi.',
    actions: [
      { label: 'Get the best PACE price', href: 'contact.html?brand=pace', primary: true },
      { label: 'Email a BOM / enquiry', href: 'mailto:info@silicomindia.com' },
    ],
    note: null,
    image: photo('ads200-large', 'PACE ADS200 PLUS AccuDrive soldering station with TD-200 iron'),
    chips: ['Soldering Stations', 'Desoldering & Rework', 'BGA Rework', 'Hot Air & IR', 'Fume Extraction'],
  },
  heroImage: photo('ads200-large', 'PACE ADS200 PLUS AccuDrive soldering station with TD-200 iron'),
  logo,
  glance: {
    eyebrow: 'At a glance',
    rows: [['Category', 'Soldering & Rework'], ['Origin', 'USA (Vass, North Carolina)'], ['India distributor', 'Silicom Electronics (national distributor)']],
  },
  about: {
    eyebrow: 'About PACE', heading: 'Soldering, rework and repair, since 1958.', text: '', actions: [],
    paragraphs: [
      'PACE is a recognised world leader in solutions for the assembly and repair of advanced electronics. It introduced training programmes for the repair of printed wire assemblies in 1958, and soon after created the first self-contained vacuum desoldering system.',
      'Today PACE makes soldering stations, desoldering and rework systems, BGA and hot-air rework stations, handpieces and fume extraction systems for work to ISO 9000, industrial and military specifications. Silicom Electronics is PACE’s national distributor for India.',
    ],
  },
  range: {
    eyebrow: 'Product range', heading: 'The PACE portfolio we supply in India.',
    text: 'Tell us your process, board or model numbers — we will match the right PACE system and quote the best price.', actions: [],
    rows: [
      ['Soldering stations', 'ADS200 PLUS AccuDrive production stations and ST35 SensaTemp stations, with TD-200 and PS-90 irons and tips.'],
      ['Desoldering & rework systems', 'MBT360 and MBT450 multi-channel systems, ST125 SensaTemp rework stations and PRC 2000 repair centres.'],
      ['BGA rework', 'IR3100 and IR4100 infrared stations and TF 1800 and TF 2800 systems for BGA and SMD rework.'],
      ['Hot air & IR', 'ST 325 hot-air reflow system, ST 400 and ST1600 IR pre-heaters and ThermoJet hot-air handpieces.'],
      ['Fume extraction', 'Arm-Evac fume extractors with ESD-safe flex arms, filters and fume collection.'],
    ],
  },
  applications: {
    eyebrow: 'Applications', heading: 'Where engineers in India use PACE.',
    chips: ['EMS production lines', 'PCB rework & repair', 'BGA & SMD rework', 'Military-spec repair', 'Training benches', 'Operator fume safety'],
  },
  why: {
    eyebrow: 'Why source PACE from Silicom', heading: 'PACE’s national distributor — not just a reseller.', text: '', actions: [],
    items: [
      { icon: '₹', title: 'Best prices in India', text: 'Authorised sourcing means fewer hands in the chain and sharper PACE pricing for your line or tender.' },
      { icon: '✓', title: 'Genuine systems & spares', text: 'Authentic PACE stations, handpieces, tips, nozzles and filters through PACE’s official channel.' },
      { icon: '⚙', title: 'Demos & application help', text: 'Product demonstrations and process guidance from a team working with PACE every day.' },
      { icon: '★', title: 'Trusted since 1994', text: 'An ISO 9001:2015 and GeM-assessed distributor with three decades in Indian electronics supply.' },
      { icon: '⇄', title: 'Pan-India delivery', text: 'Dispatch from New Delhi to every state, with support for GeM and institutional procurement.' },
      { icon: '↻', title: 'One-window sourcing', text: 'Combine PACE with the wider Silicom line card to consolidate your instrument and component buy.' },
    ],
  },
  faq: {
    eyebrow: 'PACE in India — FAQ', heading: 'Questions buyers ask about PACE.', text: '', actions: [],
    items: [
      { q: 'Who is the authorised PACE distributor in India?', a: 'Silicom Electronics Pvt. Ltd., New Delhi, is listed by PACE as its national distributor for India. We supply PACE soldering, rework and fume extraction systems pan-India with genuine products, support and competitive pricing.' },
      { q: 'What is the price of PACE soldering stations in India?', a: 'Pricing depends on the station, handpieces, tips and quantity. Send us the PACE model numbers or your application and we will share a current quotation.' },
      { q: 'Can Silicom supply PACE tips, nozzles and spare parts?', a: 'Yes. We supply PACE soldering and desoldering tips, hot-air and BGA nozzles, fume extraction filters and spare parts alongside the systems.' },
      { q: 'Which tips fit the PACE TD-200 AccuDrive iron?', a: 'The TD-200 takes PACE Blue Series tip-heater cartridges: standard tips (part numbers 1130-xxxx-P1) and Ultra Performance tips (1131-xxxx-P1) in conical, chisel, bevel, blade and removal shapes. They fit only the TD-200 iron and the ADS200 PLUS station. Tell us your joint or the part number and we will quote.' },
      { q: 'How do I buy PACE equipment in India?', a: 'Contact Silicom Electronics with the PACE models or your process. We will confirm availability, pricing and lead time, arrange a demonstration where needed and deliver anywhere in India. GeM and institutional procurement are supported.' },
    ],
  },
  cta: {
    eyebrow: 'Get a quote', heading: 'Looking for PACE soldering and rework equipment in India?',
    text: 'Send your PACE model numbers or describe your process. Silicom Electronics will reply with the right system, pricing and lead time.',
    chips: [], actions: [{ label: 'Talk to Silicom', href: 'contact.html?brand=pace', primary: true }, { label: 'View all brand partners', href: 'brands.html' }],
  },
  related: {
    eyebrow: 'Related instrument brands',
    items: [
      { slug: 'microtest', name: 'Microtest', label: 'Production Test' },
      { slug: 'tektronix', name: 'Tektronix', label: 'Test & Measurement' },
      { slug: 'uni-t', name: 'UNI-T', label: 'Test & Measurement' },
      { slug: 'scientific', name: 'Scientific', label: 'Test & Measurement (India)' },
    ],
  },
};

export const paceTile: Tile = {
  slug: 'pace', cat: 'instruments', linkLabel: 'View PACE', image: photo('ads200', 'PACE soldering station'), logo,
  name: 'PACE', catLabel: 'Instruments',
  description: 'Soldering stations, desoldering and rework, BGA and hot-air rework, and fume extraction. Silicom is PACE’s national distributor for India.',
  chips: ['Soldering', 'Rework', 'BGA', 'Fume Extraction'], viewLabel: 'View brand',
};

export const paceCard: BrandCard = {
  slug: 'pace', logo, title: 'PACE', meta: 'Soldering · rework · BGA · fume extraction',
  categories: [
    { label: 'Soldering Stations', href: 'contact.html?brand=pace&cat=soldering' },
    { label: 'Desoldering & Rework Systems', href: 'contact.html?brand=pace&cat=rework' },
    { label: 'BGA Rework Systems', href: 'contact.html?brand=pace&cat=bga' },
    { label: 'Hot Air & IR Rework', href: 'contact.html?brand=pace&cat=hot-air' },
    { label: 'Fume Extraction', href: 'contact.html?brand=pace&cat=fume-extraction' },
  ],
  note: 'National distributor for India · demos available',
  links: [{ label: 'View brand page', href: 'brand-pace.html' }, { label: 'Request demo', href: 'contact.html?brand=pace' }],
};

/** PACE part numbers for the 16 tips in the Blue Series lineup model (src/pace-models.json), in
 *  lineup order. Names follow PACE's *TD-200 Blue Series Tip Chart*; 1131- parts are its Ultra
 *  Performance cartridges. PACE does not label the lineup photo the model was built from, so each
 *  tip was matched to the chart by shape and size: `checked: false` marks a closest fit that
 *  should be confirmed with PACE. */
export const paceTipParts: { sku: string; name: string; checked: boolean }[] = [
  { sku: '1131-0052-P1', name: '1/16" Chisel (1.59mm), Ultra Performance', checked: false },
  { sku: '1130-0027-P1', name: '3/128" Conical Sharp (0.58mm)', checked: true },
  { sku: '1130-0020-P1', name: '1/8" 90° Chisel (3.18mm)', checked: true },
  { sku: '1130-0004-P1', name: '1/64" Conical Sharp Extended (0.40mm)', checked: true },
  { sku: '1130-0019-P1', name: '1/16" 30° Chisel (1.59mm)', checked: true },
  { sku: '1130-0032-P1', name: 'MiniWave® SMT Installation (3.05mm)', checked: false },
  { sku: '1130-0026-P1', name: '1/16" 30° Bent Chisel (1.59mm)', checked: false },
  { sku: '1130-0002-P1', name: '1/64" Conical Sharp (0.40mm)', checked: false },
  { sku: '1130-0003-P1', name: '1/64" Conical Sharp Bent 30° (0.40mm)', checked: true },
  { sku: '1130-0001-P1', name: '1/32" Conical Sharp Extended (0.80mm)', checked: true },
  { sku: '1130-0023-P1', name: '1/8" 90° Chisel Extended (3.20mm)', checked: false },
  { sku: '1130-0049-P1', name: 'MiniWave® SMT Installation, Special', checked: false },
  { sku: '1130-0018-P1', name: '1/32" Conical Sharp Extended (0.80mm)', checked: false },
  { sku: '1130-0034-P1', name: 'Single Sided Chisel (3.05mm)', checked: true },
  { sku: '1130-0013-P1', name: '3/32" 30° Chisel (2.38mm)', checked: true },
  { sku: '1131-0053-P1', name: '1/8" Chisel (3.18mm), Ultra Performance', checked: false },
];

/** Search metadata for brand-pace.html. */
export const paceMeta = {
  title: 'PACE Distributor in India | Soldering & Rework Stations — Silicom Electronics',
  description: 'Authorised PACE national distributor in India. PACE soldering stations, desoldering and rework systems, BGA rework and fume extraction, with demos and support from Silicom Electronics, New Delhi.',
};
