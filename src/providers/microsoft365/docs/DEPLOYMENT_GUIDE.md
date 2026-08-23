# Microsoft Deployment Guide

## Overview

Connect a Microsoft 365 tenant to ExecutiveOS using Microsoft Entra ID (Azure AD) and Microsoft Graph. The provider transforms Graph data into portable Executive Context — Core never sees Microsoft object models.

## Prerequisites

- Microsoft Entra ID tenant with Global Admin or Application Admin consent rights
- ExecutiveOS deployment with `M365_TOKEN_ENCRYPTION_KEY` (or Azure Key Vault reference)
- App registration created per [Azure App Registration Guide](./AZURE_APP_REGISTRATION.md)
- Permissions granted per [Microsoft Graph Permissions Guide](./GRAPH_PERMISSIONS.md)

## Deployment steps

1. Register the multi-tenant application in Entra ID.
2. Configure redirect URI to ExecutiveOS OAuth callback.
3. Store client secret in Key Vault; set `clientSecretRef` only (never plaintext in config).
4. Set `M365_TOKEN_ENCRYPTION_KEY` from Key Vault for AES-256-GCM token encryption.
5. Deploy ExecutiveOS with Microsoft 365 provider enabled.
6. Open **Administration → Microsoft 365** and connect the tenant.
7. Grant admin consent for required Graph scopes.
8. Select organisational scope and services (Calendar, Mail, Teams, SharePoint, Planner, Contacts, Presence, OneDrive).
9. Choose sync frequency (recommended: every 15 minutes + webhooks).
10. Run initial full synchronisation; confirm Sync Health = healthy.

## Continuous synchronisation

| Mode | Purpose |
|------|---------|
| Full | Initial load / recovery |
| Incremental | Scheduled poll |
| Delta | Graph delta tokens / watermarks |
| Webhook | Near-real-time change notifications |
| Replay | Reprocess journaled events |

Checkpoints and watermarks are stored per service for recovery.

## Verification

- Authentication Status = connected
- Permissions list matches least-privilege baseline
- Last Synchronisation recent
- Webhook Status shows active subscriptions
- Today → Executive Context shows live commitments (not empty mock fallback)
- Knowledge Graph contains people, meetings, documents without Graph `@odata` fields

## Rollback

Use **Disconnect safely** in the admin UI. Tokens are wiped from the vault; sessions are revoked; sync checkpoints remain for optional replay after reconnect.
