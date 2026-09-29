# Adversarial validation: Canary Session

**Date:** 21 September 2026  
**Role:** Kill the candidate. Do not defend it.  
**Candidate:** Canary Session only.  
**Verdict: KILLED**

---

## Thesis (to attack)

Traditional evals are short tests; some failures only emerge in longer workflows. Canary Session stores a golden agent session and **reruns it** after model / prompt / tool / config changes. Question: did the agent still behave correctly?

Hackathon demo claimed in prior research: flip one config knob (e.g. reasoning effort) → canary fails assertions / token spike; optionally bisect the config commit.

---

## Kill test A — Promptfoo already is this product

**Result: FAIL (exact product is already possible). This test alone is sufficient to kill.**

Promptfoo is not “an eval dashboard.” Verified 21 Sep 2026:

| Claim | Verified fact | Source |
|---|---|---|
| Stars | **25,332** | `gh repo view promptfoo/promptfoo` |
| Positioning | “Test your prompts, **agents**, and RAGs… Simple declarative configs with command line and **CI/CD** integration. Used by OpenAI and Anthropic.” (vendor README claim) | GitHub description |
| Docs last updated | **21 Sep 2026** (today) | promptfoo.dev pages |

### Multi-step / long-horizon sessions

Official guide **Evaluate OpenAI Agents (Python SDK)** (`https://www.promptfoo.dev/docs/guides/evaluate-openai-agents-python/`, last updated 21 Sep 2026):

- Multi-turn execution over a persistent `SQLiteSession`.
- Explicit section **“Long-Horizon Tasks”**: one eval row takes a JSON list of user turns (`vars.steps_json`); the provider runs them sequentially against shared session memory.
- “That pattern is useful when you want to evaluate: multi-step workflows that need memory; agent handoffs over time; task completion after several intermediate actions; **regressions in tool usage across longer trajectories**.”
- Returns `tokenUsage.numRequests`, cached-input tokens, reasoning-token detail so the multi-call footprint is not collapsed to one request.

Official guide **Evaluate Coding Agents** (`https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/`, last updated 21 Sep 2026):

- Coding agents “iterate—often **dozens of times**.”
- First-class providers: OpenAI Codex SDK, Codex app-server, **Claude Agent SDK**, OpenCode SDK, Open Interpreter.
- Why agent evals differ: non-determinism compounds across tool calls; intermediate steps matter; “Two agents might produce identical final outputs, but one read 3 files and the other read 30.”
- Assertions on pytest actually running (`trajectory:step-count` on `pytest*`), cost thresholds, `--repeat 3` for variance, `--no-cache` so stale responses do not hide regressions.
- QA checklist: “Run coding agent evals like integration tests. A useful PR or release check includes… Trace or metadata assertions when the intermediate path matters.”

This is the Canary Session 10-second line (“replay a 30-minute golden agent session after you change the prompt”) written as Promptfoo YAML.

### Capture trajectories

**Tracing** (`https://www.promptfoo.dev/docs/tracing/`): OpenTelemetry traces per test-case execution; multi-turn tests keep target requests and grading in the same trace; tool names/args from generic `tool.name` / `tool.arguments` and Vercel AI SDK attributes; command-like spans (`exec_command`, `shell`) normalized into trajectory steps.

### Compare outputs / regression

Matrix eval of prompts × providers; GitHub Action described as “automatically run a **before vs. after** evaluation of edited prompts”; HTML/JSON/JUnit outputs; shareable viewer.

### Assertions, including tool-call tests

**Assertions and Metrics** (`https://www.promptfoo.dev/docs/configuration/expected-outputs/`):

Deterministic: `is-valid-function-call`, `is-valid-openai-tools-call`, `trace-span-count`, `trace-span-duration`, `trace-error-spans`.

Trajectory (exact Canary Session object):

- `trajectory:tool-used`
- `trajectory:tool-args-match`
- `trajectory:tool-sequence` (including `mode: exact`)
- `trajectory:step-count`
- `trajectory:goal-success` (LLM judge on whether the traced workflow completed the goal)
- `cost` threshold (token-spike canary)

