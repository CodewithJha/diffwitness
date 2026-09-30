import assert from "node:assert/strict";
import { test } from "node:test";
import { FLAT_RATE, quote } from "../src/shipping.mjs";

const cart = [
  { sku: "mug", price: 12.5, qty: 2 },
  { sku: "tea", price: 20, qty: 1 },
];

test("the total is the subtotal plus shipping", () => {
  const q = quote(cart);
  assert.equal(q.total, Math.round((q.subtotal + q.shipping) * 100) / 100);
});

test("shipping is either free or the flat rate", () => {
  assert.ok([0, FLAT_RATE].includes(quote(cart).shipping));
});

test("an empty cart has a zero subtotal", () => {
  assert.equal(quote([]).subtotal, 0);
});

test("rejects invalid line items", () => {
  assert.throws(() => quote([{ sku: "mug", price: -1, qty: 1 }]), RangeError);
  assert.throws(() => quote([{ sku: "mug", price: 10, qty: 0 }]), RangeError);
  assert.throws(() => quote([{ sku: "", price: 10, qty: 1 }]), TypeError);
  assert.throws(() => quote("mug"), TypeError);
});
