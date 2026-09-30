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

function specimen(label, side, className) {
  return el("div", { className: `specimen-side ${className}` }, [
    el("p", { className: "micro", text: label }),
    el("pre", { className: "specimen-value", text: previewText(side) }),
    side ? evidenceChip(side.evidenceId) : el("span", { className: "chip-none", text: "no evidence ID" }),
  ]);
}

function renderFindings(findings) {
  const items = findings.items.map((f, i) =>
    el("article", { className: "finding", "aria-labelledby": `finding-${i}` }, [
      el("div", { className: "finding-index" }, [
        el("p", { className: "micro", text: "Finding" }),
        el("p", { className: "finding-number", text: pad2(i + 1) }),
        el("p", { className: `severity severity-${f.severity}`, text: f.severity }),
      ]),
      el("div", { className: "finding-main" }, [
        el("h3", { className: "finding-title", id: `finding-${i}`, text: `${f.workflowId} · ${f.observationKey}` }),
        el("p", { className: "finding-summary", text: f.summary }),
        el("dl", { className: "finding-meta" }, [
          el("dt", { text: "Finding ID" }), el("dd", { text: f.id }),
          el("dt", { text: "Type" }), el("dd", { text: f.findingType }),
          el("dt", { text: "Change surface" }),
          el("dd", { text: f.associationStatus === "associated" ? "changed alongside · co-occurrence" : f.associationStatus || "—" }),
        ]),
        el("div", { className: "specimen-pair" }, [
          specimen("Baseline", f.before, "is-base"),
          el("span", { className: "specimen-arrow", "aria-hidden": "true" }),
          specimen("Current", f.after, "is-current"),
        ]),
      ]),
    ]),
  );
  $("findings-list").replaceChildren(...(items.length ? items : [el("p", { className: "empty", text: "No behavioral findings." })]));
}

/* ── Case file: execution trace ─────────────────────────────────────────── */

function renderWorkflows(summary) {
  const rows = [
    { id: summary.tests.workflowId, role: "tests", state: summary.tests.result === "PASS" ? "pass" : "fault", value: `${summary.tests.result} · ${summary.tests.changed ? "changed" : "unchanged"}` },
    { id: summary.behavior.workflowId, role: "behavior", state: summary.behavior.changed ? "changed" : "pass", value: summary.behavior.changed ? "CHANGED" : "unchanged" },
  ];
  $("workflow-rails").replaceChildren(
    ...rows.map((r) =>
      el("li", { className: "rail", "data-state": r.state }, [
        el("span", { className: "lamp", "aria-hidden": "true" }),
        el("span", { className: "rail-id", text: r.id }),
        el("span", { className: "rail-role", text: r.role === "tests" ? "test suite" : "observed output" }),
        el("span", { className: "rail-line", "aria-hidden": "true" }),
        el("span", { className: "rail-value", text: r.value }),
      ]),
    ),
  );
}

function renderStageTrace(stages) {
  const longest = Math.max(1, ...stages.map((s) => s.durationMs));
  $("stage-trace").replaceChildren(
    ...stages.map((stage, i) => {
      const ok = stage.exitCode === 0;
      const bar = el("span", { className: "stage-bar", "aria-hidden": "true" });
      bar.style.setProperty("--w", `${Math.max(2, (stage.durationMs / longest) * 100)}%`);
      return el("li", { className: "stage", "data-state": ok ? "pass" : "fault" }, [
        el("span", { className: "stage-n", text: pad2(i + 1) }),
        el("span", { className: "stage-label", text: stage.label }),
        el("code", { className: "stage-cmd", text: `$ ${stage.command}` }),
        bar,
        el("span", { className: "stage-exit", text: stage.exitCode === null ? stage.outcome : `exit ${stage.exitCode}` }),
        el("span", { className: "stage-ms", text: `${stage.durationMs} ms` }),
      ]);
    }),
  );
}

/* ── Case file: evidence register ───────────────────────────────────────── */

function renderEvidence(result) {
  const s = result.summary;
  const citing = new Map();
  const previews = new Map();
  result.findings.items.forEach((f, i) => {
    for (const id of f.evidenceIds) citing.set(id, [...(citing.get(id) || []), `F${pad2(i + 1)}`]);
    for (const side of [f.before, f.after]) if (side && side.preview !== null) previews.set(side.evidenceId, previewText(side));
  });
  const records = [
    ...s.evidence.baseline.map((id) => ({ id, role: "Baseline" })),
    ...s.evidence.current.map((id) => ({ id, role: "Current" })),
  ];
  $("evidence-list").replaceChildren(
    ...records.map((r, i) => {
      const cites = citing.get(r.id);
      return el("li", { className: `record${cites ? " is-cited" : ""}`, "data-role": r.role.toLowerCase() }, [
        el("span", { className: "record-n", text: `E${pad2(i + 1)}` }),
        el("span", { className: "record-role", text: r.role }),
        evidenceChip(r.id),
        el("span", { className: "record-cite", text: cites ? `cited by ${cites.join(", ")}` : "held · not cited" }),
        previews.has(r.id) ? el("code", { className: "record-preview", text: previews.get(r.id) }) : null,
      ]);
    }),
  );
}

/* ── Case file: change surface and causality ────────────────────────────── */

function renderDiff(text) {
  const pre = $("git-diff");
  if (!text) {
    pre.textContent = "(no diff)";
    return;
  }
  const lines = text.replace(/\n$/, "").split("\n").map((line) => {
    const kind = line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff ") || line.startsWith("index ")
      ? "meta"
      : line.startsWith("@@") ? "hunk" : line.startsWith("+") ? "add" : line.startsWith("-") ? "del" : "ctx";
    return el("span", { className: `diff-line diff-${kind}`, text: line });
  });
  pre.replaceChildren(...lines);
}

