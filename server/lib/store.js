// Data-access helpers shared by the public API, admin panel, and checkout.
const db = require('../db');

const tiersStmt = db.prepare('SELECT min_qty, unit_price FROM product_tiers WHERE product_id = ? ORDER BY min_qty');

function tiersFor(productId) {
  return tiersStmt.all(productId);
}

function attachTiers(product) {
  if (!product) return null;
  return { ...product, tiers: tiersFor(product.id), images: safeJson(product.images_json, []) };
}

// Single product by id, with tiers. Returns { product, tiers } for pricing, or null.
const productByIdStmt = db.prepare('SELECT * FROM products WHERE id = ?');
function getProductForPricing(id) {
  const product = productByIdStmt.get(id);
  if (!product) return null;
  return { product, tiers: tiersFor(id) };
}

const productBySlugStmt = db.prepare('SELECT * FROM products WHERE slug = ?');
function getProductBySlug(slug) {
  return attachTiers(productBySlugStmt.get(slug));
}

function getProductById(id) {
  return attachTiers(productByIdStmt.get(id));
}

// Public catalog (active only). Admin listing uses listAllProducts.
const activeProductsStmt = db.prepare(`SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC`);
function listActiveProducts() {
  return activeProductsStmt.all().map(attachTiers);
}

const allProductsStmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
function listAllProducts() {
  return allProductsStmt.all().map(attachTiers);
}

const zonesStmt = db.prepare('SELECT * FROM shipping_zones ORDER BY is_default ASC, name ASC');
function listZones() {
  return zonesStmt.all();
}

function safeJson(str, dflt) {
  try {
    const v = JSON.parse(str);
    return v == null ? dflt : v;
  } catch {
    return dflt;
  }
}

// Replace all tiers for a product (admin save). tiers: [{min_qty, unit_price}].
const delTiersStmt = db.prepare('DELETE FROM product_tiers WHERE product_id = ?');
const insTierStmt = db.prepare('INSERT INTO product_tiers (product_id, min_qty, unit_price) VALUES (?, ?, ?)');
const replaceTiers = db.transaction((productId, tiers) => {
  delTiersStmt.run(productId);
  const seen = new Set();
  for (const t of tiers) {
    const minQty = Math.max(1, Math.floor(Number(t.min_qty)));
    const price = Number(t.unit_price);
    if (!Number.isFinite(minQty) || !Number.isFinite(price) || price < 0) continue;
    if (seen.has(minQty)) continue; // UNIQUE(product_id, min_qty)
    seen.add(minQty);
    insTierStmt.run(productId, minQty, price);
  }
});

module.exports = {
  db,
  tiersFor,
  attachTiers,
  getProductForPricing,
  getProductBySlug,
  getProductById,
  listActiveProducts,
  listAllProducts,
  listZones,
  replaceTiers,
  safeJson,
};
