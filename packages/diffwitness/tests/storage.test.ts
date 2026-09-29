import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import { DiffWitnessError } from "../src/domain/errors.js";

describe("FsStorage", () => {
  it("writes, reads, and refuses overwrite without flag", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-storage-"));
    try {
      const storage = new FsStorage();
      const file = path.join(root, "a", "b.txt");
      await storage.writeText(file, "one");
      assert.equal(await storage.readText(file), "one");
      assert.equal(await storage.exists(file), true);

      await assert.rejects(
        () => storage.writeText(file, "two"),
        (err: unknown) => err instanceof DiffWitnessError && err.category === "storage",
      );

      await storage.writeText(file, "two", { overwrite: true });
      assert.equal(await storage.readText(file), "two");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
