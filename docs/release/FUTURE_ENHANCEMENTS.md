# Future Enhancement Register

Enhancements that improve an existing capability. Not committed to a sprint.

| ID | Theme | Enhancement | Depends on |
|----|-------|-------------|------------|
| FE-001 | Knowledge | Wire `KnowledgeGraphExplorer` into `/knowledge` with mock-safe fallback | KI-001 |
| FE-002 | Reports | Compose board narrative from Intent + Outcomes + Decisions on `/reports` | KI-001 |
| FE-003 | Adaptive | Persist profiles and recommendation learning per tenant | TD-001 |
| FE-004 | Trust | Customer-exportable explanation packs for board packs | Trust module |
| FE-005 | Growth | Multi-tenant EVS with live Stripe usage | Growth + billing |
| FE-006 | Experience | Per-route loading skeletons matching Brief hierarchy | KI-010 |
| FE-007 | Providers | Expand Simpro / M365 certification matrix | Connectivity |
| FE-008 | Testing | Full Today attach-pipeline integration test | CI |
| FE-009 | A11y | Automated axe in Playwright smoke | FE-008 |
| FE-010 | Performance | Snapshot cache with TTL shared across Today/assistant | TD-020 |
| FE-011 | Council | Surface Executive Council on Decisions workspace (replace legacy advisors path gradually) | TD-010 |
| FE-012 | Benchmarking | Larger anonymised peer cohort for percentile stability | Adaptive |
