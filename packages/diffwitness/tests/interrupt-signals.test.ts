import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { EXIT_CODES } from "../src/domain/errors.js";
import { EvidenceStore } from "../src/infrastructure/evidence/evidence-store.js";
import { InterruptController } from "../src/infrastructure/execution/interrupt-controller.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import type { ProcessExecutor } from "../src/ports/process-executor.js";
import type { WriteTextOptions } from "../src/ports/storage.js";
import {
  makeWorkflowRepo,
  readJson,
  runInProcess,
  setMode,
  snapshotState,
  spawnCli,
  waitForExit,
  waitForFile,
  type WorkflowRepo,
} from "./support/workflow-repo.js";

const POSIX = process.platform !== "win32";

/** Baseline in fast mode, then check once so a valid previous BehavioralDiff exists. */
async function repoWithBaselineAndCheck(prefix: string): Promise<WorkflowRepo> {
  const w = await makeWorkflowRepo(prefix, [{ id: "w" }]);
  await setMode(w, "fast");
  assert.equal((await runInProcess(w.repo, ["baseline"])).code, 0);
  assert.equal((await runInProcess(w.repo, ["check"])).code, 0);
  return w;
}

/** Start the CLI, wait until the workflow is running, deliver `signals`, await exit. */
async function interruptDuringWorkflow(
  w: WorkflowRepo,
  argv: string[],
  signals: NodeJS.Signals[] = ["SIGINT"],
) {
  await setMode(w, "sleep");
  const run = spawnCli(w.repo, argv);
  const workflowPid = Number(await waitForFile(w.marker));
  for (const s of signals) {
    run.kill(s);
  }
  const result = await run.done;
  return { ...result, workflowPid };
}

function assertNoNewRuns(before: Map<string, string>, after: Map<string, string>): void {
  for (const [key, value] of before) {
    if (key === "runs/last-check.json") continue;
    assert.equal(after.get(key), value, `${key} changed`);
  }
  const added = [...after.keys()].filter((k) => !before.has(k));
  assert.deepEqual(added, [], `unexpected new files: ${added.join(", ")}`);
}

