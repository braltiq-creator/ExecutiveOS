# Production Readiness Checklist

## Identity & secrets

- [ ] Multi-tenant Entra app registered
- [ ] Client secret in Key Vault only (`clientSecretRef`)
- [ ] `M365_TOKEN_ENCRYPTION_KEY` from Key Vault
- [ ] Redirect URI matches production host
- [ ] Admin consent completed for target tenant
- [ ] Least-privilege scopes only

## Connectivity

- [ ] OAuth Authorization Code + PKCE verified
- [ ] Refresh token path verified
- [ ] Token expiry / re-auth path verified
- [ ] Logout / disconnect wipes encrypted tokens
- [ ] Consent revocation detected (`invalid_grant`)

## Synchronisation

- [ ] Initial full sync succeeds
- [ ] Incremental sync on schedule
- [ ] Delta tokens / watermarks persist
- [ ] Webhooks active and renewing
- [ ] Replay / recovery from checkpoint tested
- [ ] 429 retry behaviour observed under load

## Product surfaces

- [ ] Today Executive Context uses live brief when connected
- [ ] Insights remain vendor-independent (no Graph leakage)
- [ ] Knowledge Graph enriched (people, meetings, documents)
- [ ] Administration dashboard shows tenant / sync / webhooks / errors

## Security review

- [ ] Tenant isolation tests pass
- [ ] No plaintext credentials in logs or storage
- [ ] Audit log covers auth, sync, disconnect, rotation
- [ ] Permission validation on connect
- [ ] Secret rotation procedure documented

## Observability

- [ ] Auth events recorded
- [ ] API usage & latency telemetry
- [ ] Rate-limit counters
- [ ] Webhook delivery status
- [ ] Context generation & BusinessEvent counts

## Exit criteria

An enterprise administrator can connect without developer assistance.  
ExecutiveOS synchronises continuously via production Graph APIs (or production-shaped transport).  
Microsoft can be replaced by Google Workspace without Core changes.  
Executive insight is exposed — not Microsoft implementation details.  
The package would satisfy an enterprise security review of token handling and isolation.
