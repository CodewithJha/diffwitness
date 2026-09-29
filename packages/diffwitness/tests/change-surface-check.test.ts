import assert from "node:assert/strict";
import { rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { EXIT_CODES } from "../src/domain/errors.js";
import {
  cli,
  fixedStdoutExecutor,
  git,
  initAndBaseline,
  makeFixtureRepo,
  setRank,
} from "./support/fixture-repo.js";

interface JsonFinding {
  id: string;
  severity: string;
  findingType: string;
  evidenceIds: string[];
  associationStatus?: string;
  changeSurfaceRefs?: string[];
}
interface JsonSurface {
  id: string;
  associationStatus: string;
  causality: string;
  limitation: string | null;
  baseRevision: string | null;
  currentRevision: string | null;
  files: { path: string; status: string }[];
  excludedOperationalPaths: number;
  truncation: { filesTotal: number };
}

async function checkJson(repo: string, extras?: Parameters<typeof cli>[2]) {
  const result = await cli(repo, ["check", "--json"], extras);
  const json = JSON.parse(result.out) as {
    schemaVersion: number;
    status: string;
    behavioralDiff: { id: string; findings: JsonFinding[]; changeSurface?: JsonSurface };
  };
  return { result, json, surface: json.behavioralDiff.changeSurface!, findings: json.behavioralDiff.findings };
}

async function withRepo(fn: (repo: string) => Promise<void>): Promise<void> {
  const repo = await makeFixtureRepo("diffwitness-m6-");
  try {
    await fn(repo);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
}

describe("check: change surface + association", () => {
  it("clean check → empty associated surface; mutate → finding associated with behavior.json", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const head = (await git(repo, ["rev-parse", "HEAD"])).trim();

      const clean = await checkJson(repo);
      assert.equal(clean.json.schemaVersion, 2);
      assert.equal(clean.json.status, "clean");
      assert.equal(clean.surface.associationStatus, "associated");
      assert.equal(clean.surface.baseRevision, head);
      assert.deepEqual(clean.surface.files, []);

      await setRank(repo, 2);
      const changed = await checkJson(repo);
      assert.equal(changed.json.status, "findings");
      assert.deepEqual(changed.surface.files.map((f) => [f.status, f.path]), [
        ["modified", "fixtures/demo/behavior.json"],
      ]);
      assert.equal(changed.surface.causality, "not_established");
      for (const f of changed.findings) {
        assert.equal(f.associationStatus, "associated");
        assert.deepEqual(f.changeSurfaceRefs, [changed.surface.id]);
      }

      const human = await cli(repo, ["check"]);
      assert.match(human.out, /Change surface \(Git: baseline [0-9a-f]{12} → current [0-9a-f]{12} \+ working tree\): 1 file/);
      assert.match(human.out, /M {2}fixtures\/demo\/behavior\.json/);
      assert.match(human.out, /Association: \d+ of \d+ finding\(s\) co-occurred .*workflow demo @ source state [0-9a-f]{12}/);
      assert.match(human.out, /Causality: not established/);
      assert.ok(!/diff --git|@@ -/.test(human.out), "no git diff dump");
    });
  });

  it("behavior change + only README.md changed → co-occurrence, causality not established", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      await writeFile(path.join(repo, "README.md"), "docs only\n", "utf8");
      const executor = fixedStdoutExecutor('{"different":true}\n');
      const { json, surface, findings } = await checkJson(repo, { executor });
      assert.equal(json.status, "findings");
      assert.deepEqual(surface.files.map((f) => f.path), ["README.md"]);
      assert.ok(findings.every((f) => f.associationStatus === "associated"));
      const human = await cli(repo, ["check"], { executor });
      assert.match(human.out, /README\.md/);
      assert.match(human.out, /Causality: not established/);
    });
  });

  it("behavior change + no source change → empty surface is still representable", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const executor = fixedStdoutExecutor('{"different":true}\n');
      const { json, surface, findings } = await checkJson(repo, { executor });
      assert.equal(json.status, "findings");
      assert.equal(surface.truncation.filesTotal, 0);
      assert.equal(surface.associationStatus, "associated");
      assert.ok(findings.length > 0 && findings.every((f) => f.associationStatus === "associated"));
      const human = await cli(repo, ["check"], { executor });
      assert.match(human.out, /0 file\(s\) — no source changes vs baseline commit/);
    });
  });

  it("baseline from a dirty tree → not_comparable, never fabricated", async () => {
    await withRepo(async (repo) => {
      await cli(repo, ["init"]); // config left uncommitted → baseline tree is dirty
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      await setRank(repo, 2);
      const { surface, findings } = await checkJson(repo);
      assert.equal(surface.associationStatus, "not_comparable");
      assert.match(surface.limitation ?? "", /dirty working tree/);
      assert.deepEqual(surface.files, []);
      assert.ok(findings.every((f) => f.associationStatus === "not_comparable"));
      assert.ok(findings.every((f) => (f.changeSurfaceRefs ?? []).length === 0));
    });
  });

  it("findings are identical with and without a change surface (DiffEngine semantics unchanged)", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const executor = fixedStdoutExecutor('{"different":true}\n');
      const noSource = await checkJson(repo, { executor });
      await writeFile(path.join(repo, "README.md"), "docs only\n", "utf8");
      const withSource = await checkJson(repo, { executor });
      const strip = (fs: JsonFinding[]) =>
        fs.map(({ id, severity, findingType }) => ({ id, severity, findingType }));
      assert.deepEqual(strip(withSource.findings), strip(noSource.findings));
      assert.equal(withSource.json.status, noSource.json.status);
      assert.notEqual(withSource.surface.id, noSource.surface.id);
    });
  });

  it(".diffwitness operational artifacts never pollute the surface (even without .diffwitness/.gitignore)", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      await unlink(path.join(repo, ".diffwitness", ".gitignore"));
      await setRank(repo, 2);
      const { surface, findings } = await checkJson(repo);
      const paths = surface.files.map((f) => f.path);
      assert.ok(paths.includes("fixtures/demo/behavior.json"));
      assert.ok(paths.includes(".diffwitness/.gitignore"), "operator-owned metadata still reported");
      assert.ok(
        paths.every((p) => !/^\.diffwitness\/(evidence|blobs|baselines|runs|cache)\//.test(p)),
        `operational paths leaked: ${paths.join(", ")}`,
      );
      assert.ok(surface.excludedOperationalPaths > 0);
      assert.equal(surface.associationStatus, "associated");
      assert.ok(findings.every((f) => f.associationStatus === "associated"));
    });
  });

  it("generated file changes are reported as ordinary changed files (no provenance inference)", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      await writeFile(path.join(repo, "generated.pb.ts"), "// @generated\nexport {};\n", "utf8");
      const { surface } = await checkJson(repo);
      assert.deepEqual(surface.files, [{ path: "generated.pb.ts", status: "added", untracked: true }]);
    });
  });

  it("repo state changed during execution → association unavailable", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const executor = fixedStdoutExecutor('{"different":true}\n', async () => {
        await writeFile(path.join(repo, "README.md"), "edited mid-run\n", "utf8");
      });
      const { surface, findings } = await checkJson(repo, { executor });
      assert.equal(surface.associationStatus, "unavailable");
      assert.match(surface.limitation ?? "", /changed during workflow execution/);
      assert.ok(findings.every((f) => f.associationStatus === "unavailable"));
    });
  });
});

