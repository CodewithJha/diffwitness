import type { EvidencePacket, Explanation } from "../domain/types.js";

export interface ExplainOptions {
  readonly modelId?: string;
}

/**
 * AI explains EvidencePacket only. No shell, Git, or filesystem tools.
 * Implementations must not invent unobserved behavior.
 */
export interface AiProvider {
  readonly name: string;
  explain(packet: EvidencePacket, opts?: ExplainOptions): Promise<Explanation>;
}
