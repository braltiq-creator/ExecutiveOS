# Phase 66 — Executive Command Centre Recomposition

**Status:** Complete  
**Scope:** Experience composition only (`/today` Command Centre)  
**Date:** 2026-08-23

## Objective

Recompose `/today` around executive attention (10s / 30s / 2min) without changing intelligence, engines, contracts, isolation, or demo behaviour.

## What was recomposed

Information hierarchy on Command Centre:

1. **Executive Brief** — domain, lead judgement, 3–4 evidence signals, confidence, why it matters, decision question  
2. **Lead Judgement** — dark judgement surface + narrative chain (unchanged intelligence)  
3. **Decision Status** — status, question, honest owner/due/action, Open decision  
4. **Since You Last Looked** — moved up; compact 3–5 + View all changes  
5. **Evidence Lab** — tabs; one instrument dominates viewport at a time  
6. **Council** — progressive disclosure when position not established  
7. **Accountability** — compact (primary decision only)  
8. **Executive Insight** — closing statement  

Supporting overnight / priority / stream moved under progressive `<details>`.

## Components reused

- `ExecutiveHero`, `ExecutiveJudgementPanel`, `ExecutiveHeatMap`, `ExecutiveForecastActualChart`, `ExecutiveEvidenceSurface`, `ExecutiveInsightBar`, `ExecutiveOvernightChanges`, `ExecutiveContextRail`, `ConfidenceBand`, `DistributionBar`
- `SinceYouLastLooked`, `AccountabilitySurface`, Design Partner strips
- `buildCommandCentreExperience` / manufacturing projection (unchanged formulas)

## Components changed / added

| Item | Change |
|------|--------|
| `CommandCentreExperience.tsx` | Hierarchy recomposition; Evidence Lab wiring; decision status band |
| `command-centre.css` | Briefing layout; Evidence Lab; first-viewport surfaces |
| `EvidenceLab.tsx` | **New** — tabbed evidence navigation |
| `CouncilProgressive.tsx` | **New** — collapsed Council when not established |
| `SinceYouLastLooked.tsx` | Progressive disclosure (View all changes) |
| `ExecutiveHeatMap.tsx` | Quiet neutral/zero cells (presentation only) |
| `ExecutiveHero.tsx` | Up to 4 evidence signals |

## Architectural changes

**None.** No UDG, ingestion, snapshot, intelligence, Decision/Action engine, Design Partner logic, demo mode, or API changes.

## Tests

| | Before (Phase 65) | After (Phase 66) |
|--|-------------------|------------------|
| Files | 79 | 80 |
| Passed | 528 | 532 |

Added: `tests/unit/validation/phase-66-command-centre-recomposition.test.ts`  
Updated composition markers in existing CC tests (phase-66 markers; Evidence Lab replaces stacked instruments / focus diagram in first viewport).

## Build

`npm run build` — **pass**

## Attention assessments (manufacturing fixture)

### 10 seconds
- What changed / matters: Model H demand above plan; continuity band near top  
- Judgement required: lead judgement + decision question visible in first viewport  

### 30 seconds
- Decision required: DECISION REQUIRED + Open decision  
- Evidence: Evidence Lab tabs (Demand / Forecast / Confidence / Capacity)  
- Confidence: 72% judgement confidence (model-scoped, unchanged)  

### 2 minutes
- Demand heat map (meaningful cells loud; 0% quiet)  
- Forecast vs Actual, confidence board, capacity with extreme % preserved  
- Continuity history, accountability honesty, Council expand  

## Remaining UX debt

- Commercial still lacks Phase 60/61 decision-paper parity on CC (pre-existing)  
- Manufacturing supporting stream still may surface generic stream labels in subordinate details (pre-existing data wiring)  
- Accountability lists only the primary decision on CC; full set remains via Decision Engine / history  
- First-viewport density on small laptop heights may still require light scroll when Design Partner strip is present  

## Stop

Phase 66 complete. Do not begin Phase 67.
