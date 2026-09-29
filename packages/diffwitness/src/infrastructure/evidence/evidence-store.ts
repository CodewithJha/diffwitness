import path from "node:path";
import { DiffWitnessError } from "../../domain/errors.js";
import { parseBehavioralDiff, parseEvidence } from "../../domain/schemas.js";
import {
  asBaselineId,
  asEvidenceId,
  asWorkflowId,
  type Baseline,
  type BehavioralDiff,
  type Evidence,
  type EvidenceId,
  type BaselineId,
} from "../../domain/types.js";
import {
  ACTIVE_BASELINE_FILENAME,
  PERSISTENCE_SCHEMA_VERSION,
  DIFFWITNESS_DIR,
} from "../config/defaults.js";
import type { StoragePort } from "../../ports/storage.js";
import { z } from "zod";

const baselineSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  git: z.object({
    headSha: z.string().optional(),
    baseSha: z.string().optional(),
    dirty: z.boolean(),
    mergeBase: z.string().optional(),
  }),
  envFingerprint: z.string().min(1),
  workflowIds: z.array(z.string().min(1)),
  evidenceIds: z.array(z.string().min(1)),
});

const evidenceEnvelopeSchema = z.object({
  schemaVersion: z.literal(PERSISTENCE_SCHEMA_VERSION),
  kind: z.literal("evidence"),
  evidence: z.unknown(),
});

const baselineEnvelopeSchema = z.object({
  schemaVersion: z.literal(PERSISTENCE_SCHEMA_VERSION),
  kind: z.literal("baseline"),
  baseline: baselineSchema,
});

const activePointerSchema = z.object({
  schemaVersion: z.literal(PERSISTENCE_SCHEMA_VERSION),
  kind: z.literal("active_baseline"),
  baselineId: z.string().min(1),
});

const behavioralDiffEnvelopeSchema = z.object({
  schemaVersion: z.literal(PERSISTENCE_SCHEMA_VERSION),
  kind: z.literal("behavioral_diff"),
  behavioralDiff: z.unknown(),
});

const checkIncompleteMarkerSchema = z.object({
  schemaVersion: z.literal(PERSISTENCE_SCHEMA_VERSION),
  kind: z.literal("check_incomplete"),
  reason: z.string(),
});

/**
 * Fail closed on unknown / missing persistence schema versions.
 * Never treat corrupt or future-version envelopes as valid evidence.
 */
export function assertPersistenceSchemaVersion(
  parsed: unknown,
  label: string,
): asserts parsed is { schemaVersion: number } {
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new DiffWitnessError("analysis", `Corrupt persistence envelope (${label}): not an object`, {
      details: { code: "persistence_corrupt" },
    });
  }
  const version = (parsed as { schemaVersion?: unknown }).schemaVersion;
  if (version === undefined) {
    throw new DiffWitnessError(
      "analysis",
      `Malformed persistence envelope (${label}): missing schemaVersion`,
      { details: { code: "persistence_missing_version" } },
    );
  }
  if (version !== PERSISTENCE_SCHEMA_VERSION) {
    throw new DiffWitnessError(
      "analysis",
      `Unsupported persistence schemaVersion ${String(version)} for ${label} (expected ${PERSISTENCE_SCHEMA_VERSION}) — fail closed`,
      {
        details: {
          code: "unsupported_persistence_version",
          schemaVersion: version,
          expected: PERSISTENCE_SCHEMA_VERSION,
        },
      },
    );
  }
}

export function parseBaseline(input: unknown): Baseline {
  const parsed = baselineSchema.safeParse(input);
  if (!parsed.success) {
    throw new DiffWitnessError("analysis", "Malformed Baseline payload", {
      details: { issues: parsed.error.issues },
    });
  }
  const d = parsed.data;
  return {
    id: asBaselineId(d.id),
    createdAt: d.createdAt,
    git: {
      dirty: d.git.dirty,
      ...(d.git.headSha !== undefined ? { headSha: d.git.headSha } : {}),
      ...(d.git.baseSha !== undefined ? { baseSha: d.git.baseSha } : {}),
      ...(d.git.mergeBase !== undefined ? { mergeBase: d.git.mergeBase } : {}),
    },
    envFingerprint: d.envFingerprint,
    workflowIds: d.workflowIds.map(asWorkflowId),
    evidenceIds: d.evidenceIds.map(asEvidenceId),
  };
}

