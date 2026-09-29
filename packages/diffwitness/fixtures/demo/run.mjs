#!/usr/bin/env node
/**
 * DiffWitness deterministic demo fixture (M1/M2).
 * - No network, Date, Math.random, or absolute machine paths in output
 * - Reads local behavior.json; writes fixtures/demo/out/result.json
 * - Mutate behavior.json (e.g. change "rank") for check/diff demos:
 *     before: { "message": "diffwitness-demo", "rank": 1, "stable": true }
 *     after:  { "message": "diffwitness-demo", "rank": 2, "stable": true }
 *   Then: diffwitness check → findings (stdout + artifact); restore → clean
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const behaviorPath = join(here, "behavior.json");
const outDir = join(here, "out");
const outFile = join(outDir, "result.json");

const behavior = JSON.parse(readFileSync(behaviorPath, "utf8"));

const result = {
  fixture: "diffwitness-demo",
  version: 1,
  ok: true,
  behavior,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(result)}\n`, "utf8");

// Stable stdout contract (ranked / comparable).
process.stdout.write(`${JSON.stringify(result)}\n`);
