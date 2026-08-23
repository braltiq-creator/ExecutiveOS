# Connector SDK Guide

Build connectors against the Enterprise Connectivity Platform — not against Core internals.

## Minimal connector

```ts
import { defineConnector } from "@/connectivity";

const connector = defineConnector({
  id: "connector-acme",
  system: "mock",
  label: "Acme ERP",
  preferredAuth: "oauth2",
  mappings: [/* MappingDefinition */],
  fetchVendorObjects: () => [/* VendorObject */],
});

connector.authenticate({
  strategy: "oauth2",
  clientId: "acme",
  clientSecretRef: "secret:acme",
});
connector.connect();
const result = connector.synchronise();
// result.events → BusinessEvent[] only
```

## Wrap an existing Core / Platform connector

```ts
import { manageConnector, createMockSapConnector } from "@/connectivity";
// or from @/platform
const managed = manageConnector(createMockSapConnector());
```

## Lifecycle

Connect → Authenticate → Validate → Synchronise → Normalise → Map → Publish → Monitor → Recover → Disconnect

## Examples

Microsoft 365, SAP, Maximo, Salesforce, Simpro, Jira — see `sdk/examples.ts`.
