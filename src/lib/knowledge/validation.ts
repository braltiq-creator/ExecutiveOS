import {
  KNOWLEDGE_EDGE_TYPES,
  KNOWLEDGE_NODE_TYPES,
  KNOWLEDGE_SEARCH_FILTERS,
  type KnowledgeSearchFilter,
} from "@/lib/knowledge/types";
import { KnowledgeGraphError } from "@/lib/knowledge/types";

export function validateSearchQuery(query: string): string {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    throw new KnowledgeGraphError(
      "Search query must be at least 2 characters.",
      "VALIDATION_ERROR",
    );
  }

  return trimmed;
}

export function validateGraphQuery(input: {
  queryType: string;
  term: string;
}): { queryType: string; term: string } {
  const term = input.term.trim();

  if (!term) {
    throw new KnowledgeGraphError("Query term is required.", "VALIDATION_ERROR");
  }

  return { queryType: input.queryType, term };
}

export function validateSearchFilter(
  filter: string | undefined,
): KnowledgeSearchFilter | undefined {
  if (!filter) return undefined;

  if (!(KNOWLEDGE_SEARCH_FILTERS as readonly string[]).includes(filter)) {
    throw new KnowledgeGraphError("Invalid search filter.", "VALIDATION_ERROR");
  }

  return filter as KnowledgeSearchFilter;
}

export function isKnowledgeNodeType(value: string): boolean {
  return (KNOWLEDGE_NODE_TYPES as readonly string[]).includes(value);
}

export function isKnowledgeEdgeType(value: string): boolean {
  return (KNOWLEDGE_EDGE_TYPES as readonly string[]).includes(value);
}
