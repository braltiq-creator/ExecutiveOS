# ADR-006: Executive Intent Engine as Focus Context

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 4B (implementation)  
**Depends on:** ADR-001, ADR-003  
**Supersedes in part:** ADR-003 provider list (order amendment only)  
**Design:** [`SPRINT_4A_INTENT_ENGINE_DESIGN.md`](./SPRINT_4A_INTENT_ENGINE_DESIGN.md) · Core Executive Loop  

## Context

Executives need a durable statement of **current strategic focus** so Briefing, Decisions, and Outcomes are interpretable. Outcomes remain the personalisation and health SoT. Intent must not become OKR tracking or a duplicate business store.

## Decision

1. Canonical Intent lives on **`OutcomePortfolio.intent`** (plus `intentHistory` for superseded records).  
2. Intent stores **id references and narrative context only** — never outcome health, decision records, or action state.  
3. **`IntentProvider`** derives context, outcome alignment, and decision alignment from OutcomeProvider.  
4. Provider order:  
   `OutcomeProvider → IntentProvider → DecisionProvider → IntelligenceProvider → ExecutiveBriefingProvider`  
5. Product exposure: Briefing **IntentContextStrip** + utility route **`/intent`** — not primary navigation.  
6. Outcome alignment labels: Focused · Watching · Supporting · Non-Focus.  
7. Decision Intent support is **derived via linked outcomes** — no `intentId` on Decision.  
8. Mock-first; no persistence, AI, or analytics.

### Sprint 4B field set (approved implementation)

`id`, `title`, `narrative`, `priority`, `horizon`, `reviewDate`, `reviewCadence`, `focusOutcomeIds`, `watchingOutcomeIds`, `nonFocusOutcomeIds`, `constraints`, `successSignals`, `status`, `history`.

`nonFocusOutcomeIds` is required so Non-Focus alignment has an id-only source without embedding outcome objects.

## Consequences

### Positive

- Clear mandate on Briefing  
- Alignment cues on Outcomes and Decisions  
- Preserves Outcome SoT and provider hierarchy  

### Negative / trade-offs

- Additional provider layer  
- Authors must keep Intent id lists consistent with portfolio outcomes  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Intent as primary nav #7 | Violates Constitution Art. III |
| Intent replaces Outcomes | Violates ADR-001 |
| OKR / % complete Intent | Goal tracking; wrong category |
| `intentId` on Decision | Duplicate reference; derive via outcomes |

## References

- `src/lib/intent/`  
- `src/components/providers/IntentProvider.tsx`  
- `CORE_EXECUTIVE_LOOP.md`  
