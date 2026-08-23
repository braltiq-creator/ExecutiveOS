# Troubleshooting Guide

## Authentication failures

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Redirect error `AADSTS50011` | Redirect URI mismatch | Align app registration redirect URI |
| `invalid_grant` on refresh | Consent revoked / refresh expired | Reconnect; check Enterprise applications |
| Access token expired repeatedly | Clock skew / vault decrypt failure | Verify encryption key; check NTP |
| Wrong tenant | Multi-tenant authority + guest account | Use tenant hint / organisations authority |

## Sync failures

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Sync Health = failed | Graph 4xx/5xx | Inspect Errors panel; retry from checkpoint |
| Empty commitments | Calendar service disabled | Enable Calendar; run full sync |
| Stale data | Webhooks expired | Renew subscriptions; fall back to delta poll |
| Large tenant timeouts | Page storm | Delta + throttled paging; increase max pages carefully |

## Rate limits (429)

Production Graph client retries with `Retry-After`, records telemetry, and surfaces remaining budget in Administration.  
If persistently throttled: reduce sync frequency, prefer delta/webhooks, avoid full sync during peak.

## Webhooks

- Validate `clientState` on every notification
- Expired subscriptions are rejected and marked expired
- Use webhook replay journal to recover missed deliveries

## Data quality

If brief is present but documents = 0: check Files / SharePoint consent and `Sites.Read.All` / `Files.Read.All`.

## Isolation

Cross-tenant access attempts fail `assertTenantIsolation`.  
Never share connection records across ExecutiveOS tenants.