Python Agents example asserts `lookup_reservation → update_seat → faq_lookup`, partial arg match on `update_seat`, agent-span count, `trace-error-spans: max_count: 0`.

Coding-agent example: “If your agent emits tool-oriented spans, add `trajectory:tool-used` or `trajectory:tool-sequence` to verify the exact tool path.” Plus `cost: threshold: 0.50`.

### CI

- Docs: `https://www.promptfoo.dev/docs/integrations/ci-cd/` — `npx promptfoo@latest eval --fail-on-error`; GitHub/GitLab/Jenkins; quality gates on failure count / pass rate; JUnit; PR comments.
- GitHub Action: `https://www.promptfoo.dev/docs/integrations/github-action/` — `promptfoo/promptfoo-action@v1`; Marketplace “Test LLM outputs”.
- Action repo: **72★** (`gh repo view promptfoo/promptfoo-action`).
- Red-team docs (`site/docs/red-team/llm-agents.md` in-repo): “turn the issue into a focused **regression eval or CI check**” using the same `trajectory:*` assertions.

### Replay

Not Chronicle-style cut-point replay of recorded envelopes. Promptfoo **re-runs** the agent against saved tests (live or cache). There is also `/api/eval/replay` and UI “Edit & Replay” for a single eval test, plus Hydra “replay mode” for multi-turn red team (full transcript replay to a stateless target). Caching docs: re-running the same eval **replays** cached responses unless `--no-cache`.

**That is Canary Session’s specified mechanism:** store golden cases, rerun after a config/prompt/model change, assert behavior. Promptfoo’s coding-agent + tracing + `trajectory:*` + `cost` + GitHub Action is that product as a configuration, not a research idea.

**Remaining gap vs Canary Session pitch:** Promptfoo does not, in fetched docs, sell “one 30-minute golden transcript as the default object” or config-commit bisect UX. That is a README/UX difference. It is not a new mechanism. A competent engineer writes `promptfooconfig.yaml` with `steps_json`, `trajectory:tool-sequence`, `cost`, and `promptfoo-action@v1`.

---

## Kill test B — Langfuse already covers session replay + regression CI

**Result: FAIL for remaining wedge. What remains is not a 3-week company.**

Langfuse verified 21 Sep 2026: **34,891★** (`gh repo view langfuse/langfuse`; prior research had 34,889). Acquired by ClickHouse (amount Unknown; not re-litigated).

| Canary Session need | Langfuse feature | Source |
|---|---|---|
| Store a session | `sessionId` groups traces; **session replay** of the entire interaction | `https://langfuse.com/docs/observability/features/sessions` |
| Golden set from real runs | Add production traces/observations to a **dataset**; batch add from observations table; link `source_trace_id` | `https://langfuse.com/docs/evaluation/experiments/datasets` |
| Rerun after change | Dataset experiments (SDK/UI/OTel): run the app against the dataset, score, inspect | same + `https://langfuse.com/docs/evaluation/get-started/offline` |
| Compare experiments | Dataset runs compared in UI; CI posts “link to the Langfuse **experiment comparison view**” | `https://langfuse.com/docs/evaluation/experiments/experiments-ci-cd` |
| Regression testing | `RegressionError`; policies “no approved passing case may regress”; pin `dataset_version`; approved baseline in git | same CI doc |
| CI | `langfuse/experiment-action`; fail job; PR comment with scores and comparison link | same |
| Multi-turn | Cookbook: N+1 / multi-turn conversations: traces → dataset of conversation history → rerun chatbot → score | `https://langfuse.com/guides/cookbook/example_evaluating_multi_turn_conversations` |

**What remains after Langfuse?** Not “did the agent still behave.” That is dataset experiments + session replay + CI. Remaining is: (1) first-class “golden long coding-agent session” object, (2) deterministic **cut-point** replay of recorded tool/LLM envelopes (Langfuse re-runs live, like Promptfoo). (1) is UX. (2) is Chronicle, not us.

Humanloop sunset (8 Sep 2025) extra-kills “another eval SaaS login.”

---

## Kill test C — Long-horizon thesis: real pain, already owned

**Result: pain is real; “unsolved product job” is false.**

### Evidence that long-horizon / config regressions exist (do not deny)

