# Simpro Production Executive Context Provider

Transforms field service operations into portable executive intelligence.

## Boundary

Simpro API objects never leave this package. Core receives:

- `BusinessEvent[]` with executive meanings
- `OperationalContextBrief` (vendor-independent)

Maximo or another FSM can replace Simpro by implementing the same brief shape.

## Layout

```
auth/ api/ sync/ webhooks/
jobs/ quotes/ customers/ sites/ assets/
technicians/ projects/ workorders/
purchase-orders/ invoices/ scheduling/ timesheets/
executive-context/ analytics/
security/ configuration/ monitoring/
connection/ relationships/ docs/
```

## Live vs mock

- Default / CI: mock API transport + deterministic brief
- Connected: encrypted credentials → live sync → brief cached for Today
