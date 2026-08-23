# Enterprise Connectivity Platform

Shared architecture for integrating hundreds of enterprise applications.

**Objective:** make connectors fast, consistent, secure, and maintainable — not build every connector.

## Layout

| Folder | Responsibility |
|---|---|
| `authentication/` | OAuth2, OIDC, API keys, bearer, basic, JWT, client credentials, certificate, future SSO |
| `authorisation/` | Scopes at the connector boundary |
| `connectors/` | Lifecycle, managed wrappers, catalog |
| `mapping/` | Vendor → Canonical → BusinessEvent |
| `normalisation/` | Event validation / vendor strip |
| `synchronisation/` | realtime, scheduled, incremental, full, webhook, event-driven, replay, backfill |
| `health/` | Connection, auth, sync, errors, retries, events, latency, quality |
| `monitoring/` | Aggregate metrics |
| `webhooks/` | Incoming/outgoing, verify, replay, order, idempotency |
| `scheduling/` | Sync schedules |
| `cache/` | Watermarks / cursors |
| `retry/` | Backoff, DLQ, failure kinds |
| `security/` | Boundary rules |
| `testing/` | Simulation harness |
| `sdk/` | `defineConnector` + examples |

## Docs

- [Connector SDK Guide](./docs/CONNECTOR_SDK_GUIDE.md)
- [Authentication Guide](./docs/AUTHENTICATION_GUIDE.md)
- [Mapping Guide](./docs/MAPPING_GUIDE.md)
- [Security Guide](./docs/SECURITY_GUIDE.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)
- [Connector Certification Guide](./docs/CONNECTOR_CERTIFICATION_GUIDE.md)
