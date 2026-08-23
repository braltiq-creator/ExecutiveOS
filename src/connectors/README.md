# Connector Framework

Foundation for ingesting enterprise data into ExecutiveOS **without** coupling intelligence to any vendor platform.

## Rule

> ExecutiveOS never reasons directly over SaaS applications.
> Every external system is translated into a common `BusinessEvent`.

## Interface

```ts
type EnterpriseConnector = {
  connect()
  validate(raw)
  sync(options?)
  normalise(raw)
  health()
}
```

Vendor-specific models must not escape the connector boundary.

## Mock connectors

| Connector | System | Emits |
|-----------|--------|-------|
| `MockMicrosoft365Connector` | microsoft365 | Meetings, capacity signals |
| `MockSalesforceConnector` | salesforce | Opportunities, Helix risk, Decision required |
| `MockJiraConnector` | jira | Actions, strategic initiative |

## Sync pipeline

```
Connector → Validation → Normalisation → BusinessEvent
  → Digital Twin → Knowledge Graph → Executive Intelligence → Snapshot
```

```ts
import {
  createNorthlineConnectorSuite,
  runEnterpriseSyncPipeline,
} from "@/connectors";
import { EnterpriseDigitalTwin } from "@/digital-twin";

const twin = new EnterpriseDigitalTwin();
const result = runEnterpriseSyncPipeline(
  createNorthlineConnectorSuite(),
  twin,
  { runIntelligence: true },
);
```

## Observability

Every sync exposes: records processed, events created, latency, errors, warnings, connector health, last successful sync.

## Future

OAuth, webhooks, and scheduled syncs plug into the same `EnterpriseConnector` contract — only `fetchRaw` / `connect` become async network calls.
