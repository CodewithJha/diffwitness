// DiffWitness hosted demo page. Renders server-returned CLI results only.
// All CLI-derived text goes through textContent — never innerHTML.
"use strict";

const SCENARIO_ID = "pricing-discount-change";

const $ = (id) => document.getElementById(id);

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

const VERDICT_CLASS = {
  "BEHAVIOR CHANGED": "verdict-changed",
  "NO BEHAVIOR CHANGE": "verdict-clean",
  "ANALYSIS ERROR": "verdict-error",
};

function fact(label, value, className) {
  return [el("dt", { text: label }), el("dd", { text: value, ...(className ? { className } : {}) })];
}

function renderSummary(result) {
  const s = result.summary;
  const verdict = $("verdict");
  verdict.textContent = s.verdict;
  verdict.className = VERDICT_CLASS[s.verdict] || "";
  const o = s.observations;
  const changedCount = o.changed + o.appeared + o.disappeared;
  const facts = [
    ...fact("Tests", `${s.tests.result} (${s.tests.changed ? "changed" : "unchanged"}) · workflow ${s.tests.workflowId}`, s.tests.result === "PASS" ? "ok" : "bad"),
    ...fact("Behavior", `${s.behavior.changed ? "CHANGED" : "unchanged"} · workflow ${s.behavior.workflowId}`, s.behavior.changed ? "warn" : "ok"),
  ];
  if (s.output) {
    facts.push(...fact("Output", `${s.output.before} → ${s.output.after}  (${s.output.workflowId} · ${s.output.observationKey})`, "mono"));
  }
  facts.push(
    ...fact("Observations", `${o.unchanged} unchanged · ${changedCount} changed`),
    ...fact("Evidence", `${s.evidence.baseline.length} baseline + ${s.evidence.current.length} current records (IDs below)`),
    ...fact("Change", result.scenario.change),
  );
  $("summary-facts").replaceChildren(...facts);
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

function setBusy(busy) {
  const button = $("run");
  button.disabled = busy;
  button.setAttribute("aria-busy", busy ? "true" : "false");
  button.textContent = busy ? "Running…" : "Run demo again";
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
