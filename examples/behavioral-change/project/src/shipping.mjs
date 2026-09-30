/** Carts at or above this subtotal ship for free. */
export const FREE_SHIPPING_THRESHOLD = 50;

/** Shipping charged below the threshold. */
export const FLAT_RATE = 5.99;

const cents = (value) => Math.round(value * 100) / 100;

/**
 * Quote for a cart: subtotal, shipping and total, rounded to cents.
 * @param {{ sku: string, price: number, qty: number }[]} items
 */
export function quote(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  let subtotal = 0;
  for (const item of items) {
    if (typeof item.sku !== "string" || item.sku.length === 0) {
      throw new TypeError("item.sku must be a non-empty string");
    }
    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new RangeError(`invalid price for ${item.sku}`);
    }
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw new RangeError(`invalid qty for ${item.sku}`);
    }
    subtotal += item.price * item.qty;
  }
  subtotal = cents(subtotal);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_RATE;
  return { subtotal, shipping, total: cents(subtotal + shipping) };
}
