# SDK Reference

## Versions

| Artefact | Accessor |
|----------|----------|
| Platform | `PLATFORM_VERSION` |
| SDK | `SDK_VERSION` |

## Contracts

| Contract | Purpose |
|----------|---------|
| `ExecutiveKnowledgePack` | Industry intelligence pack |
| `PlatformConnector` | Vendor ingress → BusinessEvents |
| `BusinessEventMapper` | Domain/event mapping helper |
| `BenchmarkProvider` | Peer benchmark datasets |
| `ScenarioProvider` | Reality Lab scenarios |
| `JudgementRuleProvider` | Pack judgement rules |
| `AgentExtension` | Additional council agents (AI-routing ready) |
| `NarrativeProvider` | Executive narrative templates |
| `IndustryVocabulary` | Term → executive meaning |
| `NotificationProvider` | Outbound notifications |

## Helpers

```ts
createManifest({ id, name, kind, version, description, compatibility, provides })
defaultCompatibility()
assertBusinessEvent(event)
isCompatible(range)
formatSemVer / parseSemVer / compareSemVer
```

## Registry

```ts
bootPlatform()
getPluginRegistry()
registry.register(entry)
registry.knowledgePacks()
registry.connectors()
registry.discoverScenarios()
registry.validatePackConnectorMatrix(packId)
```
