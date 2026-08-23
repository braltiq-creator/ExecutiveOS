# Reality Lab — Simulation Engine

Simulated organisations + executive scenarios that exercise the full stack.

## Organisations

- Northline Mining
- Forgeworks Industrial
- Clearpath SaaS
- Gridline Utilities
- CareAxis Health

Each context includes: Digital Twin, Knowledge Graph, Intent profile, Memory, Business events, Decision backlog (via signals), Risks, Meetings.

## Scenarios

Major customer churn · Cyber incident · Board preparation · Acquisition opportunity · Budget reduction · Regulatory investigation · Operational outage · Leadership resignation · Market expansion

## Run

```ts
import { ORG_NORTHLINE_MINING, getScenario, runScenario } from "@/simulation";

const result = runScenario(
  ORG_NORTHLINE_MINING,
  getScenario("scenario-cyber-incident")!,
);

result.capture.pulse
result.capture.judgements
result.evaluations
result.benchmarks.trustScore
```

Contexts are isolated — global providers are not mutated.
