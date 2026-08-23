# Security Guide

## Rules

1. Vendor-specific objects never escape the connector boundary
2. Secrets are opaque refs — never logged or emitted in events
3. BusinessEvents are the only enterprise language above connectors
4. Authentication strategies are reusable and connector-agnostic
5. Connector failures are isolated
6. Webhooks require verification and idempotency
7. Dead-letter queues retain failures for controlled replay

```ts
import { assertNoVendorLeakage, assertSecretNotInEvent } from "@/connectivity";
```

Authorisation scopes: `read:events`, `read:entities`, `write:webhooks`, `sync:full`, `sync:incremental`, `admin:disconnect`.
