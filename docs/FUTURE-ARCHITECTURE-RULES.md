# Future Architecture Rules — HACK47 OFFGRID

**Process only.** Do not design the actual product architecture in this document or in the repo until a product is selected.

---

## When architecture may begin

Architecture work starts **only after**:

```text
Evidence → Validation → Product Selection → PRD → Technical Specification → Architecture → Implementation
```

A PRD and technical specification must describe an **actual selected** product. Do **not** create placeholder PRDs, tech specs, ADRs, or architecture before selection.

**Product quality does not compensate for a weak product.** Engineering standards, milestones, and polish must not be used to justify building something that failed research. No architecture, agents, or “practice” services until selection.

Historical note: an earlier direction briefly advanced to planning (22 Sep) and was then **abandoned** (see [`archive/`](../archive/README.md)). As of **22 September 2026 (later)**, product direction is **DiffWitness** with planning docs as SoT. Status: M0–M7 implemented; finalization for submission in progress. See [`archive/research/RESEARCH-STATUS.md`](../archive/research/RESEARCH-STATUS.md), `docs/DIFFWITNESS-PRD.md`, `docs/ARCHITECTURE.md`.

**Still forbidden:** empty services, fake repositories, placeholder APIs, and application code *beyond the authorized milestone*. DiffWitness M1 is complete in `packages/diffwitness/`; do not start M2 without approval. See `docs/DIFFWITNESS-PRD.md`, `docs/ARCHITECTURE.md`.

---

## What future architecture should consider

Once a real product exists, architecture should consider:

- **domain** — core concepts and invariants
- **application / use cases** — user-visible jobs and workflows
- **infrastructure** — hosting, runtime, deployment boundaries justified by requirements
- **persistence** — only if the product needs durable state
- **external integrations** — real providers behind interfaces
- **presentation / API** — how humans and clients interact
- **security boundaries** — trust edges, auth, data egress
- **observability** — logs, errors, critical transitions
- **configuration** — env/config; no hardcoded secrets or environment specifics

Detail and technology choices must come from the selected product’s requirements — not from this checklist alone.

---

## Explicit prohibitions (now and later)

Do **not** create:

- empty services
- fake repositories
- fake domain classes
- placeholder APIs
- unused database schemas
- fake agents
- speculative microservices
- architecture diagrams used as a substitute for a product decision

Do **not** invent application code, Docker stacks, or agent frameworks to “hold a place” for a product that does not exist.

---

## Principle

**Architecture must emerge from actual product requirements.**

Standards for quality once building starts: `docs/ENGINEERING-STANDARDS.md`.  
Implementation discipline: `.cursor/rules/hack47-engineering.mdc`.  
Milestone shape: `docs/MILESTONE-TEMPLATE.md`.
