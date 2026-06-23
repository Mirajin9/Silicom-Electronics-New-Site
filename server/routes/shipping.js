// Shipping-quote API. The browser sends pincode + cart; the server prices the cart
// authoritatively and returns the flat-rate shipping for the matched zone.
const express = require('express');
const router = express.Router();
const store = require('../lib/store');
const { priceCart } = require('../lib/pricing');
const { quoteShipping } = require('../lib/shipping');

// POST /api/shipping-quote  { pincode, cart: [{id, qty}] }
router.post('/shipping-quote', (req, res, next) => {
  try {
    const { pincode, cart } = req.body || {};
    if (!/^\d{6}$/.test(String(pincode || ''))) {
      return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });
    }
    const priced = priceCart(cart, store.getProductForPricing);
    const ship = quoteShipping(store.listZones(), pincode, priced.subtotal);
    res.json({
      subtotal: priced.subtotal,
      ...ship,
      total: Math.round((priced.subtotal + ship.shipping) * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
