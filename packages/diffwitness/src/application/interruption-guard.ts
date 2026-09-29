import { interruptedError } from "../domain/errors.js";
import type { Interruption } from "../ports/interruption.js";

/** Throw the interrupted error if the CLI received SIGINT/SIGTERM. Call right before persisting. */
export function assertNotInterrupted(interruption: Interruption | undefined, stage: string): void {
  const signal = interruption?.signal ?? null;
  if (signal !== null) {
    throw interruptedError(signal, stage);
  }
}