1. **Official Anthropic postmortem — previously UNCONFIRMED; now CONFIRMED.**  
   URL: `https://www.anthropic.com/engineering/april-23-postmortem`  
   Fetched 21 Sep 2026. Published **23 Apr 2026**.  
   Three product-layer changes (not API/weights):  
   - 4 Mar 2026: default reasoning effort `high` → `medium` (reverted 7 Apr).  
   - 26 Mar 2026: cache/idle thinking-clear bug that kept dropping prior reasoning **every subsequent turn** after one idle hour — “forgetful, repetitive, odd tool choices.” Fixed 10 Apr, v2.1.101.  
   - 16 Apr 2026: verbosity system-prompt line; broader ablations later showed **~3%** coding-eval drop; reverted 20 Apr, v2.1.116.  
   Quote: “neither our internal usage nor **evals initially reproduced** the issues.” The caching bug “only happening in a corner case (stale sessions).”  
   Going forward they will run a **broader per-model eval suite for every system prompt change**, soak periods, gradual rollouts, prompt-change audit tooling.  
   **This supports the failure mode. It does not support a new startup.** Anthropic’s own answer is more evals, soak, and prompt audit — i.e. they will eat the canary.

2. **Chronicle (arXiv:2609.20625), submitted 17 Sep 2026** (four days before this memo): live re-run of an agent **rarely repeats** the trajectory because inference is not bitwise reproducible, tools read changing state, and multi-step paths diverge. Record-and-replay of **boundaries** is the proposed CI object. Public: `https://github.com/theagentplane/chronicle` (**23★**, created 17 Jun 2026).

3. **HORIZON** (`https://arxiv.org/html/2604.11978v1`): agents break on long-horizon interdependent sequences; 3100+ trajectories; horizon-dependent degradation. This is a **benchmark/diagnosis** paper, not a missing SaaS.

4. **Beyond Final Scores** (`https://arxiv.org/html/2608.13417v1`): long-horizon R&D agents; “existing benchmarks primarily evaluate them using a single final score.” Process metrics, not a hosted canary product.

5. **Hamel (2024)** `https://hamel.dev/blog/posts/evals/`: unsuccessful LLM products lack evals; Level 1 unit tests on every change; looking at traces. He does **not** claim “long-session replay is an unsolved product.” He claims teams skip evals and skip looking. Promptfoo/Langfuse/LangSmith are the tools for that job.

### Evidence that rejects “distinct unsolved job”

- Promptfoo coding-agent + long-horizon docs (today).
- Langfuse sessions + datasets + CI regression.
- **LangSmith trajectory evals** (`https://docs.langchain.com/langsmith/trajectory-evals`): `agentevals` strict / unordered / subset / superset trajectory match against a **reference trajectory**; LLM-as-judge trajectory accuracy; plus **backtests** on a new agent version from production runs (`https://docs.langchain.com/langsmith/run-backtests-new-agent`).
- Anthropic is building the eval suite that would have caught their own canary.
- Chronicle’s related work cites tracing and evaluation frameworks (including promptfoo) as already scoring outputs; their claimed gap is **cut-point replay**, which Canary Session as specified **does not even claim**.

**Secondary “Claude felt off” blogs:** do not use. The official postmortem is enough.

---

## Kill test D — Reliability experiment

**Result: 10/10 only on a fake deterministic runtime. Real-agent 10/10 is unproven and the literature says live replay will flake. Per the standing rule, a canary that cannot distinguish regression from flake on a non-scripted agent is dead. Combined with A/E this kills.**

**What was run (not product code; not in `src/`; no npm in the repo):**  
`/tmp/canary_session_kill_experiment.py` → `/tmp/canary_session_experiment/report.json`  
Python 3 stdlib. Scripted sequential “coding agent.” One config knob: `reasoning_effort` `high` vs `medium`. Golden assertions: exact tool sequence `[search, read, edit, test, commit]`, tokens in [1800, 4200], must call `test`. Medium skips `test` and drops tokens to 1100 (the Anthropic-shaped knob).

| Condition | Baseline (high) | After change (medium) | 10/10 regression? |
|---|---|---|---|
| Deterministic scripted | 10/10 pass | 10/10 fail (missing `test` + token band) | **YES** |
| Stochastic: 15% chance high skips `test` (LLM-like) | **7/10 pass** (3 false fails) | 10/10 fail | **NO** |

