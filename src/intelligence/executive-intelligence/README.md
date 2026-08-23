# Executive Intelligence Engine (EIE)

The reasoning layer between enterprise data and the ExecutiveOS interface.

> ExecutiveOS does not display data.  
> ExecutiveOS interprets business reality.

## Location

```
src/intelligence/executive-intelligence/
```

## Principles

- Pure TypeScript — no React, no UI
- Deterministic — same signals → same judgement
- Explainable — every score and recommendation has reasoning
- Provider-agnostic — engines never know Salesforce vs mock
- Unit-testable — each engine is independently callable

## Engines

| Engine | Responsibility |
|--------|----------------|
| Business Pulse | Business state without averaging scores |
| Executive Capacity | Leadership load, attention budget |
| Outcome Intelligence | Trajectory, momentum, evidence, prediction |
| Decision Intelligence | Importance-ranked Decisions (not date sort) |
| Recommendation | Approve / Delegate / Escalate / Wait / Investigate / Schedule |
| Business Narrative | CoS summaries — interpret, never report |
| Attention | Scarce attention budget allocation |
| Confidence | Trust ceilings — never invent certainty |
| Reasoning Graph | Why / What changed / Evidence / Systems |
| Snapshot Builder | One `IntelligentExecutiveSnapshot` for Today |

## Entry points

```ts
import {
  runExecutiveIntelligence,
  buildExecutiveSnapshotForUi,
  explainGraph,
} from "@/intelligence/executive-intelligence";

// Full intelligent model (with reasoning)
const intelligent = runExecutiveIntelligence(portfolio);

// Presentation model for Today UI
const snapshot = buildExecutiveSnapshotForUi(portfolio);

// Explain any node
explainGraph(intelligent.reasoningIndex["decision-residency"]);
```

## Provider swap

```ts
createMockEnterpriseDataProvider(portfolio)

// Future:
createSalesforceProvider(config)
createMicrosoft365Provider(config)
createJiraProvider(config)
```

Engines call `provider.getSignals()` only. No connector knowledge inside engines.

## Knowledge Graph foundation

Recommendations traverse the [Executive Knowledge Graph](../../knowledge-graph/README.md).
Reasoning paths are materialised relationships — never invented.

## Executive Intent

[Executive Intent Engine](../executive-intent/README.md) filters and re-ranks every Decision, Outcome, and Recommendation through the active executive's priorities.

Today ranks by **business importance AND executive intent**.

## Docs

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — responsibilities & sequence
- [DATA_FLOW.md](./docs/DATA_FLOW.md) — signal → judgement → UI
