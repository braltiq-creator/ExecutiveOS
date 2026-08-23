import type { KnowledgeNodeInput } from "@/lib/knowledge/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "about",
]);

export function buildSearchText(node: KnowledgeNodeInput): string {
  const parts = [
    node.label,
    node.summary ?? "",
    node.nodeType,
    node.sourceType,
    ...(node.labels ?? []),
    JSON.stringify(node.metadata ?? {}),
  ];

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function tokenizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function scoreSearchMatch(input: {
  searchText: string;
  query: string;
}): { score: number; matchedTerms: string[] } {
  const queryTokens = tokenizeSearchText(input.query);
  const documentTokens = new Set(tokenizeSearchText(input.searchText));

  if (queryTokens.length === 0) {
    return { score: 0, matchedTerms: [] };
  }

  const matchedTerms = queryTokens.filter((token) => documentTokens.has(token));
  const score = matchedTerms.length / queryTokens.length;

  return { score, matchedTerms };
}

export function semanticRelatedness(left: string, right: string): number {
  const leftTokens = new Set(tokenizeSearchText(left));
  const rightTokens = tokenizeSearchText(right);
  if (rightTokens.length === 0) return 0;

  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return overlap / rightTokens.length;
}
