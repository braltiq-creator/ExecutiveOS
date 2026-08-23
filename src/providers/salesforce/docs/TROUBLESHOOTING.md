# Troubleshooting Guide

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Auth expired | Access token past `expiresAt` | Refresh via refresh token; reconnect if revoked |
| `invalid_grant` | Refresh token revoked | Re-consent Connected App |
| Sync failed | API 5xx / network | Retry; check checkpoints for lastError |
| Rate limited (429) | Org API limits | Client retries with backoff; reduce sync frequency |
| CDC gap | Missed change stream | Recover from last `replayId` |
| Brief missing | Not connected / sync never succeeded | Connect + full sync |
| Salesforce terms in UI | Mapping leak | Fail tests; keep mapping inside `api/mapping.ts` |
| Cross-tenant access | Isolation violation | Ensure `executiveosTenantId` matches security context |

## Health signals

Monitor: API usage, rate limits, sync latency, CDC, Platform Events, BusinessEvents generated, CommercialContextBrief generated, connector health.
