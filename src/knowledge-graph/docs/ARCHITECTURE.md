# Executive Knowledge Graph — Architecture

## Position in the stack

```
Connectors → BusinessEvent → Digital Twin → Knowledge Graph → Executive Intelligence
```

```
Enterprise Systems → Signal Providers → Executive Intelligence Engine
                                              ▲
                                              │ traverses
                                    Executive Knowledge Graph
                                    (organisational relationships)
```

The Intelligence Engine interprets Twin-backed signals.  
The Knowledge Graph models the organisation those signals belong to.  
`updateKnowledgeGraphFromTwin` keeps the graph aligned after each sync.

## Module map

```mermaid
flowchart TB
  Provider[KnowledgeGraphProvider]
  Memory[In-memory KnowledgeGraph]
  Builder[GraphBuilder]
  Traverse[Traversal Engine]
  Queries[Graph Queries]
  Reason[Reasoning Helpers]
  Explain[Explainability]
  Mock[Northline Mock Graph]
  EIE[Executive Intelligence Engine]

  Mock --> Builder
  Builder --> Memory
  Provider --> Memory
  Memory --> Traverse
  Memory --> Queries
  Queries --> Reason
  Traverse --> Reason
  Reason --> Explain
  Explain --> EIE
  Queries --> EIE
```

## Sequence — explain a recommendation

```mermaid
sequenceDiagram
  participant EIE as Recommendation Engine
  participant KG as Knowledge Graph
  participant Q as Queries
  participant T as Traversal
  participant X as Explainability

  EIE->>KG: getEntity(decision-residency)
  EIE->>X: graphPathsForEntity(decision)
  X->>Q: queryNeighborhood
  X->>T: findPaths → Outcomes / Risks
  T-->>X: GraphPath[]
  X-->>EIE: path summaries (materialised only)
  EIE->>EIE: attach paths to ReasoningGraph
```

## In-memory → Neo4j

| Concern | Today | Future |
|---------|-------|--------|
| Storage | `KnowledgeGraph` Map adjacency | Neo4j bolt driver |
| Load | `GraphBuilder` / mock fixture | Cypher import from `GraphSnapshot` |
| Query | TypeScript traversals | Cypher + same API facade |
| Contract | `KnowledgeGraphProvider` | unchanged |

`GraphSnapshot` is the portable interchange format.

## Rules

1. Never invent edges during explainability.
2. Multi-hop discovery uses traversal over materialised relationships only.
3. Entity ids for Outcomes/Decisions align with portfolio SoT where possible.
4. No React. No UI.
