# Executive Knowledge Graph (EKG)

Permanent organisational relationship foundation for ExecutiveOS.

> ExecutiveOS understands relationships — not records, not tables, not isolated systems.

## Location

```
src/knowledge-graph/
```

## Capabilities

Given any entity, the graph answers:

| Question | API |
|----------|-----|
| What depends on this? | `queryDependsOn` |
| What is affected? | `queryAffectedBy` / `outcomesAffectedBy` |
| Who owns it? | `queryOwners` / `ownersOf` |
| Which Outcomes change? | `queryLinkedOutcomes` / `queryReachableOutcomes` |
| Which Risks increase? | `risksIncreasedBy` |
| Which Recommendations change? | `recommendationsTouching` |
| What evidence exists? | `queryEvidence` |
| What meetings mention it? | `queryMeetings` |
| What documents reference it? | `queryDocuments` |
| Full neighborhood | `queryNeighborhood` |

## Explainability

```ts
import {
  getKnowledgeGraph,
  explainEntity,
  explainRecommendation,
  formatExplainability,
} from "@/knowledge-graph";

const graph = getKnowledgeGraph();
const explanation = explainEntity(graph, "decision-residency");
console.log(formatExplainability(explanation));
// Always relationship paths — never invented reasoning.
```

## Provider swap (Neo4j-ready)

```ts
createMockKnowledgeGraphProvider()

// Future:
createNeo4jKnowledgeGraphProvider({ uri, auth })
```

Both implement `KnowledgeGraphProvider` (`getGraph`, `getSnapshot`).

## Entity & relationship catalogue

See `types.ts` for the full lists (21 entity types, 20 relationship types).

## Docs

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
