import { DiffWitnessError } from "../../domain/errors.js";
import type { ChangeLocation, ChangedFile, ChangedFileStatus } from "../../domain/change-surface.js";

/**
 * Pure parsers for `git diff` / `git ls-files` output. When `truncated` is true the
 * trailing (possibly partial) record is dropped — never guessed.
 */

function zTokens(stdout: string): string[] {
  const tokens = stdout.split("\0");
  // Complete -z output ends with NUL → final token is "". Truncated output ends mid-token.
  // Either way the last token is dropped; incomplete trailing records stop the parsers.
  tokens.pop();
  return tokens;
}

/** `git diff --name-status -z -M <base>` */
export function parseNameStatusZ(stdout: string): ChangedFile[] {
  const tokens = zTokens(stdout);
  const files: ChangedFile[] = [];
  let i = 0;
  while (i < tokens.length) {
    const code = tokens[i] ?? "";
    const letter = code.charAt(0);
    if (letter === "R" || letter === "C") {
      const oldPath = tokens[i + 1];
      const newPath = tokens[i + 2];
      if (oldPath === undefined || newPath === undefined) break;
      files.push(
        letter === "R"
          ? { path: newPath, status: "renamed", oldPath }
          : { path: newPath, status: "added" },
      );
      i += 3;
      continue;
    }
    const filePath = tokens[i + 1];
    if (filePath === undefined) break;
    files.push({ path: filePath, status: statusForLetter(letter, code) });
    i += 2;
  }
  return files;
}

function statusForLetter(letter: string, code: string): ChangedFileStatus {
  switch (letter) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "M":
    case "T":
    case "U":
      return "modified";
    default:
      throw new DiffWitnessError("repo", `Unrecognized git name-status code: ${code}`);
  }
}

export interface NumstatEntry {
  readonly additions?: number;
  readonly deletions?: number;
}

/** `git diff --numstat -z -M <base>` → counts keyed by (new) path. Binary files have no counts. */
export function parseNumstatZ(stdout: string): Map<string, NumstatEntry> {
  const tokens = zTokens(stdout);
  const out = new Map<string, NumstatEntry>();
  let i = 0;
  while (i < tokens.length) {
    const parts = (tokens[i] ?? "").split("\t");
    if (parts.length < 3) break;
    const [added = "", deleted = "", inlinePath = ""] = parts;
    let filePath = inlinePath;
    let consumed = 1;
    if (inlinePath === "") {
      // Rename: "<a>\t<d>\t\0<old>\0<new>\0"
      const newPath = tokens[i + 2];
      if (newPath === undefined) break;
      filePath = newPath;
      consumed = 3;
    }
    out.set(filePath, {
      ...(isCount(added) ? { additions: Number(added) } : {}),
      ...(isCount(deleted) ? { deletions: Number(deleted) } : {}),
    });
    i += consumed;
  }
  return out;
}

function isCount(value: string): boolean {
  return /^\d+$/.test(value);
}

/** `git ls-files --others --exclude-standard -z` */
export function parseUntrackedZ(stdout: string): string[] {
  return zTokens(stdout).filter((p) => p.length > 0);
}

export interface HunkParseResult {
  readonly locations: ChangeLocation[];
  /** False when some hunks could not be attributed to a path (quoted names, truncated output). */
  readonly complete: boolean;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/**
 * `git diff --unified=0 --src-prefix=a/ --dst-prefix=b/ <base>` hunk headers → locations.
 * Body lines are skipped by count (unified=0 has no context), so content that looks like a
 * header ("--- x") cannot be misread. Content is never retained.
 */
export function parseUnifiedZeroHunks(stdout: string, truncated: boolean): HunkParseResult {
  const lines = stdout.split("\n");
  if (truncated) lines.pop();
  const locations: ChangeLocation[] = [];
  let complete = !truncated;
  let minusPath: string | null = null;
  let currentPath: string | null = null;
  let bodyRemaining = 0;

  for (const line of lines) {
    if (bodyRemaining > 0) {
      if (!line.startsWith("\\")) bodyRemaining -= 1;
      continue;
    }
    if (line.startsWith("diff --git ")) {
      minusPath = null;
      currentPath = null;
    } else if (line.startsWith("--- ")) {
      const header = headerPath(line.slice(4), "a/");
      minusPath = header === DEV_NULL ? null : header;
    } else if (line.startsWith("+++ ")) {
      const header = headerPath(line.slice(4), "b/");
      currentPath = header === DEV_NULL ? minusPath : header;
    } else {
      const m = HUNK_HEADER.exec(line);
      if (m === null) continue;
      const baseLines = m[2] === undefined ? 1 : Number(m[2]);
      const currentLines = m[4] === undefined ? 1 : Number(m[4]);
      bodyRemaining = baseLines + currentLines;
      if (currentPath === null) {
        complete = false;
        continue;
      }
      locations.push({
        path: currentPath,
        baseStart: Number(m[1]),
        baseLines,
        currentStart: Number(m[3]),
        currentLines,
      });
    }
  }
  return { locations, complete };
}

const DEV_NULL = Symbol("dev-null");

/** C-quoted or unexpected names return null (not decoded — attribution skipped, never guessed). */
function headerPath(raw: string, prefix: string): string | null | typeof DEV_NULL {
  const value = raw.endsWith("\t") ? raw.slice(0, -1) : raw;
  if (value === "/dev/null") {
    return DEV_NULL;
  }
  if (value.startsWith('"') || !value.startsWith(prefix)) {
    return null;
  }
  return value.slice(prefix.length);
}
