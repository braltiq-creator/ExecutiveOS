import { buildNorthlineKnowledgeGraph } from "@/knowledge-graph/mock/northline-graph";
import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import type { KnowledgeGraphProvider } from "@/knowledge-graph/provider";
import type { GraphSnapshot } from "@/knowledge-graph/types";

/**
 * Mock graph provider — replace with Neo4jKnowledgeGraphProvider later.
 */
export function createMockKnowledgeGraphProvider(
  graph: KnowledgeGraph = buildNorthlineKnowledgeGraph(),
): KnowledgeGraphProvider {
  return {
    id: "mock-northline-graph",
    label: "Mock Northline Knowledge Graph",
    getGraph(): KnowledgeGraph {
      return graph;
    },
    getSnapshot(): GraphSnapshot {
      return graph.snapshot();
    },
  };
}
