# Stage 5 — Real Customer Intelligence Foundation

**Status:** Architecture & implementation proposal — **awaiting approval before implementation**  
**Design partner (initial):** Hitachi Construction Machinery Australia  
**Branch / PR:** `cursor/phase-2-immersive-intelligence-b8a3` · PR #7  
**Constraint:** Do not invent customer data. Do not treat demonstration fixtures as live customer intelligence. Do not weaken the production truth boundary.

---

## Stage 4 closure (verified scope)

| Item | Status |
|------|--------|
| Connected Briefing ↔ Decisions ↔ Knowledge ↔ Map | **Accepted** |
| Decision integration + evidence integrity | **Accepted** |
| Lifecycle boundaries (record ≠ execution) | **Accepted** |
| Organisation-isolation contracts (unit + RLS code) | **Accepted** |
| Production durable persistence E2E (activated auth org → Supabase → logout/login → second browser) | **Outstanding** |
| `/dev/phase2-preview` disclosure | **Retain** — `UI CACHE ONLY — NOT DURABLE SOT` |

Stage 4 is **complete for its verified scope**. No further Stage 4 cosmetic work. Preview must not be represented as production-durable.

---

## Product objective

Demonstrate that ExecutiveOS can ingest **genuine industrial operational data** (Hitachi Construction Machinery Australia as first design partner), preserve evidence and provenance, derive manufacturing intelligence, surface executive decisions, and support accountable follow-through — as a **repeatable SaaS path**, not a one-off demo fork.

Target workflow:

```
Customer data
  → Ingestion (UDG)
  → Validation / readiness
  → Evidence (Verified Evidence + Manufacturing Evidence Graph)
  → Manufacturing Intelligence
  → Executive Briefing
  → Decision Intelligence
  → Executive Decision (record)
  → Follow-up Action
  → Outcome Review
```

---

## 1. Current architecture assessment

### 1.1 What already exists (reuse — do not rebuild)

| Layer | Capability | Key paths |
|-------|------------|-----------|
| **Universal Data Gateway** | Permanent ingestion framework; Excel/CSV/manual connectors; mapping; validation; confidence; lineage; immutable UDG snapshots | `src/data-gateway/` · `docs/data-gateway/README.md` |
| **Manufacturing Forecasting contract** | Canonical fields + concepts; min hints `model` + `forecastQuantity` | `src/data-gateway/contracts/manufacturing-forecasting.ts` |
| **Snapshot Studio / onboarding** | Upload → profile → mapping → validation → immutable Executive Snapshot → activate Command Centre | `/onboarding/snapshot` · `docs/design-partner/DATA_ONBOARDING.md` |
| **Weekly / recurring upload** | Logical Data Source identity; schema fingerprint; mapping reuse; evidence identity per upload | `src/verified-evidence/data-sources/` |
| **Manufacturing analysis** | Demand vs forecast, heat, capacity, inventory, insights, missing information, confidence slices | `src/executive-snapshot-studio/intelligence/manufacturing-analysis.ts` |
| **Decision paper + portfolio bridge** | Options, evidence, decision objects on OutcomePortfolio | `manufacturing-decision-frame.ts` · `manufacturing-portfolio-bridge.ts` |
| **Manufacturing Evidence Graph** | Snapshot-scoped facts/entities/relationships; deterministic ids include `organisationId` + `snapshotId`; USER_PROVIDED provenance only; SQL immutability triggers | `src/manufacturing-evidence-graph/` · `015_manufacturing_evidence_graph.sql` |
| **Command Centre / Briefing / Decisions immersion** | Phase 2 Stages 1–4 surfaces (presentation) | `src/experience/immersion/` · `/today` manufacturing path |
| **Decision Engine + pilot persistence** | `recordExecutiveDecision` → portfolio → `pilot_decisions.payload`; actions via Phase 61 linkage | `decision-execution-linkage.ts` · `pilot-persistence/` |
| **Org isolation** | `requireStudioActor` + RLS `is_active_organization_member` on pilot tables | `011_pilot_operating_loop.sql` · `013`/`014`/`015` evidence migrations · `PILOT_ACCESS_READINESS.md` |
| **Design partner model** | Pilot provisioning, environment labels, manufacturing_forecasting focus module | `docs/design-partner/PILOT_*.md` |

