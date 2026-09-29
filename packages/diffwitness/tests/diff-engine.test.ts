import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareEvidence } from "../src/domain/diff-engine.js";
import {
  asBaselineId,
  asEvidenceId,
  asWorkflowId,
  type BehavioralObservation,
  type Evidence,
} from "../src/domain/types.js";

function obs(
  key: string,
  kind: BehavioralObservation["kind"],
  digest: string,
  rawPreview?: string,
): BehavioralObservation {
  return {
    key,
    kind,
    valueDigest: digest,
    ...(rawPreview !== undefined ? { rawPreview } : {}),
  };
}

function evidence(partial: {
  id: string;
  workflowId?: string;
  observations: BehavioralObservation[];
  exitCode?: number;
}): Evidence {
  return {
    id: asEvidenceId(partial.id),
    workflowId: asWorkflowId(partial.workflowId ?? "demo"),
    capturedAt: "2026-09-22T00:00:00.000Z",
    git: { dirty: false, headSha: "aaa" },
    exitCode: partial.exitCode ?? 0,
    durationMs: 1,
    artifactRefs: [],
    observations: partial.observations,
    redactionApplied: false,
  };
}

const baseObs = [
  obs("exit_code", "exit", "sha256:exit0", "0"),
  obs("stdout_truncated", "structured", "sha256:f", "false"),
  obs("stderr_truncated", "structured", "sha256:f", "false"),
  obs("normalizer_version", "structured", "sha256:nv1", "normalize-v1"),
  obs("stdout", "stdout", "sha256:out1"),
  obs("stderr", "stderr", "sha256:err1"),
  obs("artifact:fixtures/demo/out/result.json", "artifact", "sha256:art1"),
];

