// Public catalog API.
const express = require('express');
const router = express.Router();
const store = require('../lib/store');
const { ceilingPrice, floorPrice } = require('../lib/pricing');

// Shape a product for the storefront (no internal-only fields leaked beyond what's needed).
function publicView(p) {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    short_desc: p.short_desc,
    long_desc: p.long_desc,
    image_main: p.image_main,
    images: p.images,
    stock: p.stock,
    in_stock: p.stock > 0,
    tiers: p.tiers,
    price_ceiling: ceilingPrice(p.tiers),
    price_floor: floorPrice(p.tiers),
  };
}

// GET /api/products  -> active catalog
router.get('/products', (req, res) => {
  const products = store.listActiveProducts().map(publicView);
  res.json({ products });
});

// GET /api/products/:slug -> single product
router.get('/products/:slug', (req, res) => {
  const p = store.getProductBySlug(req.params.slug);
  if (!p || p.status !== 'active') return res.status(404).json({ error: 'Not found' });
  res.json({ product: publicView(p) });
});

module.exports = router;
