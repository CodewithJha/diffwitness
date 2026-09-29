#!/usr/bin/env node
// Prints the quote for the sample order as one JSON line on stdout.
import { readFileSync } from "node:fs";
import { calculateTotal } from "../src/pricing.mjs";

const order = JSON.parse(readFileSync(new URL("../data/order.json", import.meta.url), "utf8"));
process.stdout.write(`${JSON.stringify({ total: calculateTotal(order.items) })}\n`);