describe("DiffEngine", () => {
  it("A=A → clean with unchanged observations", () => {
    const a = evidence({ id: "ev-a", observations: baseObs });
    const b = evidence({ id: "ev-b", observations: baseObs });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [a],
      currentEvidence: [b],
      against: { dirty: false },
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) {
      return;
    }
    assert.equal(outcome.diff.status, "clean");
    assert.equal(outcome.diff.findings.length, 0);
    assert.ok(outcome.diff.observations.unchanged.length >= 6);
    assert.equal(outcome.diff.observations.changed.length, 0);
    assert.equal(outcome.diff.schemaVersion, 1);
  });

  it("stdout change → stdout_changed finding with evidence citations", () => {
    const before = evidence({ id: "ev-a", observations: baseObs });
    const afterObs = baseObs.map((o) =>
      o.key === "stdout" ? obs("stdout", "stdout", "sha256:out2") : o,
    );
    const after = evidence({ id: "ev-b", observations: afterObs });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: true },
      assumptionIds: ["demo-output-stable"],
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) {
      return;
    }
    assert.equal(outcome.diff.status, "findings");
    const f = outcome.diff.findings.find((x) => x.observationKey === "stdout");
    assert.ok(f);
    assert.equal(f!.findingType, "stdout_changed");
    assert.equal(f!.summary, "Normalized stdout changed");
    assert.deepEqual(f!.evidenceIds, [asEvidenceId("ev-a"), asEvidenceId("ev-b")]);
    assert.deepEqual(outcome.diff.affectedAssumptions, ["demo-output-stable"]);
  });

  it("stderr / exit / artifact / truncation findings", () => {
    const before = evidence({ id: "ev-a", observations: baseObs });
    const afterObs = [
      obs("exit_code", "exit", "sha256:exit1", "1"),
      obs("stdout_truncated", "structured", "sha256:t", "true"),
      obs("stderr_truncated", "structured", "sha256:f", "false"),
      obs("normalizer_version", "structured", "sha256:nv1", "normalize-v1"),
      obs("stdout", "stdout", "sha256:out1"),
      obs("stderr", "stderr", "sha256:err2"),
      obs("artifact:fixtures/demo/out/result.json", "artifact", "sha256:art2"),
    ];
    const after = evidence({ id: "ev-b", observations: afterObs, exitCode: 1 });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) {
      return;
    }
    const types = new Set(outcome.diff.findings.map((f) => f.findingType));
    assert.ok(types.has("exit_code_changed"));
    assert.ok(types.has("stderr_changed"));
    assert.ok(types.has("artifact_changed"));
    assert.ok(types.has("truncation_changed"));
    const exit = outcome.diff.findings.find((f) => f.observationKey === "exit_code");
    assert.equal(exit?.severity, "error");
    assert.equal(exit?.summary, "Exit code changed");
  });

  it("added and removed observations", () => {
    const before = evidence({
      id: "ev-a",
      observations: [
        ...baseObs,
        obs("custom_metric", "metric", "sha256:m1", "1"),
      ],
    });
    const after = evidence({
      id: "ev-b",
      observations: [...baseObs, obs("new_metric", "metric", "sha256:m2", "2")],
    });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) {
      return;
    }
    assert.ok(outcome.diff.observations.removed.some((r) => r.key === "custom_metric"));
    assert.ok(outcome.diff.observations.added.some((r) => r.key === "new_metric"));
    const removed = outcome.diff.findings.find((f) => f.observationKey === "custom_metric");
    const added = outcome.diff.findings.find((f) => f.observationKey === "new_metric");
    assert.equal(removed?.change, "disappeared");
    assert.equal(added?.change, "appeared");
    assert.equal(removed?.findingType, "observation_changed");
    assert.equal(added?.findingType, "observation_changed");
  });

  it("multi findings sorted deterministically", () => {
    const before = evidence({ id: "ev-a", observations: baseObs });
    const afterObs = baseObs.map((o) => {
      if (o.key === "stdout") {
        return obs("stdout", "stdout", "sha256:outX");
      }
      if (o.key === "stderr") {
        return obs("stderr", "stderr", "sha256:errX");
      }
      if (o.key === "exit_code") {
        return obs("exit_code", "exit", "sha256:exit9", "9");
      }
      return o;
    });
    const after = evidence({ id: "ev-b", observations: afterObs });
    const once = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    const twice = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    assert.equal(once.ok, true);
    assert.equal(twice.ok, true);
    if (!once.ok || !twice.ok) {
      return;
    }
    assert.deepEqual(once.diff, twice.diff);
    const keys = once.diff.findings.map((f) => f.observationKey);
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(keys, sorted);
  });

  it("normalizer_version mismatch → analysis_error (not clean)", () => {
    const before = evidence({ id: "ev-a", observations: baseObs });
    const afterObs = baseObs.map((o) =>
      o.key === "normalizer_version"
        ? obs("normalizer_version", "structured", "sha256:nv2", "normalize-v2")
        : o,
    );
    const after = evidence({ id: "ev-b", observations: afterObs });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    assert.equal(outcome.ok, false);
    if (outcome.ok) {
      return;
    }
    assert.equal(outcome.status, "analysis_error");
    assert.equal(outcome.diff.status, "analysis_error");
    assert.notEqual(outcome.diff.status, "clean");
    assert.match(outcome.message, /normalizer_version mismatch/);
  });

  it("truncated stdout digest change uses careful summary", () => {
    const before = evidence({
      id: "ev-a",
      observations: baseObs.map((o) =>
        o.key === "stdout_truncated" ? obs("stdout_truncated", "structured", "sha256:t", "true") : o,
      ),
    });
    const after = evidence({
      id: "ev-b",
      observations: before.observations.map((o) =>
        o.key === "stdout" ? obs("stdout", "stdout", "sha256:outZ") : o,
      ),
    });
    const outcome = compareEvidence({
      baselineId: asBaselineId("bl-1"),
      baselineEvidence: [before],
      currentEvidence: [after],
      against: { dirty: false },
    });
    assert.equal(outcome.ok, true);
    if (!outcome.ok) {
      return;
    }
    const f = outcome.diff.findings.find((x) => x.observationKey === "stdout");
    assert.match(f!.summary, /truncated/);
  });
});
