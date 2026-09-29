import { randomUUID } from "node:crypto";

/** Injectable ID factory — volatile IDs are excluded from determinism comparisons. */
export interface IdGenerator {
  next(prefix: string): string;
}

export class UuidIdGenerator implements IdGenerator {
  next(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }
}
