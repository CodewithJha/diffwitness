import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import { DiffWitnessError } from "../src/domain/errors.js";

describe("ChildProcessExecutor", () => {
  const executor = new ChildProcessExecutor();

  it("captures successful exit and stdout", async () => {
    const result = await executor.execute({
      argv: ["node", "-e", "process.stdout.write('ok')"],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 5_000,
      maxStdoutBytes: 1024,
      maxStderrBytes: 1024,
    });
    assert.equal(result.outcome, "exited");
    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout.toString("utf8"), "ok");
    assert.equal(result.stdoutTruncated, false);
  });

  it("records non-zero exit without treating as spawn failure", async () => {
    const result = await executor.execute({
      argv: ["node", "-e", "process.exit(7)"],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 5_000,
      maxStdoutBytes: 1024,
      maxStderrBytes: 1024,
    });
    assert.equal(result.outcome, "exited");
    assert.equal(result.exitCode, 7);
  });

  it("reports spawn_failed for missing binary", async () => {
    const result = await executor.execute({
      argv: ["diffwitness-no-such-binary-xyz"],
      cwd: process.cwd(),
      env: { PATH: "/nonexistent" },
      timeoutMs: 5_000,
      maxStdoutBytes: 1024,
      maxStderrBytes: 1024,
    });
    assert.equal(result.outcome, "spawn_failed");
    assert.equal(result.exitCode, null);
  });

  it("times out long-running processes", async () => {
    const result = await executor.execute({
      argv: ["node", "-e", "setTimeout(() => {}, 60_000)"],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 200,
      maxStdoutBytes: 1024,
      maxStderrBytes: 1024,
    });
    assert.equal(result.outcome, "timed_out");
    assert.equal(result.exitCode, null);
  });

  it("truncates stdout and stderr at configured limits", async () => {
    const result = await executor.execute({
      argv: [
        "node",
        "-e",
        "process.stdout.write('A'.repeat(100)); process.stderr.write('B'.repeat(100));",
      ],
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? "" },
      timeoutMs: 5_000,
      maxStdoutBytes: 10,
      maxStderrBytes: 5,
    });
    assert.equal(result.outcome, "exited");
    assert.equal(result.stdout.byteLength, 10);
    assert.equal(result.stderr.byteLength, 5);
    assert.equal(result.stdoutTruncated, true);
    assert.equal(result.stderrTruncated, true);
  });

  it("does not use shell interpolation (metacharacters are literal argv)", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "diffwitness-exec-"));
    try {
      // If shell were used, `echo hello` might run; with argv, node receives one script arg.
      const script = path.join(dir, "echo hello");
      await writeFile(script, "process.stdout.write('literal')", "utf8");
      const result = await executor.execute({
        argv: ["node", script],
        cwd: dir,
        env: { PATH: process.env.PATH ?? "" },
        timeoutMs: 5_000,
        maxStdoutBytes: 1024,
        maxStderrBytes: 1024,
      });
      assert.equal(result.outcome, "exited");
      assert.equal(result.stdout.toString("utf8"), "literal");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("requires positive timeoutMs", async () => {
    await assert.rejects(
      () =>
        executor.execute({
          argv: ["node", "-e", "1"],
          cwd: process.cwd(),
          env: { PATH: process.env.PATH ?? "" },
          timeoutMs: 0,
          maxStdoutBytes: 100,
          maxStderrBytes: 100,
        }),
      (err: unknown) => err instanceof DiffWitnessError && err.category === "execution",
    );
  });
});
