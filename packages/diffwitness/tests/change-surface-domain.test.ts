import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_CHANGE_SURFACE_LIMITS,
  buildChangeSurface,
  unrelatedChangeSurface,
  type ChangeSurfaceBuildInput,
  type ChangedFile,
} from "../src/domain/change-surface.js";
import { associateChangeSurface } from "../src/domain/change-surface-association.js";
import { compareEvidence } from "../src/domain/diff-engine.js";
import { parseBehavioralDiff } from "../src/domain/schemas.js";
import {
  asBaselineId,
  asEvidenceId,
  asWorkflowId,
  type Evidence,
} from "../src/domain/types.js";

const BASE = "a".repeat(40);
const CURRENT = "b".repeat(40);

function input(files: ChangedFile[], overrides?: Partial<ChangeSurfaceBuildInput>): ChangeSurfaceBuildInput {
  return {
    baseRevision: BASE,
    currentRevision: CURRENT,
    workingTreeIncluded: false,
    files,
    locations: [],
    locationsComplete: true,
    gitOutputCapped: false,
    excludedOperationalPaths: 0,
    ...overrides,
  };
}

function evidence(id: string, stdoutDigest: string): Evidence {
  return {
    id: asEvidenceId(id),
    workflowId: asWorkflowId("demo"),
    capturedAt: "2026-09-27T00:00:00.000Z",
    git: { dirty: false, headSha: BASE },
    exitCode: 0,
    durationMs: 1,
    artifactRefs: [],
    observations: [
      { key: "exit_code", kind: "exit", valueDigest: "sha256:exit0", rawPreview: "0" },
      { key: "stdout", kind: "stdout", valueDigest: stdoutDigest },
    ],
    redactionApplied: false,
  };
}

function findingsDiff() {
  const outcome = compareEvidence({
    baselineId: asBaselineId("bl-1"),
    baselineEvidence: [evidence("ev-base", "sha256:one")],
    currentEvidence: [evidence("ev-cur", "sha256:two")],
    against: { dirty: false, headSha: CURRENT },
  });
  assert.equal(outcome.ok, true);
  return outcome.diff;
}

describe("ChangeSurfaceBuilder", () => {
  it("sorts files by path deterministically and is order-independent", () => {
    const files: ChangedFile[] = [
      { path: "src/z.ts", status: "modified" },
      { path: "README.md", status: "modified" },
      { path: "src/a.ts", status: "added" },
    ];
    const a = buildChangeSurface(input(files));
    const b = buildChangeSurface(input([...files].reverse()));
    assert.deepEqual(a.files.map((f) => f.path), ["README.md", "src/a.ts", "src/z.ts"]);
    assert.deepEqual(a, b);
    assert.equal(a.causality, "not_established");
    assert.equal(a.associationStatus, "associated");
    assert.equal(a.truncation.truncated, false);
  });

  it("many files: caps at maxChangedFiles and marks truncation (never claims completeness)", () => {
    const files: ChangedFile[] = Array.from({ length: 250 }, (_, i) => ({
      path: `f/${String(i).padStart(4, "0")}.txt`,
      status: "added",
    }));
    const s = buildChangeSurface(input(files));
    assert.equal(s.files.length, DEFAULT_CHANGE_SURFACE_LIMITS.maxChangedFiles);
    assert.equal(s.files[0]?.path, "f/0000.txt");
    assert.equal(s.truncation.truncated, true);
    assert.equal(s.truncation.filesTotal, 250);
    assert.equal(s.truncation.filesIncluded, 200);
  });

  it("long paths are omitted and counted, never shortened into fabricated paths", () => {
    const long = `${"d/".repeat(300)}x.txt`;
    const s = buildChangeSurface(input([{ path: long, status: "added" }, { path: "ok.txt", status: "added" }]));
    assert.deepEqual(s.files.map((f) => f.path), ["ok.txt"]);
    assert.equal(s.truncation.omittedLongPaths, 1);
    assert.equal(s.truncation.truncated, true);
  });

  it("serialized-size limit drops locations then files, marked truncated", () => {
    const files: ChangedFile[] = Array.from({ length: 100 }, (_, i) => ({
      path: `pkg/${"n".repeat(100)}-${String(i).padStart(3, "0")}.ts`,
      status: "modified",
    }));
    const locations = files.map((f) => ({ path: f.path, baseStart: 1, baseLines: 1, currentStart: 1, currentLines: 1 }));
    const limits = { ...DEFAULT_CHANGE_SURFACE_LIMITS, maxSerializedChars: 4_000 };
    const s = buildChangeSurface(input(files, { locations, limits }));
    assert.ok(JSON.stringify(s).length <= 4_000);
    assert.equal(s.locations.length, 0);
    assert.ok(s.files.length > 0 && s.files.length < 100);
    assert.equal(s.truncation.truncated, true);
    assert.equal(s.truncation.filesTotal, 100);
  });

  it("git output cap → truncated and locations incomplete", () => {
    const s = buildChangeSurface(input([{ path: "a", status: "added" }], { gitOutputCapped: true }));
    assert.equal(s.truncation.truncated, true);
    assert.equal(s.locationsComplete, false);
  });
});

