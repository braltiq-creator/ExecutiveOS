# UDG Architecture

## Pipeline

```
Source payload
    → Connector.parse()
    → Mapping (column → canonical)
    → Validation engine
    → Confidence score
    → Immutable UdgExecutiveSnapshot
    → Lineage pointers
    → Audit entries
```

Downstream ExecutiveOS consumes **only** the snapshot. Source kind remains on meta for audit/lineage — intelligence engines must not branch on it.

## Extending connectors

1. Implement `UdgConnector` in `src/data-gateway/connectors/`.
2. Register in `createAllUdgConnectors()`.
3. Keep `productionIntegration: false` until a real integration ships.
4. Never emit vendor-shaped objects past `parse()` — only `UdgRawRecord[]`.

## Extending modes

Update `UDG_MODE_CONTRACTS` and implement against the same `ingest()` request shape. Scheduled / webhook / streaming adapters should normalise into `UdgIngestionRequest`.

## Storage

v1 uses in-memory stores (`snapshots`, `mapping`, `lineage`, `audit`). Persist behind the same function surfaces when durable storage is added — no contract change required.
