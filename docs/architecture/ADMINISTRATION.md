# Administration

## Purpose

Separate **executive workspace administration** from **Braltiq system administration**.

## Architecture

| Surface | Audience | Path |
|---------|----------|------|
| Administration hub | Customer executives | `/administration` |
| Settings | Customer | `/settings/*` |
| Adaptive governance | Customer | `/settings/adaptive` |
| System / platform dashboards | Braltiq operators | `/admin/*` |

## Public APIs

Page routes only — no shared `src/administration` package.

## Extension guidance

1. Customer utilities: link from `/administration` + UTILITY_NAV.
2. Operator dashboards: `/admin/<module>` + system admin gate.
3. Keep administration out of the morning Brief hierarchy.

## Developer notes

`requireAppAccess` for customer surfaces; `requireSystemAdmin` for `/admin/*`.

## Future Intelligence Profiles

Admin packaging may expose profile-specific settings; hub structure stays stable.
