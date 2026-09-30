#!/usr/bin/env node
// Prints the quote for the sample cart as one JSON line on stdout.
import { readFileSync } from "node:fs";
import { quote } from "../src/shipping.mjs";

const cart = JSON.parse(readFileSync(new URL("../data/cart.json", import.meta.url), "utf8"));
process.stdout.write(`${JSON.stringify(quote(cart.items))}\n`);
