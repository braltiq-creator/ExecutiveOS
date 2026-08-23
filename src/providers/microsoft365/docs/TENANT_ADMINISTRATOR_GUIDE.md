# Tenant Administrator Guide

## Connect Microsoft 365 (no developer required)

1. Sign in to ExecutiveOS as a system administrator.
2. Open **Administration → Microsoft 365**.
3. Choose **Connect Microsoft 365**.
4. Sign in with a Microsoft work account that can consent for your organisation.
5. Review permissions → Accept.
6. Select organisational scope:
   - **User** — signed-in executive only
   - **Executive team** — recommended
   - **Organisation** — broader (requires admin consent)
7. Enable services needed for executive context (defaults: all).
8. Set sync frequency (default: every 15 minutes).
9. Confirm **Tenant Status = connected** and **Sync Health = healthy**.

## What administrators can see

- Microsoft Tenant ID
- Authentication status
- Permissions granted
- Sync health & last synchronisation
- Webhook status
- Rate limits & retry queue
- Errors
- Data quality (commitments, signals, documents)

## Safe disconnect

1. Administration → Microsoft 365 → Disconnect
2. Encrypted tokens are destroyed
3. Session marked revoked
4. Executive Context falls back to empty/disconnected state until reconnected

## Changing services or frequency

Update enabled services or sync frequency in the connector configuration.  
A full sync is recommended after enabling a previously disabled service.

## Security expectations

- Tokens encrypted at rest (AES-256-GCM / Key Vault key)
- No Microsoft credentials in plaintext
- Tenant isolation enforced per ExecutiveOS tenant
- Audit log of authenticate / sync / disconnect / secret rotation
