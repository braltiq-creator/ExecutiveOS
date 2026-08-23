# Extension Examples

## Field Services Knowledge Pack

`createFieldServicesKnowledgePack()` wraps the Simpro industry pack as an `ExecutiveKnowledgePack`.

## Connectors

| Id | Role |
|----|------|
| `connector-simpro` | Field service FSM |
| `connector-sap-mock` | ERP finance / contracts |
| `connector-maximo-mock` | CMMS assets / work orders |

All three can be registered at once. Each emits only BusinessEvents.

## Self-review proofs

```ts
const registry = bootPlatform();

// Replace SAP with Maximo? Unregister SAP, keep Maximo + pack
registry.unregister("connector-sap-mock");

// Two ERP/CMMS connectors simultaneously?
registry.connectors().map((c) => c.manifest.id);
// → simpro, sap, maximo

// Mining/Field pack with SAP and Maximo?
registry.validatePackConnectorMatrix("pack-field-services-simpro");
// → ok: packs consume BusinessEvents

// Healthcare pack without Core change?
// → implement ExecutiveKnowledgePack + registry.register

// Future AI models without contract change?
// → AgentExtension.review stays; routing is an implementation detail
```
