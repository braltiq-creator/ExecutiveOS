# Design Partner Pilot Metrics

Pilot measurements — **not** product KPIs. Never fabricate values.

## Recordable metrics

| Metric | Meaning | Null means |
|--------|---------|------------|
| Time to first insight | Upload → first executive insight | Not yet measured |
| Time to decision frame | Snapshot activation → decision framed | Not yet measured |
| Decisions logged | Count of executive decisions recorded | Zero until recorded |
| Actions created | Follow-through actions | Zero until recorded |
| Data preparation friction | Onboarding issues counted | Zero until recorded |
| Executive return | Returns to Command Centre | Zero until recorded |
| Would you start here? | Yes / No responses | Zero until recorded |

**IMPLEMENTED:** `src/design-partner/metrics.ts`

## Feedback

Lightweight kinds:

- Useful / Not useful / Missing / Incorrect
- Would start here / Would not start here
- Optional comment

Associated with snapshot / insight / decision / screen when provided.

**IMPLEMENTED:** `recordDesignPartnerFeedback`, Command Centre capture UI.

## Aggregation

`buildDesignPartnerMetricsSnapshot(organisationId)` returns measured values and an honest explanation of what remains unmeasured.
