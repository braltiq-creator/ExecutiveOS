# Executive Judgement Engine — Architecture

## Stack position

```
Connectors → Twin → Knowledge Graph
                      │
Enterprise Signals ───┤
                      ▼
           Executive Intelligence Engine
                      │
           Executive Intent Engine
                      │
           Executive Memory Engine
                      │
           Executive Judgement Engine  ← structures thinking
                      │
                      ▼
           IntelligentExecutiveSnapshot (incl. judgementBriefs)
```

## Sequence

```mermaid
sequenceDiagram
  participant Builder as Snapshot Builder
  participant EIE as Intelligence
  participant Intent as Intent
  participant Memory as Memory
  participant EJE as Judgement
  participant Today as Today UI

  Builder->>EIE: pulse / decisions / recs
  Builder->>Intent: applyExecutiveIntent
  Builder->>Memory: applyExecutiveMemory
  Builder->>EJE: applyExecutiveJudgement
  EJE-->>Builder: briefs + enriched packs + alternatives
  Builder-->>Today: Snapshot (judgementBriefs)
```

## Stance vs Decision

EJE may emit a **stance** (`lean_approve`, `lean_investigate`, …).  
A stance is a structured leaning for comparison — **not** a bind.

## Invariants

1. Alternatives presented whenever the catalogue has them
2. Unknowns always non-empty
3. Trade-offs always expose costs with gains
4. Closing note reminds: humans decide
