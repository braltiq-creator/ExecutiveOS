# Microsoft Graph Permissions Guide

ExecutiveOS requests **least privilege** delegated scopes for executive context.

## Required delegated scopes

| Scope | Purpose |
|-------|---------|
| `openid` `profile` `offline_access` | Sign-in, refresh tokens |
| `User.Read` | Signed-in executive identity |
| `Calendars.Read` | Commitments, governance events |
| `Mail.Read` | Executive communications signals |
| `People.Read` | Stakeholder relationships |
| `Files.Read.All` | OneDrive strategic documents |
| `Sites.Read.All` | SharePoint board packs / strategy docs |
| `Tasks.Read` | Planner initiative progress |
| `Presence.Read` | Availability / collaboration health |
| `Chat.Read` | Teams critical conversations |

## Explicitly avoided

- `Mail.ReadWrite` / `Calendars.ReadWrite` — read-only
- `Files.ReadWrite.All` — no write-back from Core
- Directory write / user management scopes
- Full mailbox export / eDiscovery

## Consent model

1. User or admin completes OAuth Authorization Code + PKCE
2. Admin consent recommended for organisation-wide executive team scope
3. Granted scopes are stored on the connection record and shown in Administration
4. Excess scopes fail `assertLeastPrivilege` in security controls

## Permission validation

On each connect and sync, ExecutiveOS validates:

- Consented scopes ⊆ least-privilege baseline (allowing OIDC basics)
- Tenant ID on tokens matches connection microsoftTenantId
- No plaintext tokens in persisted payloads

## Revocation

Tenant admins can revoke consent in Entra ID → Enterprise applications.  
ExecutiveOS treats refresh failures with `invalid_grant` as consent revocation and marks the connection `revoked`.