describe("Finding ↔ ChangeSurface association", () => {
  it("comparable surface: findings associated; ids/severity/type/evidence and diff id unchanged", () => {
    const diff = findingsDiff();
    const surface = buildChangeSurface(input([{ path: "fixtures/demo/behavior.json", status: "modified" }]));
    const associated = associateChangeSurface(diff, surface);
    assert.equal(associated.id, diff.id);
    assert.equal(associated.status, diff.status);
    assert.equal(associated.findings.length, diff.findings.length);
    associated.findings.forEach((f, i) => {
      const original = diff.findings[i]!;
      assert.equal(f.id, original.id);
      assert.equal(f.severity, original.severity);
      assert.equal(f.findingType, original.findingType);
      assert.deepEqual(f.evidenceIds, original.evidenceIds);
      assert.equal(f.associationStatus, "associated");
      assert.deepEqual(f.changeSurfaceRefs, [surface.id]);
    });
    // Round-trips through the persisted schema.
    assert.deepEqual(parseBehavioralDiff(JSON.parse(JSON.stringify(associated))), associated);
  });

  it("not comparable: no refs, status propagated", () => {
    const surface = unrelatedChangeSurface({
      status: "not_comparable",
      limitation: "Active baseline has no Git commit SHA.",
      baseRevision: null,
      currentRevision: CURRENT,
      workingTreeIncluded: false,
    });
    const associated = associateChangeSurface(findingsDiff(), surface);
    assert.ok(associated.findings.every((f) => f.associationStatus === "not_comparable"));
    assert.ok(associated.findings.every((f) => f.changeSurfaceRefs?.length === 0));
    assert.equal(associated.changeSurface?.files.length, 0);
  });

  it("empty surface is valid: behavior change with no source change stays associated", () => {
    const surface = buildChangeSurface(input([]));
    const associated = associateChangeSurface(findingsDiff(), surface);
    assert.equal(associated.changeSurface?.truncation.filesTotal, 0);
    assert.ok(associated.findings.every((f) => f.associationStatus === "associated"));
  });

  it("finding without current-execution evidence is unavailable", () => {
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [evidence("ev-base", "sha256:one")],
      currentEvidence: [],
      against: { dirty: false, headSha: CURRENT },
    });
    const associated = associateChangeSurface(outcome.diff, buildChangeSurface(input([])));
    assert.ok(associated.findings.length > 0);
    assert.ok(associated.findings.every((f) => f.associationStatus === "unavailable"));
  });

  it("analysis_error downgrades the surface to unavailable", () => {
    const diff = { ...findingsDiff(), status: "analysis_error" as const, findings: [] };
    const associated = associateChangeSurface(diff, buildChangeSurface(input([])));
    assert.equal(associated.changeSurface?.associationStatus, "unavailable");
    assert.equal(associated.status, "analysis_error");
  });
});
