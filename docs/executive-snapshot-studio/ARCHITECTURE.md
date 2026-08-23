# Snapshot Studio Architecture

## Client / Server boundary (Phase 57B)

```
┌──────────────────────────────────────────────────────────┐
│ CLIENT — Snapshot Studio UI                              │
│ upload · wizard state · mapping confirmation             │
│ validation presentation · readiness · progress           │
│ snapshot result · brief result · navigation              │
└────────────────────────────┬─────────────────────────────┘
                             │ Server Actions (serializable DTO)
                             ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER BOUNDARY                                          │
│ Acquisition / Validation / Intelligence                  │
│ createExecutiveSnapshotAction                            │
│ runStudioIntelligenceAction                              │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER — business-context processing                     │
│ UDG ingest · Snapshot · Readiness                        │
│ Commercial analysis · Isolated EIE · Permanent Council   │
│ Report generation · fixture filesystem (server-only)     │
└──────────────────────────────────────────────────────────┘
```

### Explicit rule

The browser must never import `node:fs`, `node:path`, `node:crypto`, or fixture paths — directly or indirectly.

| Layer | Responsibility |
| --- | --- |
| Client | Experience only — no filesystem, no Council execution |
| Server Boundary | Server Actions returning plain JSON DTOs |
| Server | UDG / Snapshot / Intelligence / Council / fixtures |

### Modules

- Client API: `src/executive-snapshot-studio/client/api.ts`
- Server Actions: `src/executive-snapshot-studio/server/actions.ts`
- Fixture filesystem: `src/executive-snapshot-studio/server/commercial-validation-file.ts` (`server-only`)
- Tabular validation (no fs): `src/executive-snapshot-studio/intelligence/run-commercial-validation.ts`

## Orchestration boundary (unchanged)

```
┌─────────────────────────────────────────────┐
│           Executive Snapshot Studio         │
│  welcome · wizard · detection · readiness   │
│  mapping · brief · history · launch         │
└──────────────┬──────────────────────────────┘
               │ orchestrates (server-side for heavy work)
    ┌──────────┼──────────┬──────────────┐
    ▼          ▼          ▼              ▼
  UDG        EXDS    Domain Advisors   /today
(ingest)  (presentation) (activate)  (Mission Control)
```

Studio never branches Core engines. Intelligence activation calls `activateDomainAdvisorsForIndustry` and prepares Command Centre launch.

## Session + library

In-memory `StudioSession` + `StudioLibraryEntry` (v1). Persist behind the same APIs when durable storage is added.

## Future connectors

Upload step already speaks UDG source kinds. Salesforce / Dynamics / SAP / REST / streaming / scheduled imports attach as connectors — **wizard UX stays the same**.
