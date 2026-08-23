# Industry Architecture Guide — Field Services (Simpro)

## Mission

ExecutiveOS Core is complete. This pack teaches ExecutiveOS to think like an experienced **field service CEO** using Simpro.

> ExecutiveOS must not become a Simpro dashboard.
> ExecutiveOS must become the executive intelligence layer **above** Simpro.

## Stack position

```
Simpro (vendor)
   │ SimproDomainAdapter (vendor boundary)
   ▼
BusinessEvent (canonical)
   ▼
Digital Twin + Knowledge Graph
   ▼
Executive Intelligence → Intent → Memory → Judgement
   ▼
Field Services Health + Rules + KPI language
   ▼
Today / Reality Lab
```

## Modules

| Module | Path |
|--------|------|
| Domain Model | `domain.ts` |
| Business Event Mapping | `events.ts` |
| Executive KPI Library | `kpis.ts` |
| Executive Health Model | `health.ts` |
| Industry Benchmarks | `benchmarks.ts` |
| Judgement Rules | `rules.ts` |
| Scenario Library | `scenarios.ts` (20) |
| Connector Adapter | `adapter.ts` |
| Reality Lab org | `organisation.ts` |
| Pulse enrichment | `apply-industry.ts` |

## Self-review questions

1. Would an experienced field-service CEO believe this reasoning?
2. Would this insight save executive time?
3. Would this recommendation improve decision quality?
4. Would this still work if Simpro were replaced?

If the answer to (4) is no, the vendor boundary leaked.
