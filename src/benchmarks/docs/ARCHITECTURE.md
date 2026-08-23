# Reality Lab — Benchmarks Architecture

## Metrics

Computed per run from recommendation evaluations + snapshot attention:

- Trust Score
- Evidence Coverage
- Decision Readiness
- Reasoning Completeness
- Confidence Accuracy
- Executive Attention Efficiency

## Baselines

In-memory today (`saveBaseline` / `compareToBaseline`).  
Future: durable store for CI autopilot gates.

## Suite

`runRealityLabSuite` crosses organisations × scenarios, optionally tracks regressions via fingerprint-stable re-runs.
