// Seeds a few demo products so the store has something to show. Safe to run repeatedly
// (skips products whose SKU already exists). Usage: node seed.js
const db = require('./db');
const store = require('./lib/store');

const demo = [
  {
    sku: 'IRFZ44N', slug: 'irfz44n-mosfet', name: 'IRFZ44N N-Channel MOSFET',
    brand: 'CDIL', category: 'MOSFET', weight_g: 3, stock: 5000,
    short_desc: '55V 49A TO-220 logic-level N-channel MOSFET — a workhorse for switching & motor control.',
    long_desc: 'The IRFZ44N is a 55V, 49A N-channel power MOSFET in a TO-220 package with low on-resistance (17.5 mΩ). Ideal for DC motor drivers, switching supplies, and hobby power switching. Sold as loose pieces — buy one or a reel.',
    tiers: [{ min_qty: 1, unit_price: 28 }, { min_qty: 10, unit_price: 22 }, { min_qty: 50, unit_price: 17 }, { min_qty: 200, unit_price: 13.5 }],
  },
  {
    sku: 'MLCC-104-0805', slug: 'mlcc-100nf-0805', name: '100nF 0805 MLCC Capacitor (X7R)',
    brand: 'MLCC Base', category: 'MLCC', weight_g: 1, stock: 50000,
    short_desc: '0.1µF 50V X7R 0805 multilayer ceramic capacitor — the classic decoupling cap.',
    long_desc: '100nF (0.1µF) 50V X7R ±10% multilayer ceramic capacitor in 0805. The default supply-decoupling capacitor for nearly every IC. Buy a handful for a prototype or a full reel for production.',
    tiers: [{ min_qty: 1, unit_price: 1.2 }, { min_qty: 100, unit_price: 0.7 }, { min_qty: 1000, unit_price: 0.42 }, { min_qty: 5000, unit_price: 0.28 }],
  },
  {
    sku: 'SS34-SMA', slug: 'ss34-schottky-diode', name: 'SS34 Schottky Diode (SMA)',
    brand: 'ASEMI', category: 'Diode', weight_g: 1, stock: 20000,
    short_desc: '40V 3A surface-mount Schottky rectifier in SMA (DO-214AC).',
    long_desc: 'SS34 40V 3A Schottky barrier rectifier with low forward voltage drop, in the SMA / DO-214AC package. Common in buck converters, reverse-polarity protection, and freewheeling. Spot quantities welcome.',
    tiers: [{ min_qty: 1, unit_price: 3.5 }, { min_qty: 50, unit_price: 2.4 }, { min_qty: 500, unit_price: 1.6 }, { min_qty: 2000, unit_price: 1.15 }],
  },
  {
    sku: 'TVS-SMBJ5.0A', slug: 'smbj5-0a-tvs', name: 'SMBJ5.0A TVS Diode',
    brand: 'MOT Inmark', category: 'TVS / Protection', weight_g: 1, stock: 8000,
    short_desc: '5V 600W unidirectional TVS diode (SMB) for ESD / surge protection.',
    long_desc: 'SMBJ5.0A 600W peak-pulse unidirectional transient voltage suppressor in SMB. Protects 5V rails and data lines from ESD and surges. Buy a few for a board bring-up or in volume for production.',
    tiers: [{ min_qty: 1, unit_price: 6 }, { min_qty: 25, unit_price: 4.5 }, { min_qty: 250, unit_price: 3.1 }, { min_qty: 1000, unit_price: 2.2 }],
  },
];

const insert = db.prepare(`
  INSERT INTO products (sku, slug, name, brand, category, short_desc, long_desc, stock, weight_g, status)
  VALUES (@sku, @slug, @name, @brand, @category, @short_desc, @long_desc, @stock, @weight_g, 'active')`);

let added = 0;
for (const d of demo) {
  const exists = db.prepare('SELECT id FROM products WHERE sku = ?').get(d.sku);
  if (exists) { console.log(`skip ${d.sku} (exists)`); continue; }
  const info = insert.run(d);
  store.replaceTiers(info.lastInsertRowid, d.tiers);
  added++;
  console.log(`added ${d.sku}`);
}
console.log(`\nDone. ${added} product(s) added.`);
