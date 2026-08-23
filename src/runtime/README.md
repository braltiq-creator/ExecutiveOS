# Enterprise Runtime & Multi-Tenant Platform

Operational foundation for enterprise production deployments.

## Principles

- **One deployment → thousands of organisations** without architectural change
- **Core unchanged** — Outcome / Intelligence / Council / Futures / Agenda stay pure
- **Tenant Context first** — every request resolves identity, role, workspace, policy, licence, and flags before execution
- **Customise without forks** — configuration, feature flags, branding, packs, providers

## Layout

| Module | Responsibility |
|---|---|
| `tenant/` | First-class Tenant + isolation / residency / retention |
| `identity/` | Entra, Okta, Google, Ping, Auth0, future SAML |
| `rbac/` | CEO → Support + custom, inheritance, delegation, temporary access |
| `organisation/` | Enterprise → Board scope model |
| `workspace/` | Corporate, Board, Strategy, Crisis, M&A, … |
| `policy/` | Retention, privacy, connectors, export, residency |
| `audit/` | Immutable searchable audit chain |
| `observability/` + `telemetry/` | Platform health + events |
| `configuration/` | Tenant config without Core edits |
| `feature-flags/` | Beta, rollout, emergency disable |
| `licensing/` + `usage/` + `billing-ready/` | Commercial readiness (no payments) |
| `compliance/` | SOC2 / ISO27001 / GDPR / Australian Privacy Act posture |

## Today

`projectExperienceForTenant(ctx, snapshot)` gates Council / Futures / Agenda / Context by role, licence, and flags — Core snapshot engines unchanged.
