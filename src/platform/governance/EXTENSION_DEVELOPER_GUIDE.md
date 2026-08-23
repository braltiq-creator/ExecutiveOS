# Extension Developer Guide

## Quick start

```ts
import { bootPlatform, createManifest, defaultCompatibility } from "@/platform";

const registry = bootPlatform();

// Discover without touching Core
registry.knowledgePacks();
registry.connectors();
registry.discoverScenarios();
```

## Building a Knowledge Pack

Implement `ExecutiveKnowledgePack`:

1. Identity + semver + compatibility
2. Domains, vocabulary, KPIs, health models
3. Judgement rules, benchmarks, Reality Lab scenarios
4. Narrative templates
5. Supported connectors (advisory affinity — not exclusivity)

Register via `registry.register({ kind: "knowledge_pack", extension })`.

## Building a Connector

Implement `PlatformConnector`:

1. `authenticate` / `connect`
2. `validate` → `synchronise` / `sync` → `normalise`
3. Emit **only** `BusinessEvent`s
4. `health` + `replay`

Never return vendor-specific objects from public methods.

## Testing requirements

- Unit tests for mapping / sync / replay
- Compatibility validation against current Platform + SDK versions
- Reality Lab scenario smoke (if pack provides scenarios)
- Prove no Core imports of vendor types

## Approval process (summary)

1. Contract compliance review
2. Security boundary review (vendor data stays in connector)
3. Performance budget (sync latency, event volume)
4. Compatibility matrix (platform major)
5. Release under semantic versioning
