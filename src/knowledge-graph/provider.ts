import type { GraphSnapshot } from "@/knowledge-graph/types";
import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";

/**
 * Graph provider contract — in-memory today, Neo4j (or other) tomorrow.
 * Callers never depend on storage implementation.
 */
export type KnowledgeGraphProvider = {
  readonly id: string;
  readonly label: string;
  getGraph(): KnowledgeGraph;
  getSnapshot(): GraphSnapshot;
};
