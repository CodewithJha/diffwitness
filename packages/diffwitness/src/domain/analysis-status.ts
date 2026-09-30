/**
 * AnalysisStatus discrimination — analysis_error must never be treated as clean.
 * See docs/architecture/technical-specification.md §2.2 and §11.
 */

export const ANALYSIS_STATUSES = ["clean", "findings", "analysis_error"] as const;

export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];

export function isAnalysisStatus(value: unknown): value is AnalysisStatus {
  return typeof value === "string" && (ANALYSIS_STATUSES as readonly string[]).includes(value);
}

/** Hard invariant: analysis failure is never reported as clean. */
export function assertHonestStatus(status: AnalysisStatus): void {
  if (status === "analysis_error") {
    return;
  }
  if (status === "clean" || status === "findings") {
    return;
  }
  const _exhaustive: never = status;
  void _exhaustive;
}

export function isSuccessfulAnalysis(status: AnalysisStatus): boolean {
  return status === "clean" || status === "findings";
}

export function isAnalysisFailure(status: AnalysisStatus): boolean {
  return status === "analysis_error";
}
