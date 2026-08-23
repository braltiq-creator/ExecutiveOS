# Connector Framework — Architecture

## Boundary

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Microsoft365│   │ Salesforce  │   │    Jira     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │ validate/normalise (inside connector)
       └────────────┬──────────────────────┘
                    ▼
              BusinessEvent
                    ▼
           EnterpriseDigitalTwin
                    ▼
             Knowledge Graph
                    ▼
         Executive Intelligence
```

## BusinessEvent

Canonical fields: `id`, `timestamp`, `sourceSystem`, `entityType`, `entityId`, `eventType`, `importance`, `confidence`, `relationships`, `payload`, `metadata`.

## Determinism

Mock connectors are synchronous and seeded. Production connectors may wrap the same surface with async OAuth / webhook ingress without changing Twin or Intelligence.

## Observability contract

`SyncObservability` is mandatory on every `sync()` result and aggregated by `runEnterpriseSyncPipeline`.
