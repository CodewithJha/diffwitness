/** Stub brief-writer. Replace with a real model after the wow-path is demoable. */

const SECTION_HINTS = [
  ["shipping", /ship|pr\b|release|deploy|merge/i],
  ["blocked", /block|wait|stuck|need|depend/i],
  ["noise", /fyi|cc:|sync|stand-?up|thanks/i],
];

function splitNotes(raw) {
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function writeBrief(rawNotes) {
  const lines = splitNotes(rawNotes);
  if (lines.length === 0) {
    return {
      ok: false,
      error: "Paste a messy week first.",
    };
  }

  const buckets = { shipping: [], blocked: [], noise: [], other: [] };
  for (const line of lines) {
    const hit = SECTION_HINTS.find(([, re]) => re.test(line));
    buckets[hit ? hit[0] : "other"].push(line);
  }

  const ship = buckets.shipping[0] || buckets.other[0] || lines[0];
  const blockers = buckets.blocked.slice(0, 3);
  const ignore = buckets.noise.slice(0, 4);

  return {
    ok: true,
    model: "placeholder-no-model-yet",
    generatedAt: new Date().toISOString(),
    headline: `Ship this next: ${ship}`,
    decision: `Protect time for “${ship}”. Everything else is a note, not a plan.`,
    shipTomorrow: ship,
    blockers: blockers.length ? blockers : ["No explicit blocker found — name one before you start."],
    ignore,
    leftovers: buckets.other.filter((line) => line !== ship).slice(0, 5),
    sourceLineCount: lines.length,
  };
}
