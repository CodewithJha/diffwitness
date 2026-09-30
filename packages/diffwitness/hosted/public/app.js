// DiffWitness hosted demo page. Renders server-returned CLI results only.
// All CLI-derived text goes through textContent — never innerHTML.
//
// Honesty rule for motion: while POST /api/demo is in flight the page only knows that a request
// is running, so it shows an elapsed clock and an indeterminate track. Stage-by-stage progress is
// shown only after the complete response arrives, as a labelled replay of that captured result.
"use strict";

const SCENARIO_ID = "pricing-discount-change";
const REPLAY_STEP_MS = 230;

/* ── DOM helpers ─────────────────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ── Parsing and formatting (display only; values come from the API) ────── */

const MINUS = "\u2212";

/** A single finite number from a preview string: a bare number, or a JSON object holding exactly one. */
function parseMeasure(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return { value: Number(trimmed), key: null };
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (typeof parsed === "number" && Number.isFinite(parsed)) return { value: parsed, key: null };
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const numeric = Object.entries(parsed).filter(([, v]) => typeof v === "number" && Number.isFinite(v));
    if (numeric.length === 1) return { value: numeric[0][1], key: numeric[0][0] };
  }
  return null;
}

function decimalsOf(n) {
  const s = String(n);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : Math.min(s.length - dot - 1, 4);
}

function formatNumber(n, decimals) {
  const s = Math.abs(n).toFixed(decimals);
  return n < 0 ? `${MINUS}${s}` : s;
}

function formatSigned(n, decimals) {
  if (n === 0) return (0).toFixed(decimals);
  return `${n < 0 ? MINUS : "+"}${Math.abs(n).toFixed(decimals)}`;
}

/** Numeric shift between two preview strings, or null when either side is not a single number. */
function measureShift(beforeText, afterText) {
  const before = parseMeasure(beforeText);
  const after = parseMeasure(afterText);
  if (before === null || after === null) return null;
  const decimals = Math.max(decimalsOf(before.value), decimalsOf(after.value));
  const delta = after.value - before.value;
  return {
    before: before.value,
    after: after.value,
    key: after.key,
    decimals,
    delta,
    pct: before.value !== 0 ? (delta / Math.abs(before.value)) * 100 : null,
  };
}

/** Run ID: the behavioral diff ID's type prefix plus its first 8 characters, verbatim. */
function shortId(id) {
  if (typeof id !== "string" || id.length === 0) return "—";
  const cut = id.indexOf("_");
  return cut === -1 ? id.slice(0, 8) : id.slice(0, cut + 9);
}

