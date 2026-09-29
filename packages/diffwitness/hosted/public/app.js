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

function renderFindings(findings) {
  const items = findings.items.map((f) =>
    el("li", {}, [
      el("span", { className: `sev sev-${f.severity}`, text: f.severity }),
      el("span", { className: "finding-text", text: `${f.workflowId} · ${f.observationKey} — ${f.summary}` }),
      el("span", { className: "muted small", text: f.associationStatus === "associated" ? "changed alongside the Git change below" : `association: ${f.associationStatus || "—"}` }),
    ]),
  );
  $("findings-list").replaceChildren(...(items.length ? items : [el("li", { text: "No behavioral findings." })]));
}

function renderGit(result) {
  const change = result.stages.find((s) => s.id === "change");
  $("git-diff").textContent = change && change.stdout ? change.stdout : "(no diff)";
  const cs = result.findings && result.findings.changeSurface;
  $("surface-note").textContent = cs
    ? `Change surface (Git): ${cs.files.map((f) => `${f.status} ${f.path}`).join(", ") || "none"} · causality: ${cs.causality === "not_established" ? "not established" : cs.causality}`
    : "";
}

function evidenceSide(label, side) {
  const preview = side && side.preview !== null ? side.preview.replace(/\n$/, "") : "(no preview in packet)";
  return el("div", { className: "side" }, [
    el("div", { className: "side-head" }, [
      el("strong", { text: label }),
      el("code", { className: "evid", text: side ? side.evidenceId : "(none)" }),
    ]),
    el("pre", { text: preview || "(empty)" }),
  ]);
}

function renderEvidence(findings) {
  const blocks = findings.items.map((f) =>
    el("div", { className: "evidence" }, [
      el("p", { className: "evidence-title", text: `${f.workflowId} · ${f.observationKey}` }),
      el("div", { className: "sides" }, [evidenceSide("Before (baseline)", f.before), evidenceSide("After (current)", f.after)]),
    ]),
  );
  $("evidence-list").replaceChildren(...blocks);
}

function renderExplanation(explanation) {
  if (!explanation) return;
  $("explain-summary").textContent = `MockAI — deterministic offline explainer (${explanation.status}; ${explanation.promptVersion || "—"})`;
  $("explain-narrative").textContent = explanation.narrative || explanation.error || "(no explanation)";
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
}

function renderFailure(result, fallbackMessage) {
  const box = $("failure");
  const failure = result && result.failure;
  if (!failure && !fallbackMessage) { box.hidden = true; return; }
  box.hidden = false;
  box.replaceChildren(
    el("strong", { text: failure ? `Demo failed: ${failure.kind}` : "Request failed" }),
    document.createTextNode(
      failure ? ` — ${failure.message}${failure.stage ? ` (stage: ${failure.stage})` : ""}` : ` — ${fallbackMessage}`,
    ),
  );
}

async function run() {
  setBusy(true);
  $("run-status").textContent = "Running baseline → change → check → explain with the real CLI…";
  renderFailure(null, null);
  let result = null;
  try {
    const response = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: SCENARIO_ID }),
    });
    const body = await response.json().catch(() => null);
    if (body && Array.isArray(body.stages)) {
      result = body;
    } else {
      renderFailure(null, body && body.error ? body.error.message : `HTTP ${response.status}`);
      $("run-status").textContent = "";
      return;
    }
  } catch {
    renderFailure(null, "Network error");
    $("run-status").textContent = "";
    return;
  } finally {
    setBusy(false);
  }

  renderTechnical(result);
  renderFailure(result, null);
  if (result.status !== "completed" || !result.summary || !result.findings) {
    $("results").hidden = true;
    $("run-status").textContent = "Failed — see the message above.";
    $("failure").scrollIntoView({ block: "start" });
    return;
  }
  renderSummary(result);
  renderFindings(result.findings);
  renderGit(result);
  renderEvidence(result.findings);
  renderExplanation(result.explanation);
  $("results").hidden = false;
  $("run-status").textContent = `Completed in ${result.durationMs} ms.`;
  $("summary-card").scrollIntoView({ block: "start" });
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
    $("run").disabled = false;
  } catch {
    $("scenario-title").textContent = "Demo unavailable";
  }
  $("run").addEventListener("click", run);
}

init();
