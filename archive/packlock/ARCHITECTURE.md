# PackLock — Architecture

**Status:** Planning (no application code; no directories created yet)  
**Date:** 22 September 2026  
**Depends on:** `docs/PRD.md`, `docs/TECHNICAL-SPECIFICATION.md`  
**Standards:** `docs/ENGINEERING-STANDARDS.md`, `docs/FUTURE-ARCHITECTURE-RULES.md`

---

## 1. Architectural style

**Modular monolith** — one deployable process (API + static UI or colocated SSR), clear internal modules, **no microservices**, no message-bus theatre, no fake ERP/MES adapters.

```text
Presentation  →  Application  →  Domain  →  Infrastructure
```

Dependency rule: inward only. Domain has no imports from HTTP, DB drivers, or AI SDKs.

---

## 2. Application path (when coding starts)

| Path | Role |
|---|---|
| `apps/packlock/` | **New** PackLock application root (create only after implementation approval) |
| `src/` | **Historical Afterhours scaffold — inactive.** Do not extend as PackLock |

Recommended layout (illustrative; create later):

```text
apps/packlock/
  package.json          # or workspace root package when monorepo wired
  src/
    presentation/       # HTTP routes, UI
    application/        # use cases / commands
    domain/             # entities, invariants, ValidationEngine
    infrastructure/     # db, blob store, parsers, AI adapters
  fixtures/
  tests/
```

Root `package.json` today remains the historical Afterhours entry; PackLock wiring is a later milestone decision (workspace vs replace root) — prefer **additive** `apps/packlock` so history stays untouched.

---

## 3. Layer responsibilities

### Presentation

- REST JSON API (`/api/v1/...`)
- Web UI for the single job: upload → issues → override → release certificate
- Authn session binding; **authz enforced on server**
- Maps domain/application errors to typed API error envelopes
- **Never** computes PASS/RELEASE locally

### Application

- Use cases: CreatePack, UploadArtifact, AnalyzePack, ApplyOverride, ReleasePack, LoadDemoFixture
- Orchestrates ports; owns transactions and audit append
- Enforces lifecycle transitions from tech spec
- Fail-closed wrappers around validation and AI

### Domain

- Entities and value objects (`ManufacturingPack`, issues, snapshot, override, …)
- Invariants (release/snapshot/override/validation)
- `ValidationEngine` + check modules (pure functions over facts + policy)
- No I/O

### Infrastructure

- Persistence adapter (SQL)
- Blob storage adapter (filesystem MVP; S3-compatible interface for later)
- Deterministic parsers (BOM, XY, hash, light Gerber/ODB metadata)
- `AiExtractionPort` implementations: Mock (CI/demo), OpenAI-compatible (optional)
- Structured logger

---

## 4. Modules (bounded contexts inside the monolith)

| Module | Owns |
|---|---|
| **Packs** | Pack aggregate, status, listing |
| **Artifacts** | Upload, classification, revisions, hashes |
| **Extraction** | Deterministic fact extractors; AI assist behind port |
| **Validation** | Policy, engine, checks, runs, issues |
| **Release** | READY gate, snapshot, token/certificate |
| **Overrides** | Scoped deviations + approver checks |
| **Audit** | Append-only event log |
| **Identity** | Users/roles for demo (viewer/operator/approver) |
| **Demo** | Fixture loader (feature-flagged) |

Modules communicate via application services / domain types — not HTTP to each other.

---

## 5. Ports and adapters

```text
Application
  ├── ArtifactStorePort          → FilesystemArtifactStore
  ├── PackRepositoryPort         → SqlPackRepository
  ├── ValidationRunRepositoryPort
  ├── AuditPort                  → SqlAuditLog
  ├── ClockPort                  → SystemClock
  ├── AiExtractionPort           → MockAiExtraction | HttpAiExtraction
  └── TokenSignerPort            → HmacReleaseTokenSigner
```