### 1.2 Supported formats & upload mechanisms (today)

| Mechanism | Status | Notes |
|-----------|--------|-------|
| CSV / TSV / TXT | Ready | `udg-csv` — preferred clear path for partner exports |
| Excel `.xls` / `.xlsx` | Ready | `udg-excel` — SheetJS + magic-byte detection (`uploads/parse-workbook.ts`); not a deferred connector |
| Manual / pre-parsed rows | Ready | `udg-manual` — low volume |
| Weekly recurring upload | Ready | Same logical Data Source (`organization_data_sources`); new immutable snapshot |
| Scheduled / webhook / streaming | Contract only | `ingestion/modes.ts` — not implemented |
| Dynamics / SAP / REST | Placeholder contracts only | Explicitly **out of pilot scope** (`PILOT_MODEL.md`) |

### 1.3 Evidence & snapshot boundaries

- UDG snapshots are **immutable and replayable** by contract (`immutable: true`, content hash).
- **Durability split (important):** UDG v1 snapshot/mapping/lineage process stores are **in-memory**; after activation, authoritative SoT is `pilot_executive_snapshots` (+ portfolio/decisions/actions) and verified-evidence / MEG tables under RLS — not the UDG in-memory cache (`docs/data-gateway/ARCHITECTURE.md`, `pilot-persistence/`).
- Manufacturing Evidence Graph ids hash `organisationId` + `snapshotId` + grain — a later weekly upload **cannot** overwrite prior snapshot graph ids (`manufacturing-evidence-graph/identity.ts`). Relationships are **same-row co-occurrence only** (no invented cross-row joins).
- MEG backend + compare actions exist; **no executive product UI currently consumes MEG as a primary surface** — Phase 2 Knowledge/map project from analysis/evidence hierarchy, not MEG tables. Stage 5 must not treat MEG UI as a prerequisite for the first customer workflow.
- Verified Evidence weekly upload pins `dataSourceId` and refuses mismatched identity reuse; `SYNTHETIC` provenance rejected for organisation evidence.
- Executive Snapshot activation binds org + portfolio for Command Centre; pilot persistence writes are org-scoped via `requireStudioActor`.

### 1.4 Manufacturing intelligence outputs (existing)

From `analyseManufacturingSnapshot` / Command Centre projection (evidence-derived, not invented):

- National / regional forecast–actual series  
- Region × model heat  
- Factory capacity vs load signals  
- Inventory / finished-goods / days signals  
- Insights + `missingInformation`  
- Dataset confidence ≠ judgement confidence ≠ decision confidence  
- Priority decision framing (Decision paper)  
- Map: **region-resolved** placements unless lat/lng exists in evidence  

### 1.5 Gaps vs a real industrial customer

| Gap | Impact |
|-----|--------|
| Phase 2 preview uses **demonstration fixture** only | Must never be labelled live Hitachi intelligence |
| Production durable decision E2E **outstanding** | Recorded decisions in preview ≠ Supabase SoT |
| No Hitachi-specific field mapping pack yet | First real export may need alias table + validation messages — not a new engine |
| Lat/lng rarely present | Map remains region-resolved with honesty labels (`au-regions` co-occurrence) |
| Outcome review UX is thinner than Briefing/Decision immersion | Follow-through exists in Decision Engine / actions; Stage 5 should wire clarity, not invent a new dashboard |
| MEG not wired into executive UI | Backend ready; first workflow must not depend on new MEG screens |
| UDG process stores are in-memory | Customer trust depends on activation → pilot_* durable path (Stage 5a) |
| Live ERP connectors absent | Correct for pilot — export-first is the product thesis |
| Working capital / cash instruments often “not quantified” | Honesty: leave unestablished unless customer data supports them |
| Retention / full RBAC claims | Remain honest per `SECURITY_POSTURE.md` — do not overclaim |

