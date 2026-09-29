import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXIT_CODES } from "../src/domain/errors.js";
import { InterruptController } from "../src/infrastructure/execution/interrupt-controller.js";
import { ChildProcessExecutor } from "../src/infrastructure/execution/process-executor.js";
import {
  isAlive,
  makeWorkflowRepo,
  setMode,
  spawnCli,
  waitForExit,
} from "./support/workflow-repo.js";

const POSIX = process.platform !== "win32";

/** Direct child spawns a 30s grandchild sharing stdout, prints its pid, then `after`. */
function parentScript(after: "wait" | "exit"): string {
  return [
    "const { spawn } = require('node:child_process');",
    "const gc = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], { stdio: ['ignore', 'inherit', 'inherit'] });",
    "process.stdout.write(String(gc.pid) + '\\n');",
    after === "wait" ? "setTimeout(() => {}, 30000);" : "setTimeout(() => process.exit(0), 50);",
  ].join("\n");
}

function request(script: string, timeoutMs: number) {
  return {
    argv: [process.execPath, "-e", script],
    cwd: process.cwd(),
    env: { PATH: process.env.PATH ?? "" },
    timeoutMs,
    maxStdoutBytes: 4096,
    maxStderrBytes: 4096,
  };
}

function grandchildPid(stdout: Buffer): number {
  const pid = Number(stdout.toString("utf8").trim().split("\n")[0]);
  assert.ok(Number.isInteger(pid) && pid > 0, `no grandchild pid in stdout: ${stdout.toString()}`);
  return pid;
}

describe("P1-2 timeout kills the workflow process group", { skip: !POSIX }, () => {
  it("timeout with a waiting parent + grandchild: prompt timed_out, grandchild dead", async () => {
    const executor = new ChildProcessExecutor();
    const started = Date.now();
    const result = await executor.execute(request(parentScript("wait"), 800));
    const elapsed = Date.now() - started;
    assert.equal(result.outcome, "timed_out");
    assert.equal(result.exitCode, null);
    assert.ok(elapsed < 3_000, `executor took ${elapsed}ms`);
    const pid = grandchildPid(result.stdout);
    assert.ok(await waitForExit(pid), `grandchild ${pid} still running after timeout`);
    await executor.dispose();
  });

  it("grandchild outlives the direct child and holds stdout: still bounded by timeout", async () => {
    const executor = new ChildProcessExecutor();
    const started = Date.now();
    const result = await executor.execute(request(parentScript("exit"), 800));
    const elapsed = Date.now() - started;
    assert.equal(result.outcome, "timed_out");
    assert.ok(elapsed < 3_000, `executor took ${elapsed}ms`);
    const pid = grandchildPid(result.stdout);
    assert.ok(await waitForExit(pid), `grandchild ${pid} still running after timeout`);
    await executor.dispose();
  });

  it("interrupt kills the group and reports interrupted (with the received signal)", async () => {
    const interruption = new InterruptController();
    const executor = new ChildProcessExecutor({ interruption });
    const pending = executor.execute(request(parentScript("wait"), 30_000));
    // The grandchild must have spawned and printed its pid first, even on a loaded host.
    await new Promise((r) => setTimeout(r, 1_000));
    const started = Date.now();
    interruption.trigger("SIGINT");
    const result = await pending;
    assert.ok(Date.now() - started < 2_000);
    assert.equal(result.outcome, "interrupted");
    assert.equal(result.interruptedBy, "SIGINT");
    assert.equal(result.exitCode, null);
    const pid = grandchildPid(result.stdout);
    assert.ok(await waitForExit(pid), `grandchild ${pid} survived interrupt`);
    await executor.dispose();
  });

  it("distinguishes signaled (external signal) from exited 1 and exited 130", async () => {
    const executor = new ChildProcessExecutor();
    const killed = await executor.execute(request("process.kill(process.pid, 'SIGTERM')", 5_000));
    assert.equal(killed.outcome, "signaled");
    assert.equal(killed.terminatingSignal, "SIGTERM");
    assert.equal(killed.exitCode, null);

    const one = await executor.execute(request("process.exit(1)", 5_000));
    assert.equal(one.outcome, "exited");
    assert.equal(one.exitCode, 1);

    const own130 = await executor.execute(request("process.exit(130)", 5_000));
    assert.equal(own130.outcome, "exited");
    assert.equal(own130.exitCode, 130);
    await executor.dispose();
  });

  it("dispose stops running workflows and no pids leak", async () => {
    const executor = new ChildProcessExecutor();
    const pending = executor.execute(request(parentScript("wait"), 30_000));
    // The grandchild must have spawned and printed its pid first, even on a loaded host.
    await new Promise((r) => setTimeout(r, 1_000));
    await executor.dispose();
    const result = await pending;
    assert.equal(result.outcome, "interrupted");
    assert.equal(result.interruptedBy, undefined);
    const pid = grandchildPid(result.stdout);
    assert.ok(await waitForExit(pid));
    assert.equal(isAlive(pid), false);
  });

  it("CLI: `sh -c \"sleep 37; echo\"` with timeoutMs 800 → exit 3 promptly (audit repro)", async () => {
    const w = await makeWorkflowRepo("sd-pg-cli-", [
      { id: "slow", timeoutMs: 800, command: ["sh", "-c", "sleep 37; echo done"] },
    ]);
    try {
      await setMode(w, "fast");
      const run = spawnCli(w.repo, ["baseline"]);
      const r = await run.done;
      assert.equal(r.code, EXIT_CODES.analysis_error, r.err);
      assert.match(r.err, /timed out after 800ms/);
      assert.ok(r.ms < 6_000, `CLI took ${r.ms}ms (orphaned grandchild held the pipe?)`);
    } finally {
      await w.cleanup();
    }
  });
});
