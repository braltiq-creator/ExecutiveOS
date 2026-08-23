# Continuous Intelligence & Adaptive Learning

## Purpose

Explainable personalisation of **presentation, prioritisation, confidence display,
and recommendation ordering**. Core intelligence is never modified.

## Architecture

```
behaviour → preferences (Adaptive Executive Profile)
         → recommendation-learning → ranking
         → personalisation plan → Today attach
governance: view / reset / disable
benchmarking: anonymised percentiles only
```

## Public APIs

`@/adaptive` — profiles, feedback, ranking, personalisation, benchmarking,
optimisation feed, governance, `attachAdaptiveLearningToTodayActions`, dashboard.

## Extension guidance

1. Every adjustment must carry an `explanation` string.
2. Learning must be disableable and resettable.
3. Benchmarks must never expose customer identities.

## Developer notes

- In-memory stores for V1 (see `docs/release/KNOWN_ISSUES.md` KI-002).
- Surfaces: `/admin/adaptive`, `/settings/adaptive`.

## Future Intelligence Profiles

Keyed by `IntelligenceProfileId` — reuse the same framework for new profiles.
