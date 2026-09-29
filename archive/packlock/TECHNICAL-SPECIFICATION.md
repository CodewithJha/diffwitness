# PackLock — Technical Specification

**Status:** Planning (no application code)  
**Date:** 22 September 2026  
**Depends on:** `docs/PRD.md`  
**Companion:** `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION-PLAN.md`

---

## 1. Purpose

Specify domain entities, release lifecycle, invariants, API outline, validation modules, AI boundary, security, fail-closed behavior, and fixtures for the EMS Golden Data Pack Stop/Go gate.

---

## 2. Domain entities

### 2.1 ManufacturingPack

Root aggregate for one customer data pack under review.

| Field (conceptual) | Notes |
|---|---|
| `id` | Stable identifier |
| `displayName` | e.g. board / job name |
| `status` | Release lifecycle state (see §3) |
| `createdAt` / `updatedAt` | Server timestamps |
| `createdBy` | Operator identity |
| `policyId` | Active `ValidationPolicy` version |
| `currentRevisionSetId` | Points at latest accepted artifact set |

### 2.2 PackArtifact

One classified file (or logical file) inside the pack.

| Field | Notes |
|---|---|
| `id` | |
| `packId` | FK |
| `kind` | `BOM` \| `GERBER_OR_ODB` \| `CENTROID_XY` \| `ASSEMBLY_DRAWING` \| `PO_OR_RELEASE_NOTE` \| `OTHER` \| `UNKNOWN` |
| `originalFilename` | Sanitized display name |
| `contentType` | Detected / declared MIME |
| `storageKey` | Opaque blob reference |
| `sha256` | Content hash (deterministic) |
| `byteSize` | |
| `classificationConfidence` | Optional; never drives PASS alone |
| `createdAt` | |

### 2.3 ArtifactRevision

Immutable version of an artifact’s parsed/extracted fact payload.

| Field | Notes |
|---|---|
| `id` | |
| `artifactId` | FK |
| `revisionIndex` | Monotonic per artifact |
| `extractedFacts` | Typed fact bag (see §7) |
| `extractorVersion` | Deterministic extractor / schema version |
| `provenance` | `DETERMINISTIC` \| `AI_ASSISTED` \| `HUMAN_ENTERED` |
| `createdAt` | |

Replacing a file creates a **new** `PackArtifact` or a new `ArtifactRevision`; prior revisions remain for audit.

### 2.4 ValidationCheck

Catalog entry for a modular check (not a run instance).

| Field | Notes |
|---|---|
| `checkId` | Stable string, e.g. `REV_SYNC_BOM_PCB` |
| `module` | Coherence / completeness / hash / etc. |
| `severityDefault` | `BLOCK` \| `REVIEW` \| `INFO` |
| `description` | Human-readable |

### 2.5 ValidationIssue

One finding from a validation run.

| Field | Notes |
|---|---|
| `id` | |
| `packId` | |
| `runId` | Validation run instance |
| `checkId` | |
| `severity` | Effective severity after policy |
| `status` | `OPEN` \| `RESOLVED_BY_FIX` \| `OVERRIDDEN` \| `WAIVED_SCOPED` |
| `citation` | `{ file, field, excerpt, ruleId }` |
| `message` | Operator-facing |
| `createdAt` / `resolvedAt` | |

### 2.6 ReleaseDecision

Authoritative outcome of the latest successful validation aggregation for a pack.

| Field | Notes |
|---|---|
| `id` | |
| `packId` | |
| `outcome` | `PASS` \| `BLOCK` \| `REVIEW` |
| `blockingIssueIds` | Empty only when PASS eligible |
| `validationRunId` | |
| `decidedAt` | Server time |
| `decidedBySystem` | Always true for aggregation; humans override via `Override` |

**Frontend never writes a ReleaseDecision that unlocks release.** Only server-side application services after fail-closed checks.

### 2.7 ReleaseSnapshot

Immutable freeze of everything that justified a RELEASE.

| Field | Notes |
|---|---|
| `id` | |
| `packId` | |
| `releasedAt` | |
| `releasedBy` | Approver / operator per policy |
| `artifactRevisionIds` | Exact set |
| `validationRunId` | |
| `issueDigest` | Hash of resolved/open issue set at release |
| `policyVersion` | |
| `releaseToken` | Opaque certificate id / token string |
| `certificatePayload` | Signed or HMAC’d claims (env-configured secret) |
| `immutable` | Always true after insert; no update API |

### 2.8 Override

Logged customer-accepted deviation unlocking a **scoped** exception.

| Field | Notes |
|---|---|
| `id` | |
| `packId` | |
| `issueId` | Single issue or scoped check set |
| `scope` | Explicit: which check(s) / field(s) waived |
| `reason` | Required text |
| `customerReference` | Optional PO / email ref |
| `approvedBy` | Must have `approver` role |
| `createdAt` | |
| `expiresAt` | Optional; null = until next incompatible pack change |