**Adversarial reading:**

- The 10/10 “success” is a unit test we wrote to fail when a flag is flipped. It does not test LLM replay, provider drift, tool-world state, or flake vs regression.
- Promptfoo already documents `--repeat 3` and “If a prompt fails 50% of the time, the prompt is ambiguous” — they already treat flake as the central coding-agent eval problem.
- Chronicle abstract: a re-run **rarely repeats**; full replay is bit-stable **only when model calls are stubbed from a record**.
- Anthropic: **evals initially did not reproduce** the quality issues; the worst bug needed a stale session.
- Feasibility file `09`: true multi-hour Claude Code replay is **Extremely hard**; 3-week demo is “Yes only with a fake/scripted runtime.” A judge who asks “did you fake the fail?” is correct.

**Standing kill rule from the parent brief:** if we cannot get 10/10, kill. We cannot get 10/10 on any runtime that resembles a real agent. The deterministic 10/10 is the hackathon demo’s original sin, not evidence the product works.

---

## Kill test E — Product distinction

**Result: this is Promptfoo with longer traces. KILL.**

Canary Session as specified = save inputs + expected tool path + token/cost bounds, rerun agent after a config change, fail CI.

That sentence is Promptfoo `promptfooconfig.yaml`:

```yaml
tracing: { enabled: true }
prompts: [ "the golden multi-turn task" ]
providers:
  - id: anthropic:claude-agent-sdk
    config: { model: claude-sonnet-4-6, working_dir: ./repo }
tests:
  - vars: { steps_json: "[...golden turns...]" }
    assert:
      - type: trajectory:tool-sequence
        value: { steps: [search, read, edit, test, commit], mode: exact }
      - type: cost
        threshold: 0.50
```

plus `promptfoo-action@v1` on PRs that touch prompts/config.

No mechanism remains that cannot be described as a **small Promptfoo configuration**. Config-commit bisect is `git bisect` + the same eval. Hosted HTML report is `promptfoo eval -o report.html`.

If someone objects “we store a *recording* and replay envelopes,” that is **Chronicle** (arXiv 17 Sep 2026, GitHub `theagentplane/chronicle`, PyPI `agent-chronicle`), not Canary Session. Chronicle’s paper argues the naive rerun (our thesis) **does not work**. Building Chronicle in 3 weeks against a 23★ repo that already published the paper is a clone.

LangSmith `agentevals` already matches a **reference trajectory** in strict mode. Same object, different vendor.

**TraceGym** (`hoomanesteki/tracegym-ai-agent-evaluation`, **1★**, created 25 Jul 2026) is the same slogan: “Record → replay → score → gate… Capture an agent once, replay it deterministically… block regressions in CI.” Even a 1★ repo occupying the name is enough to kill originality for OFFGRID.

---

## Strongest alternative

**Promptfoo** (25,332★) for the specified live-rerun canary.  
**Chronicle** if the job is actually record/cut-point replay (it is not what the thesis says, and it is already shipped as OSS).  
**Langfuse** (34,891★) / **LangSmith** if the job is session replay + datasets + experiment comparison + CI.

---

## Difference

| Ours | Incumbent |
|---|---|
| Golden long session as default UX | Promptfoo: same assertions; session is a test case with `steps_json` |
| Replay after config change | Promptfoo eval + GitHub Action; Langfuse dataset experiment; LangSmith backtest |
| Fail on missing tool / token spike | `trajectory:tool-sequence` + `cost` |
| Bisect config | git bisect + CI |
| Recorded envelope cut-point replay | **Not in our thesis.** Chronicle already has it |

Material difference: **none that is not a wrapper or a Chronicle clone.**

---

## Does it matter?

No. A judge who has used Claude Code or shipped an agent will ask “Promptfoo?” The honest answer, with today’s docs, is **yes**. Originality and Product Thinking fail. Technical Depth is YAML + a runner. Potential is “eval tool in a category that already sunset Humanloop.”

The Anthropic incident **matters as a story** and **does not matter as a wedge**: they published the postmortem and listed internal eval expansion as the fix.

