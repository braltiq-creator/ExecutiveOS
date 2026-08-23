import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import {
  impactClosure,
  outcomesAffectedBy,
  risksIncreasedBy,
  shortestImpactPath,
} from "@/knowledge-graph/reasoning";
import { queryEvidence, queryNeighborhood, queryOwners } from "@/knowledge-graph/queries";
import { findPaths, summarisePath } from "@/knowledge-graph/traversal";
import type { GraphExplainability, GraphPath } from "@/knowledge-graph/types";

/**
 * Explainability helpers — every recommendation traverses the graph.
 * Never invent reasoning. Always show relationship paths.
 */
export function explainEntity(
  graph: KnowledgeGraph,
  entityId: string,
  question?: string,
): GraphExplainability {
  const entity = graph.requireEntity(entityId);
  const neighborhood = queryNeighborhood(graph, entityId);
  const closure = impactClosure(graph, entityId);

  const paths: GraphPath[] = [];

  for (const outcome of closure.outcomes.slice(0, 4)) {
    const path = shortestImpactPath(graph, entityId, outcome.id);
    if (path) paths.push(path);
  }
  for (const risk of closure.risks.slice(0, 3)) {
    const path = shortestImpactPath(graph, entityId, risk.id);
    if (path) paths.push(path);
  }
  for (const owner of neighborhood.owners.slice(0, 2)) {
    paths.push({
      steps: [
        { entity },
        {
          entity: owner.entity,
          via: {
            relationship: owner.relationship,
            direction: owner.direction,
          },
        },
      ],
      summary: summarisePath([
        { entity },
        {
          entity: owner.entity,
          via: {
            relationship: owner.relationship,
            direction: owner.direction,
          },
        },
      ]),
    });
  }

  const systems = [
    ...new Set(
      neighborhood.evidence
        .map((hit) => String(hit.entity.properties?.system ?? hit.entity.type))
        .concat(
          graph
            .neighbors(entityId, { entityTypes: ["System"], direction: "both" })
            .map((hit) => hit.entity.label),
        ),
    ),
  ];

  const narrative = buildNarrative(entity.label, {
    owners: neighborhood.owners.map((h) => h.entity.label),
    outcomes: closure.outcomes.map((e) => e.label),
    risks: closure.risks.map((e) => e.label),
    evidence: neighborhood.evidence.map((h) => h.entity.label),
    paths,
  });

  return {
    subjectId: entityId,
    question:
      question ??
      `What organisational relationships explain ${entity.label}?`,
    paths: dedupePaths(paths).slice(0, 8),
    narrative,
    systems,
  };
}

export function explainRecommendation(
  graph: KnowledgeGraph,
  recommendationId: string,
): GraphExplainability {
  const rec = graph.requireEntity(recommendationId);
  if (rec.type !== "Recommendation") {
    throw new Error(`Not a Recommendation: ${recommendationId}`);
  }

  const base = explainEntity(
    graph,
    recommendationId,
    `Why recommend: ${rec.label}?`,
  );

  const linkedDecisions = graph.neighbors(recommendationId, {
    entityTypes: ["Decision"],
    direction: "both",
  });

  const decisionPaths = linkedDecisions.flatMap((hit) =>
    findPaths(graph, recommendationId, hit.entity.id, {
      maxDepth: 2,
      limit: 2,
    }),
  );

  const outcomePaths = linkedDecisions.flatMap((hit) =>
    graph
      .neighbors(hit.entity.id, { entityTypes: ["Outcome"], direction: "both" })
      .flatMap((outcomeHit) =>
        findPaths(graph, recommendationId, outcomeHit.entity.id, {
          maxDepth: 3,
          limit: 2,
        }),
      ),
  );

  const paths = dedupePaths([
    ...decisionPaths,
    ...outcomePaths,
    ...base.paths,
  ]);

  return {
    ...base,
    paths,
    narrative:
      paths.length > 0
        ? `Recommendation grounded in graph paths: ${paths
            .slice(0, 3)
            .map((path) => path.summary)
            .join(" | ")}`
        : base.narrative,
  };
}

