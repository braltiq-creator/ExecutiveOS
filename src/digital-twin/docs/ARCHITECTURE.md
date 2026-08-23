# Enterprise Digital Twin — Architecture

## Stack position

```
Connectors (M365 / Salesforce / Jira / …)
        │ BusinessEvent only
        ▼
Enterprise Digital Twin  ←── canonical operational model
        │
        ├─► Knowledge Graph (relationships)
        │
        └─► EnterpriseDataProvider.getSignals()
                    │
                    ▼
         Executive Intelligence → Snapshot
```

## Why Twin ≠ Graph

| Twin | Knowledge Graph |
|------|-----------------|
| Current + historical operational state | Relationship topology |
| Versioned snapshots + replay | Path / neighborhood queries |
| Built from BusinessEvents | Projected from Twin (and seed) |

Intelligence reasons over the Twin. Graph explains how entities relate.

## Incremental updates

`apply(events)` ignores duplicate event ids → safe for webhook retries and scheduled syncs.

## Provider swap

```ts
createMockDigitalTwinProvider()

// Future
createSupabaseDigitalTwinProvider(client)
```
