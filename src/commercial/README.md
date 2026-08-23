# Commercial Readiness (Internal)

## Purpose

Braltiq-internal commercial packaging: editions, licensing, implementation,
success plans, ROI, security pack, renewals.

## Architecture

Editions → licenses → implementation stages → success / ROI / renewals.

## Public APIs

`@/commercial` — editions, licenses, pricing, implementation, ROI, dashboard, reset.

## Extension guidance

Add editions without changing Core engines. Customer-facing PLG lives in `@/growth`.

## Developer notes

Admin only: `/admin/commercial`. Seed helpers create design-partner context when empty.

## Future Intelligence Profiles

Map editions to Intelligence Profiles in licensing metadata.
