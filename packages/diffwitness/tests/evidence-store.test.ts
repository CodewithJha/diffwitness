import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { asEvidenceId, asWorkflowId } from "../src/domain/types.js";
import { parseEvidence } from "../src/domain/schemas.js";
import { DiffWitnessError } from "../src/domain/errors.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import {
  EvidenceStore,
  parseBaseline,
} from "../src/infrastructure/evidence/evidence-store.js";
import { asBaselineId } from "../src/domain/types.js";

describe("EvidenceStore persistence", () => {
  it("writes and reads schema-versioned evidence and baselines", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-evstore-"));
    try {
      const storage = new FsStorage();
      await storage.ensureDir(path.join(root, ".diffwitness", "blobs"));
      await storage.ensureDir(path.join(root, ".diffwitness", "evidence"));
      await storage.ensureDir(path.join(root, ".diffwitness", "baselines"));
      const store = new EvidenceStore(storage, root);

      const evidence = parseEvidence({
        id: "ev-1",
        workflowId: "demo",
        capturedAt: "2026-09-22T00:00:00.000Z",
        git: { dirty: false, headSha: "abc" },
        exitCode: 0,
        durationMs: 1,
        artifactRefs: [],
        observations: [
          { key: "exit_code", kind: "exit", valueDigest: "sha256:" + "a".repeat(64) },
        ],
        redactionApplied: false,
      });

      await store.putBlob(evidence.observations[0]!.valueDigest, Buffer.from("0"));
      await store.putEvidence(evidence);
      const loaded = await store.getEvidence(asEvidenceId("ev-1"));
      assert.equal(loaded.workflowId, asWorkflowId("demo"));

      const baseline = parseBaseline({
        id: "bl-1",
        createdAt: "2026-09-22T00:00:00.000Z",
        git: { dirty: false, headSha: "abc" },
        envFingerprint: "sha256:" + "b".repeat(64),
        workflowIds: ["demo"],
        evidenceIds: ["ev-1"],
      });
      await store.putBaseline(baseline, { force: false });
      assert.equal(await store.getActiveBaselineId(), "bl-1");

      await assert.rejects(
        () =>
          store.putBaseline(
            { ...baseline, id: asBaselineId("bl-2") },
            { force: false },
          ),
        (err: unknown) => err instanceof DiffWitnessError && err.exitClass === "user_error",
      );

      await store.putBaseline({ ...baseline, id: asBaselineId("bl-2") }, { force: true });
      assert.equal(await store.getActiveBaselineId(), "bl-2");
      // Old baseline retained
      const old = await store.getBaseline("bl-1");
      assert.equal(old.id, asBaselineId("bl-1"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses silent evidence overwrite and detects corrupt JSON", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-evstore2-"));
    try {
      const storage = new FsStorage();
      await storage.ensureDir(path.join(root, ".diffwitness", "evidence"));
      const store = new EvidenceStore(storage, root);
      const evidence = parseEvidence({
        id: "ev-1",
        workflowId: "demo",
        capturedAt: "2026-09-22T00:00:00.000Z",
        git: { dirty: false },
        exitCode: 0,
        durationMs: 1,
        artifactRefs: [],
        observations: [],
        redactionApplied: false,
      });
      await store.putEvidence(evidence);
      await assert.rejects(() => store.putEvidence(evidence), DiffWitnessError);

      await storage.writeText(store.evidencePath("ev-bad"), "{not-json", { overwrite: true });
      await assert.rejects(() => store.getEvidence("ev-bad"), DiffWitnessError);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