Overrides do **not** delete issues; they change issue status and are re-evaluated on re-validation.

### 2.9 ValidationPolicy

Versioned configuration of which checks run and severities.

| Field | Notes |
|---|---|
| `id` / `version` | |
| `checks` | Enabled check IDs + severity overrides |
| `requiredArtifactKinds` | Completeness triad baseline |
| `failClosed` | Always `true` in MVP |

---

## 3. Release lifecycle

```text
DRAFT
  │  upload / classify / extract
  ▼
ANALYZING
  │  validation run
  ├──────────────────┐
  ▼                  ▼
BLOCKED            READY
  │                  │
  │  fix pack or     │  RELEASE (server)
  │  scoped override │
  │  → re-validate   ▼
  │              RELEASED
  └──── failed run / crash ──► ANALYZING retry
                              or stay BLOCKED / DRAFT
                              NEVER auto-PASS
```

| State | Meaning |
|---|---|
| `DRAFT` | Pack created; artifacts incomplete or not yet validated |
| `ANALYZING` | Ingest/extract/validate in progress |
| `BLOCKED` | One or more open `BLOCK` issues; release disabled |
| `READY` | No open blockers; eligible for release (may still have REVIEW items per policy) |
| `RELEASED` | Immutable snapshot + token minted |
| `FAILED` (optional substate / flag) | Last run errored; treat as not READY; fail-closed |

**Transitions**

- Any validation **system error** → not READY; pack remains DRAFT/BLOCKED/FAILED; **never** PASS.
- Re-upload or override → must re-enter ANALYZING → new `ReleaseDecision`.
- `RELEASED` → no mutation of snapshot; new customer pack = new `ManufacturingPack` (or explicit “new pack revision” that is a new aggregate — prefer new pack for MVP clarity).

---

## 4. Invariants

### Release

- R1: RELEASE only from `READY`.
- R2: `READY` only when zero open issues with severity `BLOCK`.
- R3: Frontend cannot mint tokens or set `RELEASED`.
- R4: After `RELEASED`, snapshot fields are append-only immutable.

### Snapshot

- S1: Snapshot references exact artifact revision IDs and validation run ID.
- S2: Certificate/token verifies against snapshot claims + server secret (env).
- S3: Regenerating a certificate for display must not alter snapshot bytes.

### Mutation

- M1: Replacing files creates new revisions; does not rewrite history.
- M2: Released packs reject artifact mutation APIs (409).

### Override

- O1: Only `approver` role may create overrides.
- O2: Override must name scope + reason; empty reason rejected.
- O3: Override does not invent PASS for unchecked rules; only scoped issues.
- O4: Pack change that invalidates scope forces issues back OPEN on re-validation.

### Audit

- A1: Significant events append-only: upload, classify, validate start/end, issue open/resolve, override, release, authz denial.
- A2: Audit records include actor, packId, timestamp, correlation id.

### Validation

- V1: **Fail-closed:** parser/extractor/check/AI/schema failure ⇒ issue or run failure ⇒ not PASS.
- V2: Deterministic facts (hashes, revision strings from structured sources, BOM fields, RefDes sets) never taken from free-form LLM text without schema validation and provenance tag.
- V3: AI provenance facts cannot alone clear a BLOCK check.
- V4: Check modules are pure with respect to inputs (artifact facts + policy); side effects only via application layer.

---

## 5. API contracts (outline)

Base: versioned JSON API under `/api/v1`. Typed error envelope:

```json
{
  "error": {
    "code": "PACK_NOT_READY",
    "message": "Release blocked: open BLOCK issues remain",
    "details": { "issueIds": ["..."] },
    "correlationId": "..."
  }
}
```

| Method | Path | Authz | Notes |
|---|---|---|---|
| `POST` | `/packs` | operator+ | Create pack |
| `GET` | `/packs/:id` | viewer+ | Status, summary |
| `POST` | `/packs/:id/artifacts` | operator+ | Multipart upload; size/type limits |
| `GET` | `/packs/:id/artifacts` | viewer+ | List |
| `POST` | `/packs/:id/analyze` | operator+ | Kick ingest→extract→validate |
| `GET` | `/packs/:id/issues` | viewer+ | Filter by status/severity |
| `POST` | `/packs/:id/overrides` | approver | Scoped override |
| `POST` | `/packs/:id/release` | approver (or operator if policy allows) | Fail-closed; returns snapshot + token |
| `GET` | `/packs/:id/release` | viewer+ | Certificate if RELEASED |
| `GET` | `/packs/:id/audit` | viewer+ / approver | Audit trail |
| `GET` | `/health` | public | Liveness |
| `GET` | `/ready` | public | Readiness (db/storage) |

