// Quantity-break pricing logic. Pure functions — easy to unit test.

// tiers: array of { min_qty, unit_price }. Returns the per-piece price for `qty`.
// Picks the tier with the greatest min_qty that is <= qty.
function unitPriceFor(tiers, qty) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  let price = sorted[0].unit_price; // fallback to lowest-qty (ceiling) price
  for (const t of sorted) {
    if (qty >= t.min_qty) price = t.unit_price;
  }
  return price;
}

// Ceiling = price at qty 1 (the tier with min_qty === 1, else the lowest tier).
function ceilingPrice(tiers) {
  return unitPriceFor(tiers, 1);
}

// Floor = price at the highest break (cheapest per-piece price available).
function floorPrice(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  return [...tiers].sort((a, b) => a.min_qty - b.min_qty).slice(-1)[0].unit_price;
}

// Round to 2 decimals to avoid floating-point dust in money math.
function money(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

// Given DB products keyed by id and a cart [{ id|product_id, qty }], compute authoritative
// line items and subtotal. Throws on unknown product, bad qty, or insufficient stock.
// `getProduct(id)` must return { product, tiers } or null.
function priceCart(cart, getProduct) {
  if (!Array.isArray(cart) || cart.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }
  const items = [];
  let subtotal = 0;
  let weight = 0;

  for (const line of cart) {
    const id = Number(line.id ?? line.product_id);
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(id) || !Number.isFinite(qty) || qty < 1) {
      const err = new Error('Invalid cart line');
      err.status = 400;
      throw err;
    }
    const found = getProduct(id);
    if (!found || found.product.status !== 'active') {
      const err = new Error(`Product ${id} is not available`);
      err.status = 400;
      throw err;
    }
    const { product, tiers } = found;
    if (product.stock < qty) {
      const err = new Error(`Only ${product.stock} of "${product.name}" left in stock`);
      err.status = 409;
      throw err;
    }
    const unit = money(unitPriceFor(tiers, qty));
    const lineTotal = money(unit * qty);
    subtotal = money(subtotal + lineTotal);
    weight += (product.weight_g || 0) * qty;
    items.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      qty,
      unit_price: unit,
      line_total: lineTotal,
    });
  }

  return { items, subtotal: money(subtotal), weight_g: weight };
}

module.exports = { unitPriceFor, ceilingPrice, floorPrice, money, priceCart };
