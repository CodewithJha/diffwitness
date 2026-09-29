import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultConfig } from "../src/infrastructure/config/defaults.js";
import { parseDiffWitnessConfig } from "../src/infrastructure/config/schema.js";
import { serializeConfig } from "../src/infrastructure/config/load.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import { parse as parseYaml } from "yaml";

describe("config schema", () => {
  it("parses defaults", () => {
    const cfg = parseDiffWitnessConfig(defaultConfig());
    assert.equal(cfg.version, 1);
    assert.equal(cfg.ai.provider, "mock");
    assert.equal(cfg.workflows[0]?.id, "example");
    assert.equal(cfg.privacy.sendCodeBodies, false);
  });

  it("applies defaults for omitted optional sections", () => {
    const cfg = parseDiffWitnessConfig({ version: 1 });
    assert.equal(cfg.baseRef, "origin/main");
    assert.deepEqual(cfg.workflows, []);
    assert.equal(cfg.execution.maxConcurrent, 1);
  });

  it("fails on invalid version / unknown keys", () => {
    assert.throws(
      () => parseDiffWitnessConfig({ version: 99 }),
      (err: unknown) => err instanceof DiffWitnessError && err.category === "config",
    );
    assert.throws(() =>
      parseDiffWitnessConfig({ version: 1, notARealField: true }),
    );
  });

  it("round-trips YAML serialization", () => {
    const yaml = serializeConfig(defaultConfig());
    const loaded = parseDiffWitnessConfig(parseYaml(yaml));
    assert.equal(loaded.workflows[0]?.command[0], "node");
  });
});