**No** `ErpPort`, `MesPort`, or `TravelerLockPort` in MVP. The release **certificate/token** is the SoR PackLock owns; external systems may consume it later via export — not fake live locks.

---

## 6. Processing model

- **Synchronous path** for small demo packs: upload → analyze → return issues (request timeout budget from config).
- **Async justified only if** pack size / parse time exceeds request budget: in-process job queue (e.g. DB-backed `ANALYZING` worker loop) inside the same monolith — **not** a separate microservice.
- UI polls pack status while `ANALYZING`.
- Failures leave pack non-READY (fail-closed).

---

## 7. Persistence

- MVP: **SQLite** (or single Postgres if host requires it) via migrations
- Store: packs, artifacts metadata, revisions (facts JSON), validation runs/issues, overrides, release snapshots, audit events, policy versions
- Blobs: local directory from `BLOB_STORAGE_PATH` on demo host
- Released snapshots: insert-only rows; application rejects UPDATE/DELETE

---

## 8. AuthZ roles

| Role | Can |
|---|---|
| `viewer` | Read packs, issues, certificates, audit |
| `operator` | Create packs, upload, analyze, load fixtures (if enabled) |
| `approver` | Create overrides; mint RELEASE |

Demo may seed three users or role-switch under a demo flag — still enforced server-side.

---

## 9. Fail-closed & immutability (architecture)

- Validation and release use cases catch infrastructure errors and convert to failed runs / 5xx with pack left non-READY
- Release use case re-checks open BLOCK issues inside the same transaction as snapshot insert
- Snapshot + token signing secret from env (`RELEASE_TOKEN_SECRET`)
- AI adapter failures → missing assistive facts, never synthetic PASS

---

## 10. Frontend architecture

- SPA (React + Vite) or minimal server-rendered pages — choose one; prefer **React + Vite** talking to the API for clear separation
- Primary screens: Pack list / open pack; Issue list with citations; Override form; Release certificate view
- Optimistic UI allowed for uploads; **release button** only enabled from server-reported `READY`, and release POST still authoritative
- No client-side rule engine copy that can disagree with server

---

## 11. Stack recommendation (binding for planning)

**TypeScript full-stack modular monolith**

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript end-to-end | One mental model; strong typing for facts, schemas, API errors |
| API | Node 20+ with **Hono** or **Fastify** | Small, fast, fit for solo; avoid Nest boilerplate |
| UI | **React + Vite** | Sufficient for one workflow; not a design-system rewrite |
| Validation schemas | **Zod** (or equivalent) | Boundary validation for API + AI JSON |
| DB | **SQLite** + Drizzle or Prisma (pick one at Milestone 0) | Zero ops for demo; Postgres swap via same repository port if host needs it |
| AI | Optional OpenAI-compatible HTTP client behind port | Mock in CI |
| Test | Vitest / node:test + a few API integration tests | Deterministic with mock AI |
| Deploy | Single Node process + static assets on Railway/Fly/Render-class host | **No** Docker Compose multi-service requirement for MVP |

**Not chosen for MVP:** Python FastAPI + separate React (two runtimes/deployables), microservices, Kubernetes, Redis-required queues.

---

## 12. Security boundaries

- Trust edge: multipart upload, AI provider responses, fixture manifests
- Validate all external input at presentation/application boundary
- Secrets only via env; never commit
- Structured logging without payloads that contain API keys

---

## 13. Explicit non-architecture

- Do not create empty services, fake repositories, or placeholder microservices “for later”
- Do not claim ERP traveler lock integrations
- Do not extend `src/server.mjs` Afterhours agent into PackLock
- Do not introduce agents unless a future PRD change requires them (MVP does not)

---

## 14. Deployability (planned)

- Env-based config; `/health` and `/ready`
- Documented `npm`/`pnpm` scripts inside `apps/packlock` when created
- Hosted demo URL required for submission; local-only is insufficient
- Prefer platform-native Node deploy over premature container orchestration
