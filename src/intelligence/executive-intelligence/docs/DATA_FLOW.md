# Executive Intelligence Engine — Data Flow

## Signal → Judgement → Presentation

```mermaid
flowchart LR
  subgraph Sources
    Mock[Mock Portfolio]
    SF[Salesforce]
    M365[Microsoft 365]
    Jira[Jira]
  end

  subgraph Ingress
    Conn[Connector Framework]
    BE[BusinessEvent]
    Twin[Enterprise Digital Twin]
  end

  subgraph Provider
    Interface[EnterpriseDataProvider.getSignals]
  end

  subgraph Signals
    EO[Outcome signals]
    ED[Decision signals]
    Meta[Executive meta]
  end

  subgraph Judgement
    P[Pulse]
    C[Capacity]
    O[Outcomes]
    D[Decisions]
    R[Recommendations]
    N[Narrative]
    A[Attention]
  end

  subgraph Output
    IES[IntelligentExecutiveSnapshot]
    UI[ExecutiveSnapshot UI model]
  end

  Mock --> Interface
  SF --> Conn
  M365 --> Conn
  Jira --> Conn
  Conn --> BE
  BE --> Twin
  Twin --> Interface
  Interface --> EO
  Interface --> ED
  Interface --> Meta
  EO --> P
  ED --> P
  EO --> C
  ED --> C
  EO --> O
  ED --> D
  O --> R
  D --> R
  P --> N
  C --> N
  O --> N
  D --> N
  C --> A
  D --> A
  O --> A
  R --> A
  P --> IES
  C --> IES
  O --> IES
  D --> IES
  R --> IES
  N --> IES
  A --> IES
  IES --> UI
```

## Explainability path

For any Today value:

1. Find the entity id (Decision, Outcome, Recommendation, or `pulse`)
2. Read `intelligent.reasoningIndex[id]`
3. Surface:
   - `question`
   - `whatChanged`
   - `evidence[]`
   - `systems[]`
   - `summary`

```ts
import { runExecutiveIntelligence, explainGraph } from "@/intelligence/executive-intelligence";

const intelligent = runExecutiveIntelligence(portfolio);
const graph = intelligent.reasoningIndex["decision-residency"];
console.log(explainGraph(graph));
```

## Replacing mock providers

| Step | Change |
|------|--------|
| 1 | Implement `EnterpriseDataProvider` for the connector |
| 2 | Map native payloads → `EnterpriseSignals` |
| 3 | Pass provider into `buildIntelligentExecutiveSnapshot(provider)` |
| 4 | No engine edits required |

## Determinism

Engines are pure functions of `EnterpriseSignals`.  
No clocks, randomness, or network calls inside engines.  
Freshness uses signal timestamps / assumed operating-window hours supplied by the provider mapping layer.
