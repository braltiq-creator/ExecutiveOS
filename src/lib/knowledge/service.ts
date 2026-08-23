import { buildKnowledgeGraphForUser } from "@/lib/knowledge/builder";
import {
  buildKnowledgeGraphFromViews,
  KnowledgeGraph,
  runGraphQuery,
  type GraphQuerySlice,
} from "@/lib/knowledge/graph";
import { scoreSearchMatch } from "@/lib/knowledge/indexer";
import {
  fetchKnowledgeEdges,
  fetchKnowledgeIndexEntries,
  fetchKnowledgeNodes,
  fetchLatestGraphSnapshot,
} from "@/lib/knowledge/queries";
import type {
  GraphPageData,
  GraphQueryResult,
  GraphSearchResult,
  KnowledgeGraphBuildResult,
  KnowledgeGraphView,
  KnowledgeSearchFilter,
} from "@/lib/knowledge/types";
import { SEARCH_FILTER_NODE_TYPES } from "@/lib/knowledge/types";
import { validateGraphQuery, validateSearchFilter, validateSearchQuery } from "@/lib/knowledge/validation";
import type { MeetingPreparation, MeetingPreparationItem } from "@/lib/intelligence/providers/types";
import type { ExecutiveCalendarIntelligence } from "@/lib/intelligence/providers/types";
import type { KnowledgeGraphContext } from "@/types/intelligence";
import { fetchActiveMembership } from "@/lib/organizations/queries";
import { KnowledgeGraphError } from "@/lib/knowledge/types";

const GRAPH_STALE_MS = 15 * 60 * 1000;

export async function getOrganizationGraphView(
  organizationId: string,
): Promise<KnowledgeGraphView> {
  const [nodes, edges, snapshot] = await Promise.all([
    fetchKnowledgeNodes(organizationId),
    fetchKnowledgeEdges(organizationId),
    fetchLatestGraphSnapshot(organizationId),
  ]);

  return {
    nodes,
    edges,
    stats: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      lastBuiltAt: snapshot?.created_at ?? null,
    },
  };
}

export async function ensureKnowledgeGraphForUser(
  userId: string,
): Promise<KnowledgeGraphBuildResult | null> {
  const membership = await fetchActiveMembership(userId);
  if (!membership) return null;

  const snapshot = await fetchLatestGraphSnapshot(membership.organization.id);
  const isStale =
    !snapshot ||
    Date.now() - new Date(snapshot.created_at).getTime() > GRAPH_STALE_MS;

  if (!isStale && snapshot.node_count > 0) {
    return {
      nodeCount: snapshot.node_count,
      edgeCount: snapshot.edge_count,
      snapshotId: snapshot.id,
    };
  }

  return buildKnowledgeGraphForUser(userId, membership.organization.id);
}

export async function loadGraphPageData(userId: string): Promise<GraphPageData> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new KnowledgeGraphError("Organization membership required.", "NOT_MEMBER");
  }

  await ensureKnowledgeGraphForUser(userId);
  const graph = await getOrganizationGraphView(membership.organization.id);

  return {
    graph,
    organizationId: membership.organization.id,
  };
}

export async function loadKnowledgeGraphContext(
  userId: string,
): Promise<KnowledgeGraphContext> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return { nodes: [], edges: [], connected: false };
  }

  await ensureKnowledgeGraphForUser(userId);
  const graph = await getOrganizationGraphView(membership.organization.id);

  return {
    connected: graph.nodes.length > 0,
    nodes: graph.nodes.slice(0, 100).map((node) => ({
      id: node.id,
      label: node.label,
      nodeType: node.nodeType,
      summary: node.summary,
    })),
    edges: graph.edges.slice(0, 150).map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      edgeType: edge.edgeType,
    })),
  };
}

