# Connected App Guide

## Purpose

OAuth 2.0 Connected App for the Salesforce Executive Context Provider.

## Recommended settings

| Setting | Value |
|---------|-------|
| Enable OAuth Settings | Yes |
| Callback URL | `https://<host>/api/integrations/oauth/callback` |
| Require Secret for Web Server Flow | Yes |
| Refresh Token Policy | Refresh token is valid until revoked |
| IP Relaxation | Enforce IP restrictions in production |

## Scopes

Minimum (least privilege):

- `api`
- `refresh_token` / `offline_access`
- `id`
- `profile`

Do not request Modify All Data or full org admin scopes.

## Credential handling

- Client secret stored only as a vault reference (`clientSecretRef`)
- Access / refresh tokens encrypted at rest (AES-GCM)
- Never persist plaintext tokens in configuration or audit logs
