# Known Issues Register — Version 1

Issues accepted for V1 with mitigations. Do not treat silence as absence.

| ID | Severity | Area | Issue | Mitigation | Target |
|----|----------|------|-------|------------|--------|
| KI-001 | High | IA | `/knowledge` and `/reports` primary-nav surfaces are foundations, not full product depth | Honest empty states + links to working engines (`/admin/memory`, `/value`, graph services) | V1.1 |
| KI-002 | High | Ops | Platform modules (adaptive, commercial, experiments, memory, strategy, trust, growth) use process-local stores | Acceptable for design-partner / demo; persist before multi-instance GA | V1.1 |
| KI-003 | High | Ops | Rate limiting is in-process only | Single-instance deploy or accept race; Redis planned | V1.1 |
| KI-004 | High | Ops | Logging is stdout JSON only | Ship with container log drain; wire Axiom/Datadog | V1.1 |
| KI-005 | Medium | Arch | Dual agent stacks: `src/agents` (Council) vs `src/lib/agents` (Advisors UI) | Document; prefer Council for new work; migrate UI later | V1.2 |
| KI-006 | Medium | Arch | Triple UI systems: `design-system`, `experience/design-system`, `components/ui` | Experience 2.0 owns executive surfaces; ui kit owns forms/admin; no new third path | V1.2 |
| KI-007 | Medium | Arch | Multiple memory layers (`lib/memory`, `intelligence/executive-memory`, `memory`) | Document ownership; organisational memory is SoT for learning | Ongoing |
| KI-008 | Medium | UX | Hardcoded demo tenant IDs on some admin/value pages (`tenant-northline`) | Fine for mock-first; replace with runtime tenant context before multi-tenant prod | V1.1 |
| KI-009 | Medium | Test | Thin e2e coverage (smoke only); no page-level Today pipeline test | CI runs unit+tsc; expand Playwright for Today auth path | V1.1 |
| KI-010 | Low | A11y | Route-level `loading.tsx` only on `/today` among product routes | Global `loading.tsx` covers others; add per-route as needed | V1.2 |
| KI-011 | Low | Perf | Knowledge graph canvas not virtualised | Cap node count in mock; virtualise before large orgs | V1.2 |
| KI-012 | Low | Product | Assistant / advisor chat not persisted | Disclose in UX; persist conversations post-V1 | V1.2 |

## Customer-facing disclosure (design partners)

1. Knowledge and Reports are evolving; Strategy, Decisions, and Today are the daily path.
2. Adaptive learning is explainable and resettable; Core recommendations are never silently rewritten.
3. Benchmarking shows percentile bands only — no peer identities.