### 1.6 Prior Hitachi materials (demo language only)

`docs/demos/HITACHI_MANUFACTURING_EXECUTIVE_DEMO.md` and related journey docs describe a **representative heavy-equipment OEM pattern**. Numbers there are **demonstration-realistic, not Hitachi confidential**. Stage 5 must not promote those numbers into customer SoT.

---

## 2. Proposed Stage 5 architecture

**Principle:** Land Hitachi on the **existing** manufacturing_forecasting module path. No application fork. No second persistence system. Avoid migrations unless a concrete blocker is proven.

```
┌─────────────────────────────────────────────────────────────┐
│  Hitachi org (Supabase Auth + organisation membership)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Snapshot Studio / Data Sources (recurring weekly upload)   │
│  CSV/Excel → UDG ingest → mapping → validation → readiness  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Immutable Executive Snapshot (org-bound)                   │
│  + Verified Evidence identity                               │
│  + Manufacturing Evidence Graph (snapshot-scoped)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Manufacturing Intelligence                                 │
│  analysis → brief → decision paper → OutcomePortfolio       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Executive experience (existing)                            │
│  /today Briefing → Decision Intelligence → record           │
│  → createActionFromSelectedDecision → accountability        │
│  → snapshot compare / outcome status (existing models)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Durable pilot path (when snapshot activated)               │
│  persistPilotPortfolioAction → pilot_* + RLS                │
└─────────────────────────────────────────────────────────────┘
```

**Truth boundary rules (non-negotiable):**

1. Customer org never loads Phase 2 demo fixture as live intelligence.  
2. Surfaces must show provenance: source filename / Data Source, snapshot id, record count, readiness.  
3. `UI CACHE ONLY` remains on `/dev/phase2-preview` only.  
4. Missing fields → Not available / Not established — never invented.  
5. Recording a decision still does not imply execution started.

---

## 3. Minimum viable Hitachi data requirements

**Do not invent Hitachi rows.** Customer (or Braltiq under NDA) supplies an export. Below is the **contract shape** already supported.

### 3.1 Absolute minimum (engine will run, intelligence thin)

| Field (canonical) | Why |
|-------------------|-----|
| `model` | Grain for demand / decision framing |
| `forecastQuantity` | Forecast instrument |

### 3.2 Meaningful first executive workflow (recommended minimum)

| Field | Role in workflow |
|-------|------------------|
| `period` | Time series / freshness |
| `region` | Regional heat + map honesty |
| `dealer` or `branch` | Channel tension |
| `model` + `variant` | Portfolio mix |
| `factory` | Capacity / plant load |
| `forecastQuantity` | Plan |
| `actualQuantity` | Actual demand / variance |
| `orderBankQuantity` | Demand pressure |
| `productionCapacity` and/or `availableSlots` | Finite capacity story |
| `finishedGoods` and/or `inventoryDays` | Inventory / capital tension |
| `forecastVersion` | Provenance of plan version |

**Optional later (do not block Stage 5 start):** lat/lng, explicit working-capital values, Dynamics connector, dealer allocation rules.

**Volume guidance:** Prefer ≥1 complete planning horizon (e.g. several months) across ≥2 regions and ≥1 factory so capacity vs demand tension is *evidenced*, not staged.

**Format:** CSV (UTF-8) with stable headers, or `.xlsx` via the existing Excel connector. Prefer one consistent export cadence (weekly).

---

## 4. Data ingestion and evidence lifecycle

| Step | System | Acceptance |
|------|--------|------------|
| 1. Provision org + users | Existing org + `PILOT_PROVISIONING.md` | Hitachi users isolated from demo tenants |
| 2. Establish Data Source | Verified Evidence logical source | Filename ≠ durable identity |
| 3. Upload export | UDG CSV/Excel connector | Org id stamped on ingestion meta |
| 4. Map fields | UDG mapping (save/reuse) | Aliases documented; no silent invention |
| 5. Validate | UDG validation + manufacturing readiness | Dataset % ≠ Judgement % |
| 6. Create Executive Snapshot | Immutable | Never mutate prior snapshots |
| 7. Materialise evidence graph | `materializeManufacturingEvidenceGraph` | Ids scoped to org+snapshot |
| 8. Activate → `/today` | Active Executive Snapshot context | Durable persist eligible |
| 9. Recurring upload | New snapshot + compare | Prior graph/ids preserved |
| 10. Decision / action | Pilot portfolio tables | RLS + `requireStudioActor` |

