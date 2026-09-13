# ExecutiveOS Architecture Documentation

**Status:** Canonical governance for platform foundation (Sprint 3.5)  
**Owner:** Principal Frontend Architect / Founder

## Start here

1. [`EXECUTIVEOS_CONSTITUTION_v1.md`](./EXECUTIVEOS_CONSTITUTION_v1.md) — governing vision, principles, IA, engineering rules  
2. [`DOMAIN_MODEL.md`](./DOMAIN_MODEL.md) — entities and relationships  
3. Architecture Decision Records (ADRs) below  
4. [`CONSTITUTION_INCONSISTENCIES.md`](./CONSTITUTION_INCONSISTENCIES.md) — implementation gaps vs Constitution  
5. [`CORE_EXECUTIVE_LOOP.md`](./CORE_EXECUTIVE_LOOP.md) — Foundational operating-loop philosophy  
6. [`SPRINT_4A_INTENT_ENGINE_DESIGN.md`](./SPRINT_4A_INTENT_ENGINE_DESIGN.md) — Intent Engine design (implemented Sprint 4B; ADR-006)  
7. [`SPRINT_4_EXECUTION_ENGINE_DESIGN.md`](./SPRINT_4_EXECUTION_ENGINE_DESIGN.md) — Execution Engine design (proposed; ADR-007)  

## Architecture Decision Records

| ADR | Title |
|-----|--------|
| [ADR-001](./ADR-001-outcome-engine-single-source-of-truth.md) | Outcome Engine as single source of truth |
| [ADR-002](./ADR-002-decision-engine-outcome-coupling.md) | Decision Engine coupled to outcomes |
| [ADR-003](./ADR-003-provider-composition.md) | React provider composition order |
| [ADR-004](./ADR-004-information-architecture-briefing.md) | Information architecture & Executive Briefing |
| [ADR-005](./ADR-005-design-system-hybrid.md) | Design system hybrid (tokens, type, theme) |
| [ADR-006](./ADR-006-executive-intent-engine.md) | Executive Intent Engine as focus context |
| [ADR-008](./ADR-008-verified-connections-evidence.md) | Verified connections & evidence infrastructure (Phase 37) |

## Related product docs

- **Experience Alignment (Phase 36):** [`../experience/README.md`](../experience/README.md) — definitive blueprint for remaining screens  
- **Intelligence Packs:** [`../intelligence-packs/README.md`](../intelligence-packs/README.md) — EIPF + industry blueprints; [Manufacturing Pack (Phase 52)](../intelligence-packs/manufacturing/IMPLEMENTATION.md) / [blueprint (Phase 48)](../intelligence-packs/manufacturing/README.md)  
- **Executive Intelligence Research Library (EIRL, Phase 49):** [`../research/README.md`](../research/README.md) — permanent research foundation for Council, packs, and industries  
- **Executive Intelligence Models (EIM, Phase 50):** [`../intelligence-models/README.md`](../intelligence-models/README.md) — behavioural reasoning models (`src/intelligence-models/`)  
- **Executive Judgement Framework (EJF, Phase 51):** [`../judgement-framework/README.md`](../judgement-framework/README.md) — action-posture judgement above EIM (`src/judgement-framework/`)  
- **Executive Domain Advisors (Phase 52A):** [`../domain-advisors/README.md`](../domain-advisors/README.md) — pack-activated specialists that advise the permanent Council (`src/domain-advisors/`); Council seats unchanged  
- **Customer Provisioning (Phase 53):** [`../provisioning/README.md`](../provisioning/README.md) — self-service tenant trial (`src/provisioning/`, `/admin/provisioning`)  
- **Organisation Portal (Phase 54):** [`../organisation-portal/README.md`](../organisation-portal/README.md) — customer org/subscription portal (`src/organisation-portal/`, `/organisation`)  
- Frontend Decision Record: [`../design/FRONTEND_DECISION_RECORD.md`](../design/FRONTEND_DECISION_RECORD.md)  
- Information Architecture: [`../design/INFORMATION_ARCHITECTURE.md`](../design/INFORMATION_ARCHITECTURE.md)  
- Design Workshops: [`../design/studio/`](../design/studio/)  
- Product Strategy: [`../business/PRODUCT_STRATEGY.md`](../business/PRODUCT_STRATEGY.md)  
- **Commercial Strategy Library (v1):** [`../commercial/README.md`](../commercial/README.md) — pricing, positioning, GTM, sales, CS (documentation only; does not change architecture)  

## Intelligence stack (canonical)

```
Executive Research Library (EIRL)
        ↓
Executive Intelligence Models (EIM)
        ↓
Executive Judgement Framework (EJF)
        ↓
Industry Intelligence Pack (EIPF)
        ↓
Executive Domain Advisors
        ↓
Executive Council (CEO · CFO · COO · CRO · CSO)
        ↓
Executive Recommendation
        ↓
Executive Experience System
```

Domain Advisors are **not** Council members. Industries add expertise via packs and advisor catalogues — never by forking Core or expanding permanent Council seats.

## Storybook

UI primitives are documented in Storybook. From repo root:

```bash
npm run storybook
```

See [`../design/STORYBOOK.md`](../design/STORYBOOK.md).
