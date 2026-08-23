import type {
  KnowledgeEdgeType,
  KnowledgeGraphEdgeView,
  KnowledgeGraphNodeView,
  KnowledgeNodeType,
} from "@/lib/knowledge/types";

export class KnowledgeGraph {
  private readonly nodes = new Map<string, KnowledgeGraphNodeView>();
  private readonly edges = new Map<string, KnowledgeGraphEdgeView>();
  private readonly outgoing = new Map<string, Set<string>>();
  private readonly incoming = new Map<string, Set<string>>();

  addNode(node: KnowledgeGraphNodeView): void {
    this.nodes.set(node.id, node);
    if (!this.outgoing.has(node.id)) this.outgoing.set(node.id, new Set());
    if (!this.incoming.has(node.id)) this.incoming.set(node.id, new Set());
  }

  addEdge(edge: KnowledgeGraphEdgeView): void {
    this.edges.set(edge.id, edge);
    this.outgoing.get(edge.sourceId)?.add(edge.id);
    this.incoming.get(edge.targetId)?.add(edge.id);
    if (!this.outgoing.has(edge.sourceId)) this.outgoing.set(edge.sourceId, new Set([edge.id]));
    if (!this.incoming.has(edge.targetId)) this.incoming.set(edge.targetId, new Set([edge.id]));
  }

  getNode(nodeId: string): KnowledgeGraphNodeView | null {
    return this.nodes.get(nodeId) ?? null;
  }

  listNodes(): KnowledgeGraphNodeView[] {
    return Array.from(this.nodes.values());
  }

  listEdges(): KnowledgeGraphEdgeView[] {
    return Array.from(this.edges.values());
  }

  neighbors(
    nodeId: string,
    direction: "outgoing" | "incoming" | "both" = "both",
  ): KnowledgeGraphNodeView[] {
    const edgeIds = new Set<string>();

    if (direction === "outgoing" || direction === "both") {
      for (const edgeId of this.outgoing.get(nodeId) ?? []) {
        edgeIds.add(edgeId);
      }
    }

    if (direction === "incoming" || direction === "both") {
      for (const edgeId of this.incoming.get(nodeId) ?? []) {
        edgeIds.add(edgeId);
      }
    }

    const neighborIds = new Set<string>();

    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (!edge) continue;
      neighborIds.add(edge.sourceId === nodeId ? edge.targetId : edge.sourceId);
    }

