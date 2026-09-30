/**
 * Explicit error model for DiffWitness.
 * Categories map to CLI exit classes without collapsing analysis failure into "clean".
 */

export type ErrorCategory =
  | "config"
  | "repo"
  | "storage"
  | "execution"
  | "analysis"
  | "provider"
  | "internal";

/** CLI exit classes from docs/reference/cli.md */
export type ExitClass =
  | "success"
  | "findings"
  | "user_error"
  | "analysis_error"
  | "explain_error"
  | "interrupted"
  | "terminated";

/** Signals the CLI treats as a user/operator interruption. */
export type InterruptSignal = "SIGINT" | "SIGTERM";

const CATEGORY_EXIT: Record<ErrorCategory, ExitClass> = {
  config: "user_error",
  repo: "user_error",
  storage: "analysis_error",
  execution: "analysis_error",
  analysis: "analysis_error",
  provider: "explain_error",
  internal: "analysis_error",
};

export const EXIT_CODES: Record<ExitClass, number> = {
  success: 0,
  findings: 1,
  user_error: 2,
  analysis_error: 3,
  explain_error: 4,
  interrupted: 130,
  terminated: 143,
};

/** 128 + signal number: SIGINT → 130, SIGTERM → 143. */
export function exitClassForSignal(signal: InterruptSignal): ExitClass {
  return signal === "SIGTERM" ? "terminated" : "interrupted";
}

export function exitCodeForSignal(signal: InterruptSignal): number {
  return EXIT_CODES[exitClassForSignal(signal)];
}

export function isInterruptionExitCode(code: number): boolean {
  return code === EXIT_CODES.interrupted || code === EXIT_CODES.terminated;
}

export class DiffWitnessError extends Error {
  readonly category: ErrorCategory;
  readonly exitClass: ExitClass;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    category: ErrorCategory,
    message: string,
    options?: { cause?: unknown; details?: Readonly<Record<string, unknown>>; exitClass?: ExitClass },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "DiffWitnessError";
    this.category = category;
    this.exitClass = options?.exitClass ?? CATEGORY_EXIT[category];
    if (options?.details !== undefined) {
      this.details = options.details;
    }
  }

  get exitCode(): number {
    return EXIT_CODES[this.exitClass];
  }
}

export function isDiffWitnessError(value: unknown): value is DiffWitnessError {
  return value instanceof DiffWitnessError;
}

/** The run was interrupted; nothing from this run may be persisted or reported as a result. */
export function interruptedError(signal: InterruptSignal, stage: string): DiffWitnessError {
  return new DiffWitnessError(
    "execution",
    `Interrupted by ${signal} during ${stage} — no baseline or check result was saved`,
    { exitClass: exitClassForSignal(signal), details: { code: "interrupted", signal, stage } },
  );
}

export function exitCodeForError(error: unknown): number {
  if (isDiffWitnessError(error)) {
    return error.exitCode;
  }
  return EXIT_CODES.analysis_error;
}