describe("P0-1 Ctrl-C / SIGTERM (real signals to the CLI process)", { skip: !POSIX }, () => {
  it("first baseline interrupted → exit 130; no active baseline, no evidence recorded", async () => {
    const w = await makeWorkflowRepo("sd-int-bl-", [{ id: "w" }]);
    try {
      const r = await interruptDuringWorkflow(w, ["baseline"]);
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.doesNotMatch(r.out, /Baseline captured/);
      assert.match(r.err, /Interrupted by SIGINT/);
      assert.equal(existsSync(path.join(w.repo, ".diffwitness", "baselines", "active.json")), false);
      assert.deepEqual([...(await snapshotState(w.repo)).keys()], []);
      assert.ok(await waitForExit(r.workflowPid), "workflow process still running");
    } finally {
      await w.cleanup();
    }
  });

  it("baseline --force interrupted → exit 130; active baseline byte-identical", async () => {
    const w = await repoWithBaselineAndCheck("sd-int-blf-");
    try {
      const before = await snapshotState(w.repo);
      const r = await interruptDuringWorkflow(w, ["baseline", "--force"]);
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.doesNotMatch(r.out, /Baseline captured/);
      const after = await snapshotState(w.repo);
      assert.equal(after.get("baselines/active.json"), before.get("baselines/active.json"));
      assertNoNewRuns(before, after);
    } finally {
      await w.cleanup();
    }
  });

  it("check interrupted → exit 130; no new Evidence/BehavioralDiff; previous run file unchanged; explain refuses", async () => {
    const w = await repoWithBaselineAndCheck("sd-int-chk-");
    try {
      const before = await snapshotState(w.repo);
      const r = await interruptDuringWorkflow(w, ["check", "--fail-on", "warn"]);
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(r.out, "");
      const after = await snapshotState(w.repo);
      assertNoNewRuns(before, after);
      const last = (await readJson(
        path.join(w.repo, ".diffwitness", "runs", "last-check.json"),
      )) as { kind: string };
      assert.equal(last.kind, "check_incomplete");
      await setMode(w, "fast");
      const explained = await runInProcess(w.repo, ["explain"]);
      assert.equal(explained.code, EXIT_CODES.user_error);
      assert.match(explained.err, /check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("ci interrupted → exit 130, never clean, no JSON report, no fabricated exit_code finding", async () => {
    const w = await repoWithBaselineAndCheck("sd-int-ci-");
    try {
      const before = await snapshotState(w.repo);
      const r = await interruptDuringWorkflow(w, ["ci", "--fail-on", "warn"]);
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(r.out, "", "ci must not print a report when interrupted");
      assert.doesNotMatch(r.err, /ci clean|exit_code_changed/);
      assertNoNewRuns(before, await snapshotState(w.repo));
    } finally {
      await w.cleanup();
    }
  });

  it("SIGTERM during check → exit 143; nothing persisted", async () => {
    const w = await repoWithBaselineAndCheck("sd-term-chk-");
    try {
      const before = await snapshotState(w.repo);
      const r = await interruptDuringWorkflow(w, ["check"], ["SIGTERM"]);
      assert.equal(r.code, EXIT_CODES.terminated, r.err);
      assert.match(r.err, /Interrupted by SIGTERM/);
      assertNoNewRuns(before, await snapshotState(w.repo));
    } finally {
      await w.cleanup();
    }
  });

  it("repeated SIGINT → exit 130 promptly; active baseline unchanged", async () => {
    const w = await repoWithBaselineAndCheck("sd-int-rep-");
    try {
      const before = await snapshotState(w.repo);
      const r = await interruptDuringWorkflow(w, ["baseline", "--force"], ["SIGINT", "SIGINT"]);
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      const after = await snapshotState(w.repo);
      assert.equal(after.get("baselines/active.json"), before.get("baselines/active.json"));
    } finally {
      await w.cleanup();
    }
  });

  it("interrupt kills the workflow's grandchildren and the CLI exits promptly", async () => {
    const w = await repoWithBaselineAndCheck("sd-int-gc-");
    try {
      await setMode(w, "grandchild");
      const run = spawnCli(w.repo, ["check"]);
      const grandchild = Number(await waitForFile(w.marker));
      const sentAt = Date.now();
      run.kill("SIGINT");
      const r = await run.done;
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.ok(Date.now() - sentAt < 5_000, "CLI did not exit promptly after SIGINT");
      assert.ok(await waitForExit(grandchild), "grandchild survived interrupt");
    } finally {
      await w.cleanup();
    }
  });
});

/** Storage that fires `onWrite` after a matching write completes (simulates a signal mid-persist). */
class TriggeringStorage extends FsStorage {
  constructor(
    private readonly matches: (filePath: string) => boolean,
    private readonly onWrite: () => void,
  ) {
    super();
  }

  override async writeText(filePath: string, content: string, options?: WriteTextOptions): Promise<void> {
    await super.writeText(filePath, content, options);
    if (this.matches(filePath)) this.onWrite();
  }
}

describe("P0-1 interruption races (deterministic, injected InterruptController)", () => {
  it("signal during baseline persistence (after baseline record, before active pointer) → 130; active unchanged", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-blp-");
    try {
      const before = await snapshotState(w.repo);
      const interruption = new InterruptController();
      const storage = new TriggeringStorage(
        (p) => p.includes(`${path.sep}baselines${path.sep}bl`),
        () => interruption.trigger("SIGINT"),
      );
      const r = await runInProcess(w.repo, ["baseline", "--force"], { interruption, storage });
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.doesNotMatch(r.out, /Baseline captured/);
      const after = await snapshotState(w.repo);
      assert.equal(after.get("baselines/active.json"), before.get("baselines/active.json"));
    } finally {
      await w.cleanup();
    }
  });

  it("signal during check persistence (after run file, before last-check) → 130; no current result", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-chkp-");
    try {
      const interruption = new InterruptController();
      const storage = new TriggeringStorage(
        (p) => p.includes(`${path.sep}runs${path.sep}bd_`),
        () => interruption.trigger("SIGINT"),
      );
      await setMode(w, "exit1");
      const r = await runInProcess(w.repo, ["check", "--fail-on", "warn"], { interruption, storage });
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(r.out, "");
      const store = new EvidenceStore(new FsStorage(), w.repo);
      await assert.rejects(() => store.getLastBehavioralDiff(), /check_incomplete/);
    } finally {
      await w.cleanup();
    }
  });

  it("signal immediately after a normal child exit (before persistence) → 130, not evidence", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-post-");
    try {
      const before = await snapshotState(w.repo);
      const interruption = new InterruptController();
      const executor: ProcessExecutor = {
        async execute() {
          interruption.trigger("SIGINT");
          return {
            outcome: "exited",
            exitCode: 1,
            stdout: Buffer.from("different\n"),
            stderr: Buffer.alloc(0),
            stdoutTruncated: false,
            stderrTruncated: false,
            durationMs: 1,
          };
        },
      };
      const r = await runInProcess(w.repo, ["ci", "--fail-on", "warn"], { interruption, executor });
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(r.out, "");
      assertNoNewRuns(before, await snapshotState(w.repo));
    } finally {
      await w.cleanup();
    }
  });

  it("signal before spawn → workflow never starts; 130", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-pre-");
    try {
      await setMode(w, "sleep");
      const interruption = new InterruptController();
      interruption.trigger("SIGINT");
      const r = await runInProcess(w.repo, ["check"], { interruption });
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(existsSync(w.marker), false, "workflow was spawned after interruption");
    } finally {
      await w.cleanup();
    }
  });

  it("interrupted explain prints no explanation and exits 130", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-explain-");
    try {
      const interruption = new InterruptController();
      interruption.trigger("SIGINT");
      const r = await runInProcess(w.repo, ["--json", "explain"], { interruption });
      assert.equal(r.code, EXIT_CODES.interrupted, r.err);
      assert.equal(r.out, "");
    } finally {
      await w.cleanup();
    }
  });

  it("SIGTERM recorded via controller → 143", async () => {
    const w = await repoWithBaselineAndCheck("sd-race-term-");
    try {
      const interruption = new InterruptController();
      interruption.trigger("SIGTERM");
      const r = await runInProcess(w.repo, ["baseline", "--force"], { interruption });
      assert.equal(r.code, EXIT_CODES.terminated, r.err);
    } finally {
      await w.cleanup();
    }
  });
});

