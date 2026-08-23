import type {
  ReasoningEdge,
  ReasoningGraph,
  ReasoningNode,
} from "@/intelligence/executive-intelligence/types";

/**
 * Reasoning Graph — explainability layer.
 * Every recommendation and score can answer: Why? What changed? What evidence? Which systems?
 */
export function buildReasoningGraph(input: {
  id: string;
  question: string;
  whatChanged: string[];
  evidence: ReasoningNode[];
  systems: string[];
  edges?: ReasoningEdge[];
  summary: string;
}): ReasoningGraph {
  const systems =
    input.systems.length > 0
      ? input.systems
      : [
          ...new Set(
            input.evidence
              .map((node) => node.system)
              .filter((value): value is string => Boolean(value)),
          ),
        ];

  return {
    question: input.question,
    whatChanged: input.whatChanged.filter(Boolean),
    evidence: input.evidence,
    systems,
    edges: input.edges ?? defaultEdges(input.evidence),
    summary: input.summary,
  };
}

export function explainGraph(graph: ReasoningGraph): string {
  const changed =
    graph.whatChanged.length > 0
      ? graph.whatChanged.join(" ")
      : "No material overnight change named.";
  const evidence =
    graph.evidence.length > 0
      ? graph.evidence
          .slice(0, 3)
          .map((node) => node.label)
          .join("; ")
      : "Evidence sparse.";
  const systems =
    graph.systems.length > 0 ? graph.systems.join(", ") : "Internal judgement";
  return `Why: ${graph.summary} What changed: ${changed} Evidence: ${evidence} Systems: ${systems}.`;
}

function defaultEdges(evidence: ReasoningNode[]): ReasoningEdge[] {
  if (evidence.length < 2) return [];
  const root = evidence[0];
  return evidence.slice(1).map((node) => ({
    from: node.id,
    to: root.id,
    relation: "informs" as const,
  }));
}
