# Phase 61 — Decision → Execution Linkage

**Status:** Complete  
**Date:** 2026-08-22  
**Principle:** ExecutiveOS frames the decision. The executive makes the decision. ExecutiveOS records and operationalises it.

**Prior:** Phase 59 / 59A / 59B / 60.

---

## 1. Decision state model

| State | Meaning |
|-------|---------|
| `OPTION_IDENTIFIED` | Alternatives framed; no executive selection yet |
| `OPTION_SELECTED` | Executive explicitly selected an option |
| `DECISION_APPROVED` | Approve act recorded |
| `DECISION_REJECTED` | Reject act recorded |
| `DECISION_DEFERRED` | Defer option selected or defer act recorded |

**Option identification ≠ option selection ≠ approval.**

Viewing `/decisions` does not select an option.

---

## 2. Executive selection

- UI: `ExecutiveDecisionPaperView` with **Select this option**
- Write path: `selectDecisionOption` → portfolio store
- Freezes `evidenceAtDecision`, records `originSnapshotId`
- Does **not** create an action
- Does **not** set approved

---

## 3. Decision history

Each selection / action appends `Decision.history` and `Decision.timeline`.

Snapshot analysis remains immutable — portfolio is the mutable Decision Loop SoT.

---

## 4. Action creation

`createActionFromSelectedDecision` — allowed only after selection.

Action framing derived from selected option label (template by pattern, not hard-coded Model H).

| Field | Value when unknown |
|-------|--------------------|
| Owner | Owner not yet assigned. |
| Due date | Due date not yet assigned. |
| Action confidence | Action confidence not yet established. |
| Expected outcome | From decision narrative — never fabricated $ |

---

## 5. Action lineage

`OutcomeActionRef` carries:

- `decisionId`
- `snapshotId`
- `evidenceIds`

Trace: Action → Decision → Evidence → Snapshot.

---

## 6. Outcome linkage

Action attaches to the decision’s primary linked outcome (`pendingActions`).

If no strategic outcome exists beyond the bridged insight outcome: narrative remains honest (“Strategic outcome not yet established” only when impact text absent).

---

## 7. Confidence boundaries

Dataset / Judgement / Decision readiness / Decision confidence / Action confidence remain separate.

Decision confidence stays **not yet established** until a bind methodology exists.

---

## 8. Council boundaries

Five seats. Manufacturing: **Not yet established.** Selection does not create consensus.

---

## 9. Command Centre return path

Derived from live portfolio Decision + linked actions:

| Status | Label |
|--------|-------|
| before selection | Decision required |
| after selection | Decision selected |
| after approve | Decision approved |
| after defer | Decision deferred |
| after action | Execution underway |

`/today` stays judgement-first; CTA opens `/decisions`.

---

## 10. Commercial regression

Helix `applyDecisionAct(approve)` still creates workshop action and sets `DECISION_APPROVED`.

Commercial CC: no manufacturing decision paper / instruments.

---

## 11. Manufacturing regression

Lead judgement unchanged. Formulas unchanged. Isolation intact.

---

## 12. Tests

`tests/unit/decisions/decision-execution-linkage-61.test.ts`

Full suite: **75 files · 506 tests passed** (2026-08-22).

---

## 13. Known limitations

1. Approve on manufacturing paper does not auto-create action (explicit create step).
2. Owner / due date assignment UX is deferred — honesty labels only.
3. Session portfolio store is the bind SoT; snapshot library is not rewritten.
4. Commercial DecisionActions (approve/reject) path unchanged for legacy demo decisions.

---

## 14. Recommended next phase

**Phase 62 — Accountability & outcome learning** (assign owner/due date without inventing them; learn from closed actions).

Do not begin Phase 62 until Phase 61 remains green.
