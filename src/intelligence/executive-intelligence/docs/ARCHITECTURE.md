# Executive Intelligence Engine — Architecture

## Responsibility split

```
Enterprise Systems          Intelligence Layer              Presentation
─────────────────          ─────────────────              ────────────
Salesforce ─┐
M365 / Teams┤              ┌─────────────────────┐
Outlook ────┤  signals     │ Executive           │  snapshot
Jira ───────┼─────────────►│ Intelligence Engine │─────────► Today UI
ServiceNow ─┤              │ (pure functions)    │          Decisions UI
SAP / Oracle┤              └─────────────────────┘          Outcomes UI
Snowflake ──┘                       │
Mock Portfolio ─────────────────────┘
```

The UI never derives business meaning.  
The Intelligence Engine never knows the source system.

Above this layer, the **Executive Judgement Engine** structures options, trade-offs, and unknowns — it does not bind Decisions.

## Module map

```mermaid
flowchart TB
  Provider[EnterpriseDataProvider]
  Signals[EnterpriseSignals]
  Pulse[Business Pulse Engine]
  Capacity[Executive Capacity Engine]
  Outcomes[Outcome Intelligence Engine]
  Decisions[Decision Intelligence Engine]
  Recs[Recommendation Engine]
  Narrative[Business Narrative Engine]
  Attention[Attention Engine]
  Confidence[Confidence Engine]
  Graph[Reasoning Graph]
  Builder[Executive Snapshot Builder]
  Adapter[Presentation Adapter]
  UI[Today UI]

  Provider --> Signals
  Signals --> Pulse
  Signals --> Capacity
  Signals --> Outcomes
  Signals --> Decisions
  Confidence --> Pulse
  Confidence --> Capacity
  Confidence --> Outcomes
  Confidence --> Decisions
  Confidence --> Recs
  Graph --> Pulse
  Graph --> Outcomes
  Graph --> Decisions
  Graph --> Recs
  Decisions --> Recs
  Outcomes --> Recs
  Pulse --> Narrative
  Capacity --> Narrative
  Outcomes --> Narrative
  Decisions --> Narrative
  Capacity --> Attention
  Decisions --> Attention
  Outcomes --> Attention
  Recs --> Attention
  Pulse --> Builder
  Capacity --> Builder
  Outcomes --> Builder
  Decisions --> Builder
  Recs --> Builder
  Narrative --> Builder
  Attention --> Builder
  Builder --> Adapter
  Adapter --> UI
```

## Sequence — building Today

```mermaid
sequenceDiagram
  participant UI as Today UI
  participant Facade as buildExecutiveSnapshotForUi
  participant Provider as Mock/Enterprise Provider
  participant Builder as Snapshot Builder
  participant Engines as EIE Engines
  participant Adapter as Presentation Adapter

  UI->>Facade: portfolio SoT
  Facade->>Provider: create + getSignals()
  Provider-->>Facade: EnterpriseSignals
  Facade->>Builder: buildIntelligentExecutiveSnapshot(provider)
  Builder->>Engines: pulse / capacity / outcomes / decisions
  Engines-->>Builder: typed judgements + reasoning
  Builder->>Engines: recommendations / narrative / attention
  Engines-->>Builder: ranked advice + CoS prose
  Builder-->>Facade: IntelligentExecutiveSnapshot
  Facade->>Adapter: toPresentationSnapshot
  Adapter-->>UI: ExecutiveSnapshot (render-only)
```

## Engine contracts

### 1. Business Pulse
Inputs: outcome momentum, decision backlog, strategic risk, workload, volatility, confidence.  
Output: `PulseResult` with state, factors, narrative, reasoning graph.  
Rule: never average health scores into a state label.

### 2. Executive Capacity
Inputs: meetings, decisions, approvals, initiatives, context switching.  
Output: capacity, attention budget, leadership load, remaining units.

### 3. Outcome Intelligence
Each Outcome → trajectory, momentum, evidence, systems, prediction, recommendation.

### 4. Decision Intelligence
Ranks by `executiveImportance` (urgency × impact × linkage), not by calendar date.

### 5. Recommendation
Every act includes reason, evidence, benefit, downside, confidence, related Outcomes.

### 6. Business Narrative
CoS tone. Summaries interpret overnight change. No status theatre.

### 7. Attention
Budget in minutes. Items compete. Only winners appear on Today.

### 8. Confidence
Completeness, freshness, agreement, history, prediction, AI — with ceilings.

### 9. Reasoning Graph
Answers Why / What changed / Evidence / Systems for every judgement.

### 10. Snapshot Builder
Single orchestration point → `IntelligentExecutiveSnapshot`.

## Decade-ready extension

1. Keep `EnterpriseDataProvider` as the only integration surface.
2. Add connectors that normalise into `EnterpriseSignals`.
3. Engines remain unchanged.
4. Presentation adapters may evolve per surface without touching reasoning.
