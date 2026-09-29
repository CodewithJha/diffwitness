import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateTotal } from "../src/pricing.mjs";

const order = [
  { sku: "desk", price: 250, qty: 1 },
  { sku: "lamp", price: 50, qty: 2 },
];

test("returns a finite number rounded to cents", () => {
  const total = calculateTotal(order);
  assert.equal(typeof total, "number");
  assert.ok(Number.isFinite(total));
  assert.equal(Math.round(total * 100) / 100, total);
});

test("a discount never increases the total", () => {
  assert.ok(calculateTotal(order) <= calculateTotal(order, 0));
});

test("an empty order costs nothing", () => {
  assert.equal(calculateTotal([]), 0);
});

test("rejects invalid line items", () => {
  assert.throws(() => calculateTotal([{ sku: "desk", price: -1, qty: 1 }]), RangeError);
  assert.throws(() => calculateTotal([{ sku: "desk", price: 10, qty: 0 }]), RangeError);
  assert.throws(() => calculateTotal([{ sku: "", price: 10, qty: 1 }]), TypeError);
  assert.throws(() => calculateTotal("desk"), TypeError);
});