export class EvidenceStore {
  constructor(
    private readonly storage: StoragePort,
    private readonly repoRoot: string,
  ) {}

  private diffwitnessDir(): string {
    return path.join(this.repoRoot, DIFFWITNESS_DIR);
  }

  blobPath(digest: string): string {
    const safe = digest.replace(/[^a-zA-Z0-9:_-]/g, "_");
    return path.join(this.diffwitnessDir(), "blobs", safe);
  }

  evidencePath(id: EvidenceId | string): string {
    return path.join(this.diffwitnessDir(), "evidence", `${id}.json`);
  }

  baselinePath(id: BaselineId | string): string {
    return path.join(this.diffwitnessDir(), "baselines", `${id}.json`);
  }

  activePath(): string {
    return path.join(this.diffwitnessDir(), "baselines", ACTIVE_BASELINE_FILENAME);
  }

  behavioralDiffPath(id: string): string {
    const safe = id.replace(/[^a-zA-Z0-9:_-]/g, "_");
    return path.join(this.diffwitnessDir(), "runs", `${safe}.json`);
  }

  lastCheckPath(): string {
    return path.join(this.diffwitnessDir(), "runs", "last-check.json");
  }

  async putBlob(digest: string, bytes: Buffer): Promise<void> {
    const filePath = this.blobPath(digest);
    if (await this.storage.exists(filePath)) {
      const existing = await this.storage.readBytes(filePath);
      if (!existing.equals(bytes)) {
        throw new DiffWitnessError(
          "storage",
          `Blob digest collision with different content: ${digest}`,
        );
      }
      return;
    }
    await this.storage.writeBytes(filePath, bytes);
  }

  async putEvidence(evidence: Evidence): Promise<void> {
    parseEvidence(evidence);
    const envelope = {
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      kind: "evidence" as const,
      evidence,
    };
    const body = `${JSON.stringify(envelope, null, 2)}\n`;
    await this.storage.writeText(this.evidencePath(evidence.id), body);
  }

