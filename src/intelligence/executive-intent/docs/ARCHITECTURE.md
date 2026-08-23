# Executive Intent Engine — Architecture

## Stack position

```
Enterprise Signals → Executive Intelligence Engine (business)
                              │
Organisational Graph ─────────┤
                              │
Executive Intent Engine ──────┤
         (the executive)      │
                              │
Executive Memory Engine ──────┴─► IntelligentExecutiveSnapshot → Today UI
         (the journey)
```

Independently replaceable via `ExecutiveIntentProvider`.

## Sequence

```mermaid
sequenceDiagram
  participant Builder as Snapshot Builder
  participant EIE as Intelligence Engines
  participant KG as Knowledge Graph
  participant Intent as Intent Engine
  participant Memory as Memory Engine
  participant Today as Today UI

  Builder->>EIE: pulse / capacity / outcomes / decisions / recs
  EIE->>KG: graph paths for recommendations
  Builder->>Intent: getExecutiveIntent()
  Builder->>Intent: applyExecutiveIntent(...)
  Intent-->>Builder: alignment + re-ranked work + intent narrative
  Builder->>Memory: applyExecutiveMemory(...)
  Memory-->>Builder: journey narrative + history-personalised recs
  Builder-->>Today: ExecutiveSnapshot
```

## Ranking formula

```
attentionPriority = businessImportance × 0.55 + intentScore × 0.45
(+ high-alignment boost / conflict penalty)
```

Today no longer ranks by business importance alone.

## Narrative shift

| Before | After |
|--------|-------|
| What happened overnight | What happened that affects YOUR priorities |
| Generic portfolio summary | Priority lens + highest-alignment call |

## Provider swap

```ts
createMockExecutiveIntentProvider("CEO")

// Future: Workday goals, Lattice, Cascading OKRs, Notion strategy docs
createGoalsSystemIntentProvider(config)
```
