# PackLock — Implementation Plan

**Status:** Planning only — **no Milestone 0 coding until implementation approval**  
**Date:** 22 September 2026  
**Depends on:** `docs/PRD.md`, `docs/TECHNICAL-SPECIFICATION.md`, `docs/ARCHITECTURE.md`  
**Template:** `docs/MILESTONE-TEMPLATE.md` (use per milestone when coding)

---

## PackLock implementation assessment

### Repository state

- Research-heavy repo; discovery **CLOSED**; PackLock advanced to PRD/planning.
- Application implementation **has not started** for PackLock.
- Governance docs exist (`ENGINEERING-STANDARDS`, `FUTURE-ARCHITECTURE-RULES`, `MILESTONE-TEMPLATE`, `WIN-PLAN`, `SUBMISSION`).
- No CI workflows, no test suite for a product, no PackLock app tree, no DB, no deploy config for PackLock.
- Git present; MIT-oriented README still says product not permanently selected (sync after selection acceptance).

### Current stack

- Root `package.json`: historical **Afterhours** (`afterhours`), `"type": "module"`, single script `node src/server.mjs`.
- **Zero npm runtime dependencies.**
- Node static server + client notes→brief UI under `src/` (inactive).
- `.env.example` only documents a placeholder OpenAI key comment.
- No Python/React/Docker product stack in use.

### Reusable components

- **Almost none** for PackLock domain.
- Reusable ideas only: env-based secrets habit, `.gitignore` patterns, fixture-folder concept, MIT repo hygiene.
- Do **not** reuse Afterhours agent/brief logic as PackLock core.

### Inactive / historical components

| Path | Status |
|---|---|
| `src/server.mjs`, `src/agent.mjs`, `src/public/*`, `src/fixtures/messy-week.txt` | Historical Afterhours scaffold — **inactive** |
| Root `npm start` | Historical only |
| Placeholder product name Afterhours in package metadata | Superseded by PackLock for selected path once approved |

### Existing risks

- Status/docs drift: README/AGENTS may still say survivors 0 / paused in places that predate PackLock PRD (research status already updated to PRD-next).
- Calendar constraints before 30 Sep 2026 (other commitments; see assumptions).
- Domain complexity temptation (full Gerber DFM) vs MVP cohesion/completeness.
- Soft enforcement if shops ignore release certificate (product risk, not code).

### Missing infrastructure

- PackLock app path (`apps/packlock` planned, **not created**)
- Typed API, DB, migrations, blob storage
- ValidationEngine + parsers
- AuthZ roles
- CI (lint/test with mock AI)
- Hosted deploy pipeline
- Demo GDP fixtures (BOM/Gerber/XY/drawing packs)
- `.env.example` keys for PackLock (documented this planning pass)

### Recommended implementation sequence

1. Accept PRD + this plan (product selection under engineering standards).  
2. Milestone 0 foundation → 1 ingest → 2 extraction → 3 validation → 4 issues UX → 5 release/snapshot → 6 overrides/authz/audit → 7 optional AI assist → 8 demo/deploy/polish.  
3. Do not parallelize microservices or ERP adapters.  
4. Keep Afterhours `src/` untouched.

---

## Global rules (every milestone)

- Follow `docs/MILESTONE-TEMPLATE.md` when implementing.
- One milestone at a time: Implement → Inspect → Test → Verify → Review → Next.
- No secrets in git; config via env.
- Fail-closed validation; AI untrusted + schema validation.
- Frontend never decides release.
- No microservices; no fake ERP/MES integrations.
- CI deterministic (mock AI).
- Definition of done: acceptance criteria met + relevant tests pass + no unrelated file churn.

---

## Recommended sequence

```text
M0 Foundation
 → M1 Ingest & artifact detection
 → M2 Deterministic fact extraction
 → M3 ValidationEngine (coherence + completeness)
 → M4 Issues API + operator UI (PASS/BLOCK visibility)
 → M5 Release snapshot + token (READY → RELEASED)
 → M6 Overrides, roles, audit
 → M7 AI-assisted title-block OCR (optional, schema-bound)
 → M8 Fixtures, hosted demo, hardening
```

M7 may be thin or skipped if OCR is unnecessary for the 90s demo (filename/manifest revs suffice); do not block M8 on AI.

---

## Milestone 0 — Foundation

### Objective

Create PackLock application skeleton and engineering baseline without product theater.

### Scope

- Create `apps/packlock` modular layout (presentation/application/domain/infrastructure)
- Tooling: TypeScript, test runner, lint, env loading
- Health/ready endpoints
- DB migrations empty or minimal schema bootstrap
- Document run commands; update root README status when selection accepted
- Leave `src/` Afterhours untouched

