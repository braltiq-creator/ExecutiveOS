# Design Partner Pilot Model

## Environment distinction

| Mode | Label | When |
|------|-------|------|
| Demo | DEMO | No active Executive Snapshot (Northline path) |
| Design Partner | DESIGN PARTNER ENVIRONMENT | Pilot tenant / manufacturing snapshot context |
| Standard | EXECUTIVEOS | Real snapshot without pilot metadata |

**IMPLEMENTED:** `src/design-partner/environment.ts`, Command Centre status strip for manufacturing.

## Focus module

`manufacturing_forecasting` — generic module id.

Provision via:

```ts
provisionDesignPartner({
  partnerName: "…", // tenant display name only
  industry: "Manufacturing",
  intelligenceProfileId: "operations_executive",
  focusModule: "manufacturing_forecasting",
  environment: "pilot",
  administratorEmail: "…",
})
```

**IMPLEMENTED:** Manufacturing Forecasting tenant template (`MANUFACTURING_FORECASTING_TENANT_TEMPLATE`) — export-first modules, no live ERP connector ids.

**NOT YET IMPLEMENTED:** Dedicated `manufacturing_executive` Intelligence Profile catalogue entry (Studio business profile `manufacturing` maps to `operations_executive` today).

## Pilot clock

| Field | Rule |
|-------|------|
| `pilotStartedAt` | Optional. Day N of 30 shown **only** when set |
| Without start date | `PILOT STATUS · Not yet started` |

**IMPLEMENTED:** `markPilotStarted`, `buildDesignPartnerStatus`, checkpoints.

Do not invent dates.

## 30-day checkpoints

| Week | Themes |
|------|--------|
| 1 | Data onboarding, forecast interpretation, baseline |
| 2 | Executive usage, judgement quality, data friction |
| 3 | Decision workflow, action linkage, repeat usage |
| 4 | Value review, adoption, integration discussion, expansion |

**IMPLEMENTED:** Measurement framework (`buildDesignPartnerCheckpoints`).  
**NOT YET IMPLEMENTED:** Project-management UI / tasking (intentionally out of scope).

## Pilot boundary

### Includes (IMPLEMENTED / SUPPORTED)

- Manufacturing Forecasting
- Excel / CSV via UDG
- Executive Snapshot
- Command Centre
- Judgement / Decision / Action
- Snapshot comparison
- Pilot measurement & feedback

### Excludes (FUTURE)

- Live ERP / Dynamics / SAP
- Automated factory scheduling, MRP, CMMS
- Production execution
- Inventory optimisation
- Dealer allocation automation
- Autonomous decision making

## Positioning narrative

> Start with the data you already export.  
> No production-system integration is required to prove value.  
> Once ExecutiveOS demonstrates value, deeper integrations can be introduced.

Excel / CSV is the **lowest-friction first connector**. UDG remains the permanent ingestion architecture.
