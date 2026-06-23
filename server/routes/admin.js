// Password-protected admin panel: products (with images + price tiers), shipping zones, orders.
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();

const db = require('../db');
const store = require('../lib/store');
const { ceilingPrice, floorPrice } = require('../lib/pricing');
const { checkCredentials, requireAdmin, csrfToken, verifyCsrf } = require('../lib/auth');

// --- image uploads ---
const uploadDir = path.join(__dirname, '..', 'uploads', 'store');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, crypto.randomBytes(10).toString('hex') + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// Parse the tier rows the form posts as parallel arrays min_qty[] / unit_price[].
function parseTiers(body) {
  const minQ = [].concat(body.tier_min_qty || []);
  const price = [].concat(body.tier_unit_price || []);
  const tiers = [];
  for (let i = 0; i < minQ.length; i++) {
    const mq = parseInt(minQ[i], 10);
    const up = parseFloat(price[i]);
    if (Number.isFinite(mq) && Number.isFinite(up) && mq >= 1 && up >= 0) {
      tiers.push({ min_qty: mq, unit_price: up });
    }
  }
  // Always guarantee a qty-1 ceiling tier so pricing is well-defined.
  if (!tiers.some((t) => t.min_qty === 1) && tiers.length) {
    tiers.push({ min_qty: 1, unit_price: tiers.sort((a, b) => a.min_qty - b.min_qty)[0].unit_price });
  }
  return tiers;
}

// ---------- Auth ----------
router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/login', { error: null, csrf: csrfToken(req) });
});

router.post('/login', verifyCsrf, (req, res) => {
  const { username, password } = req.body;
  if (checkCredentials(username, password)) {
    req.session.admin = { user: username };
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', { error: 'Invalid username or password', csrf: csrfToken(req) });
});

router.post('/logout', requireAdmin, verifyCsrf, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// Everything below requires login.
router.use(requireAdmin);

// ---------- Dashboard / product list ----------
router.get('/', (req, res) => {
  const products = store.listAllProducts().map((p) => ({
    ...p,
    price_ceiling: ceilingPrice(p.tiers),
    price_floor: floorPrice(p.tiers),
  }));
  const orderCount = db.prepare('SELECT COUNT(*) n FROM orders').get().n;
  const paidCount = db.prepare(`SELECT COUNT(*) n FROM orders WHERE status='paid'`).get().n;
  res.render('admin/products', { products, csrf: csrfToken(req), orderCount, paidCount });
});

// ---------- New / edit product form ----------
router.get('/products/new', (req, res) => {
  res.render('admin/product-form', { product: null, csrf: csrfToken(req) });
});

router.get('/products/:id/edit', (req, res) => {
  const product = store.getProductById(Number(req.params.id));
  if (!product) return res.status(404).send('Product not found');
  res.render('admin/product-form', { product, csrf: csrfToken(req) });
});

const upsertCols = `sku=@sku, slug=@slug, name=@name, brand=@brand, category=@category,
  short_desc=@short_desc, long_desc=@long_desc, stock=@stock, weight_g=@weight_g,
  status=@status, updated_at=datetime('now')`;

router.post('/products/:id?', verifyCsrf, upload.array('images', 6), (req, res, next) => {
  try {
    const b = req.body;
    const id = req.params.id ? Number(req.params.id) : null;
    const newImages = (req.files || []).map((f) => `/store-uploads/${f.filename}`);

    let images = [];
    let imageMain = '';
    if (id) {
      const existing = store.getProductById(id);
      images = existing ? existing.images : [];
      imageMain = existing ? existing.image_main : '';
      // Allow removing images via removed_images[] checkboxes.
      const removed = [].concat(b.remove_image || []);
      images = images.filter((u) => !removed.includes(u));
      if (removed.includes(imageMain)) imageMain = '';
    }
    images = images.concat(newImages);
    if (!imageMain && images.length) imageMain = images[0];

    const fields = {
      sku: String(b.sku || '').trim(),
      slug: slugify(b.slug || b.name || ''),
      name: String(b.name || '').trim(),
      brand: String(b.brand || '').trim(),
      category: String(b.category || '').trim(),
      short_desc: String(b.short_desc || '').trim(),
      long_desc: String(b.long_desc || '').trim(),
      stock: Math.max(0, parseInt(b.stock, 10) || 0),
      weight_g: Math.max(0, parseInt(b.weight_g, 10) || 0),
      status: b.status === 'hidden' ? 'hidden' : 'active',
      image_main: imageMain,
      images_json: JSON.stringify(images),
    };
    if (!fields.sku || !fields.name) return res.status(400).send('SKU and name are required.');

    let productId = id;
    if (id) {
      db.prepare(`UPDATE products SET ${upsertCols}, image_main=@image_main, images_json=@images_json WHERE id=@id`)
        .run({ ...fields, id });
    } else {
      const info = db.prepare(`
        INSERT INTO products (sku, slug, name, brand, category, short_desc, long_desc,
                              stock, weight_g, status, image_main, images_json)
        VALUES (@sku, @slug, @name, @brand, @category, @short_desc, @long_desc,
                @stock, @weight_g, @status, @image_main, @images_json)`).run(fields);
      productId = info.lastInsertRowid;
    }

    store.replaceTiers(productId, parseTiers(b));
    res.redirect('/admin');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).send('SKU or slug already exists.');
    next(err);
  }
});

router.post('/products/:id/delete', verifyCsrf, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id));
  res.redirect('/admin');
});

// ---------- Shipping zones ----------
router.get('/zones', (req, res) => {
  res.render('admin/zones', { zones: store.listZones(), csrf: csrfToken(req) });
});

router.post('/zones', verifyCsrf, (req, res) => {
  const b = req.body;
  db.prepare(`INSERT INTO shipping_zones (name, pincode_prefixes, flat_rate, free_above, is_default)
              VALUES (?, ?, ?, ?, ?)`).run(
    String(b.name || '').trim(),
    String(b.pincode_prefixes || '').replace(/\s/g, ''),
    parseFloat(b.flat_rate) || 0,
    parseFloat(b.free_above) || 0,
    b.is_default ? 1 : 0
  );
  res.redirect('/admin/zones');
});

router.post('/zones/:id/update', verifyCsrf, (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE shipping_zones SET name=?, pincode_prefixes=?, flat_rate=?, free_above=?, is_default=? WHERE id=?`)
    .run(
      String(b.name || '').trim(),
      String(b.pincode_prefixes || '').replace(/\s/g, ''),
      parseFloat(b.flat_rate) || 0,
      parseFloat(b.free_above) || 0,
      b.is_default ? 1 : 0,
      Number(req.params.id)
    );
  res.redirect('/admin/zones');
});

router.post('/zones/:id/delete', verifyCsrf, (req, res) => {
  db.prepare('DELETE FROM shipping_zones WHERE id = ?').run(Number(req.params.id));
  res.redirect('/admin/zones');
});

// ---------- Orders ----------
router.get('/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200').all();
  const itemsByOrder = {};
  const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  for (const o of orders) itemsByOrder[o.id] = itemStmt.all(o.id);
  res.render('admin/orders', { orders, itemsByOrder, csrf: csrfToken(req) });
});

module.exports = router;
