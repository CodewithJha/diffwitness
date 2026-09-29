import { isAnalysisFailure } from "./analysis-status.js";
import { DiffWitnessError } from "./errors.js";
import {
  CAUSAL_PHRASES,
  CLEAN_CLAIM_PHRASES,
  containsForbiddenWording,
  findUnqualifiedPhrase,
  stripQuotedPacketText,
} from "./explanation-wording.js";
import type { EvidencePacket, Explanation } from "./types.js";

interface ExplanationText {
  readonly field: string;
  readonly text: string;
  /** Hypotheses may speculate ("may have caused"); no other field may. */
  readonly allowHedge: boolean;
}

/**
 * Semantic checks after schema + citation validation. Shared final gate for every provider
 * (MockAI, Featherless, injected) — applied to EVERY user-visible model-generated string:
 * narrative, facts, hypotheses, citation claims, caveats, promptVersion, modelId.
 *
 * - Causality is never asserted (with or without a change surface); hypotheses may hedge.
 * - An analysis_error packet is never described as clean / passing / safe / regression-free.
 */
export function validateExplanationSemantics(
  explanation: Explanation,
  packet: EvidencePacket,
): void {
  const quotes = forbiddenPacketQuotes(packet);
  const texts = explanationTexts(explanation).map((t) => ({
    ...t,
    text: stripQuotedPacketText(t.text, quotes),
  }));

  if (isAnalysisFailure(packet.status)) {
    for (const t of texts) {
      const violation = findUnqualifiedPhrase(t.text, CLEAN_CLAIM_PHRASES, { allowHedge: false });
      if (violation !== null) {
        throw semanticError(
          `Explanation semantics invalid: analysis_error packet must not claim a clean bill of health (${t.field}: "${violation.phrase}")`,
          "analysis_error_clean_claim",
          t.field,
        );
      }
    }
  }

  for (const t of texts) {
    const violation = findUnqualifiedPhrase(t.text, CAUSAL_PHRASES, { allowHedge: t.allowHedge });
    if (violation !== null) {
      throw semanticError(
        `Explanation semantics invalid: explanations must not claim causality — change-surface membership is co-occurrence only (${t.field}: "${violation.phrase}")`,
        "causal_claim",
        t.field,
      );
    }
  }

  if (packet.status === "findings" && packet.findings.length > 0) {
    if (explanation.citations.length === 0 && explanation.facts.length === 0) {
      throw semanticError(
        "Explanation semantics invalid: findings packet requires facts or citations",
        "findings_without_facts",
        "facts",
      );
    }
  }

  if (explanation.promptVersion.trim().length === 0) {
    throw new DiffWitnessError("provider", "Explanation missing promptVersion", {
      exitClass: "explain_error",
      details: { code: "schema_validation_error" },
    });
  }
}

function explanationTexts(explanation: Explanation): ExplanationText[] {
  return [
    { field: "narrative", text: explanation.narrative, allowHedge: false },
    ...explanation.facts.map((f, i) => ({ field: `facts[${i}]`, text: f.claim, allowHedge: false })),
    ...explanation.hypotheses.map((h, i) => ({
      field: `hypotheses[${i}]`,
      text: h.claim,
      allowHedge: true,
    })),
    ...explanation.citations.map((c, i) => ({
      field: `citations[${i}]`,
      text: c.claim,
      allowHedge: false,
    })),
    ...explanation.caveats.map((c, i) => ({ field: `caveats[${i}]`, text: c, allowHedge: false })),
    // A live model may echo its own metadata; both are printed / serialized.
    { field: "promptVersion", text: explanation.promptVersion, allowHedge: false },
    ...(explanation.modelId !== undefined
      ? [{ field: "modelId", text: explanation.modelId, allowHedge: false }]
      : []),
  ];
}

/** Packet strings (evidence / paths / summaries) that a faithful quote could legitimately repeat. */
function forbiddenPacketQuotes(packet: EvidencePacket): string[] {
  const raw: string[] = [];
  for (const e of packet.evidenceExcerpts) {
    const json = JSON.stringify(e.preview);
    raw.push(json, json.slice(1, -1), e.preview, e.observationKey);
  }
  for (const f of packet.findings) {
    raw.push(f.summary, f.observationKey, f.workflowId, f.id);
  }
  for (const a of packet.assumptions) {
    raw.push(a.description, a.id);
  }
  const surface = packet.changeSurface;
  if (surface !== undefined) {
    if (surface.limitation !== null) raw.push(surface.limitation);
    for (const file of surface.files) {
      raw.push(file.path);
      if (file.oldPath !== undefined) raw.push(file.oldPath);
    }
  }
  const unique = [...new Set(raw.filter((s) => s.length > 0 && containsForbiddenWording(s)))];
  // Longest first so a quote containing a shorter quote is removed whole.
  return unique.sort((a, b) => b.length - a.length);
}

function semanticError(message: string, reason: string, field: string): DiffWitnessError {
  return new DiffWitnessError("provider", message, {
    exitClass: "explain_error",
    details: { code: "schema_validation_error", reason, field },
  });
}
