import { exitCodeForSignal, type InterruptSignal } from "../../domain/errors.js";
import type { Interruption } from "../../ports/interruption.js";

type Listener = (signal: InterruptSignal) => void;

/**
 * Process-level SIGINT/SIGTERM handling for one CLI run.
 *
 * First signal: records the interruption and notifies listeners (the executor kills workflow
 * process groups; use cases refuse to persist). The CLI then exits 130 (SIGINT) / 143 (SIGTERM).
 * Repeated signal: notifies listeners again, then exits immediately with the same code.
 */
export class InterruptController implements Interruption {
  private received: InterruptSignal | null = null;
  private readonly listeners = new Set<Listener>();
  private installed = false;
  private readonly handler = (signal: NodeJS.Signals): void => {
    const normalized: InterruptSignal = signal === "SIGTERM" ? "SIGTERM" : "SIGINT";
    const repeated = this.received !== null;
    this.trigger(normalized);
    if (repeated && this.received !== null) {
      process.exit(exitCodeForSignal(this.received));
    }
  };

  get signal(): InterruptSignal | null {
    return this.received;
  }

  onInterrupt(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Record an interruption (first signal wins) and notify listeners. */
  trigger(signal: InterruptSignal): void {
    if (this.received === null) {
      this.received = signal;
    }
    for (const listener of [...this.listeners]) {
      try {
        listener(signal);
      } catch {
        // Cleanup listeners must not prevent other listeners from running.
      }
    }
  }

  install(): void {
    if (this.installed) {
      return;
    }
    this.installed = true;
    process.on("SIGINT", this.handler);
    process.on("SIGTERM", this.handler);
  }

  uninstall(): void {
    if (!this.installed) {
      return;
    }
    process.off("SIGINT", this.handler);
    process.off("SIGTERM", this.handler);
    this.installed = false;
  }
}