Demo-only (flagged, not production-fake ERP):

| Method | Path | Notes |
|---|---|---|
| `POST` | `/demo/load-fixture` | Load named seeded pack; labeled in UI |

---

## 6. Validation check modules (MVP)

Modular `ValidationEngine` registers checks; each returns zero or more `ValidationIssue` drafts.

| checkId | Module | Severity default | Behavior |
|---|---|---|---|
| `REQUIRED_TRIAD` | Completeness | BLOCK | BOM + fab set + (XY **or** assembly drawing per policy) present |
| `BOM_MACHINE_READABLE` | Completeness | BLOCK | BOM parses to structured rows |
| `REV_SYNC_BOM_PCB` | Coherence | BLOCK | BOM rev equals PCB/Gerber rev when both known |
| `REV_SYNC_BOM_DRAWING` | Coherence | BLOCK | BOM rev equals assembly drawing rev when both known |
| `TBD_MPN_SCAN` | Completeness | BLOCK | Reject TBD / placeholder / empty MPN patterns |
| `CENTROID_REFDES_SUBSET_BOM` | Coherence | BLOCK | XY RefDes ⊆ BOM RefDes |
| `ARCHIVE_HASH_MATCH` | Coherence | BLOCK or REVIEW | If stated hash present, must match computed archive/content hash |
| `UNKNOWN_ARTIFACT_ONLY` | Completeness | REVIEW | Pack has no classified required kinds |

Policy may demote selected checks to REVIEW for demo tenants; fail-closed still applies to engine errors.

---

## 7. Fact extraction & AI schema approach

### Deterministic extractors (SoT)

- SHA-256 of blobs and ZIP members
- BOM CSV/TSV/structured parse → MPN, RefDes, qty, rev fields
- Filename / manifest revision tokens (documented patterns)
- Centroid/XY parse → RefDes set
- Gerber/ODB++ **identity/rev metadata only** in MVP (not full DFM compare)

### AI-assisted (optional)

- Input: drawing raster/PDF page region or text layer
- Output: JSON matching a versioned schema, e.g. `{ "revisionLetter": "B", "confidence": 0.0-1.0, "rawExcerpt": "..." }`
- Validate with schema (Zod / JSON Schema); reject → fact absent → fail-closed for checks that require that fact **or** emit REVIEW/BLOCK per policy — never invent PASS
- Persist `provenance: AI_ASSISTED` on `ArtifactRevision`

### CI

- Default mock AI adapter returns fixture OCR payloads
- No network calls in unit/CI unless explicitly opted in

---

## 8. Security (uploads & authz)

- Max upload size and allowed extensions/MIME from env/config
- Store blobs outside web root; serve via authorized download routes
- Sanitize filenames; no path traversal
- Virus scanning out of MVP; still reject archives with zip-slip paths
- Server-side roles: `viewer` \| `operator` \| `approver`
- Auth mechanism MVP: session or signed demo tokens from env (document in `.env.example`); no hardcoded secrets
- Least privilege: viewers cannot override or release

---

## 9. Fail-closed behavior

| Failure | Result |
|---|---|
| Parse error | Issue or run FAILURE; not PASS |
| Missing required fact | BLOCK or REVIEW per check; not PASS |
| AI schema invalid / timeout | Treat assistive fact as absent; log; do not PASS on hope |
| Partial check suite crash | Mark run failed; pack not READY |
| Storage read error mid-validate | Fail run |

**Never** map unknown errors to PASS. **Never** client-side “green” without server `ReleaseDecision`.

---

## 10. Fixtures plan

Seed under future `apps/packlock/fixtures/` (path decided in architecture; **do not create in this pass**):

| Fixture | Intent |
|---|---|
| `board-x-block` | BOM Rev A, Gerber Rev B, TBD MPN, missing XY → three BLOCK citations |
| `board-x-pass` | Coherent triad, no TBD, RefDes subset OK, optional hash match → READY |
| `board-x-override` | Same as block but one issue eligible for scoped override demo |
| `board-x-hash-mismatch` | Stated hash ≠ computed |

Each fixture ships a `MANIFEST.json` describing expected issues (for tests). UI labels “Demo fixture” honestly.

---

## 11. Observability

- Structured logs: JSON lines with `correlationId`, `packId`, `event`, `level`
- Log state transitions and release minting
- No secrets in logs

---

## 12. Config keys (documentation)

See `.env.example`. No real secrets in git. Representative keys: `PORT`, `DATABASE_URL`, `BLOB_STORAGE_PATH`, `MAX_UPLOAD_BYTES`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `RELEASE_TOKEN_SECRET`, `DEMO_FIXTURES_ENABLED`, `LOG_LEVEL`.