export function explainBetween(
  graph: KnowledgeGraph,
  fromId: string,
  toId: string,
): GraphExplainability {
  const from = graph.requireEntity(fromId);
  const to = graph.requireEntity(toId);
  const paths = findPaths(graph, fromId, toId, { maxDepth: 5, limit: 6 });

  return {
    subjectId: fromId,
    question: `How does ${from.label} relate to ${to.label}?`,
    paths,
    narrative:
      paths.length > 0
        ? `Found ${paths.length} relationship path(s). Shortest: ${paths[0]!.summary}.`
        : `No materialised relationship path between ${from.label} and ${to.label}.`,
    systems: [],
  };
}

export function formatExplainability(explanation: GraphExplainability): string {
  const pathLines =
    explanation.paths.length > 0
      ? explanation.paths.map((path, i) => `${i + 1}. ${path.summary}`).join("\n")
      : "No relationship paths materialised.";
  return [
    explanation.question,
    explanation.narrative,
    "Paths:",
    pathLines,
    explanation.systems.length > 0
      ? `Systems: ${explanation.systems.join(", ")}`
      : "Systems: (none linked)",
  ].join("\n");
}

/** Compact path strings for Intelligence Engine consumption. */
export function graphPathsForEntity(
  graph: KnowledgeGraph,
  entityId: string,
): string[] {
  if (!graph.getEntity(entityId)) return [];
  return explainEntity(graph, entityId).paths.map((path) => path.summary);
}

export function ownersOf(graph: KnowledgeGraph, entityId: string): string[] {
  if (!graph.getEntity(entityId)) return [];
  return queryOwners(graph, entityId).map((hit) => hit.entity.label);
}

export function evidenceFor(graph: KnowledgeGraph, entityId: string): string[] {
  if (!graph.getEntity(entityId)) return [];
  return queryEvidence(graph, entityId).map((hit) => hit.entity.label);
}

export function outcomeLabelsAffected(
  graph: KnowledgeGraph,
  entityId: string,
): string[] {
  if (!graph.getEntity(entityId)) return [];
  return outcomesAffectedBy(graph, entityId).map((entity) => entity.label);
}

export function riskLabelsIncreased(
  graph: KnowledgeGraph,
  entityId: string,
): string[] {
  if (!graph.getEntity(entityId)) return [];
  return risksIncreasedBy(graph, entityId).map((entity) => entity.label);
}

function buildNarrative(
  label: string,
  parts: {
    owners: string[];
    outcomes: string[];
    risks: string[];
    evidence: string[];
    paths: GraphPath[];
  },
): string {
  const chunks: string[] = [`${label} is grounded in the organisational graph.`];
  if (parts.owners.length > 0) {
    chunks.push(`Owned by ${parts.owners.slice(0, 3).join(", ")}.`);
  }
  if (parts.outcomes.length > 0) {
    chunks.push(`Affects Outcomes: ${parts.outcomes.slice(0, 4).join(", ")}.`);
  }
  if (parts.risks.length > 0) {
    chunks.push(`Linked Risks: ${parts.risks.slice(0, 3).join(", ")}.`);
  }
  if (parts.evidence.length > 0) {
    chunks.push(`Evidence: ${parts.evidence.slice(0, 3).join(", ")}.`);
  }
  if (parts.paths.length > 0) {
    chunks.push(`Primary path: ${parts.paths[0]!.summary}.`);
  } else {
    chunks.push("No multi-hop path required — neighborhood is direct.");
  }
  return chunks.join(" ");
}

function dedupePaths(paths: GraphPath[]): GraphPath[] {
  const seen = new Set<string>();
  const result: GraphPath[] = [];
  for (const path of paths) {
    if (seen.has(path.summary)) continue;
    seen.add(path.summary);
    result.push(path);
  }
  return result;
}
