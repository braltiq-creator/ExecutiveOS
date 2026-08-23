# Reality Lab — Architecture

## Mission

> ExecutiveOS should be testable like an aircraft autopilot.
> Every improvement should be measurable.
> Every reasoning change should be benchmarked.

## Pipeline

```
Simulated Organisation
        │
        ▼
   Scenario.apply()  → Twin events + signal overlays
        │
        ▼
 Full ExecutiveOS stack
 (EIE → Intent → Memory → Judgement)
        │
        ▼
   Capture (pulse, snapshot, judgement, recs, alts, unknowns, paths)
        │
        ▼
   Evaluation Framework (9 dimensions + gates)
        │
        ▼
   Benchmarks (Trust, Coverage, Readiness, …)
        │
        ▼
   Reports / Regression detection
```

## Module map

| Path | Role |
|------|------|
| `src/evaluation/` | Score recommendations; gate executive-ready |
| `src/simulation/` | Orgs, scenarios, stack runner |
| `src/benchmarks/` | Metrics, baselines, suite reports |

## Invariants

1. Deterministic scoring
2. Isolated simulation contexts
3. No UI
4. Baselines enable measurable regressions
