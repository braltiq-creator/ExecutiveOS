# ExecutiveOS Experience Alignment

**Phase:** 36  
**Status:** Canonical blueprint for all remaining screens  
**Version:** 1.0  
**Date:** 27 July 2026  
**Reference implementation:** Today — Executive Command Centre (`/today`)  
**Presentation system:** [EXS v1.0](../../src/experience/exs/README.md)  

---

## Authority

This folder is the **definitive experience architecture** for ExecutiveOS screens.

| Rule | Meaning |
|------|---------|
| Today is home | Mission Control — 30-second organisational awareness |
| Workspaces are dedicated | Strategy, Decisions, Knowledge, Reports, Administration |
| No parallel languages | Future pages inherit Today’s EXS language |
| Docs before redesign | Align here before redesigning any individual page |

**Does not change:** Core engines, providers, routing structure, business logic, or data models.  
**Does define:** How executives move, what each surface answers, and how every screen must feel.

---

## Document index

| # | Document | Purpose |
|---|----------|---------|
| 1 | [Executive Experience Blueprint](./01_EXECUTIVE_EXPERIENCE_BLUEPRINT.md) | Philosophy, levels, Today as reference |
| 2 | [Navigation Architecture](./02_NAVIGATION_ARCHITECTURE.md) | Primary nav, utility nav, shell chrome |
| 3 | [Information Architecture](./03_INFORMATION_ARCHITECTURE.md) | Levels L1–L3, content ownership |
| 4 | [Workspace Definitions](./04_WORKSPACE_DEFINITIONS.md) | Every page: purpose, KPIs, cards, actions |
| 5 | [Navigation Contracts](./05_NAVIGATION_CONTRACTS.md) | Entry, exit, return, deep-link rules |
| 6 | [Interaction Contracts](./06_INTERACTION_CONTRACTS.md) | Click, hover, focus, loading, motion |
| 7 | [Drill-down Architecture](./07_DRILL_DOWN_ARCHITECTURE.md) | L1 → L2 → L3 pathways |
| 8 | [KPI Destination Contracts](./08_KPI_DESTINATION_CONTRACTS.md) | Every Today KPI → module section |
| 9 | [Executive Journeys](./09_EXECUTIVE_JOURNEYS.md) | Major workflows: Today → workspace → Today |
| 10 | [Component Standards](./10_COMPONENT_STANDARDS.md) | Cards, headers, tables, badges, EXS |
| 11 | [Cross-page Consistency Rules](./11_CROSS_PAGE_CONSISTENCY.md) | Icons, colour, copy, status, value |

---

## Related (historical / supporting)

| Document | Relationship |
|----------|----------------|
| [EXS README](../../src/experience/exs/README.md) | Code-level presentation primitives |
| [Design IA](../design/INFORMATION_ARCHITECTURE.md) | Pre–Command Centre IA — superseded for nav labels by this set |
| [Product Experience Blueprint](../product/EXECUTIVE_EXPERIENCE_BLUEPRINT.md) | Broader product philosophy — complements, does not replace Phase 36 |
| [Customer Journey Blueprint](../customer/EXECUTIVEOS_CUSTOMER_JOURNEY_BLUEPRINT.md) | Lifecycle / commercial journeys |

---

## Success criteria

An executive should:

1. Open **Today** and understand the organisation in ≤30 seconds  
2. Drill into any KPI or Priority with a predictable destination  
3. Complete work in a dedicated workspace  
4. Return to Today and see continuity  
5. Recognise ExecutiveOS on every screen by brand, icons, cards, and motion  

**Confidence Through Clarity.**
