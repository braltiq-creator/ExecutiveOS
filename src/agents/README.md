# Executive Council

A team of specialised executive reasoning agents.

> Not a chatbot.
> Agents never invent facts.
> The executive remains the decision maker.

## Agents

| Agent | Focus |
|-------|--------|
| Chief of Staff | Briefing, attention, sequencing |
| CFO | Revenue, margin, cash, capital |
| COO | Capacity, delivery, execution |
| CRO | Pipeline, customers, growth |
| Chief Risk Officer | Enterprise / cyber / compliance risk |
| Chief People Officer | Leadership capacity, retention |
| Chief Customer Officer | Customer health, trust |
| Chief Strategy Officer | Portfolio, long-term Outcomes |

## API (each agent)

`review` · `recommend` · `challenge` · `summarise` · `identifyRisks` · `identifyOpportunities` · `confidence` · `reasoning`

## Orchestrator

```ts
import { conveneExecutiveCouncil } from "@/agents";

const brief = conveneExecutiveCouncil(intelligentSnapshot);
// Conflicts preserved — never averaged
```

## Sources

Agents reason only from Executive Intelligence, Knowledge Graph, Memory, Intent, Judgement, Reality Lab, and Industry Packs (via the snapshot artefacts those systems already produced).

## Future

Deterministic today. Future-ready for AI model routing behind the same `ExecutiveAgent` interface.
