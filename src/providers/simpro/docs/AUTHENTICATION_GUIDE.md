# Authentication Guide

## Strategies

### API key

- Store key in Key Vault as `vault:simpro-api-key`
- ExecutiveOS persists only encrypted credential payloads
- Header: `Authorization: Bearer <key>`

### OAuth 2.0

- Client ID + `clientSecretRef` (Key Vault)
- Access + refresh tokens encrypted at rest
- Automatic refresh on expiry; `invalid_grant` → connection revoked

## Session lifecycle

1. Connect → encrypt credentials → create auth session
2. Sync validates credentials before each API call
3. Disconnect / revoke → wipe vault payload → session revoked

## Never store plaintext

`assertNoPlaintextSimproCredentials` rejects persistence of access tokens, API keys, or client secrets in clear text.
