# Salesforce Deployment Guide

## Overview

Deploy the Salesforce Commercial Executive Context Provider so ExecutiveOS can generate portable commercial intelligence without exposing Salesforce objects outside the provider boundary.

## Prerequisites

- Salesforce org with API access
- Connected App configured (see Connected App Guide)
- Least-privilege OAuth scopes (see Permissions Guide)
- Encryption key: `SALESFORCE_TOKEN_ENCRYPTION_KEY` or `INTEGRATION_TOKEN_ENCRYPTION_KEY`
- Feature flag `salesforce_context` enabled
- License entitlement `provider-salesforce`

## Steps

1. Create Connected App and capture Client ID / Client Secret.
2. Configure OAuth redirect to ExecutiveOS callback.
3. In **Administration → Salesforce**, connect the org.
4. Run initial **full** sync.
5. Enable CDC and Platform Events (see CDC / Platform Events guides).
6. Confirm Commercial Context appears on **Today**.
7. Verify Admin status: sync healthy, brief present, CDC active.

## Environment

```bash
SALESFORCE_TOKEN_ENCRYPTION_KEY=<32+ char secret>
```

## Validation

- Admin shows `connected` + `healthy`
- Today shows Pipeline Health, Revenue Forecast, Commercial Risks
- Council CRO/CFO/CCO/CSO reason from commercial evidence
- No Salesforce terminology in presentation payloads
