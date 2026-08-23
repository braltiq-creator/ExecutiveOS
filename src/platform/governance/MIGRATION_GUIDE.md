# Migration Guide

## From industry-specific Core edits

**Before:** New industry logic was added beside Core modules (`src/industry/...`) and sometimes imported into builders.

**After:** Wrap industry logic as an `ExecutiveKnowledgePack` and register it:

```ts
registry.register({
  kind: "knowledge_pack",
  extension: createMyHealthcarePack(),
});
```

Core snapshot builders stay unchanged. Packs enrich via registered providers / optional industry flags already present.

## From ad-hoc connectors

**Before:** Connector classes lived only under `src/connectors` without platform manifests.

**After:** Implement `PlatformConnector` (authenticate, sync, normalise, health, replay), register in the Plugin Registry. Keep using Core `BusinessEvent` types.

## Version bumps

1. Bump extension `manifest.version`
2. Update `compatibility.minPlatform` / `sdk.min` if required
3. Use `deprecated` on the old id when replacing

## Deprecations

Registration surfaces deprecation warnings; successors are declared via `deprecated.successorId`.
