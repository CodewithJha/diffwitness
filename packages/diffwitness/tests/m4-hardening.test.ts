import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import { buildProcessEnv, resolveWorkflowCwd } from "../src/infrastructure/execution/env-policy.js";
import { parseDiffWitnessConfig } from "../src/infrastructure/config/schema.js";
import {
  assertPersistenceSchemaVersion,
  EvidenceStore,
} from "../src/infrastructure/evidence/evidence-store.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";

describe("M4 security + reliability hardening", () => {
  it("envPolicy none|path|all documented behaviors", () => {
    const prev = process.env.DIFFWITNESS_TEST_SECRET;
    process.env.DIFFWITNESS_TEST_SECRET = "secret-value";
    try {
      const none = buildProcessEnv("none", { FOO: "1" });
      assert.deepEqual(none, { FOO: "1" });
      assert.equal(none.DIFFWITNESS_TEST_SECRET, undefined);

      const pathOnly = buildProcessEnv("path", { FOO: "1" });
      assert.equal(pathOnly.FOO, "1");
      assert.ok(typeof pathOnly.PATH === "string");
      assert.equal(pathOnly.DIFFWITNESS_TEST_SECRET, undefined);

      const all = buildProcessEnv("all", { FOO: "2" });
      assert.equal(all.FOO, "2");
      assert.equal(all.DIFFWITNESS_TEST_SECRET, "secret-value");
    } finally {
      if (prev === undefined) {
        delete process.env.DIFFWITNESS_TEST_SECRET;
      } else {
        process.env.DIFFWITNESS_TEST_SECRET = prev;
      }
    }
  });

  it("rejects cwd escape and missing cwd", async () => {
    assert.throws(
      () => resolveWorkflowCwd("/repo", "../outside"),
      DiffWitnessError,
    );
    const executor = new ChildProcessExecutor();
    await assert.rejects(
      () =>
        executor.execute({
          argv: ["node", "-e", "1"],
          cwd: path.join(os.tmpdir(), "diffwitness-missing-cwd-" + Date.now()),
          env: { PATH: process.env.PATH ?? "" },
          timeoutMs: 1000,
          maxStdoutBytes: 100,
          maxStderrBytes: 100,
        }),
      DiffWitnessError,
    );
  });

  it("killAllChildren / AbortSignal cleans up long-running child", async () => {
    const executor = new ChildProcessExecutor();
    const controller = new AbortController();
    const pending = executor.execute({
      argv: ["node", "-e", "setTimeout(() => {}, 60_000)"],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 30_000,
      maxStdoutBytes: 100,
      maxStderrBytes: 100,
      signal: controller.signal,
    });
    await new Promise((r) => setTimeout(r, 50));
    controller.abort();
    const result = await pending;
    assert.equal(result.outcome, "timed_out");
    assert.ok(result.errorMessage?.includes("abort") || result.errorMessage?.includes("timed"));

    const pending2 = executor.execute({
      argv: ["node", "-e", "setTimeout(() => {}, 60_000)"],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 30_000,
      maxStdoutBytes: 100,
      maxStderrBytes: 100,
    });
    await new Promise((r) => setTimeout(r, 50));
    executor.killAllChildren("SIGKILL");
    const result2 = await pending2;
    // A child DiffWitness killed must never be reported as a normal exit (which would become Evidence).
    assert.equal(result2.outcome, "interrupted");
    assert.equal(result2.exitCode, null);
    await executor.dispose();
  });

  it("malicious / invalid config fails closed", () => {
    assert.throws(() => parseDiffWitnessConfig({ version: 2 }), (err: unknown) => {
      return (
        err instanceof DiffWitnessError &&
        err.details?.code === "unsupported_config_version"
      );
    });
    assert.throws(() =>
      parseDiffWitnessConfig({
        version: 1,
        workflows: [{ id: "x", command: ["node", "a\0b"] }],
      }),
    );
    assert.throws(() => parseDiffWitnessConfig(null));
    assert.throws(() => parseDiffWitnessConfig([]));
  });

  it("persistence unknown schemaVersion fail closed", async () => {
    assert.throws(
      () => assertPersistenceSchemaVersion({ schemaVersion: 99, kind: "evidence" }, "t"),
      (err: unknown) =>
        err instanceof DiffWitnessError &&
        err.details?.code === "unsupported_persistence_version",
    );

    const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-schema-"));
    try {
      const storage = new FsStorage();
      await storage.ensureDir(path.join(root, ".diffwitness", "evidence"));
      const store = new EvidenceStore(storage, root);
      await writeFile(
        store.evidencePath("bad"),
        JSON.stringify({
          schemaVersion: 99,
          kind: "evidence",
          evidence: {},
        }),
        "utf8",
      );
      await assert.rejects(() => store.getEvidence("bad"), DiffWitnessError);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects NUL in argv at executor boundary", async () => {
    const executor = new ChildProcessExecutor();
    await assert.rejects(
      () =>
        executor.execute({
          argv: ["node", "x\0y"],
          cwd: process.cwd(),
          env: {},
          timeoutMs: 1000,
          maxStdoutBytes: 10,
          maxStderrBytes: 10,
        }),
      DiffWitnessError,
    );
  });
});
