# Testing Review — Version 1

## Inventory

| Suite | Location | Role |
|-------|----------|------|
| Unit | `tests/unit/**` (~41 files) | Engines, platforms, providers |
| Integration | `tests/integration/intelligence.test.ts` | Intelligence composition |
| E2E | `tests/e2e/smoke.spec.ts` | Landing / sign-in smoke |
| CI | `.github/workflows/ci.yml` | `tsc` + unit/integration |

**Command:** `npm test` · `npm run test:smoke` · `npm run test:e2e`

## Coverage by critical path

| Path | Coverage | Risk |
|------|----------|------|
| Snapshot / intelligence builders | Strong unit | Low |
| Today attach pipeline (scenarios→memory→strategy→trust→adaptive) | Units per attach; no single integration test | Medium |
| Adaptive governance reset/disable | Unit | Low |
| Trust explanations | Unit | Low |
| Growth EVS / activation | Unit | Low |
| Commercial licensing | Unit | Low |
| Auth → onboarding → Today | Smoke only | Medium |
| Stripe / OAuth webhooks | Manual / provider docs | Medium |
| Knowledge / Reports primary nav | Foundations only | Accepted (KI-001) |
| Accessibility | Storybook a11y addon; no CI axe | Medium |
| Performance budgets | Not automated | Medium |

## Regression risk (highest)

1. `src/runtime/experience.ts` composition order changes  
2. Snapshot type optional fields used by Experience cards  
3. Dual agents / dual outcomes import mistakes  
4. In-memory store leakage across tests (mitigated by `reset*` helpers)

## V1 testing standard

- Every platform module ships with a `reset*` and at least one unit file under `tests/unit/<module>/`
- CI must stay green on `main`
- New product phases must add tests before claiming readiness

## Gaps deferred (not blocking design-partner V1)

- Full Playwright Today journey  
- axe-core in CI  
- Webhook contract tests  
- Load tests for graph canvas  
