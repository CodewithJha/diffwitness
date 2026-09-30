# Engineering Standards — HACK47 OFFGRID

> **Build-phase process document.** The engineering standards used while building DiffWitness. The contributor-facing rules are summarized in [CONTRIBUTING.md](../CONTRIBUTING.md); this document keeps the fuller rationale.

**Applies after a product is selected.** These standards define production-quality software, not hackathon throwaway code.

**Current product direction (27 Sep 2026):** DiffWitness — local-first behavioral intelligence CLI. Status: M0–M7 implemented in `packages/diffwitness/` (M7 = hosted trusted demo, 29 Sep 2026); finalization for submission in progress. See [`archive/research/RESEARCH-STATUS.md`](../archive/research/RESEARCH-STATUS.md).

---

## DiffWitness extensions (CLI / local-first / AI)

These add to — not replace — the standards below.

1. **CLI boundary:** argv parsing and exit-code mapping live at the edge; domain logic must be testable without process spawning.
2. **Local-first default:** no required cloud control plane; optional providers behind interfaces (`MockAIProvider` required when AI exists).
3. **Evidence-first AI:** models may explain only schema-validated evidence packets; AI must not execute shell or decide analysis success.
4. **Analysis ≠ clean:** failed capture/diff must not be reported as “no behavioral regression.”
5. **Execution policy:** timeouts, output caps, argv arrays preferred over shell strings; document trust assumptions when running repo workflows.
6. **Config:** workflows, model IDs, endpoints, and keys from env/config — never hardcoded secrets or environment-specific paths in source.
7. **Small surface:** prefer one modular CLI binary over microservices or agent meshes.

Details: `docs/architecture/ai.md`, `docs/security/threat-model.md`, `docs/reference/cli.md`.

---

## Modularity

**Use:**

- small cohesive modules
- single responsibility
- clear boundaries
- explicit interfaces
- reusable components where justified
- independently testable business logic

**Avoid:**

- giant files
- giant functions
- duplicated logic
- tightly coupled modules
- unnecessary abstractions
- premature microservices

---

## Configuration

Never hardcode:

- secrets
- API keys
- credentials
- URLs
- ports
- model identifiers
- environment-specific paths
- deployment configuration

Use configuration / environment variables appropriately.

Avoid magic numbers and magic strings.

Never commit secrets. Use `.env` locally; keep secrets out of git.

---

## Domain Logic

Business logic must not be buried inside:

- HTTP handlers
- UI components
- database queries
- CLI commands
- provider-specific integrations

Keep core domain behavior independently testable.

---

## External Integrations

External providers should be isolated behind clear interfaces.

Conceptually:

```text
domain
  → application / service layer
  → provider interface
  → provider implementation
```

Vendor-specific details should not spread throughout the application.

Do not fake production integrations for demos that claim to be real.

---

## Testing

Use appropriate levels:

- unit tests
- integration tests
- contract tests
- end-to-end tests

Do not write meaningless tests only to increase coverage.

Prefer tests that lock important behavior and failure cases.

---

## Error Handling

Errors must be:

- explicit
- contextual
- actionable
- observable

Never silently swallow important failures.

---

## Observability

Important workflows should have appropriate:

- structured logging
- error context
- operation identifiers where useful
- external dependency failure visibility
- important state transition visibility

Avoid useless logging noise.

---

## Security

- Never commit secrets.
- Validate external input.
- Use least privilege.
- Treat third-party responses as untrusted input.

Do not build Web3, blockchain, or cyber/offensive-security features in this repo (see `AGENTS.md` and `.cursor/rules/hackathon.mdc`).

---

## Dependencies

Do not add a dependency unless there is a concrete reason.

Prefer standard / library solutions when they are sufficient.

Avoid dependency bloat.

---

## Scalability

Start simple. Scale only when a real requirement demands it.

**Prefer:**

- a single deployable service when that meets the job
- clear module boundaries inside one process
- horizontal scale only after measured need

**Avoid premature:**

- message queues
- microservices
- distributed systems complexity
- “platform” infrastructure without a concrete load or isolation requirement

See also: do not optimize prematurely; do not introduce microservices without a concrete requirement (`.cursor/rules/hack47-engineering.mdc`).

---

## Deployability

Judges need a **public demo URL**. Laptop-only is not a submission (`AGENTS.md`, `.cursor/rules/hackathon.mdc`).

When implementing a selected product, plan for:

- environment-based configuration (no hardcoded host/port/secrets)
- a reproducible run path (documented commands; pinned runtime where it matters)
- a simple health/readiness check appropriate to the stack
- a hosted deployment path — not Docker/K8s/infra theatre by default

Do **not** add containers, orchestrators, or multi-service meshes until requirements justify them. Document how to run and deploy; ship the smallest honest hostable surface.

---

## Maintainability

Code should be understandable by another engineer without requiring the original author to explain it.

**Prefer:**

- good naming
- simple control flow
- clear module boundaries
- explicit contracts
- minimal comments

Comments should explain **why**, not obvious **what**.

---

## Persistence

Only introduce durable state when the selected product requires it.

When persistence is required:

- choose the simplest store that fits the job
- keep schema and data access evolvable (clear boundaries; migrations or equivalent when schema changes)
- do not invent databases, schemas, or repositories before requirements demand them

See `docs/FUTURE-ARCHITECTURE-RULES.md` — persistence is architecture after selection, not beforehand.

---

## UX (when implementing)

Once a selected product is being built:

- production-quality UX for the one painful job
- clear primary user flow
- useful loading, error, and empty states
- reliable demo path (hosted, honest)
- no fixture theatre
- no misleading fake functionality

Graceful handling of dependency or API failure belongs in the UX and error-handling surfaces — not silent broken demos.

---

## Reliability

The primary demo path must remain honest and usable when external dependencies fail.

Where appropriate:

- timeout external calls
- handle provider errors with useful failure states
- retry only when safe
- avoid duplicate side effects
- degrade gracefully

Do not hide failures merely to make the demo look successful. Do not report success when an important operation failed.

---

## Cursor development discipline

Never generate the entire application in one giant change.

Use:

```text
Milestone → Implement → Inspect → Test → Verify → Review → Next milestone
```

Keep changes small and reviewable. Use `docs/MILESTONE-TEMPLATE.md`. Do not modify unrelated files.

---

## Post-hackathon viability

Structure implementation so it can continue after OFFGRID without a complete rewrite.

**Prefer:** modular boundaries, honest integrations, env-based configuration, and the smallest architecture that still matches real requirements.

**Avoid:** throwaway scaffolds presented as the product, one-shot demo hacks that cannot be maintained, and architecture theatre that forces a rewrite to ship anything real.