### Out of scope

- Upload, validation, release UI, AI, fixtures content beyond placeholders

### Acceptance criteria

- App boots locally with `/health`
- Tests run green (smoke)
- No secrets committed; `.env.example` lists PackLock keys
- Architecture layers present as empty/thin modules with no fake business claims

### Risks

- Over-scaffolding Nest/monorepo complexity; mitigate by keeping Hono/Fastify + Vite minimal

### Definition of done

Template fields satisfied; smoke test + health check verified.

---

## Milestone 1 — Ingest & artifact detection

### Objective

Operator can create a pack and upload files; system stores blobs and classifies artifact kinds.

### Scope

- `ManufacturingPack` + `PackArtifact` persistence
- Multipart upload with size/MIME limits
- Classification heuristics (extension/name/manifest)
- SHA-256 at ingest
- Pack status `DRAFT`

### Out of scope

- Full validation, release, AI OCR

### Acceptance criteria

- Upload happy path + reject oversize/illegal type
- Zip-slip / path traversal rejected
- Artifacts listable with kind + hash
- Failures do not mark pack READY

### Risks

- Mis-classification; mitigate with UNKNOWN kind + REVIEW later, not silent PASS

---

## Milestone 2 — Deterministic fact extraction

### Objective

Produce typed `ArtifactRevision` facts for BOM, XY, hashes, revision tokens from structured sources.

### Scope

- BOM parser (CSV/TSV/simple structured)
- Centroid/XY RefDes extraction
- Revision token extraction from filenames/manifests
- Light fab-set identity/rev metadata (not DFM)
- Provenance `DETERMINISTIC`
- Extractor version field

### Out of scope

- LLM extraction; Gerber geometry compare

### Acceptance criteria

- Fixture BOM/XY yield stable facts in unit tests
- Parse failures recorded fail-closed (no fake facts)
- Re-upload creates new revision, prior retained

### Risks

- Real customer BOM formats vary; MVP supports documented fixture formats + clear parse errors

---

## Milestone 3 — ValidationEngine

### Objective

Modular checks produce cited issues; aggregate outcome PASS/BLOCK/REVIEW; pack → BLOCKED or READY.

### Scope

- Policy version; check registration
- MVP checks from tech spec (triad, BOM readable, rev sync, TBD MPN, RefDes subset, optional hash match)
- Validation run records; fail-closed on engine errors
- Transition ANALYZING → BLOCKED | READY | failed non-READY

### Out of scope

- Overrides, release certificate, AI

### Acceptance criteria

- `board-x-block` fixture yields ≥3 BLOCK citations with rule IDs
- `board-x-pass` yields READY with zero open BLOCKs
- Crashed check ⇒ not READY
- Unit tests per check + engine integration test with mock storage facts

### Risks

- Check brittleness; keep citations stable for demo

---

## Milestone 4 — Issues API & operator UI

### Objective

Human can see pack status, issues with citations, and understand why release is locked.

### Scope

- Issues API filters
- UI: open pack, issue list, citation detail, analyze action
- Server-driven status badges
- Typed API errors surfaced in UI

### Out of scope

- Override submit, certificate download (stubs disabled OK)

### Acceptance criteria

- Demo path shows BLOCK with three visible citations
- Release control disabled when not READY (client hint + server enforce later)
- Loading/error/empty states usable

### Risks

- UI scope creep into dashboards; keep one job

---

## Milestone 5 — Release snapshot & token

### Objective

From READY, approver/operator mints immutable RELEASE snapshot + downloadable certificate/token.

### Scope

- Release use case with transactional re-check of blockers
- `ReleaseSnapshot` insert-only
- HMAC/signed token via `RELEASE_TOKEN_SECRET`
- GET certificate; reject mutations on RELEASED
- Audit event for release

### Out of scope

- ERP push; multi-pack batch release

### Acceptance criteria

- Cannot release with open BLOCKs (API 409/typed error)
- Snapshot references exact revisions + run id
- Token verifies for released pack
- Frontend release POST required; no client-only unlock

### Risks

- Secret mismanagement; env-only signing key

---

## Milestone 6 — Overrides, authZ, audit

### Objective

Approver can log scoped customer-accepted deviation; roles enforced; audit trail complete for significant events.

### Scope

- Override entity + re-validation
- Roles: viewer / operator / approver (server-side)
- Audit log API for pack timeline
- Data Hold–style text export optional (templated from issues)

### Out of scope

- SSO/SAML; full multi-tenant billing

### Acceptance criteria

