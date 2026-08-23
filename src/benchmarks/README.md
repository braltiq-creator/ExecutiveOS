# Reality Lab — Benchmarks

Every recommendation / run receives:

| Metric | Meaning |
|--------|---------|
| Trust Score | Aggregate evaluation quality |
| Evidence Coverage | Evidence-quality dimension |
| Decision Readiness | Completeness + usefulness + pass rate |
| Reasoning Completeness | Explainability + completeness |
| Confidence Accuracy | Calibration dimension |
| Executive Attention Efficiency | High-attention ready recs vs budget |

## Reporting

```ts
import { runRealityLabSuite, compareToBaseline, saveBaseline } from "@/benchmarks";

const suite = runRealityLabSuite({
  organisationIds: ["org-northline"],
  scenarioIds: ["scenario-board-prep", "scenario-cyber-incident"],
  trackRegressions: true,
});

suite.suiteReport.summary
suite.comparisons // regressions / improvements
```

Future AI changes should be measured here — not judged subjectively.
