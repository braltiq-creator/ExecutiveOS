# 7. Drill-down Architecture

**Phase 36 · Experience Alignment**  

---

## 7.1 Model

```
LEVEL 1 — Today
  Mission Control · 30-second understanding
        │
        │  KPI / Priority / Activity
        ▼
LEVEL 2 — Workspace
  Strategy · Decisions · Knowledge · Reports · Administration
  Five-minute understanding
        │
        │  Row / card / “Open”
        ▼
LEVEL 3 — Deep analysis
  Evidence · Relationships · History · Reporting · Settings detail
  Thirty-minute investigation
        │
        │  BrandMark / Today / Up
        ▼
LEVEL 1 — Today
```

---

## 7.2 Drill rules

| Rule | Statement |
|------|-----------|
| D-01 | Today never becomes the workspace |
| D-02 | Each drill answers one deeper question |
| D-03 | L1 shows signals; L2 shows structure; L3 shows evidence |
| D-04 | Do not skip L2 when the executive needs orientation (except deep links with breadcrumb) |
| D-05 | L3 must declare its L2 parent in chrome |
| D-06 | Parallel drills from Today are independent — no stacked Today clones |

---

## 7.3 Drill pathways (canonical)

### From KPI bar

See [KPI Destination Contracts](./08_KPI_DESTINATION_CONTRACTS.md).

### From Executive Priorities

| Priority type | Default L2 | Optional L3 |
|---------------|------------|-------------|
| Lead Judgement | Strategy | Outcome detail |
| Commercial Capacity / Focus | Strategy | Intent / commercial section |
| Revenue Opportunity | Decisions or Strategy | Decision detail |
| Executive Recommendation | Decisions | Decision detail |
| Critical Risk | Decisions | Decision / risk detail |

### From Activity Feed

| Event class | Destination |
|-------------|-------------|
| Overnight / knowledge | Knowledge (or linked object) |
| Decision awaiting | Decisions / decision id |
| Risk detected | Decisions |
| Health / org | Strategy |
| Agenda | Calendar utility (return via Today) |
| Value / revenue | Reports / Value |

### From Pulse signals

Pulse is **orientation**, not a mandatory click target. If made clickable in future:

| Signal | Destination |
|--------|-------------|
| Revenue | Reports |
| Leadership capacity | Administration → Team / People |
| Decisions waiting | Decisions |
| Customer health | Knowledge |
| Outcomes at risk | Strategy or Decisions |

---

## 7.4 Zoom metaphor

Executives should feel:

> “I am focusing into the organisation — not switching apps.”

Implementation: EXS page transition + consistent icons + preserved shell chrome.

---

## 7.5 Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| Expanding Priority into a full report on Today | Move to Strategy/Decisions |
| Multi-step wizards launched from KPI | Workspace owns the flow |
| Drill to unrelated module | Re-map destination contract |
| L3 without Up path | Add breadcrumb + parent link |

---

**Next:** [KPI Destination Contracts](./08_KPI_DESTINATION_CONTRACTS.md)
