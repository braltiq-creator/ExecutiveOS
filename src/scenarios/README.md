# Executive Scenario Packs

Acceptance criteria for Design Partner pilots.

ExecutiveOS is evaluated by whether it answers the executive questions that matter — not by feature checklists.

## Packs

- Operations Executive (M365 + Simpro) — 10 scenarios
- Commercial Executive (M365 + Salesforce) — 10 scenarios

## Usage

```ts
import {
  runScenarioPack,
  buildScenarioScorecard,
  generateScenarioReport,
  attachScenariosToTodayActions,
} from "@/scenarios";

const run = runScenarioPack({
  tenantId,
  profileId: "operations_executive",
  presentation: snapshot,
});

const scorecard = buildScenarioScorecard({
  tenantId,
  profileId: "operations_executive",
  presentation: snapshot,
});
```

## Today

Recommended actions on Today reference scenario, business question, evidence, confidence, and expected outcome via `attachScenariosToTodayActions` (wired in runtime experience projection).

## Extending

Register a new pack with `registerScenarioPack` — no Core engine changes required.
