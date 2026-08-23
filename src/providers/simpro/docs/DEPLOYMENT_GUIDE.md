# Simpro Deployment Guide

1. Obtain company ID and API credentials (OAuth or API key) from Simpro.
2. Store secrets in Key Vault; set `SIMPRO_TOKEN_ENCRYPTION_KEY`.
3. Deploy ExecutiveOS with the Simpro provider enabled (`provider-simpro` license).
4. Open **Administration → Simpro** → Connect.
5. Select services and sync frequency (default: every 15 minutes + webhooks).
6. Run initial full synchronisation; confirm Sync Health = healthy.
7. Verify Today → Operational Context shows capacity, delivery, cash, and recommendations without Simpro terminology.

## Continuous sync

| Mode | Purpose |
|------|---------|
| Full | Initial / recovery |
| Incremental | Watermark / modifiedSince |
| Webhook | Near-real-time |
| Replay | Journal reprocess |

## Rollback

Disconnect safely — encrypted credentials destroyed; Today falls back to mock/disconnected state.
