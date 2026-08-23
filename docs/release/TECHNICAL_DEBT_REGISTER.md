# Technical Debt Register — Version 1

Supersedes root `TECHNICAL_DEBT.md` scoring for Phase 33+. Root file retained as historical pointer.

## P0 — Before multi-instance production

| ID | Debt | Location | Effort |
|----|------|----------|--------|
| TD-001 | Persist platform module stores | `src/{adaptive,commercial,experiments,memory,outcomes,trust,strategy,growth,scenarios}/**/store.ts` | L |
| TD-002 | Distributed rate limit | `src/lib/security/rate-limit.ts` | M |
| TD-003 | Log aggregation sink | `src/lib/logging/logger.ts` | M |
| TD-004 | Tenant context on admin/value pages | Hardcoded `tenant-northline` | S |

## P1 — Architecture simplification

| ID | Debt | Recommendation | Effort |
|----|------|----------------|--------|
| TD-010 | Dual agents (`src/agents` vs `src/lib/agents`) | Make Council the SoT; adapters for Advisors UI | L |
| TD-011 | Dual outcomes (`lib/outcomes` vs `outcomes`) | Keep: portfolio UI vs value engine — document only | — |
| TD-012 | Triple design systems | Freeze: Experience for exec UI; `components/ui` for forms; deprecate unused `ExecutiveSurface/Panel/Tile` | M |
| TD-013 | Triple memory | Ownership matrix in module READMEs; no new fourth path | S |
| TD-014 | Orphan `RoutePlaceholder` | Removed in Phase 33 | Done |

## P2 — Quality & performance

| ID | Debt | Effort |
|----|------|--------|
| TD-020 | Repeated intelligence builds across pages | M |
| TD-021 | Graph canvas virtualisation | M |
| TD-022 | Advisor orchestrator sequential AI calls | M |
| TD-023 | Domain error class duplication (`lib/billing` vs `lib/errors`) | S |
| TD-024 | Expand Playwright: Today + adaptive governance | M |
| TD-025 | Storybook coverage for Experience primitives | S |

## Simplification recommendations (Phase 33)

1. **Do not add** another design-system package.
2. **Do not add** another memory or agents tree.
3. Prefer `attach-*ToTodayActions` composition in `src/runtime/experience.ts` over page-local intelligence rebuilds.
4. Treat `src/lib/*` as persistence/UI adapters; treat `src/{memory,strategy,trust,adaptive,…}` as platform engines.
5. Delete unused abstractions when discovered (Phase 33: `RoutePlaceholder`).

## Debt score

**Moderate — shippable for design partners; invest P0 before horizontal scale.**