describe("ci: change surface in JSON; exit semantics unchanged", () => {
  it("ci v2 JSON carries changeSurface; exit codes follow findings only", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const clean = await cli(repo, ["ci"]);
      assert.equal(clean.code, EXIT_CODES.success);
      const cleanJson = JSON.parse(clean.out);
      assert.equal(cleanJson.schemaVersion, 2);
      assert.equal(cleanJson.behavioralDiff.changeSurface.associationStatus, "associated");
      assert.match(clean.err, /Causality: not established/);

      await setRank(repo, 2);
      await git(repo, ["commit", "-am", "rank 2"]);
      const warn = await cli(repo, ["ci", "--fail-on", "warn"]);
      assert.equal(warn.code, EXIT_CODES.findings);
      const never = await cli(repo, ["ci", "--fail-on", "never"]);
      assert.equal(never.code, EXIT_CODES.success);
      const json = JSON.parse(never.out);
      assert.equal(json.behavioralDiff.changeSurface.workingTreeIncluded, false);
      assert.deepEqual(
        json.behavioralDiff.changeSurface.files.map((f: { path: string }) => f.path),
        ["fixtures/demo/behavior.json"],
      );
      assert.ok(json.findings.every((f: JsonFinding) => f.associationStatus === "associated"));
      assert.ok(!/\u001b\[/.test(never.out));
    });
  });

  it("analysis_error is never clean and its surface is not associated", async () => {
    await withRepo(async (repo) => {
      await initAndBaseline(repo);
      const timeout = {
        async execute() {
          return {
            outcome: "timed_out" as const,
            exitCode: null,
            stdout: Buffer.alloc(0),
            stderr: Buffer.alloc(0),
            stdoutTruncated: false,
            stderrTruncated: false,
            durationMs: 1,
            errorMessage: "forced timeout",
          };
        },
      };
      const timed = await cli(repo, ["ci"], { executor: timeout });
      assert.equal(timed.code, EXIT_CODES.analysis_error);
      assert.ok(!timed.out.includes('"status": "clean"'));
    });
  });
});