---

## 5. Manufacturing intelligence outputs (Stage 5 target)

Same instruments as Phase 59 / Phase 2 — but **driven by customer snapshot**:

1. Executive Brief — what moved, why it matters, priority decision  
2. Forecast vs actual (national / regional)  
3. Capacity / plant load signals  
4. Inventory / FG signals where present  
5. Evidence network + region-resolved map  
6. Decision Intelligence — options, assumptions, risks, record  
7. Follow-up action accountability (owner/due only when assigned — no fabrication)  
8. Snapshot comparison when a second upload exists  

Anything not supported by columns remains **Not established**.

---

## 6. Executive workflow and UX

Reuse existing routes; do **not** build filler dashboards.

| Moment | Surface | Notes |
|--------|---------|-------|
| Onboard data | Snapshot Studio / Data | Honesty readiness copy already specified |
| Morning judgement | `/today` manufacturing Command Centre + Briefing immersion | Customer snapshot only |
| Decide | Decision Intelligence (production path, not preview-as-SoT) | Persistence banner reflects durable_eligible when activated |
| Act | Decision Workspace / action from selected decision | Selection ≠ approval ≠ execution |
| Review | Snapshot library compare + outcome/action status | Prefer existing models over new screens |
| Dev preview | `/dev/phase2-preview` | Remains demonstration + UI-cache disclosure |

Hitachi-facing copy should follow design-partner language (Manufacturing · Forecasting), not “demo Model H” unless that string literally appears in **their** export.

---

## 7. Security and tenancy

| Control | Requirement |
|---------|-------------|
| Auth | Supabase Auth users; email confirmed as required |
| Tenancy | Dedicated organisation for Hitachi; membership via existing roles |
| RLS | Keep `is_active_organization_member` on pilot_* / evidence tables |
| Server actions | Always `requireStudioActor(organisationId)` |
| Isolation tests | Extend existing pilot-access tests with Hitachi org fixture ids (synthetic), never real customer payloads in git |
| Demo leakage | Forbid `?demo=1` / Northline seed in partner sessions (`PILOT_PROVISIONING.md`) |
| Data handling | Customer exports stay in their org; no commit of confidential CSVs to the repo |
| Persistence honesty | Production path only after activated snapshot; preview disclosure retained |

**Outstanding from Stage 4 (carry into Stage 5 gate):** authenticated Supabase durable decision E2E for an activated org.

---

## 8. Implementation stages and acceptance tests

### Stage 5a — Foundation gate (build first — see §10)

1. Provision Hitachi (or staging) organisation + executive user.  
2. Close **production durable persistence E2E** on that org (record → refresh → logout/login → second browser).  
3. Confirm RLS isolation against a second org.  
**Exit:** Durable SoT proven; Stage 4 outstanding item closed.

### Stage 5b — Real export land

1. Receive Hitachi CSV (or approved sample under NDA) — **not** committed if confidential.  
2. Map to `MANUFACTURING_FORECASTING_FIELDS` (alias pack if needed — config, not fork).  
3. Snapshot Studio path: validate → snapshot → activate.  
4. Confirm analysis/briefing/decision paper populate from **that** snapshot.  
5. Confirm demonstration fixture never appears as live SoT.  
**Exit:** `/today` shows customer-derived instruments with provenance.

### Stage 5c — Decision loop on customer snapshot

1. Record executive decision with evidence freeze.  
2. Create follow-up action; assign accountability without inventing owners.  
3. Recurring upload → new snapshot → compare; prior decision lineage retained.  
**Exit:** Full workflow string complete on real data shape.

### Stage 5d — Partner readiness polish (only if needed)