---

## Demo breakage

1. **Scripted fail looks fake** (`09` already warned). Judges who read `src/` see a fixture agent.
2. **Real Claude Agent SDK replay**: cost, timeout, flake, API keys in the hosted demo, provider variance on judging day (keep-live through 25 Oct).
3. Promptfoo’s own coding-agent guide: high token usage, 30–120s tasks, `--repeat 3` because the same prompt differs across runs. That is the opposite of a 20-second reliable wow.
4. “Flip reasoning effort” is the **exact knob Anthropic already documented**. Using it as a demo is a book report on a public postmortem.

---

## Business breakage

- Crowded evals: Promptfoo 25,332★, Langfuse 34,891★ + ClickHouse, LangSmith trajectory/backtests, Braintrust (pricing not re-fetched this pass), DeepEval / Phoenix adjacent.
- Humanloop sunset 8 Sep 2025: independent eval login is acquihire-fragile.
- Switching cost: **low** (prior `06`). Teams with Promptfoo YAML do not migrate.
- WTP: Unknown; default is “we already pay LangSmith/Langfuse” or “npx promptfoo.”
- Providers (Anthropic) expanding evals after the incident.
- OFFGRID field ~87; “we built evals” is the most common-looking AI-eng submission.

---

## Copy-me

**Yes, weekend.** Prior `06` reproducibility test already said yes. Promptfoo config + one coding-agent provider is the copy. Chronicle is MIT-style public paper + repo. A second OFFGRID team can `npx promptfoo@latest init --example openai-agents` today.

---

## No-AI

The core (assertions, token bounds, config snapshot) works without an LLM judge. **That does not save it.** Product-without-AI is a Promptfoo feature, not a reason to exist. Using an LLM judge (`trajectory:goal-success`) reintroduces Zheng et al. bias (already used to kill Judge Swap CI in this repo).

---

## Judge-says-no

Hardest question in `07`: “Promptfoo?”  
**Updated answer: yes, and their coding-agent / long-horizon / trajectory docs were updated 21 Sep 2026.**  
Follow-ups: “Langfuse sessions?” “LangSmith agentevals?” “Isn’t this the Anthropic postmortem?” All yes. Originality = 0. Execution of a wrapper is not Technical Depth.

---

## 2-year category

Worse. ClickHouse will keep shipping Langfuse experiments. Promptfoo will keep adding agent providers (Claude Agent SDK is already there). Anthropic will keep the eval suite they promised. Chronicle (or a bigger lab) owns cut-point replay if that is even a category. A solo hosted “golden session” report does not survive as a company. Humanloop is the prior.

---

## Unknowns (do not upgrade to facts)

- Independent 2026 TAM for “agent session canaries”: **Unknown**.
- Whether Promptfoo’s Claude Agent SDK provider can replay a *literal* 30-minute Claude Code CLI session including compact/cache internals: **not verified** (docs show SDK workflows, not the full CLI transcript format). This unknown **does not save us**; if Promptfoo cannot, wrapping the real CLI is Extremely hard in 3 weeks (`09`).
- Chronicle production usage / funding: **Unknown** (23★, paper 4 days old).
- TraceGym is a 1★ demo; quality Unknown; existence is enough for copy-me.
- Whether judges value verifiers over generators given an OpenAI-credits prize: still Unknown (hackathon intel). Irrelevant once Originality is gone.

---

## Kill-test scorecard

| Test | Outcome | One line |
|---|---|---|
| A Promptfoo | **KILL** | Long-horizon + coding-agent + `trajectory:*` + cost + GitHub Action **is** the product |
| B Langfuse | **KILL** | Session replay + datasets from traces + experiment compare + `RegressionError` CI |
| C Long-session thesis | **Pain real, job owned** | Anthropic postmortem confirmed; incumbents + Chronicle/LangSmith already instrument it |
| D 10/10 reliability | **KILL** | 10/10 only on deterministic fake agent; 15% flake destroys 10/10; live replay unproven |
| E Distinction | **KILL** | Promptfoo YAML; Chronicle is the actual record-replay paper (17 Sep 2026) |

---

## Verdict

**KILLED**
