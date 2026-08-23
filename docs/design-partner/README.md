# Design Partner — Manufacturing Forecasting Pilot

**Status:** Phase 63 — Design Partner readiness  
**Use case:** Manufacturing → Forecasting  
**Ingestion:** Excel / CSV via Universal Data Gateway (no live ERP required)

## Principle

Prove value from a controlled customer export **before** asking for enterprise system integration.

```
Customer export (Excel/CSV)
  → Universal Data Gateway
  → Executive Snapshot
  → Manufacturing Forecast Intelligence
  → Command Centre
  → Judgement → Decision → Action
```

## What this is

A **controlled Design Partner environment** inside ExecutiveOS — not a separate product (`HitachiApp`, etc.).

Partner identity is tenant configuration. Customer names are never hard-coded into architecture.

## Documents

| Doc | Contents |
|-----|----------|
| [PILOT_MODEL.md](./PILOT_MODEL.md) | Environment, 30-day checkpoints, boundaries |
| [DATA_ONBOARDING.md](./DATA_ONBOARDING.md) | Upload → map → validate → snapshot → activate |
| [SECURITY_POSTURE.md](./SECURITY_POSTURE.md) | Honest claims only |
| [PILOT_ACCESS_READINESS.md](./PILOT_ACCESS_READINESS.md) | Four-user access / deploy / isolation audit (AMBER after M3–M5) |
| [PILOT_PROVISIONING.md](./PILOT_PROVISIONING.md) | Manual four-user account + org setup |
| [PILOT_METRICS.md](./PILOT_METRICS.md) | Measurement model (no fabrication) |
| [EXPANSION_MODEL.md](./EXPANSION_MODEL.md) | Land-and-expand signals (NOT ACTIVE modules) |
| [PHASE_64_EXECUTIVE_EXPERIENCE_VALIDATION.md](./PHASE_64_EXECUTIVE_EXPERIENCE_VALIDATION.md) | Morning simulation & operating-loop validation |
| [PHASE_64_FRICTION_LOG.md](./PHASE_64_FRICTION_LOG.md) | Classified friction from simulation |
| [PHASE_65_PILOT_CONTINUITY.md](./PHASE_65_PILOT_CONTINUITY.md) | Continuity, accountability, no silent demo fallback |

## Status legend (all docs)

| Label | Meaning |
|-------|---------|
| **IMPLEMENTED** | Shipped in product code |
| **SUPPORTED BY CURRENT ARCHITECTURE** | Types/stores/paths exist; durability or UX may be partial |
| **NOT YET IMPLEMENTED** | Documented limitation — do not imply it exists |
| **FUTURE** | After Design Partner proves value |

## Primary executive destination

**Command Centre (`/today`)** — not the upload screen.

Data onboarding is initial / recurring. Day-to-day work starts at:

> What requires executive judgement today?

## Regression

Demo mode, Commercial Salesforce snapshots, and Manufacturing Forecasting must coexist without cross-contamination.
