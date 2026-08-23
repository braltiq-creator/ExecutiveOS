# Microsoft 365 Production Integration

Production-ready Microsoft Graph provider for ExecutiveOS.

## Package layout

```
auth/             Entra ID OAuth2 + PKCE, refresh, vault
graph/            Mock + production Graph clients
sync/             Full / incremental / delta orchestration
delta/            Delta tokens & large-tenant simulation
webhooks/         Change notification subscriptions
calendar|mail|teams|sharepoint|planner|contacts|presence|files/
executive-context/ Portable ExecutiveContextBrief
configuration/    Admin connector settings
connection/       Encrypted connection registry
monitoring/       Auth / API / sync / webhook telemetry
security/         Least privilege, isolation, audit
docs/             Deployment & admin guides
```

## Boundary rule

Microsoft object models never leave this package. Core receives:

- `BusinessEvent[]`
- `ExecutiveContextBrief` (vendor-independent)

Google Workspace can replace Microsoft by implementing the same brief shape.

## Live vs mock

- **Mock** (default / CI): `createMicrosoftGraphClient` + `buildExecutiveContextBriefFromMock`
- **Live path**: Entra connect → encrypted vault → `createLiveSyncEngine` / registry `sync` → brief cached for Today

Today prefers a live brief when `tenant-northline` (or configured tenant) is connected.
