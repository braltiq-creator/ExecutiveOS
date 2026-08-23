import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import type {
  GraphEntity,
  GraphPath,
  GraphPathStep,
  TraversalOptions,
} from "@/knowledge-graph/types";

/**
 * Traversal engine — BFS / path finding over organisational relationships.
 */
export function traverse(
  graph: KnowledgeGraph,
  startId: string,
  options: TraversalOptions = {},
): GraphEntity[] {
  const maxDepth = options.maxDepth ?? 2;
  const direction = options.direction ?? "both";
  const limit = options.limit ?? 50;
  const seen = new Set<string>([startId]);
  const results: GraphEntity[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0 && results.length < limit) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    const neighbors = graph.neighbors(current.id, {
      direction,
      relationshipTypes: options.relationshipTypes,
      entityTypes: options.entityTypes,
    });

    for (const hit of neighbors) {
      if (seen.has(hit.entity.id)) continue;
      seen.add(hit.entity.id);
      results.push(hit.entity);
      queue.push({ id: hit.entity.id, depth: current.depth + 1 });
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function findPaths(
  graph: KnowledgeGraph,
  fromId: string,
  toId: string,
  options: TraversalOptions = {},
): GraphPath[] {
  const maxDepth = options.maxDepth ?? 4;
  const limit = options.limit ?? 8;
  const paths: GraphPath[] = [];

  type Frame = {
    id: string;
    depth: number;
    steps: GraphPathStep[];
    visited: Set<string>;
  };

  const start = graph.requireEntity(fromId);
  const stack: Frame[] = [
    {
      id: fromId,
      depth: 0,
      steps: [{ entity: start }],
      visited: new Set([fromId]),
    },
  ];

  while (stack.length > 0 && paths.length < limit) {
    const frame = stack.pop()!;
    if (frame.id === toId && frame.depth > 0) {
      paths.push({
        steps: frame.steps,
        summary: summarisePath(frame.steps),
      });
      continue;
    }
    if (frame.depth >= maxDepth) continue;

    const neighbors = graph.neighbors(frame.id, {
      direction: options.direction ?? "both",
      relationshipTypes: options.relationshipTypes,
      entityTypes: options.entityTypes,
    });

    for (const hit of neighbors) {
      if (frame.visited.has(hit.entity.id)) continue;
      const visited = new Set(frame.visited);
      visited.add(hit.entity.id);
      stack.push({
        id: hit.entity.id,
        depth: frame.depth + 1,
        visited,
        steps: [
          ...frame.steps,
          {
            entity: hit.entity,
            via: {
              relationship: hit.relationship,
              direction: hit.direction,
            },
          },
        ],
      });
    }
  }

  return paths.sort((a, b) => a.steps.length - b.steps.length);
}

export function summarisePath(steps: GraphPathStep[]): string {
  if (steps.length === 0) return "";
  const parts: string[] = [steps[0]!.entity.label];
  for (let i = 1; i < steps.length; i += 1) {
    const step = steps[i]!;
    const rel = step.via?.relationship.type ?? "relates_to";
    const arrow = step.via?.direction === "incoming" ? "←" : "→";
    parts.push(`${arrow}[${rel}] ${step.entity.label}`);
  }
  return parts.join(" ");
}
