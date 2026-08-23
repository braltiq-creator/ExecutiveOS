# Salesforce Commercial Executive Context Provider

Production Executive Context Provider that transforms CRM activity into **vendor-independent commercial intelligence**.

## Boundary

- Emits `BusinessEvent[]` + portable `CommercialContextBrief`
- Never exposes Salesforce objects, SOQL, or SObject names outside this package
- Replaceable later by HubSpot or Dynamics using the same brief shape

## Surface

| Area | Path |
|------|------|
| Auth / vault | `auth/` |
| API client | `api/` |
| Domain sync | `accounts/`, `opportunities/`, `contacts/`, … |
| Executive context | `executive-context/` |
| Sync / CDC / events | `sync/`, `cdc/`, `webhooks/` |
| Admin connection | `connection/`, `configuration/` |
| Security / monitoring | `security/`, `monitoring/` |

## Docs

See `docs/` for deployment, Connected App, permissions, CDC, Platform Events, troubleshooting, and production readiness.