/** Readable evidence ID: prefix + first 8 + last 4, the full ID stays available for copying. */
function shortEvidenceId(id) {
  return id.length > 20 ? `${id.slice(0, 11)}…${id.slice(-4)}` : id;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function nicestep(raw) {
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

function formatClock(ms) {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  return `${pad2(minutes)}:${(total - minutes * 60).toFixed(1).padStart(4, "0")}`;
}

/* ── Run state ──────────────────────────────────────────────────────────── */

const STATE_TEXT = { idle: "Idle", running: "Running", replay: "Replaying", changed: "Behavior changed", clean: "No change", error: "Fault" };
const VERDICT_STATE = { "BEHAVIOR CHANGED": "changed", "NO BEHAVIOR CHANGE": "clean", "ANALYSIS ERROR": "error" };

function setRunState(state) {
  $("run-state").dataset.state = state;
  $("run-state-text").textContent = STATE_TEXT[state] || state;
  $("readout").dataset.state = state;
}

function setBusy(busy, label) {
  const button = $("run");
  button.disabled = busy;
  button.setAttribute("aria-busy", busy ? "true" : "false");
  $("run-label").textContent = label || (busy ? "Investigating…" : "Run investigation again");
}

/* ── In-flight clock (request only; no fake stage progress) ─────────────── */

let clockTimer = null;
let clockStarted = 0;

function startClock() {
  clockStarted = performance.now();
  const tick = () => { $("sequencer-clock").textContent = formatClock(performance.now() - clockStarted); };
  tick();
  clearInterval(clockTimer);
  clockTimer = setInterval(tick, 100);
}

function stopClock() {
  clearInterval(clockTimer);
  clockTimer = null;
  const elapsed = performance.now() - clockStarted;
  $("sequencer-clock").textContent = formatClock(elapsed);
  return elapsed;
}

function setSequencer(phase, mode) {
  $("sequencer").dataset.phase = phase;
  $("sequencer-mode").textContent = mode;
}

/* ── Readout: verdict, baseline → current, measurement line ─────────────── */

function renderScale(shift) {
  const lo0 = Math.min(shift.before, shift.after);
  const hi0 = Math.max(shift.before, shift.after);
  const range = hi0 - lo0 || Math.abs(hi0) || 1;
  const step = nicestep(range / 3);
  const lo = Math.floor((lo0 - range * 0.45) / step) * step;
  const hi = Math.ceil((hi0 + range * 0.45) / step) * step;
  const pos = (v) => ((v - lo) / (hi - lo)) * 100;

  const scale = $("scale");
  scale.hidden = false;
  scale.style.setProperty("--ticks", String(Math.round((hi - lo) / step) * 5));
  $("marker-base").style.setProperty("--pos", `${pos(shift.before)}%`);
  $("marker-current").style.setProperty("--pos", `${pos(shift.after)}%`);
  $("marker-current").style.setProperty("--start", `${pos(shift.before)}%`);
  const bracket = $("scale-bracket");
  bracket.style.setProperty("--from", `${pos(lo0)}%`);
  bracket.style.setProperty("--to", `${pos(hi0)}%`);
  bracket.classList.toggle("is-falling", shift.after < shift.before);

  const labels = [];
  const labelDecimals = Math.max(shift.decimals, decimalsOf(step));
  for (let v = lo; v <= hi + step / 2; v += step) {
    const label = el("span", { text: formatNumber(v, labelDecimals) });
    label.style.setProperty("--pos", `${pos(v)}%`);
    labels.push(label);
  }
  $("scale-labels").replaceChildren(...labels);
}

function resetReadout() {
  for (const id of ["num-before", "num-after", "shift-delta", "shift-observations", "shift-duration"]) $(id).textContent = "—";
  for (const id of ["raw-before", "raw-after", "shift-pct"]) $(id).textContent = "";
  $("scale").hidden = true;
  const readout = $("readout");
  readout.classList.remove("is-verbatim", "show-base", "show-current", "show-shift", "is-locked");
  $("readout-mode").textContent = "Verdict";
  $("case-id").textContent = "—";
  $("case-id").removeAttribute("title");
  for (const id of ["label-specimen", "label-change", "label-tests"]) setLabel(id, null);
}

/* ── Case label (hero): filled from the response as the replay reaches each fact ── */

function setLabel(id, text, state) {
  const node = $(id);
  node.textContent = text === null ? "awaiting run" : text;
  node.dataset.empty = text === null ? "true" : "false";
  if (state) node.dataset.state = state;
  else delete node.dataset.state;
}

function surfaceText(files) {
  return files.length ? files.map((f) => `${f.path} +${f.additions ?? "?"} ${MINUS}${f.deletions ?? "?"}`).join(", ") : "no Git change";
}

/** Counts a node from one value to another; the final text is always the real value. */
function countTo(node, from, to, decimals, format, finalText, durationMs) {
  if (reducedMotion.matches) {
    node.textContent = finalText;
    return;
  }
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = t < 1 ? format(from + (to - from) * eased, decimals) : finalText;
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ── Investigation rail and sequence ────────────────────────────────────── */

function setRail(id, state, word, value) {
  const step = $(id);
  step.dataset.state = state;
  step.querySelector(".rail-word").textContent = word;
  step.querySelector(".rail-value").textContent = value;
}

function resetRail() {
  for (const id of ["rail-change", "rail-execution", "rail-behavior", "rail-evidence", "rail-causality"]) setRail(id, "idle", "—", "—");
}

function sequenceItem(step) {
  return $("sequence").querySelector(`[data-step="${step}"]`);
}

function setSequenceStep(step, state, value) {
  const item = sequenceItem(step);
  item.dataset.state = state;
  if (value !== undefined) item.querySelector(".seq-value").textContent = value;
}

function resetSequence() {
  for (const item of $("sequence").children) {
    item.dataset.state = "pending";
    item.querySelector(".seq-value").textContent = "—";
  }
}

/* ── Copyable evidence IDs ──────────────────────────────────────────────── */

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the selection fallback */
  }
  const area = el("textarea", { readonly: "", "aria-hidden": "true", className: "copy-buffer" });
  area.value = text;
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function copyButton(evidenceId) {
  const button = el("button", { type: "button", className: "chip", "aria-label": `Copy evidence ID ${evidenceId}`, title: evidenceId }, [
    el("span", { className: "chip-id", text: shortEvidenceId(evidenceId) }),
    el("span", { className: "chip-action", "aria-hidden": "true", text: "Copy" }),
  ]);
  button.addEventListener("click", async () => {
    const ok = await copyText(evidenceId);
    const idNode = button.querySelector(".chip-id");
    if (!ok) {
      idNode.textContent = evidenceId;
      window.getSelection().selectAllChildren(idNode);
    }
    button.dataset.copied = ok ? "true" : "false";
    button.querySelector(".chip-action").textContent = ok ? "Copied" : "Select";
    $("copy-status").textContent = ok ? `Copied ${evidenceId}` : `Clipboard unavailable — ${evidenceId} is selected; press Ctrl+C or ⌘C`;
    setTimeout(() => {
      delete button.dataset.copied;
      button.querySelector(".chip-action").textContent = "Copy";
    }, 1400);
  });
  return button;
}

/* ── Evidence index shared by the finding and the ledger ────────────────── */

function previewText(side) {
  if (!side) return "(no record)";
  if (side.preview === null) return "(no preview in packet)";
  return side.preview.replace(/\n$/, "") || "(empty)";
}

function buildEvidenceIndex(result) {
  const s = result.summary;
  const records = [
    ...s.evidence.baseline.map((id) => ({ id, role: "baseline" })),
    ...s.evidence.current.map((id) => ({ id, role: "current" })),
  ].map((r, i) => ({ ...r, n: i + 1, citedBy: [], preview: null }));
  const byId = new Map(records.map((r) => [r.id, r]));
  result.findings.items.forEach((f, i) => {
    for (const id of f.evidenceIds) byId.get(id)?.citedBy.push(`F${pad2(i + 1)}`);
    for (const side of [f.before, f.after]) {
      const record = side && byId.get(side.evidenceId);
      if (record && side.preview !== null) record.preview = previewText(side);
    }
  });
  return { records, byId };
}

function evidenceLabel(record) {
  return `Evidence ${pad2(record.n)}`;
}

/* ── Case file: finding incident ────────────────────────────────────────── */

function citeLink(record, fallbackId) {
  if (!record) return el("span", { className: "cite is-missing", text: fallbackId || "no evidence ID" });
  return el("a", { className: "cite", href: `#evidence-${record.n}`, "data-role": record.role }, [
    el("span", { className: "cite-n", text: evidenceLabel(record) }),
    el("span", { className: "cite-role", text: record.role }),
  ]);
}

function renderFinding(f, i, index) {
  const shift = f.before && f.after ? measureShift(f.before.preview, f.after.preview) : null;
  const beforeRecord = f.before ? index.byId.get(f.before.evidenceId) : null;
  const afterRecord = f.after ? index.byId.get(f.after.evidenceId) : null;
  const shiftText = shift
    ? `Δ ${formatSigned(shift.delta, shift.decimals)}${shift.pct === null ? "" : ` · ${formatSigned(shift.pct, 1)}%`}`
    : "shift shown verbatim";
  return el("article", { className: "finding", id: `finding-${i + 1}`, "aria-labelledby": `finding-title-${i + 1}` }, [
    el("div", { className: "finding-head" }, [
      el("p", { className: "finding-index" }, [
        el("span", { className: "micro", text: "Finding" }),
        el("span", { className: "finding-number", text: pad2(i + 1) }),
      ]),
      el("p", { className: `severity severity-${f.severity}` }, [
        el("span", { className: "micro", text: "Severity" }),
        el("span", { className: "severity-value", text: f.severity }),
      ]),
    ]),
    el("h3", { className: "finding-title", id: `finding-title-${i + 1}`, text: `${f.observationKey} behavioral shift` }),
    el("p", { className: "finding-summary", text: `${f.workflowId} workflow · ${f.summary}` }),
    el("div", { className: "finding-measure" }, [
      el("div", { className: "fm-side is-base" }, [
        el("span", { className: "micro", text: "Baseline" }),
        el("code", { className: "fm-value", text: previewText(f.before) }),
        citeLink(beforeRecord, f.before && f.before.evidenceId),
      ]),
      el("div", { className: "fm-shift" }, [
        el("span", { className: "fm-arrow", "aria-hidden": "true" }),
        el("span", { className: "fm-delta", text: shiftText }),
      ]),
      el("div", { className: "fm-side is-current" }, [
        el("span", { className: "micro", text: "Current" }),
        el("code", { className: "fm-value", text: previewText(f.after) }),
        citeLink(afterRecord, f.after && f.after.evidenceId),
      ]),
    ]),
    el("details", { className: "drawer drawer-inline" }, [
      el("summary", { text: "Finding record" }),
      el("dl", { className: "kv" }, [
        el("dt", { text: "Finding ID" }), el("dd", { text: f.id }),
        el("dt", { text: "Type" }), el("dd", { text: f.findingType }),
        el("dt", { text: "Workflow · key" }), el("dd", { text: `${f.workflowId} · ${f.observationKey}` }),
        el("dt", { text: "Change surface" }), el("dd", { text: f.associationStatus === "associated" ? "changed alongside · co-occurrence" : f.associationStatus || "—" }),
        el("dt", { text: "Evidence" }), el("dd", { text: f.evidenceIds.join(", ") || "—" }),
      ]),
    ]),
  ]);
}

function renderFindings(result, index) {
  const items = result.findings.items.map((f, i) => renderFinding(f, i, index));
  $("findings-list").replaceChildren(...(items.length ? items : [el("p", { className: "empty", text: "No behavioral findings." })]));
}

/* ── Case file: evidence ledger ─────────────────────────────────────────── */

function renderEvidence(index) {
  const entries = index.records.map((r) =>
    el("li", { className: "entry", id: `evidence-${r.n}`, "data-role": r.role, "data-cited": r.citedBy.length ? "true" : "false" }, [
      el("span", { className: "entry-marker", "aria-hidden": "true" }),
      el("p", { className: "entry-head" }, [
        el("span", { className: "entry-n", text: evidenceLabel(r) }),
        el("span", { className: "entry-role", text: r.role }),
        el("span", { className: "entry-state" }, [el("span", { className: "lamp", "aria-hidden": "true" }), el("span", { text: "Captured" })]),
      ]),
      copyButton(r.id),
      r.preview !== null ? el("code", { className: "entry-preview", text: r.preview }) : null,
      el("p", { className: "entry-cite", text: r.citedBy.length ? `cited by ${r.citedBy.join(", ")}` : "held · not cited by a finding" }),
    ]),
  );
  const metadata = el("details", { className: "drawer drawer-inline ledger-meta" }, [
    el("summary", { text: "Full evidence IDs" }),
    el("dl", { className: "kv" }, index.records.flatMap((r) => [
      el("dt", { text: `${evidenceLabel(r)} · ${r.role}` }),
      el("dd", { text: r.id }),
    ])),
  ]);
  $("evidence-list").replaceChildren(...entries);
  $("evidence-list").parentElement.querySelector(".ledger-meta")?.remove();
  $("evidence-list").after(metadata);
}

/* ── Case file: change surface ──────────────────────────────────────────── */

function diffKind(line) {
  if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff ") || line.startsWith("index ")) return "meta";
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "del";
  return "ctx";
}

function renderDiff(text) {
  const pre = $("git-diff");
  const peek = $("diff-peek");
  if (!text) {
    pre.textContent = "(no diff)";
    peek.replaceChildren();
    return;
  }
  const lines = text.replace(/\n$/, "").split("\n").map((line) => ({ line, kind: diffKind(line) }));
  pre.replaceChildren(...lines.map((l) => el("span", { className: `diff-line diff-${l.kind}`, text: l.line })));
  const changed = lines.filter((l) => l.kind === "add" || l.kind === "del").slice(0, 6);
  peek.replaceChildren(...changed.map((l) => el("code", { className: `diff-line diff-${l.kind}`, text: l.line })));
}

function renderSurface(result) {
  const change = result.stages.find((s) => s.id === "change");
  renderDiff(change && change.stdout ? change.stdout : "");
  const cs = result.findings.changeSurface;
  const linked = result.findings.items
    .map((f, i) => ({ f, n: i + 1 }))
    .filter(({ f }) => f.associationStatus === "associated");

  if (!cs || cs.files.length === 0) {
    $("surface-files").replaceChildren(el("li", { className: "empty", text: cs ? "No files changed." : "No change surface in the CLI result." }));
    $("surface-rev").textContent = "";
    return;
  }
  $("surface-files").replaceChildren(
    ...cs.files.map((file) =>
      el("li", { className: "surface-row" }, [
        el("div", { className: "surface-file" }, [
          el("code", { className: "surface-path", text: file.path }),
          el("span", { className: "surface-status", text: file.status }),
          el("span", { className: "surface-counts" }, [
            el("span", { className: "count-add", text: file.additions === null ? "+?" : `+${file.additions}` }),
            el("span", { className: "count-del", text: file.deletions === null ? `${MINUS}?` : `${MINUS}${file.deletions}` }),
          ]),
        ]),
        el("span", { className: "surface-link" }, [
          el("span", { className: "surface-link-label", text: linked.length ? "changed alongside" : `association: ${cs.associationStatus}` }),
        ]),
        linked.length
          ? el("span", { className: "surface-targets" }, linked.map(({ f, n }) =>
              el("a", { className: "surface-target", href: `#finding-${n}` }, [
                el("span", { className: "micro", text: `Finding ${pad2(n)}` }),
                el("span", { text: `${f.workflowId} · ${f.observationKey}` }),
              ])))
          : null,
      ]),
    ),
  );
  const base = cs.baseRevision ? cs.baseRevision.slice(0, 12) : "—";
  const current = cs.currentRevision ? cs.currentRevision.slice(0, 12) : "—";
  $("surface-rev").textContent = `baseline ${base} → executed ${current}${cs.workingTreeIncluded ? " + working tree" : ""}`;
}

function renderCausality(result) {
  const cs = result.findings.changeSurface;
  const causality = cs ? cs.causality : result.summary.causality;
  $("h-trust").textContent = causality === "not_established" ? "Not established" : causality;
  $("causality-source").textContent = `changeSurface.causality = "${causality}" · association = "${cs ? cs.associationStatus : "—"}"`;
}

/* ── Case file: execution timeline ──────────────────────────────────────── */

function workflowOutcomes(summary) {
  return el("ul", { className: "tl-outcomes", "aria-label": "Workflow outcomes" }, [
    el("li", { "data-state": summary.tests.result === "PASS" ? "pass" : "fault" }, [
      el("span", { className: "lamp", "aria-hidden": "true" }),
      el("span", { text: `${summary.tests.workflowId} ${summary.tests.result} · ${summary.tests.changed ? "changed" : "unchanged"}` }),
    ]),
    el("li", { "data-state": summary.behavior.changed ? "changed" : "pass" }, [
      el("span", { className: "lamp", "aria-hidden": "true" }),
      el("span", { text: `${summary.behavior.workflowId} ${summary.behavior.changed ? "CHANGED" : "unchanged"}` }),
    ]),
  ]);
}

function renderTimeline(result) {
  const longest = Math.max(1, ...result.stages.map((s) => s.durationMs));
  $("stage-trace").replaceChildren(
    ...result.stages.map((stage, i) => {
      const ok = stage.exitCode === 0;
      const bar = el("span", { className: "tl-bar", "aria-hidden": "true" });
      bar.style.setProperty("--w", `${Math.max(3, (stage.durationMs / longest) * 100)}%`);
      return el("li", { className: "tl-item", "data-state": ok ? "pass" : "fault" }, [
        el("span", { className: "tl-node", "aria-hidden": "true" }),
        el("p", { className: "tl-head" }, [
          el("span", { className: "tl-n", text: pad2(i + 1) }),
          el("span", { className: "tl-label", text: stage.label }),
          el("span", { className: "tl-exit", text: stage.exitCode === null ? stage.outcome : `exit ${stage.exitCode}` }),
          el("span", { className: "tl-ms", text: `${stage.durationMs} ms` }),
        ]),
        el("p", { className: "tl-meta" }, [el("code", { className: "tl-cmd", text: `$ ${stage.command}` }), bar]),
        stage.id === "check" && result.summary ? workflowOutcomes(result.summary) : null,
      ]);
    }),
  );
}

/* ── Records: explanation, raw output, config, JSON ─────────────────────── */

function renderExplanation(explanation) {
  if (!explanation) return;
  $("explain-summary").textContent = `MockAI · deterministic offline explainer · ${explanation.status} · ${explanation.promptVersion || "—"}`;
  $("explain-narrative").textContent = explanation.narrative || explanation.error || "(no explanation)";
  $("explain-facts").replaceChildren(
    ...(explanation.facts.length
      ? explanation.facts.map((f) => el("li", {}, [
          el("span", { text: f.claim }),
          f.evidenceIds.length ? el("span", { className: "explain-cite", text: `evidence: ${f.evidenceIds.join(", ")}` }) : null,
        ]))
      : [el("li", { className: "empty", text: "No facts returned." })]),
  );
  $("explain-hypotheses").replaceChildren(
    ...(explanation.hypotheses.length
      ? explanation.hypotheses.map((h) => el("li", {}, [
          el("span", { className: "confidence", text: h.confidence }),
          el("span", { text: h.claim }),
        ]))
      : [el("li", { className: "empty", text: "No hypotheses returned." })]),
  );
  $("explain-caveats").replaceChildren(...explanation.caveats.map((c) => el("li", { text: c })));
}

function renderStage(stage) {
  const exitText = stage.exitCode === null ? stage.outcome : `exit ${stage.exitCode}`;
  const body = stage.json !== null && stage.json !== undefined ? JSON.stringify(stage.json, null, 2) : stage.stdout;
  return el("div", { className: "terminal" }, [
    el("div", { className: "terminal-head" }, [
      el("span", { className: "cmd", text: `$ ${stage.command}` }),
      el("span", {
        className: stage.exitCode === 0 ? "exit-ok" : "exit-bad",
        text: `${exitText} · ${stage.durationMs} ms${stage.truncated ? " · output truncated" : ""}`,
      }),
    ]),
    el("pre", { text: body || "(no stdout)" }),
    stage.stderr ? el("pre", { className: "stderr", text: stage.stderr }) : null,
  ]);
}

function renderTechnical(result) {
  $("config-text").textContent = result.scenario.config || "(not installed)";
  $("stage-list").replaceChildren(...result.stages.map(renderStage));
  $("raw-json").textContent = JSON.stringify(result, null, 2);
  renderTimeline(result);
}

/* ── Failure ────────────────────────────────────────────────────────────── */

function renderFailure(result, fallbackMessage, retryAfter) {
  const box = $("failure");
  const failure = result && result.failure;
  if (!failure && !fallbackMessage) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const detail = failure
    ? `${failure.message}${failure.stage ? ` (stage: ${failure.stage})` : ""}`
    : fallbackMessage;
  const parts = [
    el("p", { className: "micro", text: "Fault" }),
    el("strong", { text: failure ? `Demo failed: ${failure.kind}` : "Request failed" }),
    el("span", { text: ` — ${detail}` }),
  ];
  if (retryAfter) parts.push(el("span", { className: "failure-retry", text: ` Retry in about ${retryAfter} s.` }));
  box.replaceChildren(...parts);
  setRunState("error");
  setSequencer("fault", failure ? "Run failed" : "Request failed");
  setRail("rail-execution", "fault", "failed", failure ? `${failure.kind}${failure.stage ? ` · ${failure.stage}` : ""}` : "no result returned");
  $("readout-mode").textContent = "No reading";
  for (const id of ["label-specimen", "label-change", "label-tests"]) {
    if ($(id).dataset.empty === "true") $(id).textContent = "no reading";
  }
  $("verdict").textContent = failure ? "Run failed" : "Request failed";
  $("readout-key").textContent = failure ? failure.kind : detail;
}

/* ── Replay of the captured result ──────────────────────────────────────── */

function stageById(result, id) {
  return result.stages.find((s) => s.id === id) || null;
}

function stageSummary(stage, extra) {
  if (!stage) return extra || "—";
  const exit = stage.exitCode === null ? stage.outcome : `exit ${stage.exitCode}`;
  return `${extra ? `${extra} · ` : `${exit} · `}${stage.durationMs} ms`;
}

/** The eight replay steps, each carrying values read from the response and the UI it unlocks. */
function replaySteps(result, index) {
  const s = result.summary;
  const out = s.output;
  const shift = out ? measureShift(out.before, out.after) : null;
  const o = s.observations;
  const moved = o.changed + o.appeared + o.disappeared;
  const files = (result.findings.changeSurface && result.findings.changeSurface.files) || [];
  const stages = result.stages;
  const allOk = stages.every((st) => st.exitCode === 0);
  const first = result.findings.items[0];
  const cited = index.records.filter((r) => r.citedBy.length).length;
  const causality = s.causality === "not_established" ? "not established" : s.causality;
  const readout = $("readout");

  return [
    { step: "init", value: stageSummary(stageById(result, "init")) },
    {
      step: "baseline",
      value: stageSummary(stageById(result, "baseline"), plural(s.evidence.baseline.length, "record")),
      apply: () => readout.classList.add("show-base"),
    },
    {
      step: "execute",
      value: stageSummary(stageById(result, "check")),
      apply: () => {
        setRail("rail-change", files.length ? "observed" : "idle", files.length ? "detected" : "none", surfaceText(files));
        setLabel("label-change", surfaceText(files));
      },
    },
    {
      step: "observe",
      value: plural(moved + o.unchanged, "observation"),
      apply: () => {
        readout.classList.add("show-current");
        if (shift) countTo($("num-after"), shift.before, shift.after, shift.decimals, formatNumber, formatNumber(shift.after, shift.decimals), 520);
        setRail("rail-execution", allOk ? "pass" : "fault", allOk ? "complete" : "incomplete",
          `${plural(stages.length, "stage")} · ${s.tests.workflowId} ${s.tests.result}`);
        setLabel("label-tests", `${s.tests.workflowId} ${s.tests.result} · ${s.tests.changed ? "changed" : "unchanged"}`,
          s.tests.result === "PASS" ? "pass" : "fault");
      },
    },
    {
      step: "compare",
      value: `${moved} moved · ${o.unchanged} held`,
      apply: () => {
        readout.classList.add("show-shift", "is-locked");
        $("readout-mode").textContent = "Verdict · locked";
        setRunState(VERDICT_STATE[s.verdict] || "error");
        $("verdict").textContent = s.verdict;
        if (shift) {
          countTo($("shift-delta"), 0, shift.delta, shift.decimals, (v, d) => `Δ ${formatSigned(v, d)}`, `Δ ${formatSigned(shift.delta, shift.decimals)}`, 440);
        }
        setRail("rail-behavior", s.behavior.changed ? "changed" : "pass", s.behavior.changed ? "changed" : "unchanged",
          out ? `${out.workflowId} · ${out.observationKey} · ${out.before} → ${out.after}` : `${s.behavior.workflowId} · no output change`);
        setLabel("label-specimen", out
          ? `${out.workflowId} workflow · ${out.observationKey}${shift && shift.key ? ` · ${shift.key}` : ""}`
          : `${s.behavior.workflowId} workflow · no output change`, s.behavior.changed ? "changed" : undefined);
      },
    },
    {
      step: "finding",
      value: first ? `${plural(result.findings.items.length, "finding")} · ${first.severity}` : "none",
      apply: () => reveal("finding"),
    },
    {
      step: "evidence",
      value: `${index.records.length} captured · ${cited} cited`,
      apply: () => {
        reveal("evidence");
        setRail("rail-evidence", "observed", "captured", `${plural(index.records.length, "record")} · ${cited} cited`);
      },
    },
    {
      step: "causality",
      value: causality,
      apply: () => {
        reveal("causality");
        setRail("rail-causality", "withheld", causality, "co-occurrence only");
      },
    },
  ];
}

function reveal(name) {
  for (const node of document.querySelectorAll(`[data-reveal="${name}"]`)) node.classList.add("is-shown");
}

function hideReveals() {
  for (const node of document.querySelectorAll("[data-reveal]")) node.classList.remove("is-shown");
}

let runToken = 0;

/** Plays the replay; resolves when every step (and its UI) is applied. Instant under reduced motion. */
function playReplay(steps, token) {
  return new Promise((resolve) => {
    const applyStep = (i) => {
      const { step, value, apply } = steps[i];
      if (i > 0) setSequenceStep(steps[i - 1].step, "done");
      setSequenceStep(step, "active", value);
      if (apply) apply();
    };
    if (reducedMotion.matches) {
      steps.forEach((_, i) => applyStep(i));
      setSequenceStep(steps[steps.length - 1].step, "done");
      resolve();
      return;
    }
    let i = 0;
    const next = () => {
      if (token !== runToken) return resolve();
      applyStep(i);
      i += 1;
      if (i < steps.length) setTimeout(next, REPLAY_STEP_MS);
      else setTimeout(() => { setSequenceStep(steps[steps.length - 1].step, "done"); resolve(); }, REPLAY_STEP_MS);
    };
    next();
  });
}

/* ── Run ────────────────────────────────────────────────────────────────── */

async function requestDemo() {
  const response = await fetch("/api/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario: SCENARIO_ID }),
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

function enterInFlight() {
  setBusy(true);
  setRunState("running");
  renderFailure(null, null);
  resetReadout();
  resetRail();
  resetSequence();
  hideReveals();
  $("results").hidden = true;
  $("verdict").textContent = "Investigating";
  $("readout-mode").textContent = "Request in flight";
  $("readout-key").textContent = "The server is running the real CLI in a fresh temporary repository.";
  $("run-status").textContent = "Investigation running — waiting for the server to finish the real CLI run…";
  setSequencer("inflight", "Request in flight · awaiting the complete result");
  setRail("rail-execution", "active", "running", "request in flight");
  startClock();
  const readout = $("readout");
  if (readout.getBoundingClientRect().top > window.innerHeight * 0.55) {
    readout.scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "auto" : "smooth" });
  }
}

function populateResult(result, index) {
  const s = result.summary;
  const out = s.output;
  const shift = out ? measureShift(out.before, out.after) : null;
  const readout = $("readout");
  $("case-id").textContent = shortId(result.findings.behavioralDiffId);
  $("case-id").title = result.findings.behavioralDiffId;
  $("readout-key").textContent = out
    ? `workflow ${out.workflowId} · ${out.observationKey}${shift && shift.key ? ` · ${shift.key}` : ""}`
    : "No output change recorded for the behavior workflow.";
  $("raw-before").textContent = out ? out.before : "";
  $("raw-after").textContent = out ? out.after : "";
  readout.classList.toggle("is-verbatim", Boolean(out) && !shift);
  if (!out) {
    $("shift-delta").textContent = "none recorded";
  } else if (!shift) {
    $("num-before").textContent = out.before;
    $("num-after").textContent = out.after;
    $("shift-delta").textContent = "non-numeric · verbatim";
  } else {
    $("num-before").textContent = formatNumber(shift.before, shift.decimals);
    $("num-after").textContent = formatNumber(shift.after, shift.decimals);
    $("shift-delta").textContent = `Δ ${formatSigned(shift.delta, shift.decimals)}`;
    $("shift-pct").textContent = shift.pct === null ? "" : `${formatSigned(shift.pct, 1)}%`;
    renderScale(shift);
  }
  const o = s.observations;
  $("shift-observations").textContent = `${o.changed + o.appeared + o.disappeared} moved · ${o.unchanged} held`;
  $("shift-duration").textContent = `${(result.durationMs / 1000).toFixed(2)} s`;

  renderFindings(result, index);
  renderEvidence(index);
  renderSurface(result);
  renderCausality(result);
  renderExplanation(result.explanation);
}

async function run() {
  const token = ++runToken;
  enterInFlight();

  let result = null;
  try {
    const { response, body } = await requestDemo();
    if (body && Array.isArray(body.stages)) {
      result = body;
    } else {
      stopClock();
      const retryAfter = response.status === 503 ? response.headers.get("Retry-After") : null;
      resetRail();
      renderFailure(null, body && body.error ? body.error.message : `HTTP ${response.status}`, retryAfter);
      $("run-status").textContent = retryAfter ? `Server busy — retry in about ${retryAfter} s.` : "Request failed.";
      setBusy(false);
      return;
    }
  } catch {
    stopClock();
    resetRail();
    renderFailure(null, "Network error");
    $("run-status").textContent = "Request failed — network error.";
    setBusy(false);
    return;
  }
  const elapsed = stopClock();

  renderTechnical(result);
  const results = $("results");
  if (result.status !== "completed" || !result.summary || !result.findings) {
    resetRail();
    renderFailure(result, null);
    results.hidden = false;
    results.classList.add("is-failed");
    $("run-status").textContent = "Failed — see the fault message below the rail.";
    $("failure").scrollIntoView({ block: "start" });
    setBusy(false);
    return;
  }

  results.classList.remove("is-failed");
  const index = buildEvidenceIndex(result);
  populateResult(result, index);
  results.hidden = false;
  setRunState("replay");
  $("verdict").textContent = "Comparing";
  $("readout-mode").textContent = "Replaying captured result";
  setSequencer("replay", `Replaying captured result · response in ${formatClock(elapsed)}`);
  setBusy(true, "Replaying…");
  $("run-status").textContent = `Response received in ${formatClock(elapsed)} — replaying the captured result.`;

  await playReplay(replaySteps(result, index), token);
  if (token !== runToken) return;
  setSequencer("done", `Captured result · response in ${formatClock(elapsed)} · server run ${(result.durationMs / 1000).toFixed(2)} s`);
  setBusy(false);
  const out = result.summary.output;
  $("run-status").textContent = `${result.summary.verdict}${out ? `: ${out.before} → ${out.after}` : ""}. Completed in ${result.durationMs} ms.`;
  $("verdict").focus({ preventScroll: true });
}

async function init() {
  try {
    const response = await fetch("/api/scenarios");
    const body = await response.json();
    const scenario = body.scenarios.find((s) => s.id === SCENARIO_ID);
    if (!scenario) throw new Error("scenario missing");
    $("scenario-title").textContent = scenario.title;
    $("scenario-description").textContent = scenario.description;
    $("scenario-change").textContent = scenario.change || "";
    $("run").disabled = false;
  } catch {
    $("scenario-title").textContent = "Demo unavailable";
    setRunState("error");
    $("run-state-text").textContent = "Unavailable";
  }
  $("run").addEventListener("click", run);
}

init();
