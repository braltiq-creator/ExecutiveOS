# ADR-003: React Provider Composition Order

**Status:** Accepted  
**Date:** 2026-07-20  
**Deciders:** Founder, Principal Frontend Architect  
**Sprint:** 3.5 Platform Foundation  
**Depends on:** ADR-001, ADR-002  

## Context

Multiple client contexts serve the authenticated product shell: outcomes, decisions, intelligence projections, and the executive briefing. Incorrect nesting causes circular dependencies or duplicate sources of truth.

## Decision

Authenticated briefing/engine surfaces compose providers in this **fixed order**:

```
OutcomeProvider
  → IntentProvider
    → DecisionProvider
      → IntelligenceProvider
        → ExecutiveBriefingProvider
```

Rules:

1. **OutcomeProvider** owns portfolio state (intent, outcomes, decisions array, health aggregates).  
2. **IntentProvider** derives focus context and alignment from OutcomeProvider; does not own business state (ADR-006).  
3. **DecisionProvider** consumes OutcomeProvider (via tree); exposes queue, detail lookups, `priorityDecisions`.  
4. **IntelligenceProvider** merges Decision Engine priorities with other intelligence signals; must not invent a second decision store.  
5. **ExecutiveBriefingProvider** assembles briefing sections from derived portfolio + intent + decision + intelligence data.  
6. Composition is wired via `BriefingProviders` (or equivalent shell wrapper). New providers that depend on portfolio state nest **inside** OutcomeProvider and declare dependencies in an ADR amendment.

*Amended by ADR-006 (Intent Engine).*

## Consequences

### Positive

- Deterministic data flow for Briefing and engines  
- Easy mental model for contributors  
- Prevents briefing-local outcome copies  

### Negative / trade-offs

- Deeper tree; testing requires provider wrappers  
- Server Components cannot use these contexts — pages that need engines remain client-boundary aware  

## Alternatives considered

| Alternative | Why rejected |
|-------------|--------------|
| Flat peer providers with sync events | Race conditions and dual writes |
| Briefing owns all data | Violates ADR-001 |
| Global Zustand/Redux store (Phase 1–3) | Premature; React context sufficient for mock engines |

## References

- `src/components/providers/`  
- `src/components/briefing/`  
- Constitution § Engineering Principles  
