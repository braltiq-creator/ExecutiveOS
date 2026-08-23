# Field Services / Simpro Pack

Executive intelligence layer above Simpro.

See `docs/` for:

- Industry Architecture Guide
- Business Event Catalogue
- Executive KPI Dictionary
- Executive Health Model
- Reasoning Rules
- Scenario Catalogue
- Future Integration Guide

```ts
import {
  createSimproDomainAdapter,
  createMockSimproDomainEvents,
  buildFieldServicesExecutiveSnapshot,
  ORG_APEX_FIELD_SERVICES,
  FIELD_SERVICES_SCENARIOS,
} from "@/industry/field-services/simpro";
import { runScenario } from "@/simulation";

const adapter = createSimproDomainAdapter();
const events = adapter.toBusinessEventsMany(createMockSimproDomainEvents());

const result = runScenario(
  ORG_APEX_FIELD_SERVICES,
  FIELD_SERVICES_SCENARIOS[0]!,
);
result.industry?.health.executiveNarrative
result.benchmarkComparison?.summary
```
