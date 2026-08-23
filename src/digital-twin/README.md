# Enterprise Digital Twin

Canonical operational model of the organisation.

## Responsibilities

- Maintain current organisational state
- Track historical changes (`history`)
- Version snapshots (`snapshot` / `listVersions`)
- Support replay (`replay`)
- Expose query APIs (`query` / `getEntity`)
- Publish change events (`subscribe`)
- Support incremental updates (`apply` — idempotent by event id)

## Usage

```ts
import { bootstrapNorthlineDigitalTwin } from "@/digital-twin";

const { twin, graph, pipeline } = bootstrapNorthlineDigitalTwin({
  runIntelligence: true,
});

twin.query({ type: "Decision", minImportance: 80 });
twin.history("decision-residency");
twin.replay(pipeline.twinSnapshotId);
```

## Intelligence bridge

`createTwinEnterpriseDataProvider(twin)` implements `EnterpriseDataProvider`.
Engines consume Twin-derived `EnterpriseSignals` — never Salesforce/M365/Jira payloads.

## Knowledge Graph bridge

`updateKnowledgeGraphFromTwin(twin, graph)` upserts entities and relationships so graph traversals reflect Twin state.
