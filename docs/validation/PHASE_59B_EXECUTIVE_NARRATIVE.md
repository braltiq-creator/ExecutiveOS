# Phase 59B — Manufacturing Executive Narrative & Evidence Hierarchy

**Status:** Complete  
**Scope:** Experience composition only  
**Date:** 2026-08-17  

**Non-goals (unchanged):** Manufacturing formulas, UDG contracts, Council architecture, commercial Salesforce behaviour, Phase 57F isolation, new agents/modules.

**Prior audit:** `docs/validation/PHASE_59_MANUFACTURING_INTELLIGENCE_AUDIT.md`

---

## Previous hierarchy (Phase 59 / 59A)

| Surface | Content | Problem |
|---------|---------|---------|
| Hero `leadJudgement` | “Manufacturing forecast requires executive judgement” | Generic framing competed with specific signal |
| Judgement panel `headline` | “Model H demand has moved above plan” | Second competing lead |
| Evidence strip | Sorted by `abs(variancePct)` | SA Model L (−31.5%) could outrank QLD Model H (+22.9%) |
| Confidence | Brief rollup / national HIGH | Implied Model H judgement shared national confidence |
| Window | Implicit 6-period heat window | Not labelled for executives |

---

## New hierarchy (Phase 59B)

```
COMMAND CENTRE
Manufacturing Forecast Intelligence          ← domain kicker

EXECUTIVE BRIEF
What requires executive judgement today?

LEAD JUDGEMENT
{data-derived demand title}                  ← e.g. Model H above plan

WHY IT MATTERS
{executive_judgement implication}            ← protect / reallocate / defer

EVIDENCE (semantic roles, ordered)
01 PRIMARY_SUPPORT → …
02 PRIMARY_SUPPORT → …
03 COUNTER_SIGNAL → …
04 OPERATIONAL_IMPLICATION → …

JUDGEMENT CONFIDENCE
{model-scoped slice or demand insight}       ← not national HIGH alone
```

Generic phrase “Manufacturing forecast requires executive judgement” may appear in talk-track / domain framing only — **never** as the competing lead line.

---

## Lead judgement logic

**Unchanged ranking engine** (analysis):

1. Region×Model heat over last `MANUFACTURING_VARIANCE_WINDOW_PERIODS` (6) periods
2. Accelerators: `variancePct ≥ +10`, sort descending
3. Demand insight title: `${top.model} demand has moved above plan`

**Presentation resolution** (`resolveManufacturingLeadJudgement`):

1. Prefer `brief.whatChanged[0]` when not generic framing
2. Else first `demand_movement` insight title
3. Never promote generic framing when a demand signal exists

**Brief composition** (`manufacturing-brief.ts`):

- `executiveJudgement` / `whatChanged` led by **demand** signal
- Implication / `whatRequiresJudgement` still from `executive_judgement` insight

**No hard-coded Model H** in Command Centre or hierarchy modules.

---

## Evidence role classification

| Role | Meaning | Typical sources |
|------|---------|-----------------|
| `PRIMARY_SUPPORT` | Directly supports the lead | Lead-model accelerators (QLD/NSW Model H on demo) |
| `COUNTER_SIGNAL` | Challenges / qualifies lead | Material decliners on other models (SA Model L) |
| `OPERATIONAL_IMPLICATION` | What demand means operationally | Highest constrained plant load |
| `CONTEXT` | Useful, non-material | Inventory attention / other movers |

**Display order:** PRIMARY → COUNTER → OPERATIONAL → CONTEXT

Module: `src/experience/mission-control/manufacturing-evidence-hierarchy.ts`

---

## Confidence presentation

| Layer | Source | Label |
|-------|--------|-------|
| Judgement panel / hero | Model confidence slice for lead model, else demand insight confidence | **Judgement confidence** |
| Forecast Confidence metric | National MAE score | Dataset health (explicitly not judgement) |
| Heat map | Instrument coverage meta | “6-period window · instrument” — not judgement |

**Formulas unchanged.** Only which score is surfaced beside the lead judgement.

---

## Six-period presentation

- Constant: `MANUFACTURING_VARIANCE_WINDOW_PERIODS = 6` (analysis + labels)
- Heat question / cell detail / variance evidence: **“6-period actual vs forecast”**
- No formula language in the executive UI

---

## Capacity presentation

Preserved audited values:

| Plant | Load % |
|-------|-------:|
| Plant 1 | 536.2 |
| Plant 2 | 366.7 |
| Plant 3 | 308.3 |

Denominator copy retained:
`% of plant capacity · N units demand vs C capacity (×)`

No capping or normalisation.

---

## Narrative chain (traceability)

Visible Signal → Demand implication → Operational implication → Executive judgement

Built only from existing insights / hierarchy — no invented causality.

---

## Executive Value & Council

| Item | Status |
|------|--------|
| Executive Value | **Not yet quantified** |
| Council seats | CEO, CFO, COO, CRO, CSO |
| Council position | **Not yet established** |

---

## Test results

Suite: `tests/unit/executive-snapshot-studio/manufacturing-narrative-59b.test.ts`

Coverage:

- Data-derived lead; no hard-coded Model H string in CC/hierarchy sources
- Supporting evidence ranks above unrelated magnitude
- Counter-signals + operational roles distinguishable
- Six-period labels
- Judgement-specific confidence
- Extreme capacity unchanged
- Value / Council unset
- Commercial isolation

Full suite: **73 files · 489 tests passed** (2026-08-17).

---

## Known limitations

1. **Demo-dependent lead:** With the current fixture, Model H wins acceleration; another fixture with a different top accelerator yields a different lead (by design).
2. **Demand implication copy** uses short executive paraphrases of existing titles (`Demand is above plan`) when titles match known patterns — not a new causal model.
3. **Operational plant in strip** is the highest load plant (≥95%); strip may show Plant 1 (536.2%) rather than Plant 2.
4. **National HIGH** remains on the confidence board for dataset literacy; executives must read **Judgement confidence** for the lead.
5. **$ value** still unavailable without unit economics evidence.
6. Visual language is refined hierarchy only — no Phase 60 redesign.

---

## Primary files

| File | Role |
|------|------|
| `manufacturing-evidence-hierarchy.ts` | Roles, lead resolution, judgement confidence |
| `manufacturing-command-centre.ts` | CC projection |
| `manufacturing-brief.ts` | Signal-led brief title |
| `CommandCentreExperience.tsx` | Narrative chain + labels |
| `ExecutiveJudgementPanel.tsx` / `ExecutiveHero.tsx` | Role captions, judgement confidence label |
| `manufacturing-analysis.ts` | Window constant export only (`slice(-6)` unchanged semantically) |