describe("P0-1 ordinary exits stay ordinary", () => {
  it("workflow exit 1 (no signal) is normal Evidence; baseline exits 0", async () => {
    const w = await makeWorkflowRepo("sd-exit1-", [{ id: "w" }]);
    try {
      await setMode(w, "exit1");
      const r = await runInProcess(w.repo, ["baseline"]);
      assert.equal(r.code, EXIT_CODES.success, r.err);
      assert.match(r.out, /w: exit=1/);
    } finally {
      await w.cleanup();
    }
  });

  it("workflow exiting 130 on its own is not a user interruption", async () => {
    const w = await makeWorkflowRepo("sd-exit130-", [{ id: "w" }]);
    try {
      await setMode(w, "exit130");
      const r = await runInProcess(w.repo, ["baseline"]);
      assert.equal(r.code, EXIT_CODES.success, r.err);
      assert.match(r.out, /w: exit=130/);
    } finally {
      await w.cleanup();
    }
  });

  it("workflow killed by a signal DiffWitness did not send → analysis error (exit 3), never Evidence", async () => {
    const w = await makeWorkflowRepo("sd-selfkill-", [{ id: "w" }]);
    try {
      await setMode(w, "selfkill");
      const r = await runInProcess(w.repo, ["baseline"]);
      assert.equal(r.code, EXIT_CODES.analysis_error, r.err);
      assert.match(r.err, /terminated by signal SIGKILL/);
      assert.equal(existsSync(path.join(w.repo, ".diffwitness", "baselines", "active.json")), false);
    } finally {
      await w.cleanup();
    }
  });
});
