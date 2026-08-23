# ADR-002: Decision Engine Coupled to Outcomes

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 3.5 Platform Foundation  
**Depends on:** ADR-001  

## Context

Decisions are the unit of executive judgment. Standing alone, a decision register becomes a task list. The product requires every decision to advance one or more strategic outcomes.

## Decision

1. Decisions live on the **Outcome Portfolio** (`OutcomePortfolio.decisions`).  
2. Every decision **must** reference one or more outcomes via `outcomeIds` (length ≥ 1). There are **no standalone decisions**.  
3. The **Decision Engine** (`DecisionProvider`) derives queue, lookups, and priority decisions from `OutcomeProvider` — it does not own a separate decision store.  
4. Decision Engine types live in `src/lib/decisions/engine-types.ts`. Legacy Supabase decision-register types remain in `src/lib/decisions/types.ts` and must not be overwritten by engine work.  
5. UI status badges for engine vs register are separate (`EngineDecisionStatusBadge` vs `DecisionStatusBadge`).

## Consequences

### Positive

- Decisions always answer “which outcome does this serve?”  
- Priority Decisions on the Briefing reuse Decision Engine projections  
- Clear boundary between engine (mock/derived) and legacy register  

### Negative / trade-offs

- Dual type systems until register is retired or unified  
- Mutations to decisions must go through portfolio/OutcomeProvider paths  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Standalone decision store | Breaks Outcome Before Interface |
| Overwrite legacy `types.ts` | Broke existing register/Supabase code paths |
| Decision-first portfolio | Outcomes are the personalisation axis |

## References

- `src/components/providers/DecisionProvider.tsx`  
- `src/lib/decisions/engine-types.ts`  
- `src/lib/decisions/derive.ts`  
- Constitution § Domain Rules  