- Mapping UX friction fixes  
- Readiness messaging for Hitachi column names  
- Outcome review clarity on existing surfaces  
**Not:** New vanity dashboards, ERP live sync, cosmetic Stage 4 work.

### Acceptance tests (required)

| ID | Test |
|----|------|
| S5-T1 | Customer org cannot read another org’s snapshots/decisions |
| S5-T2 | Upload without inventing missing capacity/inventory values |
| S5-T3 | Dataset vs judgement vs decision confidence remain separate |
| S5-T4 | Evidence graph ids change with snapshot id; prior snapshot intact |
| S5-T5 | Activated snapshot → durable_eligible → Supabase row contains `executiveRecording` |
| S5-T6 | Logout/login restores decision artefacts |
| S5-T7 | Preview fixture path still discloses UI-cache / demonstration |
| S5-T8 | Recording does not auto-set execution_underway without action |
| S5-T9 | Second weekly upload creates new snapshot; compare works |
| S5-T10 | No confidential Hitachi payload in repository |

Prefer extending existing Vitest + one authenticated Playwright/manual smoke; avoid parallel persistence systems.

---

## 9. Infrastructure and customer dependencies

| Dependency | Owner | Blocks |
|------------|-------|--------|
| Production (or staging) Supabase with migrations through pilot loop | Braltiq | 5a |
| Hitachi organisation + at least one executive user | Braltiq ops | 5a/5b |
| `NEXT_PUBLIC_EXECUTIVEOS_MOCK=false` on target env | Braltiq | Durable path |
| First manufacturing forecast export (CSV) with agreed columns | Hitachi / Braltiq under NDA | 5b |
| Confirmation of region/factory/dealer grain in export | Joint | Meaningful workflow |
| Legal / NDA for confidential data handling | Joint | Before storing real exports |
| Optional: second period export for comparison | Hitachi | 5c compare story |
| Migrations through pilot + evidence + MEG (`011`, `013`–`015`) applied on target env | Braltiq | Durable evidence / graph |
| `PILOT_ACCESS_READINESS` AMBER ops checklist (mock off, env keys) | Braltiq | Invite / pilot gate |
| **Not required for Stage 5 first slice:** Dynamics/SAP connector, lat/lng UDG fields, MEG product UI, new SQL migrations (unless blocker found) | — | — |

---

## 10. Recommendation — what to build first

**Build first: Stage 5a — authenticated durable persistence on a real organisation**, then land the first Hitachi (or NDA sample) export on the **existing** Snapshot Studio → manufacturing intelligence → Briefing → Decision path (Stage 5b).

### Why this order

1. Stage 4 already proved the UX and contracts; the open production risk is **durable SoT**, which Stage 5 customer trust requires.  
2. The ingestion → intelligence → decision architecture **already exists**; the highest leverage work is **tenancy + real export mapping + honesty**, not new screens.  
3. Avoid migrations and ERP connectors until a real export proves a contract gap.  
4. Keeps PR #7 coherent: Phase 2 immersion + customer-foundation plan/implementation without splitting unless migrations or a long-lived Hitachi-only fork appears (not expected).

### Explicit non-goals for the first build slice

- No Stage 4 visual redesign  
- No second decision persistence system  
- No inventing Hitachi operational rows  
- No labelling demo fixture as Hitachi live intelligence  
- No filler dashboards  
- No MEG product UI as a Stage 5a/5b gate (backend may materialise; executive surfaces reuse existing analysis/immersion)  
- No merge / production deploy until Stage 5 proposal + 5a/5b acceptance are approved  

---

## Decision requests for approver

1. Approve Stage 5 architecture (reuse UDG + manufacturing_forecasting + pilot persistence)?  
2. Approve **5a then 5b** as the build order?  
3. Confirm who supplies the first CSV and under what data-handling rules?  
4. Confirm Hitachi org provisioning target (staging vs production)?  
5. Any Hitachi-specific column aliases known today (list), or discover during first mapping session?

---

*Document only — no Stage 5 product implementation in this change set. Implementation starts only after approval.*
