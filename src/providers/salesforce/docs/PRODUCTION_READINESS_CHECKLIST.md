# Production Readiness Checklist

- [ ] Connected App configured with least-privilege scopes
- [ ] Encryption key set (`SALESFORCE_TOKEN_ENCRYPTION_KEY`)
- [ ] License `provider-salesforce` active
- [ ] Feature flag `salesforce_context` enabled
- [ ] Initial full sync succeeded
- [ ] Incremental sync succeeding on schedule
- [ ] CDC channels active (Opportunity, Account, Case)
- [ ] Platform Events subscribed and delivering
- [ ] Replay recovery tested
- [ ] Rate-limit retry verified
- [ ] Auth expiry / refresh verified
- [ ] Tenant isolation tests green
- [ ] Today Commercial Context shows vendor-independent language
- [ ] Council CRO/CFO/CCO/CSO use commercial evidence
- [ ] Validation provider health shows Salesforce card
- [ ] No plaintext credentials in logs or persisted config
- [ ] Admin disconnect clears credentials and briefs

## Self-review

1. Can ExecutiveOS understand commercial performance entirely from Salesforce? **Yes** (via CommercialContextBrief).
2. Can Salesforce be replaced with HubSpot/Dynamics without changing Core? **Yes** (same brief shape, `providerId` portable).
3. Is every commercial insight represented as Executive Context? **Yes** (signals + brief sections).
4. Would an executive understand commercial health without Salesforce terminology? **Yes** (presentation forbids vendor leakage).
