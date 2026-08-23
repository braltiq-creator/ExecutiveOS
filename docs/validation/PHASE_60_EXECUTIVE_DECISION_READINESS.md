# Phase 60 — Executive Decision Readiness

**Status:** Complete  
**Date:** 2026-08-17  
**Principle:** ExecutiveOS does not make the executive decision. ExecutiveOS makes the decision clearer.

**Prior:** Phase 59 / 59A / 59B — Manufacturing Forecasting, Audit, Narrative Hierarchy.

---

## Decision readiness model

| Class | Meaning |
|-------|---------|
| `DECISION_READY` | Options framed and evidence would support bind (not used for current demo — selection still executive) |
| `DECISION_REQUIRES_EVIDENCE` | Gaps block framing options |
| `DECISION_REQUIRES_EXECUTIVE_JUDGEMENT` | Options identified; executive selection required |
| `NOT_DECISION_READY` | Insufficient material judgement to frame a decision |

Demo manufacturing lead judgement → **`DECISION_REQUIRES_EXECUTIVE_JUDGEMENT`**.

Message: **“Options identified. Executive selection required.”**

---

## Decision question methodology

1. Prefer executive-judgement **implication** (`Whether to …`).
2. Transform to interrogative (`Should …?`) without inventing business content.
3. Fallback templates only when implication absent, using **derived** lead model name.

No hard-coded “Model H” decision question in source.

---

## Option methodology

When demand acceleration / primary support exists, frame three **options** (not recommendations):

- Protect lead-model demand through capacity reallocation  
- Maintain allocation / accept potential deferral  
- Defer until additional evidence  

Each option: `isRecommendation: false`.

---

## Trade-off methodology

Per-option upside/downside traced to:

- Primary support cells  
- Counter-signals  
- Operational plant load  

No invented financial consequences.

---

## Counter-signal handling

Counter-signals from Region×Model decliners (e.g. SA Model L) remain a first-class block on the decision paper. Lead judgement does not erase them.

---

## Missing evidence handling

Listed only when absent / weakly covered / not in contract:

- Order bank (coverage)  
- Financial contribution / unit economics  
- Capacity allocation flexibility (requires executive judgement)  
- Customer / strategic priority (requires executive judgement)  
- Dealer commitment strength  

Presence tags: `KNOWN` | `DERIVED` | `MISSING` | `REQUIRES_EXECUTIVE_JUDGEMENT`

---

## Confidence methodology

| Layer | Demo behaviour |
|-------|----------------|
| Dataset confidence | National MAE score |
| Judgement confidence | Model-scoped / demand insight |
| Decision readiness | Classification enum |
| Decision confidence | **Not yet established** (null % — never fabricated) |

---

## Cost-of-delay boundaries

Without financial evidence: **“Cost of delay not quantified.”**  
Operational volume is never substituted for dollars.

---

## Council boundaries

Seats: CEO, CFO, COO, CRO, CSO.  
Manufacturing: **Council position not yet established.**  
Decision Workspace suppresses fabricated consensus panels for manufacturing snapshots.

---

## Executive Value boundaries

**Not yet quantified** unless analysis marks quantified with defensible evidence.

---

## Manufacturing example (demo fixture)

| Step | Content |
|------|---------|
| Signal | QLD/NSW Model H above plan (6-period) |
| Judgement | Model H demand has moved above plan |
| Implication | Protect via reallocation vs accept deferral |
| Decision question | Derived from implication (`Should …?`) |
| Readiness | Requires executive judgement |
| Options | Protect / Maintain / Defer |
| Counter-signal | SA Model L softening |
| Operational | Extreme plant load % preserved |

---

## Command Centre integration

- `/today` remains judgement-first (what changed / why / judgement).  
- CTA: **Open decision →** → `/decisions?from=manufacturing_judgement&select=…`  
- Full decision paper lives on Decision Workspace — not cluttered onto `/today`.

---

## Commercial regression

- Commercial Command Centre: no manufacturing decision paper / instruments.  
- Manufacturing: no pipeline / ageing / next-step.  
- Shared Decision Engine types only — no manufacturing fork.

---

## Tests

`tests/unit/executive-snapshot-studio/manufacturing-decision-readiness-60.test.ts`

- Judgement → decision transition  
- Readiness classification  
- Derived question (no Model H hard-code)  
- Options / trade-offs / counter-signals  
- Missing evidence / confidence separation  
- Cost-of-delay / Value / Council honesty  
- CC CTA wiring  
- Commercial isolation  

Full suite: **74 files · 497 tests passed** (2026-08-17).

---

## Primary files

| File | Role |
|------|------|
| `src/lib/decisions/decision-readiness.ts` | Shared readiness types + question derive |
| `src/executive-snapshot-studio/intelligence/manufacturing-decision-frame.ts` | MFG decision paper |
| `src/experience/decision-readiness/ExecutiveDecisionPaper.tsx` | Decision paper UI |
| `src/experience/decision-workspace/DecisionWorkspace.tsx` | Paper + council integrity |
| `manufacturing-portfolio-bridge.ts` / `run-manufacturing-validation.ts` | Enrich Decision Engine objects |
| `manufacturing-command-centre.ts` | CTA → `/decisions` |

---

## Known limitations

1. Decision confidence remains unset until a bind methodology with evidence exists.  
2. Options are framed for demand-acceleration class judgements; other postures may stay Investigate/Monitor stubs.  
3. Detail route `/decisions/[id]` resolves portfolio client-side (sessionStorage).  
4. Impact simulator / commercial council panels intentionally hidden for manufacturing to avoid fabricated consensus/value.

---

## Recommended next phase

**Phase 61 — Decision bind & learning loop** (only after executive selection UX + memory of chosen option without fabricating recommendation pressure).

Do not begin Phase 61 until Phase 60 acceptance criteria remain green.