export async function searchKnowledgeGraph(input: {
  organizationId: string;
  query: string;
  filter?: KnowledgeSearchFilter;
  limit?: number;
}): Promise<GraphSearchResult[]> {
  const query = validateSearchQuery(input.query);
  const filter = validateSearchFilter(input.filter);
  const entries = await fetchKnowledgeIndexEntries(input.organizationId);

  const allowedTypes = filter ? SEARCH_FILTER_NODE_TYPES[filter] : null;

  const results = entries
    .filter((entry) =>
      allowedTypes ? allowedTypes.includes(entry.node.nodeType) : true,
    )
    .map((entry) => {
      const scored = scoreSearchMatch({
        searchText: entry.search_text,
        query,
      });

      return {
        node: entry.node,
        score: scored.score,
        matchedTerms: scored.matchedTerms,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, input.limit ?? 20);

  return results;
}

export async function queryKnowledgeGraph(input: {
  organizationId: string;
  queryType: string;
  term: string;
}): Promise<GraphQueryResult> {
  const validated = validateGraphQuery(input);
  const [nodes, edges] = await Promise.all([
    fetchKnowledgeNodes(input.organizationId),
    fetchKnowledgeEdges(input.organizationId),
  ]);

  const graph = buildKnowledgeGraphFromViews({ nodes, edges });
  const slice: GraphQuerySlice = runGraphQuery(
    graph,
    validated.queryType,
    validated.term,
  );

  return {
    query: slice.query,
    nodes: slice.nodes,
    edges: slice.edges,
  };
}

export async function expandKnowledgeNode(
  organizationId: string,
  nodeId: string,
  depth = 1,
): Promise<KnowledgeGraphView> {
  const [nodes, edges] = await Promise.all([
    fetchKnowledgeNodes(organizationId),
    fetchKnowledgeEdges(organizationId),
  ]);

  const graph = buildKnowledgeGraphFromViews({ nodes, edges });
  const subgraph = graph.connectedSubgraph(nodeId, depth);

  return {
    nodes: subgraph.nodes,
    edges: subgraph.edges,
    stats: {
      nodeCount: subgraph.nodes.length,
      edgeCount: subgraph.edges.length,
      lastBuiltAt: null,
    },
  };
}

export async function getMeetingPreparationFromGraph(input: {
  organizationId: string;
  meetingTitle: string;
  meetingId?: string;
}): Promise<Partial<MeetingPreparation>> {
  const [nodes, edges] = await Promise.all([
    fetchKnowledgeNodes(input.organizationId),
    fetchKnowledgeEdges(input.organizationId),
  ]);

  const graph = buildKnowledgeGraphFromViews({ nodes, edges });
  const meetingNode =
    (input.meetingId
      ? nodes.find(
          (node) =>
            node.sourceId === input.meetingId &&
            (node.nodeType === "calendar_event" || node.nodeType === "meeting"),
        )
      : null) ?? graph.findByLabel(input.meetingTitle).find(
        (node) => node.nodeType === "calendar_event" || node.nodeType === "meeting",
      );

  if (!meetingNode) {
    return {};
  }

  const neighbors = graph.neighbors(meetingNode.id, "both");

  const toItems = (
    items: typeof neighbors,
    type: MeetingPreparationItem["type"],
  ): MeetingPreparationItem[] =>
    items.map((node) => ({
      id: node.id,
      type,
      title: node.label,
      summary: node.summary ?? "",
    }));

  return {
    relatedDecisions: toItems(
      neighbors.filter((node) => node.nodeType === "decision"),
      "decision",
    ),
    relatedInitiatives: toItems(
      neighbors.filter((node) => node.nodeType === "initiative"),
      "initiative",
    ),
    relatedRisks: toItems(
      neighbors.filter((node) => node.nodeType === "risk"),
      "risk",
    ),
    relatedOpportunities: toItems(
      neighbors.filter((node) => node.nodeType === "opportunity"),
      "opportunity",
    ),
    relevantMemory: toItems(
      neighbors.filter((node) => node.nodeType === "memory"),
      "memory",
    ),
    previousMeetings: toItems(
      neighbors.filter((node) => node.nodeType === "meeting"),
      "meeting",
    ),
  };
}

export async function enrichCalendarWithKnowledgeGraph(input: {
  userId: string;
  calendar: ExecutiveCalendarIntelligence;
}): Promise<ExecutiveCalendarIntelligence> {
  const membership = await fetchActiveMembership(input.userId);
  if (!membership) return input.calendar;

  await ensureKnowledgeGraphForUser(input.userId);

  const meetingPreparation = await Promise.all(
    input.calendar.meetingPreparation.map(async (prep) => {
      const graphPrep = await getMeetingPreparationFromGraph({
        organizationId: membership.organization.id,
        meetingTitle: prep.meetingTitle,
        meetingId: prep.meetingId,
      });

      return mergeMeetingPreparation(prep, graphPrep);
    }),
  );

  return {
    ...input.calendar,
    meetingPreparation,
    preparationNeeded: meetingPreparation.filter((item) => item.preparationScore >= 60),
  };
}

function mergeMeetingPreparation(
  base: MeetingPreparation,
  graph: Partial<MeetingPreparation>,
): MeetingPreparation {
  const mergeItems = (
    current: MeetingPreparationItem[],
    incoming: MeetingPreparationItem[] | undefined,
  ) => {
    const map = new Map(current.map((item) => [item.id, item]));
    for (const item of incoming ?? []) map.set(item.id, item);
    return Array.from(map.values()).slice(0, 4);
  };

  const enrichedScore =
    base.preparationScore +
    (graph.relatedInitiatives?.length ?? 0) * 5 +
    (graph.relatedDecisions?.length ?? 0) * 5;

  return {
    ...base,
    preparationScore: Math.min(enrichedScore, 100),
    relatedDecisions: mergeItems(base.relatedDecisions, graph.relatedDecisions),
    relatedInitiatives: mergeItems(base.relatedInitiatives, graph.relatedInitiatives),
    relatedRisks: mergeItems(base.relatedRisks, graph.relatedRisks),
    relatedOpportunities: mergeItems(base.relatedOpportunities, graph.relatedOpportunities),
    relevantMemory: mergeItems(base.relevantMemory, graph.relevantMemory),
    previousMeetings: mergeItems(base.previousMeetings, graph.previousMeetings),
  };
}

export async function rebuildKnowledgeGraph(
  userId: string,
): Promise<KnowledgeGraphBuildResult> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new KnowledgeGraphError("Organization membership required.", "NOT_MEMBER");
  }

  return buildKnowledgeGraphForUser(userId, membership.organization.id);
}

export async function getKnowledgeGraphForIntelligence(
  userId: string,
): Promise<KnowledgeGraph> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return new KnowledgeGraph();
  }

  await ensureKnowledgeGraphForUser(userId);

  const [nodes, edges] = await Promise.all([
    fetchKnowledgeNodes(membership.organization.id),
    fetchKnowledgeEdges(membership.organization.id),
  ]);

  return buildKnowledgeGraphFromViews({ nodes, edges });
}
