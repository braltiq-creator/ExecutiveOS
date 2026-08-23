# 00 — Manufacturing Executive Blueprint Overview

**Phase:** 48 · Manufacturing Executive Discovery Blueprint  
**Industry label (future pack):** `manufacturing`  
**Suggested future pack id:** `pack-manufacturing-executive`  
**Audience:** Pack authors, Reality Lab designers, Executive Council designers, Design Partner prep

---

## 1. What this blueprint is

A complete knowledge architecture for manufacturing executive leadership:

- How ELT members prioritise
- What they decide
- What vocabulary they use
- Which events force attention
- How Council members reason differently by role
- How operating rhythm and Reality Lab prove readiness

It is **not**:

- A Manufacturing Intelligence Pack implementation
- Core customisation
- An ERP, MES, or dealer-portal replacement
- A Simpro / Salesforce / SAP dashboard

---

## 2. Manufacturing executive persona (design partner archetype)

**Organisation type:** Discrete / OEM manufacturing with multi-factory network, dealer or distributor channel, and material working-capital exposure.

**Typical scale (design assumption):**

- Multiple factories / plants
- Model and variant complexity
- Dealer / regional demand system
- Order bank and allocation tension
- Capex and inventory as board-visible capital

**Executive job-to-be-done:**

> See factory, inventory, demand, and capital as one judgement surface — decide where to place scarce build slots, cash, and leadership attention before the quarter breaks.

---

## 3. Governing principles

1. **Pack, not Core** — Manufacturing logic lives in a future EIPF pack only.
2. **Outcomes first** — Decisions exist to move Focus Outcomes, not to fill reports.
3. **Ontology is opaque** — Core never imports Factory, Build Slot, Order Bank as platform types.
4. **Role-consistent Council** — CEO/CFO/COO/CRO/CSO stay the same roles; knowledge becomes manufacturing-aware.
5. **Reality Lab before customers** — Validate manufacturing reasoning in simulation before Design Partner exposure.
6. **Dealer demand is not the same as B2B SaaS pipeline** — Commercial language must be manufacturing-native.

---

## 4. Scope boundaries

### In scope

- Executive outcomes for manufacturing ELTs
- Decision catalogue with full evidence model
- Business ontology and events
- Council knowledge per role
- KPIs, rhythms, meeting packs
- Reality Lab scenarios, benchmarks, reasoning, validation, learning
- EIPF implementation mapping

### Out of scope (this phase)

- Application code / pack TypeScript
- Connector adapters (SAP, MES, dealer DMS)
- UI redesigns
- Provider or routing changes
- Mining / utilities / healthcare blueprints

---

## 5. EIPF binding (mandatory)

When a Manufacturing pack is eventually authorised, it **must**:

| EIPF method | Blueprint source |
|-------------|------------------|
| `manifest` / `industry()` | This overview |
| `outcomes()` | 01 |
| `ontology()` | 02 |
| `decisionFrameworks()` | 03 (+ frameworks in 10) |
| `businessEvents()` | 04 |
| `councilKnowledge()` | 05 |
| `kpis()` | 06 |
| `meetingPacks()` | 07 |
| `realityLab()` | 08 |
| `benchmarks()` | 09 |
| `reasoningRules()` | 10 |
| `validationRules()` / `learningRules()` | 11 |
| `reports()` / `recommendations()` | Derived from 03, 07, 10 |

See [12 — EIPF Implementation Map](./12_EIPF_IMPLEMENTATION_MAP.md).

---

## 6. Success definition for Phase 48

ExecutiveOS (as an organisation and platform) fully understands manufacturing executive leadership **before** writing a single Manufacturing-specific feature.

Evidence of success:

- Complete document set in this folder
- Every Council role specified
- Decision catalogue entries are implementation-ready
- Reality Lab scenarios and validation criteria are explicit
- EIPF map has no uncovered contract methods
