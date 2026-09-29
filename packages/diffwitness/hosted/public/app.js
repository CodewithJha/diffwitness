// DiffWitness hosted demo page. Renders server-returned CLI results only.
// All CLI-derived text goes through textContent — never innerHTML.
"use strict";

const SCENARIO_ID = "pricing-discount-change";

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

/** Investigation ID: the behavioral diff ID's type prefix plus its first 8 characters, verbatim. */
function shortId(id) {
  if (typeof id !== "string" || id.length === 0) return "—";
  const cut = id.indexOf("_");
  return cut === -1 ? id.slice(0, 8) : id.slice(0, cut + 9);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nicestep(raw) {
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

/* ── Run state ──────────────────────────────────────────────────────────── */

const STATE_TEXT = { idle: "Idle", running: "Running", changed: "Behavior changed", clean: "No change", error: "Fault" };
const VERDICT_STATE = { "BEHAVIOR CHANGED": "changed", "NO BEHAVIOR CHANGE": "clean", "ANALYSIS ERROR": "error" };

function setRunState(state) {
  $("run-state").dataset.state = state;
  $("run-state-text").textContent = STATE_TEXT[state] || state;
  $("readout").dataset.state = state;
}

let elapsedTimer = null;

function setBusy(busy) {
  const button = $("run");
  button.disabled = busy;
  button.setAttribute("aria-busy", busy ? "true" : "false");
  $("run-label").textContent = busy ? "Running…" : "Run investigation again";
  clearInterval(elapsedTimer);
  if (!busy) return;
  const started = performance.now();
  const tick = () => {
    $("readout-key").textContent = `Executing baseline → change → check → explain · ${((performance.now() - started) / 1000).toFixed(1)} s`;
  };
  tick();
  elapsedTimer = setInterval(tick, 100);
}

/* ── Readout: verdict, baseline → current, measurement line ─────────────── */

function renderVerdict(summary) {
  const state = VERDICT_STATE[summary.verdict] || "error";
  setRunState(state);
  $("verdict").textContent = summary.verdict;
}

function renderReadout(result) {
  const s = result.summary;
  const out = s.output;
  const before = out ? parseMeasure(out.before) : null;
  const after = out ? parseMeasure(out.after) : null;
  const numeric = before !== null && after !== null;

  $("readout-key").textContent = out
    ? `workflow ${out.workflowId} · ${out.observationKey}${numeric && after.key ? ` · ${after.key}` : ""}`
    : "No output change recorded for the behavior workflow.";
  $("raw-before").textContent = out ? out.before : "";
  $("raw-after").textContent = out ? out.after : "";

  const dial = $("readout");
  dial.classList.toggle("is-verbatim", Boolean(out) && !numeric);

  if (!out) {
    $("num-before").textContent = "—";
    $("num-after").textContent = "—";
    $("shift-delta").textContent = "none recorded";
    $("scale").hidden = true;
  } else if (!numeric) {
    $("num-before").textContent = out.before;
    $("num-after").textContent = out.after;
    $("shift-delta").textContent = "non-numeric · shown verbatim";
    $("scale").hidden = true;
  } else {
    const decimals = Math.max(decimalsOf(before.value), decimalsOf(after.value));
    const delta = after.value - before.value;
    $("num-before").textContent = formatNumber(before.value, decimals);
    $("num-after").textContent = formatNumber(after.value, decimals);
    const pct = before.value !== 0 ? ` · ${formatSigned((delta / Math.abs(before.value)) * 100, 1)}%` : "";
    $("shift-delta").textContent = `Δ ${formatSigned(delta, decimals)}${pct}`;
    renderScale(before.value, after.value, decimals);
  }

  const o = s.observations;
  const moved = o.changed + o.appeared + o.disappeared;
  $("shift-observations").textContent = `${moved} moved · ${o.unchanged} held`;
  $("shift-duration").textContent = `${(result.durationMs / 1000).toFixed(2)} s`;
  return numeric ? { before: before.value, after: after.value, decimals: Math.max(decimalsOf(before.value), decimalsOf(after.value)) } : null;
}

function renderScale(before, after, decimals) {
  const lo0 = Math.min(before, after);
  const hi0 = Math.max(before, after);
  const range = hi0 - lo0 || Math.abs(hi0) || 1;
  const step = nicestep(range / 3);
  const lo = Math.floor((lo0 - range * 0.45) / step) * step;
  const hi = Math.ceil((hi0 + range * 0.45) / step) * step;
  const pos = (v) => ((v - lo) / (hi - lo)) * 100;

  const scale = $("scale");
  scale.hidden = false;
  scale.style.setProperty("--ticks", String(Math.round((hi - lo) / step) * 5));
  $("marker-base").style.setProperty("--pos", `${pos(before)}%`);
  $("marker-current").style.setProperty("--pos", `${pos(after)}%`);
  $("marker-current").style.setProperty("--start", `${pos(before)}%`);
  const bracket = $("scale-bracket");
  bracket.style.setProperty("--from", `${pos(lo0)}%`);
  bracket.style.setProperty("--to", `${pos(hi0)}%`);
  bracket.classList.toggle("is-falling", after < before);

  const labels = [];
  const labelDecimals = Math.max(decimals, decimalsOf(step));
  for (let v = lo; v <= hi + step / 2; v += step) {
    const label = el("span", { text: formatNumber(v, labelDecimals) });
    label.style.setProperty("--pos", `${pos(v)}%`);
    labels.push(label);
  }
  $("scale-labels").replaceChildren(...labels);
}

function resetReadout() {
  for (const id of ["num-before", "num-after", "shift-delta", "shift-observations", "shift-duration"]) $(id).textContent = "—";
  $("raw-before").textContent = "";
  $("raw-after").textContent = "";
  $("scale").hidden = true;
  $("readout").classList.remove("is-verbatim");
  $("case-id").textContent = "—";
  $("case-id").removeAttribute("title");
}

/** Counts the current numeral from baseline to its measured value. Final text is always the real value. */
function animateCounter(measure, delayMs) {
  if (!measure || reducedMotion.matches) return;
  const node = $("num-after");
  const finalText = node.textContent;
  const duration = 520;
  node.textContent = formatNumber(measure.before, measure.decimals);
  setTimeout(() => {
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = measure.before + (measure.after - measure.before) * eased;
      node.textContent = t < 1 ? formatNumber(v, measure.decimals) : finalText;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, delayMs);
}

/* ── Investigation chain ────────────────────────────────────────────────── */

function setChain(id, state, value) {
  const step = $(id);
  step.dataset.state = state;
  step.querySelector(".chain-value").textContent = value;
}

function renderChain(result) {
  const s = result.summary;
  const files = (result.findings.changeSurface && result.findings.changeSurface.files) || [];
  setChain("chain-code", files.length ? "observed" : "idle", files.length ? `${files.length} file${files.length === 1 ? "" : "s"} · ${files.map((f) => f.path).join(", ")}` : "no Git change");
  setChain("chain-tests", s.tests.result === "PASS" ? "pass" : "fault", `${s.tests.result} · ${s.tests.changed ? "changed" : "unchanged"}`);
  setChain("chain-behavior", s.behavior.changed ? "changed" : "pass", s.behavior.changed ? `CHANGED · ${s.behavior.workflowId}` : `unchanged · ${s.behavior.workflowId}`);
  const evidenceCount = s.evidence.baseline.length + s.evidence.current.length;
  setChain("chain-evidence", "observed", `${evidenceCount} records · ${s.evidence.baseline.length} baseline + ${s.evidence.current.length} current`);
  setChain("chain-causality", "withheld", s.causality === "not_established" ? "not established" : s.causality);
}

function resetChain() {
  for (const id of ["chain-code", "chain-tests", "chain-behavior", "chain-evidence", "chain-causality"]) setChain(id, "idle", "—");
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

function evidenceChip(evidenceId) {
  const button = el("button", { type: "button", className: "chip", "aria-label": `Copy evidence ID ${evidenceId}`, title: "Copy evidence ID" }, [
    el("span", { className: "chip-id", text: evidenceId }),
    el("span", { className: "chip-action", "aria-hidden": "true", text: "Copy" }),
  ]);
  button.addEventListener("click", async () => {
    const ok = await copyText(evidenceId);
    if (!ok) window.getSelection().selectAllChildren(button.querySelector(".chip-id"));
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

/* ── Case file: findings ────────────────────────────────────────────────── */

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
