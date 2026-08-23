# Phase 64 — Product Friction Log

**Simulation date:** 2026-08-23  
**Fixture:** `fixtures/manufacturing/forecasting/demo-manufacturing-forecast.csv`  
**Mode:** Manufacturing Forecasting Design Partner (no new intelligence)  
**Principle:** Observe → record → prioritise. Do not auto-fix.

| ID | Class | Friction | Severity | Notes |
|----|-------|----------|----------|-------|
| F01 | UNDERSTANDING | Pilot Day N does not appear after `markPilotStarted` when Snapshot organisationId ≠ pilot tenantId | P1 | Simulation showed `PILOT STATUS · Not yet started` despite started clock. CC looks up pilot by `organisationId` / `tenant-snap-*`; provisioned pilot lives under `tenant-{slug}`. |
| F02 | NAVIGATION | First open may land on demo Command Centre if no active snapshot / `?studio=` | P0 | Design Partner morning test requires Snapshot Studio activate or persisted session context. Empty session → Northline demo — trust risk. |
| F03 | UNDERSTANDING | Decision question grammar slightly awkward (“Should protect strategic Model H…”) | P2 | Meaning clear; subject missing. Not a loop blocker. |
| F04 | VISUAL | Command Centre is long; heat map / capacity / inventory sit below the fold on many viewports | P1 | 60-second instruments exist, but may require scroll. First viewport carries judgement + evidence strip + CTA. |
| F05 | DECISION | Commercial Command Centre still lacks manufacturing-parity decision paper / execution status | P1 | Out of Manufacturing DP critical path; remains product asymmetry (Phase 62). |
| F06 | TRUST | Dataset readiness ≈ judgement readiness on clean demo fixture (100% / 99%) | P2 | Separation is implemented; demo quality can make the distinction feel academic. |
| F07 | UNDERSTANDING | Honesty labels (“Not yet quantified”, “Not yet established”) can read as incomplete product | P2 | Intentional integrity — needs executive framing in pilot briefing, not invented numbers. |
| F08 | ACTION | Owner / due date remain honesty strings with no assignment UI | P1 | Accountability after decision is partial — lineage exists; assignment does not. |
| F09 | NAVIGATION | Judgement → Decision requires leaving `/today` for `/decisions` | P2 | CTA is present; transition is natural but not single-page. |
| F10 | DATA | Snapshot Library manufacturing comparison needs session-stored analyses | P2 | Compare works when contexts are in browser library; process-local studio library alone is thinner. |
| F11 | SECURITY | Isolation is organisation-scoped in-memory / session — not durable multi-instance auth | P1 | Documented Phase 63; pilot must disclose. |
| F12 | PERFORMANCE | Full suite remains healthy; no simulation-time performance issue observed | — | None material in Phase 64. |
| F13 | VISUAL | Design Partner strip + “EXECUTIVEOS / MANUFACTURING FORECAST…” stacks above hero | P3 | Subtle enough; slight vertical cost before lead judgement. |
| F14 | TRUST | “Would you start here?” feedback is available; answer must not be fabricated for sales claims | P0 (process) | Mechanism PASS; product claim requires real executive response. |

## Classification key

DATA · NAVIGATION · VISUAL · UNDERSTANDING · TRUST · DECISION · ACTION · SECURITY · PERFORMANCE