  async getEvidence(id: EvidenceId | string): Promise<Evidence> {
    const raw = await this.storage.readText(this.evidencePath(id));
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DiffWitnessError("analysis", `Corrupt evidence JSON: ${id}`, {
        cause,
        details: { code: "persistence_corrupt" },
      });
    }
    assertPersistenceSchemaVersion(parsed, `evidence:${id}`);
    const envelope = evidenceEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      throw new DiffWitnessError("analysis", `Malformed evidence envelope: ${id}`, {
        details: { code: "persistence_malformed", issues: envelope.error.issues },
      });
    }
    return parseEvidence(envelope.data.evidence);
  }

  /**
   * Persist Baseline then atomically update active pointer.
   * Active is never written before the baseline blob is durable.
   * On interrupt mid-write, FsStorage tmp+rename leaves prior active intact.
   */
  async putBaseline(
    baseline: Baseline,
    options: { force: boolean; beforeWrite?: () => void },
  ): Promise<void> {
    parseBaseline(baseline);
    const beforeWrite = options.beforeWrite ?? (() => {});

    const activePath = this.activePath();
    const activeExists = await this.storage.exists(activePath);
    if (activeExists && !options.force) {
      throw new DiffWitnessError(
        "storage",
        "Active baseline already exists (pass --force to supersede)",
        {
          exitClass: "user_error",
          details: { code: "baseline_exists" },
        },
      );
    }

    const envelope = {
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      kind: "baseline" as const,
      baseline,
    };
    const body = `${JSON.stringify(envelope, null, 2)}\n`;
    // Baseline record first — if interrupted here, active pointer unchanged.
    beforeWrite();
    await this.storage.writeText(this.baselinePath(baseline.id), body);

    const pointer = {
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      kind: "active_baseline" as const,
      baselineId: baseline.id,
    };
    // Atomic rename inside FsStorage — no half-written active.json.
    beforeWrite();
    await this.storage.writeText(activePath, `${JSON.stringify(pointer, null, 2)}\n`, {
      overwrite: true,
    });
  }

  async getBaseline(id: BaselineId | string): Promise<Baseline> {
    const raw = await this.storage.readText(this.baselinePath(id));
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DiffWitnessError("analysis", `Corrupt baseline JSON: ${id}`, {
        cause,
        details: { code: "persistence_corrupt" },
      });
    }
    assertPersistenceSchemaVersion(parsed, `baseline:${id}`);
    const envelope = baselineEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      throw new DiffWitnessError("analysis", `Malformed baseline envelope: ${id}`, {
        details: { code: "persistence_malformed", issues: envelope.error.issues },
      });
    }
    return parseBaseline(envelope.data.baseline);
  }

  async getActiveBaselineId(): Promise<string | null> {
    const activePath = this.activePath();
    if (!(await this.storage.exists(activePath))) {
      return null;
    }
    const raw = await this.storage.readText(activePath);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DiffWitnessError("analysis", "Corrupt active baseline pointer", {
        cause,
        details: { code: "persistence_corrupt" },
      });
    }
    assertPersistenceSchemaVersion(parsed, "active_baseline");
    const pointer = activePointerSchema.safeParse(parsed);
    if (!pointer.success) {
      throw new DiffWitnessError("analysis", "Malformed active baseline pointer", {
        details: { code: "persistence_malformed", issues: pointer.error.issues },
      });
    }
    return pointer.data.baselineId;
  }

  /**
   * Persist BehavioralDiff under runs/. Does not touch baselines/active.json.
   */
  async putBehavioralDiff(
    diff: BehavioralDiff,
    options?: { beforeWrite?: () => void },
  ): Promise<void> {
    parseBehavioralDiff(diff);
    const beforeWrite = options?.beforeWrite ?? (() => {});
    const envelope = {
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      kind: "behavioral_diff" as const,
      behavioralDiff: diff,
    };
    const body = `${JSON.stringify(envelope, null, 2)}\n`;
    // Diff ids are content-derived; identical re-runs may rewrite the same path.
    beforeWrite();
    await this.storage.writeText(this.behavioralDiffPath(diff.id), body, { overwrite: true });
    beforeWrite();
    await this.storage.writeText(this.lastCheckPath(), body, { overwrite: true });
  }

  /**
   * Replace last-check.json with a `check_incomplete` marker so `explain` can never present the
   * previous run's BehavioralDiff as the current result. Called when a check starts; a completed
   * check overwrites the marker. No-op when there is no previous result.
   */
  async invalidateLastBehavioralDiff(reason: string): Promise<void> {
    const lastPath = this.lastCheckPath();
    if (!(await this.storage.exists(lastPath))) {
      return;
    }
    const marker = {
      schemaVersion: PERSISTENCE_SCHEMA_VERSION,
      kind: "check_incomplete" as const,
      reason,
    };
    await this.storage.writeText(lastPath, `${JSON.stringify(marker, null, 2)}\n`, {
      overwrite: true,
    });
  }

  /** Throws `check_incomplete` (user_error) when the most recent check did not complete. */
  async getLastBehavioralDiff(): Promise<BehavioralDiff | null> {
    const lastPath = this.lastCheckPath();
    if (!(await this.storage.exists(lastPath))) {
      return null;
    }
    return this.readBehavioralDiffFile(lastPath, "last-check");
  }

  async getBehavioralDiffById(id: string): Promise<BehavioralDiff | null> {
    const filePath = this.behavioralDiffPath(id);
    if (!(await this.storage.exists(filePath))) {
      return null;
    }
    return this.readBehavioralDiffFile(filePath, id);
  }

  private async readBehavioralDiffFile(
    filePath: string,
    label: string,
  ): Promise<BehavioralDiff> {
    const raw = await this.storage.readText(filePath);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DiffWitnessError("analysis", `Corrupt behavioral_diff JSON: ${label}`, {
        cause,
        details: { code: "persistence_corrupt" },
      });
    }
    assertPersistenceSchemaVersion(parsed, `behavioral_diff:${label}`);
    const marker = checkIncompleteMarkerSchema.safeParse(parsed);
    if (marker.success) {
      throw new DiffWitnessError(
        "storage",
        "The most recent check did not complete (failed or interrupted); there is no current BehavioralDiff to explain — re-run `diffwitness check` (code: check_incomplete)",
        { exitClass: "user_error", details: { code: "check_incomplete", reason: marker.data.reason } },
      );
    }
    const envelope = behavioralDiffEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      throw new DiffWitnessError("analysis", `Malformed behavioral_diff envelope: ${label}`, {
        details: { code: "persistence_malformed", issues: envelope.error.issues },
      });
    }
    return parseBehavioralDiff(envelope.data.behavioralDiff);
  }
}
