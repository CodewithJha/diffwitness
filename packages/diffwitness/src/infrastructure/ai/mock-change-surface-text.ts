import type { ChangedFile } from "../../domain/change-surface.js";
import type { ExplanationFact, PacketChangeSurface } from "../../domain/types.js";

/** Deterministic change-surface wording for MockAIProvider. Co-occurrence only, never cause. */

export const CAUSALITY_CAVEAT =
  "Causality: not established — change-surface files co-occurred with the findings; DiffWitness does not claim any of them caused a finding.";

const MAX_NAMED_FILES = 5;

export function changeSurfaceFact(surface: PacketChangeSurface): ExplanationFact {
  return { claim: changeSurfaceClaim(surface), evidenceIds: [] };
}

function changeSurfaceClaim(s: PacketChangeSurface): string {
  if (s.associationStatus !== "associated") {
    return `Git change surface is ${s.associationStatus} (${s.limitation ?? "no detail"}); findings are not associated with any file.`;
  }
  const range = `baseline commit ${short(s.baseRevision)} and executed state ${short(s.currentRevision)}${s.workingTreeIncluded ? " + working tree" : ""}`;
  if (s.filesTotal === 0) {
    return `Git change surface is empty: no source change detected between ${range}. DiffWitness does not infer why behavior changed.`;
  }
  const named = s.files.slice(0, MAX_NAMED_FILES).map(describeFile).join(", ");
  const rest = s.filesTotal - Math.min(s.files.length, MAX_NAMED_FILES);
  return `Git change surface: ${s.filesTotal} file(s) differ between ${range}: ${named}${rest > 0 ? ` (+${rest} more)` : ""}. Co-occurrence only.`;
}

export function changeSurfaceNarrative(s: PacketChangeSurface): string[] {
  const lines = ["CHANGE SURFACE (Git; co-occurrence only):"];
  if (s.associationStatus !== "associated") {
    lines.push(`- ${s.associationStatus}: ${s.limitation ?? "no detail"}`);
  } else if (s.filesTotal === 0) {
    lines.push("- (empty) no source change vs baseline commit");
  } else {
    lines.push(...s.files.map((f) => `- ${describeFile(f)}`));
    if (s.truncated) {
      lines.push(`- … truncated (${s.files.length} of ${s.filesTotal} file(s) in packet)`);
    }
  }
  lines.push("CAUSALITY: not established");
  return lines;
}

export function hypothesisClaim(workflowId: string, observationKey: string, s: PacketChangeSurface | undefined): string {
  const subject = `Observable change on workflow ${workflowId} key ${observationKey}`;
  if (s === undefined || s.associationStatus !== "associated") {
    return `${subject} may relate to declared assumptions or recent edits — not proven by DiffEngine.`;
  }
  if (s.filesTotal === 0) {
    return `${subject} occurred with no source change vs the baseline commit; the reason is unknown and not inferred.`;
  }
  return `${subject} may relate to one or more of the ${s.filesTotal} co-occurring changed file(s) — unverified; causality not established.`;
}

function describeFile(f: ChangedFile): string {
  const name = f.oldPath !== undefined ? `${f.oldPath} → ${f.path}` : f.path;
  return `${f.status} ${name}${f.untracked === true ? " (untracked)" : ""}`;
}

function short(sha: string | null): string {
  return sha === null ? "(none)" : sha.slice(0, 12);
}
