// SQLite connection (better-sqlite3) + idempotent migration on boot.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('./config');

const dbPath = path.isAbsolute(config.dbFile)
  ? config.dbFile
  : path.join(__dirname, config.dbFile);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply schema (CREATE TABLE IF NOT EXISTS ...).
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Seed default shipping zones once, so the store works out of the box.
const zoneCount = db.prepare('SELECT COUNT(*) AS n FROM shipping_zones').get().n;
if (zoneCount === 0) {
  const insertZone = db.prepare(
    `INSERT INTO shipping_zones (name, pincode_prefixes, flat_rate, free_above, is_default)
     VALUES (@name, @pincode_prefixes, @flat_rate, @free_above, @is_default)`
  );
  // Sensible India defaults — the user edits these in the admin panel.
  insertZone.run({ name: 'Delhi NCR (local)', pincode_prefixes: '11,12,201,121,122', flat_rate: 60, free_above: 2000, is_default: 0 });
  insertZone.run({ name: 'North India',       pincode_prefixes: '1,2,3',             flat_rate: 90, free_above: 3000, is_default: 0 });
  insertZone.run({ name: 'West & Central',    pincode_prefixes: '36,37,38,39,4',     flat_rate: 110, free_above: 3000, is_default: 0 });
  insertZone.run({ name: 'South India',       pincode_prefixes: '5,6',               flat_rate: 120, free_above: 3500, is_default: 0 });
  insertZone.run({ name: 'East & North-East', pincode_prefixes: '7,8',               flat_rate: 140, free_above: 4000, is_default: 0 });
  insertZone.run({ name: 'Rest of India',     pincode_prefixes: '',                  flat_rate: 150, free_above: 5000, is_default: 1 });
}

module.exports = db;
