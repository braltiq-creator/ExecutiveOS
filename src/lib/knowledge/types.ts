export const KNOWLEDGE_NODE_TYPES = [
  "executive",
  "organization",
  "department",
  "person",
  "meeting",
  "decision",
  "initiative",
  "objective",
  "risk",
  "opportunity",
  "action",
  "memory",
  "calendar_event",
  "email",
  "document",
  "crm_opportunity",
  "task",
] as const;

export const KNOWLEDGE_EDGE_TYPES = [
  "owns",
  "attended",
  "related_to",
  "created",
  "assigned_to",
  "blocks",
  "supports",
  "depends_on",
  "references",
  "generated",
  "connected_to",
] as const;

export const KNOWLEDGE_SEARCH_FILTERS = [
  "people",
  "initiatives",
  "meetings",
  "risks",
  "documents",
] as const;

export type KnowledgeNodeType = (typeof KNOWLEDGE_NODE_TYPES)[number];
export type KnowledgeEdgeType = (typeof KNOWLEDGE_EDGE_TYPES)[number];
export type KnowledgeSearchFilter = (typeof KNOWLEDGE_SEARCH_FILTERS)[number];

export type KnowledgeNodeRecord = {
  id: string;
  organization_id: string;
  user_id: string;
  node_type: KnowledgeNodeType;
  source_type: string;
  source_id: string;
  label: string;
  summary: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type KnowledgeEdgeRecord = {
  id: string;
  organization_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: KnowledgeEdgeType;
  weight: number;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type KnowledgeLabelRecord = {
  id: string;
  node_id: string;
  label: string;
  created_at: string;
};

export type KnowledgeIndexRecord = {
  id: string;
  node_id: string;
  search_text: string;
  token_count: number;
  updated_at: string;
};

export type GraphSnapshotRecord = {
  id: string;
  organization_id: string;
  user_id: string;
  node_count: number;
  edge_count: number;
  snapshot_json: Record<string, unknown>;
  created_at: string;
};

export type KnowledgeNodeInput = {
  nodeType: KnowledgeNodeType;
  sourceType: string;
  sourceId: string;
  label: string;
  summary?: string | null;
  metadata?: Record<string, unknown>;
  labels?: string[];
};

export type KnowledgeEdgeInput = {
  sourceKey: string;
  targetKey: string;
  edgeType: KnowledgeEdgeType;
  weight?: number;
  metadata?: Record<string, unknown>;
};

export type KnowledgeGraphNodeView = {
  id: string;
  nodeType: KnowledgeNodeType;
  label: string;
  summary: string | null;
  sourceType: string;
  sourceId: string;
  metadata: Record<string, unknown>;
};

export type KnowledgeGraphEdgeView = {
  id: string;
  sourceId: string;
  targetId: string;
  edgeType: KnowledgeEdgeType;
  weight: number;
};

export type KnowledgeGraphView = {
  nodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphEdgeView[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    lastBuiltAt: string | null;
  };
};

export type GraphSearchResult = {
  node: KnowledgeGraphNodeView;
  score: number;
  matchedTerms: string[];
};

export type GraphQueryResult = {
  query: string;
  nodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphEdgeView[];
};

export type GraphPageData = {
  graph: KnowledgeGraphView;
  organizationId: string;
};

export type KnowledgeGraphBuildResult = {
  nodeCount: number;
  edgeCount: number;
  snapshotId: string;
};

export class KnowledgeGraphError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "KnowledgeGraphError";
    this.code = code;
  }
}

export function nodeKey(sourceType: string, sourceId: string): string {
  return `${sourceType}:${sourceId}`;
}

export function formatNodeType(nodeType: KnowledgeNodeType): string {
  return nodeType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatEdgeType(edgeType: KnowledgeEdgeType): string {
  return edgeType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const NODE_TYPE_COLORS: Record<KnowledgeNodeType, string> = {
  executive: "#18181b",
  organization: "#3f3f46",
  department: "#71717a",
  person: "#2563eb",
  meeting: "#7c3aed",
  decision: "#059669",
  initiative: "#d97706",
  objective: "#dc2626",
  risk: "#b91c1c",
  opportunity: "#0891b2",
  action: "#4f46e5",
  memory: "#9333ea",
  calendar_event: "#6366f1",
  email: "#0284c7",
  document: "#78716c",
  crm_opportunity: "#0d9488",
  task: "#65a30d",
};

export const SEARCH_FILTER_NODE_TYPES: Record<
  KnowledgeSearchFilter,
  KnowledgeNodeType[]
> = {
  people: ["person", "executive"],
  initiatives: ["initiative", "objective"],
  meetings: ["meeting", "calendar_event"],
  risks: ["risk"],
  documents: ["document", "email", "memory"],
};
