// Flat-rate-by-pincode-zone shipping with a free-above threshold.
const { money } = require('./pricing');

// Match a pincode to a zone by the LONGEST matching leading-digit prefix.
// Falls back to the is_default zone. `zones` come from the shipping_zones table.
function zoneForPincode(zones, pincode) {
  const pin = String(pincode || '').replace(/\D/g, '');
  let best = null;
  let bestLen = -1;
  let fallback = null;

  for (const z of zones) {
    if (z.is_default) fallback = z;
    const prefixes = String(z.pincode_prefixes || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    for (const prefix of prefixes) {
      if (pin.startsWith(prefix) && prefix.length > bestLen) {
        best = z;
        bestLen = prefix.length;
      }
    }
  }
  return best || fallback || null;
}

// Returns { zone, shipping, free, free_above, free_remaining }.
// subtotal is the cart subtotal (after quantity-break pricing).
function quoteShipping(zones, pincode, subtotal) {
  const zone = zoneForPincode(zones, pincode);
  if (!zone) {
    return { zone: null, shipping: 0, free: false, free_above: 0, free_remaining: 0 };
  }
  const freeAbove = Number(zone.free_above) || 0;
  const qualifiesFree = freeAbove > 0 && subtotal >= freeAbove;
  const shipping = qualifiesFree ? 0 : money(zone.flat_rate);
  const freeRemaining = freeAbove > 0 && !qualifiesFree ? money(freeAbove - subtotal) : 0;
  return {
    zone: { id: zone.id, name: zone.name },
    shipping,
    free: qualifiesFree,
    free_above: freeAbove,
    free_remaining: freeRemaining,
  };
}

module.exports = { zoneForPincode, quoteShipping };
