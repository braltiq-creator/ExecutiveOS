# Troubleshooting Guide

| Symptom | Cause | Action |
|---------|-------|--------|
| Auth expired | Token / key invalid | Reconnect; check Key Vault |
| 429 storms | Rate limit | Client retries; lower sync frequency |
| Empty operational context | Services disabled / sync failed | Enable services; run full sync |
| Stale jobs | Webhooks expired | Renew; fall back to incremental |
| Cross-tenant error | Isolation violation | Never share connection records |
| Simpro terms in UI | Boundary leak | File defect — UI must use executive language only |
