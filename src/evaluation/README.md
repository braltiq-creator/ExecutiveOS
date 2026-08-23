# Reality Lab — Evaluation Framework

Scores every recommendation **before** it reaches an executive.

## Dimensions

| Dimension | What it measures |
|-----------|------------------|
| Explainability | Reasoning graph / systems / summary |
| Evidence quality | Evidence count + Graph/Memory grounding |
| Strategic alignment | Intent alignment level |
| Confidence calibration | Value vs ceiling (no overconfidence) |
| Completeness | Benefits, downside, alternatives, unknowns, trade-offs |
| Consistency | Attention vs Decision importance |
| Stability | Fingerprint drift vs prior run |
| Novelty | Grounded historical novelty (not invention) |
| Decision usefulness | Act, href, judgement brief readiness |

## Gates

Recommendations that fail gates are **blocked** from executive-ready status (`pass: false`).

```ts
import { evaluateSnapshotRecommendations } from "@/evaluation";

const evaluations = evaluateSnapshotRecommendations(snapshot);
const ready = evaluations.filter((item) => item.pass);
```
