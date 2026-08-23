# Platform Events Guide

## Purpose

Platform Events deliver near-real-time commercial change notifications into the provider webhook store.

## Subscription model

- Channel (e.g. `/event/CommercialChange__e`)
- Notification URL
- Shared secret
- Expiration timestamp
- Replay ID per delivery

## Flow

1. Subscribe with secret + expiry.
2. Receive signed notifications.
3. Reject secret mismatch / expired subscriptions.
4. Replay journal by subscription ID for recovery testing.

## Mapping

Notifications trigger incremental sync. Raw Salesforce payloads are mapped to BusinessEvents with executive meaning before leaving the provider.
