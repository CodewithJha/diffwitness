import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDiffwitnessOperationalPath,
  isSourceDirty,
  isSourceRelevantPath,
  sourceDirtyFiles,
} from "../src/application/dirty-policy.js";

describe("dirty-policy", () => {
  it("classifies DiffWitness operational paths", () => {
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/evidence/x.json"), true);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/blobs/sha256:abc"), true);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/baselines/active.json"), true);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/runs/last-check.json"), true);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/cache/tmp"), true);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/config.yaml"), false);
    assert.equal(isDiffwitnessOperationalPath(".diffwitness/.gitignore"), false);
    assert.equal(isDiffwitnessOperationalPath("src/app.ts"), false);
  });

  it("sourceRelevant excludes operational artifacts only", () => {
    assert.equal(isSourceRelevantPath(".diffwitness/config.yaml"), true);
    assert.equal(isSourceRelevantPath(".diffwitness/evidence/a.json"), false);
    assert.equal(isSourceRelevantPath("README.md"), true);
  });

  it("sourceDirtyFiles filters and sorts", () => {
    const files = [
      ".diffwitness/evidence/e1.json",
      "z.txt",
      ".diffwitness/baselines/active.json",
      "a.txt",
      ".diffwitness/config.yaml",
    ];
    assert.deepEqual(sourceDirtyFiles(files), [".diffwitness/config.yaml", "a.txt", "z.txt"]);
    assert.equal(isSourceDirty(files), true);
    assert.equal(isSourceDirty([".diffwitness/evidence/x", ".diffwitness/runs/y"]), false);
  });
});
