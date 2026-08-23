# Authentication Guide

Authentication strategies are **reusable across connectors**.

| Strategy | Id |
|---|---|
| OAuth 2.0 | `oauth2` |
| OpenID Connect | `oidc` |
| API Keys | `api_key` |
| Bearer Tokens | `bearer` |
| Basic Authentication | `basic` |
| JWT | `jwt` |
| Client Credentials | `client_credentials` |
| Certificate Authentication | `certificate` |
| Future SSO | `sso_future` |

```ts
import { authenticateWithStrategy } from "@/connectivity";

const result = authenticateWithStrategy({
  connectorId: "connector-sap",
  credentials: {
    strategy: "client_credentials",
    clientId: "sap-app",
    clientSecretRef: "secret:sap",
    tokenUrl: "https://example.invalid/oauth/token",
    scopes: ["read:events", "sync:incremental"],
  },
});
```

Secrets are **references only** — never embed raw secrets in BusinessEvents.
