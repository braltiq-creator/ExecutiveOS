# Operational Excellence & Observability Platform

**Braltiq-only.** Continuously monitors health, reliability, performance,
commercial operation, and customer experience of ExecutiveOS.

No customer-facing capabilities. Core intelligence unchanged.

## Modules

| Folder | Role |
|--------|------|
| `observability/` | Types + composite dashboard builder |
| `monitoring/` | Platform uptime, API, auth, queues, memory, errors |
| `health/` | Pilot health scores + customer health portfolio |
| `alerts/` | Partner alerts + platform alerts + thresholds |
| `diagnostics/` | Cross-cutting findings |
| `performance/` | Latency / memory / queue metrics |
| `provider-health/` | M365, Simpro, Salesforce |
| `billing-health/` | Subscriptions / webhooks |
| `adoption-health/` | Brief / module / provider adoption |
| `value-health/` | Portfolio EVS trends |
| `security-health/` | Auth / rate-limit signals |
| `release-management/` | Versions, flags, known issues, maintenance |
| `incident-management/` | Severity, timeline, PIR, lessons |
| `analytics/` | Portfolio + commercial (MRR/ARR) |

Also includes the Design Partner Operations Centre (partners, CS, support).

## Isolation

Allowed: health, telemetry, aggregated metrics, operational metadata.  
Forbidden: jobs, opportunities, emails, decision content across tenants.

## Entry points

```ts
import {
  buildOperationsCentreDashboard,
  buildOperationalExcellenceDashboard,
  configureAlertThresholds,
  openIncident,
} from "@/operations";

const dashboard = buildOperationsCentreDashboard();
// dashboard.excellence → platform / providers / commercial / …
```

## Admin

`Administration → Operations` → `/admin/operations`
