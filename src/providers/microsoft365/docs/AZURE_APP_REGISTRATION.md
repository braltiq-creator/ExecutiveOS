# Azure App Registration Guide

## Create the application

1. Entra ID → App registrations → New registration
2. Name: `ExecutiveOS Microsoft 365`
3. Supported account types: **Accounts in any organisational directory** (multi-tenant)
4. Redirect URI (Web): `https://<your-host>/api/integrations/oauth/callback`
5. Register

## Authentication

- Enable **ID tokens** if using OIDC claims for tenant discovery
- Front-channel logout URL (optional): `https://<your-host>/sign-out`
- Implicit grant: leave disabled (use Authorization Code + PKCE)

## Certificates & secrets

1. Certificates & secrets → New client secret
2. Copy the value once into Azure Key Vault as `executiveos-m365-client-secret`
3. In ExecutiveOS, set `clientSecretRef = vault:executiveos-m365-client-secret`
4. Never store the secret in source control or plaintext env files in production

## API permissions

Add delegated permissions listed in [GRAPH_PERMISSIONS.md](./GRAPH_PERMISSIONS.md).  
Do **not** add Application permissions for the executive-context path unless a separate daemon job is approved.

## Expose / branding

- Publisher domain verified
- Logo optional
- Terms / privacy URLs recommended for enterprise consent

## Multi-tenant

Authority options used by ExecutiveOS:

- `https://login.microsoftonline.com/organizations` (work/school)
- `https://login.microsoftonline.com/common`
- Tenant-specific: `https://login.microsoftonline.com/{tenantId}` when a hint is known

## Application IDs to record

| Field | Where used |
|-------|------------|
| Application (client) ID | `EntraAppRegistration.clientId` |
| Directory (tenant) ID | Tenant discovery / admin consent URL |
| Client secret ref | Key Vault reference only |
| Redirect URI | Must match exactly |

## Admin consent URL

```
https://login.microsoftonline.com/{tenantId}/adminconsent?client_id={clientId}&redirect_uri={redirectUri}
```
