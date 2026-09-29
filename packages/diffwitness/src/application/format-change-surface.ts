import type { ChangeLocation, ChangeSurface, ChangedFile } from "../domain/change-surface.js";
import type { Finding } from "../domain/types.js";

/** Terminal output bounds — the full (bounded) surface is always in --json. */
export const TERMINAL_MAX_FILES = 10;
const TERMINAL_MAX_HUNKS_PER_FILE = 3;

const STATUS_LETTER: Record<ChangedFile["status"], string> = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
};

/**
 * Compact "Change surface / Association / Causality" block for check and ci human output.
 * Git facts, DiffWitness association, and the causality limitation are printed as separate lines.
 */
export function formatChangeSurfaceHuman(
  surface: ChangeSurface,
  findings: readonly Finding[],
): string[] {
  const lines: string[] = [];
  if (surface.associationStatus === "associated" || surface.files.length > 0) {
    lines.push(...formatFiles(surface));
  } else {
    lines.push(`Change surface (Git): ${surface.associationStatus} — ${surface.limitation ?? "no detail"}`);
  }
  lines.push(formatAssociation(surface, findings));
  lines.push(
    "Causality: not established — change-surface membership means co-occurrence only, not that a file caused a finding.",
  );
  return lines;
}

function formatFiles(surface: ChangeSurface): string[] {
  const t = surface.truncation;
  const header =
    `Change surface (Git: baseline ${short(surface.baseRevision)} → current ${short(surface.currentRevision)}` +
    `${surface.workingTreeIncluded ? " + working tree" : ""}): ${t.filesTotal} file(s)`;
  if (t.filesTotal === 0) {
    return [`${header} — no source changes vs baseline commit`];
  }
  const hunksByPath = groupLocations(surface.locations);
  const shown = surface.files.slice(0, TERMINAL_MAX_FILES);
  const lines = [header, ...shown.map((f) => `  ${formatFile(f, hunksByPath.get(f.path) ?? [])}`)];
  const hidden = t.filesTotal - shown.length;
  if (hidden > 0) {
    lines.push(`  … ${hidden} more file(s) not shown${t.filesIncluded < t.filesTotal ? " (surface truncated)" : " (see --json)"}`);
  }
  if (t.truncated) {
    lines.push(
      `  Truncated: yes (limits: files=${t.limits.maxChangedFiles}, locations=${t.limits.maxLocations}${t.gitOutputCapped ? ", git output capped — counts are lower bounds" : ""}${t.omittedLongPaths > 0 ? `, ${t.omittedLongPaths} over-long path(s) omitted` : ""})`,
    );
  }
  if (surface.associationStatus !== "associated" && surface.limitation !== null) {
    lines.push(`  Note: ${surface.limitation}`);
  }
  return lines;
}

function formatFile(file: ChangedFile, hunks: readonly ChangeLocation[]): string {
  const name = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  const parts = [`${STATUS_LETTER[file.status]}  ${name}`];
  if (file.untracked === true) {
    parts.push("(untracked)");
  }
  if (file.additions !== undefined || file.deletions !== undefined) {
    parts.push(`+${file.additions ?? "?"} -${file.deletions ?? "?"}`);
  }
  if (hunks.length > 0) {
    const listed = hunks.slice(0, TERMINAL_MAX_HUNKS_PER_FILE).map(formatHunk).join("; ");
    const more = hunks.length > TERMINAL_MAX_HUNKS_PER_FILE ? `; +${hunks.length - TERMINAL_MAX_HUNKS_PER_FILE} more` : "";
    parts.push(`(hunks: ${listed}${more})`);
  }
  return parts.join("  ");
}

function formatHunk(h: ChangeLocation): string {
  const side = (start: number, count: number) => (count === 1 ? `${start}` : `${start},${count}`);
  return `-${side(h.baseStart, h.baseLines)} +${side(h.currentStart, h.currentLines)}`;
}

function formatAssociation(surface: ChangeSurface, findings: readonly Finding[]): string {
  if (findings.length === 0) {
    return "Association: not applicable — no findings";
  }
  const associated = findings.filter((f) => f.associationStatus === "associated");
  if (associated.length === 0) {
    return `Association: ${surface.associationStatus} — 0 of ${findings.length} finding(s) associated`;
  }
  const workflows = [...new Set(associated.map((f) => f.workflowId as string))].sort().join(", ");
  const state = `${short(surface.currentRevision)}${surface.workingTreeIncluded ? " + working tree" : ""}`;
  return `Association: ${associated.length} of ${findings.length} finding(s) co-occurred with this change surface (workflow ${workflows} @ source state ${state})`;
}

function groupLocations(locations: readonly ChangeLocation[]): Map<string, ChangeLocation[]> {
  const map = new Map<string, ChangeLocation[]>();
  for (const l of locations) {
    const list = map.get(l.path) ?? [];
    list.push(l);
    map.set(l.path, list);
  }
  return map;
}

function short(sha: string | null): string {
  return sha === null ? "(none)" : sha.slice(0, 12);
}