    return Array.from(neighborIds)
      .map((id) => this.nodes.get(id))
      .filter((node): node is KnowledgeGraphNodeView => Boolean(node));
  }

  connectedSubgraph(nodeId: string, depth = 1): {
    nodes: KnowledgeGraphNodeView[];
    edges: KnowledgeGraphEdgeView[];
  } {
    const visitedNodes = new Set<string>([nodeId]);
    const visitedEdges = new Set<string>();
    let frontier = [nodeId];

    for (let level = 0; level < depth; level += 1) {
      const nextFrontier: string[] = [];

      for (const currentId of frontier) {
        for (const edgeId of this.outgoing.get(currentId) ?? []) {
          visitedEdges.add(edgeId);
          const edge = this.edges.get(edgeId);
          if (edge && !visitedNodes.has(edge.targetId)) {
            visitedNodes.add(edge.targetId);
            nextFrontier.push(edge.targetId);
          }
        }

        for (const edgeId of this.incoming.get(currentId) ?? []) {
          visitedEdges.add(edgeId);
          const edge = this.edges.get(edgeId);
          if (edge && !visitedNodes.has(edge.sourceId)) {
            visitedNodes.add(edge.sourceId);
            nextFrontier.push(edge.sourceId);
          }
        }
      }

      frontier = nextFrontier;
    }

    return {
      nodes: Array.from(visitedNodes)
        .map((id) => this.nodes.get(id))
        .filter((node): node is KnowledgeGraphNodeView => Boolean(node)),
      edges: Array.from(visitedEdges)
        .map((id) => this.edges.get(id))
        .filter((edge): edge is KnowledgeGraphEdgeView => Boolean(edge)),
    };
  }

  findByType(nodeType: KnowledgeNodeType): KnowledgeGraphNodeView[] {
    return this.listNodes().filter((node) => node.nodeType === nodeType);
  }

  findByLabel(term: string): KnowledgeGraphNodeView[] {
    const normalized = term.toLowerCase();
    return this.listNodes().filter((node) =>
      node.label.toLowerCase().includes(normalized),
    );
  }

  findPathsBetween(
    sourceNodeId: string,
    targetNodeId: string,
    maxDepth = 4,
  ): KnowledgeGraphNodeView[][] {
    const paths: KnowledgeGraphNodeView[][] = [];
    const visited = new Set<string>();

    const walk = (currentId: string, path: KnowledgeGraphNodeView[]): void => {
      if (path.length > maxDepth) return;
      if (currentId === targetNodeId) {
        paths.push([...path]);
        return;
      }

      visited.add(currentId);

      for (const neighbor of this.neighbors(currentId)) {
        if (visited.has(neighbor.id)) continue;
        walk(neighbor.id, [...path, neighbor]);
      }

      visited.delete(currentId);
    };

    const source = this.getNode(sourceNodeId);
    if (!source) return paths;

    walk(sourceNodeId, [source]);
    return paths;
  }

  queryConnectedToInitiative(initiativeLabel: string): GraphQuerySlice {
    const initiative = this.findByLabel(initiativeLabel).find(
      (node) => node.nodeType === "initiative",
    );

    if (!initiative) {
      return emptySlice(`Initiative "${initiativeLabel}"`);
    }

    const subgraph = this.connectedSubgraph(initiative.id, 2);
    const meetings = subgraph.nodes.filter(
      (node) => node.nodeType === "meeting" || node.nodeType === "calendar_event",
    );

    return {
      query: `Meetings connected to ${initiative.label}`,
      nodes: subgraph.nodes,
      edges: subgraph.edges,
      highlights: meetings.map((node) => node.id),
    };
  }

  queryDecisionsForPerson(personLabel: string): GraphQuerySlice {
    const person = this.findByLabel(personLabel).find(
      (node) => node.nodeType === "person" || node.nodeType === "executive",
    );

    if (!person) {
      return emptySlice(`Person "${personLabel}"`);
    }

    const decisions = this.neighbors(person.id)
      .flatMap((node) => this.neighbors(node.id))
      .filter((node) => node.nodeType === "decision");

    const uniqueDecisions = dedupeNodes(decisions);
    const edges = this.listEdges().filter(
      (edge) =>
        uniqueDecisions.some(
          (node) => node.id === edge.sourceId || node.id === edge.targetId,
        ) &&
        (edge.sourceId === person.id ||
          edge.targetId === person.id ||
          uniqueDecisions.some(
            (node) => node.id === edge.sourceId || node.id === edge.targetId,
          )),
    );

    return {
      query: `Decisions involving ${person.label}`,
      nodes: dedupeNodes([person, ...uniqueDecisions]),
      edges,
      highlights: uniqueDecisions.map((node) => node.id),
    };
  }

  queryRisksBlockingObjective(objectiveLabel: string): GraphQuerySlice {
    const objective = this.findByLabel(objectiveLabel).find(
      (node) => node.nodeType === "objective",
    );

    if (!objective) {
      return emptySlice(`Objective "${objectiveLabel}"`);
    }

    const risks = this.listEdges()
      .filter(
        (edge) =>
          edge.edgeType === "blocks" &&
          (edge.targetId === objective.id || edge.sourceId === objective.id),
      )
      .flatMap((edge) => {
        const otherId = edge.sourceId === objective.id ? edge.targetId : edge.sourceId;
        return this.getNode(otherId);
      })
      .filter((node): node is KnowledgeGraphNodeView => {
        return node !== null && node.nodeType === "risk";
      });

    return {
      query: `Risks blocking ${objective.label}`,
      nodes: dedupeNodes([objective, ...risks]),
      edges: this.listEdges().filter(
        (edge) =>
          edge.edgeType === "blocks" &&
          (edge.targetId === objective.id || edge.sourceId === objective.id),
      ),
      highlights: risks.map((node) => node.id),
    };
  }

  queryMemoryAboutTopic(topic: string): GraphQuerySlice {
    const normalized = topic.toLowerCase();
    const memories = this.listNodes().filter(
      (node) =>
        (node.nodeType === "memory" ||
          node.nodeType === "risk" ||
          node.nodeType === "opportunity") &&
        `${node.label} ${node.summary ?? ""}`.toLowerCase().includes(normalized),
    );

    const edges = this.listEdges().filter((edge) =>
      memories.some(
        (node) => node.id === edge.sourceId || node.id === edge.targetId,
      ),
    );

    const related = edges.flatMap((edge) => {
      const otherId = memories.some((node) => node.id === edge.sourceId)
        ? edge.targetId
        : edge.sourceId;
      return this.getNode(otherId);
    });

    return {
      query: `Executive memory related to "${topic}"`,
      nodes: dedupeNodes([...memories, ...related.filter(Boolean) as KnowledgeGraphNodeView[]]),
      edges,
      highlights: memories.map((node) => node.id),
    };
  }
}

export type GraphQuerySlice = {
  query: string;
  nodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphEdgeView[];
  highlights: string[];
};

export function buildKnowledgeGraphFromViews(input: {
  nodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphEdgeView[];
}): KnowledgeGraph {
  const graph = new KnowledgeGraph();
  for (const node of input.nodes) graph.addNode(node);
  for (const edge of input.edges) graph.addEdge(edge);
  return graph;
}

function dedupeNodes(nodes: KnowledgeGraphNodeView[]): KnowledgeGraphNodeView[] {
  const map = new Map<string, KnowledgeGraphNodeView>();
  for (const node of nodes) map.set(node.id, node);
  return Array.from(map.values());
}

function emptySlice(query: string): GraphQuerySlice {
  return { query, nodes: [], edges: [], highlights: [] };
}

export function runGraphQuery(
  graph: KnowledgeGraph,
  queryType: string,
  term: string,
): GraphQuerySlice {
  switch (queryType) {
    case "meetings_for_initiative":
      return graph.queryConnectedToInitiative(term);
    case "decisions_for_person":
      return graph.queryDecisionsForPerson(term);
    case "risks_blocking_objective":
      return graph.queryRisksBlockingObjective(term);
    case "memory_about_topic":
      return graph.queryMemoryAboutTopic(term);
    default:
      return graph.queryMemoryAboutTopic(term);
  }
}
