# Executive Snapshot Studio

**Phase:** 56 · 57B client/server boundary  
**Route:** `/onboarding/snapshot`  
**Path:** `src/executive-snapshot-studio/`

---

## Purpose

The first complete ExecutiveOS customer workflow — the Design Partner “wow” moment.

```
Client UX (upload · wizard · presentation)
        ↓ Server Actions (serializable DTO)
Server (UDG · Snapshot · Intelligence · Council)
        ↓
Command Centre (/today)
```

This is **orchestration**, not a new framework. It reuses:

- Universal Data Gateway
- Executive Experience Design System
- Domain Advisors / Pack activation
- Outcome Engine · Council · Judgement (via Command Centre)
- Existing Mission Control at `/today`

No new AI reasoning. No Core / Council / Pack / EIM changes.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the client/server boundary.

---

## Wizard steps

| # | Step | Behaviour |
| --- | --- | --- |
| 1 | Welcome | Acquire context — does not replace operational systems |
| 2 | Upload | Excel / CSV via UDG dropzone (future connectors unchanged UX) |
| 3 | Profile | Auto-detect Manufacturing · Commercial · Mining · Utilities · Field Services · Technology — override allowed |
| 4 | Mapping | Entities · relationships · measures · hierarchy — confirm |
| 5 | Validation | Readiness dashboard (quality, coverage, freshness, confidence, relationships) |
| 6 | Snapshot | Immutable UDG snapshot + lineage summary |
| 7 | Intelligence | Activate advisors / council readiness — no new reasoning |
| 8 | Brief | Brief ready · **Open Command Centre →** |

Mapping precedes scored validation because UDG validates **canonical** fields after mapping confirmation.

---

## Library

`SnapshotLibrary` lists immutable snapshots: profile, created, confidence, readiness, brief, Command Centre, open. Comparison of readiness / confidence / volume — **no editing**.

---

## Experience

EXDS components throughout: Narrative, KPI cards, Business Impact, Heat Map, Timeline, Digital Twin, colour language, motion, typography.

---

## Success criteria

A first-time user uploads a dataset and, within minutes, receives Snapshot · Readiness · Profile · Brief · Command Centre — without product training.

---

*Confidence Through Clarity.*
