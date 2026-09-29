/** Order-level discount applied to every quote. */
export const DISCOUNT = 0.1;

/**
 * Total for a list of line items after the order discount, rounded to cents.
 * @param {{ sku: string, price: number, qty: number }[]} items
 * @param {number} [discount]
 */
export function calculateTotal(items, discount = DISCOUNT) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  if (typeof discount !== "number" || discount < 0 || discount >= 1) {
    throw new RangeError("discount must be in [0, 1)");
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
  return Math.round(subtotal * (1 - discount) * 100) / 100;
}
