# Webhook Guide

## Subscribe

```
resource: jobs | quotes | invoices | schedules
notificationUrl: https://<host>/api/integrations/webhook
secret: random client secret
expirationDateTime: renew before expiry
```

## Delivery

1. Validate subscription secret
2. Reject expired / unknown subscriptions
3. Journal notification for replay
4. Trigger incremental sync for the resource

## Replay

Administration → Simpro → use webhook journal replay after outages.  
Replay reprocesses accepted notifications without re-calling Simpro for the payload reference.