- Non-approver cannot override or release
- Override requires reason + scope; re-validate updates issue status
- Audit shows upload/analyze/override/release
- Unscoped “override all” rejected

### Risks

- Soft override becoming silent PASS; mitigate with scope + re-validation invariants

---

## Milestone 7 — AI-assisted extraction (optional)

### Objective

Optional title-block revision OCR assist behind port; schema-validated; never release authority.

### Scope

- `AiExtractionPort` + Mock + optional HTTP provider
- Zod/JSON schema validation
- Provenance `AI_ASSISTED`
- CI uses mock only

### Out of scope

- Free-form chat; AI triage of PASS/BLOCK

### Acceptance criteria

- Invalid AI JSON ⇒ fact absent / REVIEW-or-BLOCK per policy; not PASS
- Deterministic tests without network
- Feature flag / env to disable AI

### Risks

- Demo dependency on live AI; keep mock path for hosted demo

---

## Milestone 8 — Demo fixtures, deploy, hardening

### Objective

Hosted honest demo URL; 90s script reliable; submission readiness.

### Scope

- Seeded fixtures (`board-x-block`, `board-x-pass`, override path)
- Demo loader endpoint (flagged)
- Deploy single Node+static service
- Structured logging, readiness, upload limits tune
- Changelog / disclose AI tools for Devpost
- Reliability pass on primary path

### Out of scope

- New product modules; microservices; Docker Compose unless host forces a single Dockerfile

### Acceptance criteria

- Public URL completes BLOCK → PASS/override → certificate
- Fixtures labeled honestly
- Health/ready OK on host
- CI green with mock AI
- No secrets in repo

### Risks

- Host filesystem ephemeral blob loss; use durable volume or accept demo reset procedure documented

---

## Key technical risks

1. **Gerber/ODB complexity** — full compare is out of scope; MVP must stick to cohesion/completeness or schedule slips into fixture theater.
2. **BOM format diversity** — parsers must fail closed with clear errors rather than guessing PASS.
3. **Fail-open bugs** — any path that maps errors to READY/PASS is a product-killing defect; tests must lock this.
4. **Async/job correctness** — if ANALYZING is async, status races must not allow release on stale READY.
5. **AuthZ shortcuts in demo** — role-switch must not disable server checks.
6. **Immutable snapshot violations** — accidental UPDATE endpoints or “re-release overwrite.”
7. **AI leaking into SoT** — unschema’d LLM text used for rev/hash/BOM.
8. **Deploy blob/db durability** — demo host resets wipe evidence mid-judging.

---

## Explicit assumptions

1. PackLock PRD + this plan are accepted as the selected OFFGRID product before Milestone 0 coding.
2. Solo builder; ~3-week effective build window after coding starts (target MVP hosted early October per `AGENTS.md` calendar).
3. Calendar constraints before 30 Sep 2026 (other commitments) — planning docs are allowed now; heavy implementation waits on explicit go-ahead.
4. Demo uses seeded GDP packs; no live customer EMS data required for V1.
5. Release certificate is accepted as PackLock’s SoR for the demo (no real traveler software integration).
6. SQLite (or single Postgres) + filesystem blobs sufficient for hackathon demo scale.
7. AI OCR is optional for the 90s demo if filename/manifest revisions suffice.
8. Afterhours `src/` remains historical and is not the PackLock codebase.
9. No requirement for Docker Compose multi-service topology in MVP.

---

## Engineering constraints checklist (encoded)

| Constraint | Where encoded |
|---|---|
| Fail-closed validation | Tech spec §9; Architecture §9; M3/M5 |
| AI untrusted + schema | Tech spec §7; M7 |
| Deterministic facts for hashes/revs/BOM | Tech spec §7; M2 |
| Provenance | Entities `ArtifactRevision.provenance` |
| Modular ValidationEngine | Tech spec §6; Architecture modules |
| Config/env, no hardcoded secrets | Architecture; `.env.example`; M0 |
| Upload security | Tech spec §8; M1 |
| Immutable release snapshot | Tech spec invariants; M5 |
| Audit significant events | Tech spec; M6 |
| Typed API errors | Tech spec §5; M4 |
| Server-side authZ | Architecture §8; M6 |
| Structured logging | Tech spec §11; M8 |
| CI deterministic mock AI | Architecture; M7/M8 |
| Frontend never decides release | PRD; Architecture §10; M5 |
| Demo fixtures | Tech spec §10; M8 |
| Milestone-based | This plan |
| No microservices / no fake integrations | Architecture §1, §5 |

---

## STOP

This document does not authorize Milestone 0 implementation. Await explicit implementation approval after PRD acceptance.