function renderSurface(result) {
  const change = result.stages.find((s) => s.id === "change");
  renderDiff(change && change.stdout ? change.stdout : "");
  const cs = result.findings.changeSurface;
  const findingRefs = result.findings.items.map((f, i) => ({ ref: `Finding ${pad2(i + 1)}`, associated: f.associationStatus === "associated" }));
  const linked = findingRefs.filter((f) => f.associated).map((f) => f.ref);

  if (!cs || cs.files.length === 0) {
    $("surface-files").replaceChildren(el("li", { className: "empty", text: cs ? "No files changed." : "No change surface in the CLI result." }));
    $("surface-rev").textContent = "";
  } else {
    $("surface-files").replaceChildren(
      ...cs.files.map((f) =>
        el("li", { className: "surface-file" }, [
          el("code", { className: "surface-path", text: f.path }),
          el("span", { className: "surface-status", text: f.status }),
          el("span", { className: "surface-counts" }, [
            el("span", { className: "count-add", text: f.additions === null ? "+?" : `+${f.additions}` }),
            el("span", { className: "count-del", text: f.deletions === null ? `${MINUS}?` : `${MINUS}${f.deletions}` }),
          ]),
          el("span", { className: "surface-link", text: linked.length ? `Changed alongside ${linked.join(", ")}` : `association: ${cs.associationStatus}` }),
        ]),
      ),
    );
    const base = cs.baseRevision ? cs.baseRevision.slice(0, 12) : "—";
    const current = cs.currentRevision ? cs.currentRevision.slice(0, 12) : "—";
    $("surface-rev").textContent = `baseline ${base} → executed ${current}${cs.workingTreeIncluded ? " + working tree" : ""}`;
  }
  const causality = cs ? cs.causality : result.summary.causality;
  $("h-trust").textContent = causality === "not_established" ? "Not established" : causality;
  const gap = $("causality-gap");
  const first = result.findings.items[0];
  gap.hidden = !(first && cs && cs.files.length && causality === "not_established");
  if (!gap.hidden) {
    $("gap-finding").textContent = `Finding 01 · ${first.workflowId} · ${first.observationKey}`;
    $("gap-files").textContent = cs.files.map((f) => f.path).join(", ");
  }
  $("causality-source").textContent = `changeSurface.causality = "${causality}" · association = "${cs ? cs.associationStatus : "—"}"`;
}

/* ── Case file: explanation and technical details ───────────────────────── */

function renderExplanation(explanation) {
  if (!explanation) return;
  $("explain-summary").textContent = `MockAI — deterministic offline explainer · ${explanation.status} · ${explanation.promptVersion || "—"}`;
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
  renderStageTrace(result.stages);
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
  $("verdict").textContent = failure ? "Run failed" : "Request failed";
  $("readout-key").textContent = failure ? failure.kind : detail;
}

/* ── Staged reveal ──────────────────────────────────────────────────────── */

function stageReveal() {
  const root = document.body;
  root.classList.remove("is-revealing");
  if (reducedMotion.matches) return;
  void root.offsetWidth;
  root.classList.add("is-revealing");
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

async function run() {
  setBusy(true);
  setRunState("running");
  $("verdict").textContent = "Measuring…";
  $("run-status").textContent = "Running baseline → change → check → explain with the real CLI…";
  document.body.classList.remove("is-revealing");
  renderFailure(null, null);
  resetReadout();
  resetChain();

  let result = null;
  try {
    const { response, body } = await requestDemo();
    if (body && Array.isArray(body.stages)) {
      result = body;
    } else {
      const retryAfter = response.status === 503 ? response.headers.get("Retry-After") : null;
      setBusy(false);
      $("results").hidden = true;
      renderFailure(null, body && body.error ? body.error.message : `HTTP ${response.status}`, retryAfter);
      $("run-status").textContent = retryAfter ? `Server busy — retry in about ${retryAfter} s.` : "";
      return;
    }
  } catch {
    setBusy(false);
    $("results").hidden = true;
    renderFailure(null, "Network error");
    $("run-status").textContent = "";
    return;
  }
  setBusy(false);

  renderTechnical(result);
  renderFailure(result, null);
  const results = $("results");
  if (result.status !== "completed" || !result.summary || !result.findings) {
    results.hidden = false;
    results.classList.add("is-failed");
    $("run-status").textContent = "Failed — see the message below the console.";
    $("failure").scrollIntoView({ block: "start" });
    return;
  }
  results.classList.remove("is-failed");
  $("case-id").textContent = shortId(result.findings.behavioralDiffId);
  $("case-id").title = result.findings.behavioralDiffId;
  renderVerdict(result.summary);
  const measure = renderReadout(result);
  renderChain(result);
  renderFindings(result.findings);
  renderWorkflows(result.summary);
  renderEvidence(result);
  renderSurface(result);
  renderExplanation(result.explanation);
  results.hidden = false;

  stageReveal();
  animateCounter(measure, 460);
  const out = result.summary.output;
  $("run-status").textContent = `${result.summary.verdict}${out ? `: ${out.before} → ${out.after}` : ""}. Completed in ${result.durationMs} ms.`;
  const readout = $("readout");
  if (readout.getBoundingClientRect().top < 0 || readout.getBoundingClientRect().top > window.innerHeight * 0.5) {
    readout.scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "auto" : "smooth" });
  }
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
