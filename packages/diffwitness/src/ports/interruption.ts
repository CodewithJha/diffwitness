import type { InterruptSignal } from "../domain/errors.js";

/**
 * Explicit interruption state for one CLI run.
 * Set only when the DiffWitness process itself receives SIGINT/SIGTERM — never inferred from a
 * child's exit code (a child exiting 130 on its own is ordinary behavior).
 */
export interface Interruption {
  /** First interrupt signal received by this process, or null. */
  readonly signal: InterruptSignal | null;
  /** Subscribe to interrupts (called for every received signal). Returns unsubscribe. */
  onInterrupt(listener: (signal: InterruptSignal) => void): () => void;
}
