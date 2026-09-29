import type { EvidencePacket } from "../domain/types.js";

/** Patterns applied to preview / path / summary-adjacent text before provider handoff. */
const REDACTION_RULES: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  {
    name: "bearer",
    pattern: /\bBearer\s+[A-Za-z0-9._\-+=/]{8,}/gi,
  },
  {
    name: "jwt",
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  },
  {
    name: "aws_key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    name: "assignment",
    pattern:
      /\b(?:api[_-]?key|token|secret|password|passwd|authorization)\s*[:=]\s*["']?[^\s"'\\]{6,}/gi,
  },
];

/**
 * Redact sensitive substrings in packet previews/paths before any AiProvider sees them.
 * Never mutates Finding/Evidence IDs. Deterministic.
 */
export function redactExplanationPacket(packet: EvidencePacket): EvidencePacket {
  let applied = packet.redactionApplied;

  const redactText = (text: string): string => {
    let out = text;
    for (const rule of REDACTION_RULES) {
      const next = out.replace(rule.pattern, `[REDACTED:${rule.name}]`);
      if (next !== out) {
        applied = true;
        out = next;
      }
    }
    return out;
  };

  const evidenceExcerpts = packet.evidenceExcerpts.map((e) => ({
    ...e,
    preview: redactText(e.preview),
  }));

  const findings = packet.findings.map((f) => ({
    ...f,
    summary: redactText(f.summary),
  }));

  const assumptions = packet.assumptions.map((a) => ({
    ...a,
    description: redactText(a.description),
  }));

  const changeSurface =
    packet.changeSurface !== undefined
      ? {
          ...packet.changeSurface,
          files: packet.changeSurface.files.map((f) => ({
            ...f,
            path: redactText(f.path),
            ...(f.oldPath !== undefined ? { oldPath: redactText(f.oldPath) } : {}),
          })),
        }
      : undefined;

  return {
    ...packet,
    findings,
    evidenceExcerpts,
    assumptions,
    ...(changeSurface !== undefined ? { changeSurface } : {}),
    redactionApplied: applied,
  };
}
