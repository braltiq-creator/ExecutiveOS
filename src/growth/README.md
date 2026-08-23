# Product-Led Growth & Executive Value

## Purpose

Customer-facing growth: trial/checkout, activation, Executive Value Score (EVS),
and value reporting.

## Architecture

Checkout / subscriptions → activation path → value synthesis → Today value strip.

## Public APIs

`@/growth` — checkout, subscriptions, activation, value estimates, EVS,
notifications, upgrades, `ExecutiveValueStrip`.

## Extension guidance

Keep the five-minute activation path. Value figures must remain explainable.

## Developer notes

Routes: `/get-started`, `/subscribe`, `/activate`, `/value`.  
Distinct from internal `@/commercial` packaging.

## Future Intelligence Profiles

Edition and profile packaging may change narratives; EVS math stays shared.
