/**
 * Wording rules for model-generated explanation text (domain; no I/O).
 *
 * A forbidden phrase is accepted only when the same clause negates it epistemically
 * ("does not claim … caused", "no evidence that … caused", "not established that …") or negates it
 * directly ("was not caused by"). In hypotheses a preceding hedge ("may have caused") is also
 * accepted; everywhere else causality must not be asserted at all.
 */

/** Causal-certainty phrasing. */
export const CAUSAL_PHRASES =
  /\b(?:caus(?:ed|es|ing)|cause of|root[- ]causes?|due to|because|result(?:ed|s|ing)? (?:in|from)|as a result of|trigger(?:ed|s|ing)?|(?:led|leads|leading) to|responsible for|introduced by|attribut(?:able|ed) to|stem(?:s|med|ming)? from|originat(?:es|ed|ing) from|explains? why)\b/gi;

/** Claims that must never accompany an analysis_error packet (it is not a bill of health). */
export const CLEAN_CLAIM_PHRASES =
  /\b(?:safe to (?:merge|ship|deploy|release)|(?:is|are|looks?|seems?) (?:safe|fine|good|ok|okay)|no (?:known |detected |behavioral |observable |new )?(?:issues?|problems?|regressions?|changes?|differences?|findings?)|absence of (?:regressions?|issues?|problems?)|nothing (?:changed|to worry about|is wrong)|all (?:good|clear|checks passed)|clean(?: bill of health)?|pass(?:ed|es|ing)?|successful(?:ly)?|succeeded|verified|healthy)\b/gi;

/** Clause boundaries: punctuation, dashes, and conjunctions that can detach a negation. */
const CLAUSE_SPLIT =
  /[.;:!?]+(?=\s|$)|[\n\r\u2014\u2013]+|,\s|\s(?:but|however|yet|although|though|whereas|while|and)\s/i;
const WINDOW_WORDS = 6;

/** "was not caused by", "is not a clean …", "cannot be verified" — negation right before the phrase. */
const DIRECT_NEGATION =
  /\b(?:not|never|cannot|can't)\s+(?:(?:be|been|have|has|yet|a|an|the|necessarily|directly|fully|entirely)\s+)*$/i;

/** Negated epistemic verb: the text refuses to assert, rather than asserting. */
const EPISTEMIC_NEGATION = new RegExp(
  String.raw`\b(?:not|never|cannot|can ?not|can't|doesn't|does not|do not|don't|did not|didn't|is not|isn't|are not|aren't|was not|wasn't|unable to|refuses? to|refused to)\b` +
    String.raw`(?:\s+\S+){0,3}?\s+(?:establish(?:ed)?|prove[dn]?|show[ns]?|claim(?:s|ed)?|assert(?:s|ed)?|determine[ds]?|infer(?:s|red)?|imply|implies|know[ns]?|verif(?:y|ied)|confirm(?:s|ed)?|say|says|suggest(?:s|ed)?|attribute[ds]?|complete[ds]?|finish(?:ed)?)\b`,
  "i",
);

const EPISTEMIC_PHRASES =
  /\b(?:no (?:evidence|proof|indication)(?: that| of)?|without (?:evidence|proof|claiming|asserting)|(?:unclear|unknown|uncertain|unverified) (?:whether|if))\b/i;

const HEDGES = /\b(?:may|might|could|possibly|perhaps|potentially|plausibly|conceivably|whether|if)\b/i;

export interface WordingViolation {
  readonly phrase: string;
}

/**
 * First phrase in `text` matching `pattern` that is not negated (or, with `allowHedge`, hedged)
 * within its clause. Returns null when the text is acceptable.
 */
export function findUnqualifiedPhrase(
  text: string,
  pattern: RegExp,
  options: { allowHedge: boolean },
): WordingViolation | null {
  for (const clause of text.split(CLAUSE_SPLIT)) {
    const matcher = new RegExp(pattern.source, "gi");
    for (const match of clause.matchAll(matcher)) {
      const before = precedingWords(clause.slice(0, match.index ?? 0));
      if (isQualified(before, options.allowHedge)) {
        continue;
      }
      return { phrase: match[0] };
    }
  }
  return null;
}

function precedingWords(prefix: string): string {
  const words = prefix.trim().split(/\s+/).filter((w) => w.length > 0);
  return `${words.slice(-WINDOW_WORDS).join(" ")} `;
}

function isQualified(before: string, allowHedge: boolean): boolean {
  if (DIRECT_NEGATION.test(before)) return true;
  if (EPISTEMIC_NEGATION.test(before)) return true;
  if (EPISTEMIC_PHRASES.test(before)) return true;
  return allowHedge && HEDGES.test(before);
}

/**
 * Remove verbatim packet-derived text (evidence previews, finding summaries, paths, assumption
 * descriptions) that itself contains forbidden wording, so quoting evidence is not mistaken for a
 * model claim. Only strings that would trigger a rule are removed — short IDs never mask text.
 */
export function stripQuotedPacketText(text: string, quotes: readonly string[]): string {
  let out = text;
  for (const quote of quotes) {
    if (quote.length === 0) continue;
    out = out.split(quote).join(" ");
  }
  return out;
}

export function containsForbiddenWording(text: string): boolean {
  return (
    new RegExp(CAUSAL_PHRASES.source, "i").test(text) ||
    new RegExp(CLEAN_CLAIM_PHRASES.source, "i").test(text)
  );
}
