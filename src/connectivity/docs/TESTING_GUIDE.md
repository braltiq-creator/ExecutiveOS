# Testing Guide

Test connectors without production systems.

```ts
import { simulateConnectorSync, createSdkSapConnector } from "@/connectivity";

const connector = createSdkSapConnector();

simulateConnectorSync({ connector, failure: "none" });
simulateConnectorSync({ connector, failure: "auth_expiry" });
simulateConnectorSync({ connector, failure: "rate_limit" });
simulateConnectorSync({ connector, failure: "network_failure" });
simulateConnectorSync({ connector, failure: "permanent_error" });
simulateConnectorSync({ connector, failure: "partial_failure" });
```

Also covered:

- Mock APIs via SDK `fetchVendorObjects`
- Replay via Platform `replay()` / webhook journal
- Failure classification → retry / DLQ
