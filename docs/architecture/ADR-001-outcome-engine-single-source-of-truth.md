# ADR-001: Outcome Engine as Single Source of Truth

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 3.5 Platform Foundation  

## Context

ExecutiveOS must personalise and prioritise on **strategic outcomes**, not roles or widget density. Phases 1B–2 established the Outcome Engine as the central intelligence model. Without a hard rule, briefing, decisions, and health signals risk duplicating portfolio state.

## Decision

1. The **Outcome Engine** (`OutcomeProvider` + `OutcomePortfolio`) is the **single source of truth** for strategic outcomes and portfolio health.  
2. Downstream surfaces (Briefing, Decision Engine, Intelligence projections) **derive** from the portfolio — they must not maintain parallel outcome stores.  
3. Every outcome exposes health, yesterday’s movement, trajectory, confidence, owner, target date, business impact, and linked operational artifacts.  
4. Roles may enrich context; **roles must not determine priority order**.

## Consequences

### Positive

- One place to update mock (and later persisted) outcome state  
- Briefing and Decision Engine stay consistent  
- Outcome-based personalisation is enforceable in architecture  

### Negative / trade-offs

- Outcome schema becomes a broad aggregate; changes require coordinated derive updates  
- Early phases use mocked portfolio data until Supabase persistence is designed  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Separate stores per surface | Drift and duplicated business state |
| Role-first priority model | Conflicts with approved FDR personalisation axis |
| Initiative-first model | Initiatives execute outcomes; they are not the personalisation axis |

## References

- `src/components/providers/OutcomeProvider.tsx`  
- `src/lib/outcomes/`  
- Frontend Decision Record §6 / §3  
- Constitution § Engineering Principles  
