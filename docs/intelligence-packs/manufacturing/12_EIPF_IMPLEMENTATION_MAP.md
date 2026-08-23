# 12 — EIPF Implementation Map

**Purpose:** Translate this blueprint into a future Manufacturing Executive Intelligence Pack **without inventing behaviour in Core**.  
**Status:** Authoring checklist — code not authorised in Phase 48.

---

## Future pack identity (proposed)

| Field | Value |
|-------|-------|
| `manifest.id` | `pack-manufacturing-executive` |
| `manifest.name` | Manufacturing Executive Intelligence Pack |
| `manifest.industry` / `industry()` | `manufacturing` |
| `manifest.provides` | `outcomes`, `ontology`, `kpis`, `council`, `reality-lab`, `benchmarks`, `meeting-packs`, `reasoning`, `validation`, `learning` |
| Authoring helper | `defineIntelligencePack({ ... })` from `@/intelligence-packs` |

---

## Contract method → blueprint source

| EIPF method | Blueprint source | Implementation notes |
|-------------|------------------|----------------------|
| `manifest` / `industry()` | [00 Overview](./00_BLUEPRINT_OVERVIEW.md) | No Core industry enum required |
| `outcomes()` | [01 Outcomes](./01_EXECUTIVE_OUTCOMES.md) | Map each outcome ID/name/owner/successMeasures/supportingKpiIds |
| `ontology()` | [02 Ontology](./02_BUSINESS_ONTOLOGY.md) | Terms as strings only; never Core types |
| `kpis()` | [06 KPIs](./06_INDUSTRY_KPIS.md) | Polarity + linkedOutcomeIds mandatory |
| `councilKnowledge()` | [05 Council](./05_EXECUTIVE_COUNCIL.md) | One record per CEO/CFO/COO/CRO/CSO |
| `decisionFrameworks()` | [03 Catalogue](./03_DECISION_CATALOGUE.md) + [10 Rules](./10_REASONING_RULES.md) DF-01…04 | Steps + escalationTriggers |
| `reasoningRules()` | [10 Reasoning](./10_REASONING_RULES.md) | `mfg-rr-*` → evaluateKey |
| `benchmarks()` | [09 Benchmarks](./09_BENCHMARKS.md) | Peer median / top quartile per metric |
| `businessEvents()` | [04 Events](./04_BUSINESS_EVENTS.md) | Include executiveQuestion |
| `realityLab()` | [08 Reality Lab](./08_REALITY_LAB_SCENARIOS.md) | scenarios, datasets, success/failure, questions, expectedOutcomes |
| `meetingPacks()` | [07 Rhythms](./07_EXECUTIVE_RHYTHMS_AND_MEETING_PACKS.md) | Packs A–F |
| `reports()` | Derive from Pack E (board) + monthly operating review | Sections: Pulse, Outcomes, Risks, Capital, Outlook |
| `recommendations()` | [10](./10_REASONING_RULES.md) quality pattern + event narratives | Situation keys from event classes |
| `validationRules()` | [11 Validation](./11_VALIDATION_AND_LEARNING.md) | Blockers must be wired in Reality Lab |
| `learningRules()` | [11 Learning](./11_VALIDATION_AND_LEARNING.md) | Triggers from decision/forecast/OT/gates |
| `supportedConnectors()` | Deferred | ERP/MES/DMS affinities advisory only |

---

## Decision catalogue → runtime Decisions

When pack code is authorised, each `mfg-d-*` becomes Decision content with:

| Catalogue field | Runtime / experience mapping |
|-----------------|------------------------------|
| Purpose | Decision `why` / question framing |
| Inputs | Evidence sources |
| Leading / lagging indicators | KPI + signal references |
| Confidence | Decision confidence + unknowns |
| Evidence | Evidence stack in Knowledge / Decision workspace |
| Council participation | Council overlays + collaboration stances |
| Expected outcome | `expectedOutcomeImpact` |
| Success measures | Linked outcome successMeasures |

Core Decision Engine remains unchanged — pack supplies content through providers/events/seeds, not new Core entities.

---

## Outcome Engine consumption

Use EIPF consumer `toOutcomeEngineSeed(pack)`:

- Uniform seed shape for all industries  
- Manufacturing names come from doc 01  
- No Manufacturing branch inside Outcome Engine  

---

## Council adaptation path

1. Register pack in `IntelligencePackRegistry`  
2. Activate `pack-manufacturing-executive`  
3. `buildCouncilOverlay(pack)` / `councilIndustryPreface(pack, roleId)`  
4. Experience layer may consume overlays — **roles stay permanent**

---

## Reality Lab path

1. `discoverPackScenarios(registry)` loads RL-MFG-*  
2. Enterprise Simulation Environment (Phase 46) exercises loop + Council  
3. Validation rules from doc 11 gate Design Partner  

---

## Authoring sequence (when authorised)

1. Freeze blueprint version (this folder)  
2. `defineIntelligencePack` skeleton from this map  
3. Wire Reality Lab scenarios first (fail closed)  
4. Only then connect ERP/MES/DMS adapters  
5. Never open Core PRs for Factory/BuildSlot types  

---

## Explicit non-goals for implementers

- Do not add `manufacturing` branches to Core engines  
- Do not copy Field Services Simpro modules as a template for ERP coupling into Core  
- Do not ship UI labelled “Manufacturing Pack” before Reality Lab blockers pass  
- Do not treat this blueprint as incomplete permission to code  

---

## Completeness checklist

- [x] All 10 outcomes represented in `outcomes()` — Phase 52  
- [x] Ontology terms from doc 02 present — Phase 52  
- [x] All five Council roles populated — Phase 52  
- [x] ≥12 business events — Phase 52 (18)  
- [x] ≥10 Reality Lab scenarios with expected outcomes — Phase 52 (12)  
- [x] Reasoning rules `mfg-rr-01`…`12` — Phase 52  
- [x] Validation blockers wired — Phase 52  
- [x] Learning triggers defined — Phase 52  
- [x] Meeting packs A–F defined — Phase 52  
- [x] Benchmarks attached to primary KPIs — Phase 52  
- [x] Self-review in [README](./README.md) answered Yes  

**Implemented:** [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) → `src/intelligence-packs/packs/manufacturing/` (`pack-manufacturing-executive`).
