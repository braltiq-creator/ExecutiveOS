import { createClient } from "@/lib/supabase/server";
import type {
  GraphSnapshotRecord,
  KnowledgeEdgeRecord,
  KnowledgeGraphEdgeView,
  KnowledgeGraphNodeView,
  KnowledgeIndexRecord,
  KnowledgeNodeRecord,
} from "@/lib/knowledge/types";

function mapNode(record: KnowledgeNodeRecord): KnowledgeGraphNodeView {
  return {
    id: record.id,
    nodeType: record.node_type,
    label: record.label,
    summary: record.summary,
    sourceType: record.source_type,
    sourceId: record.source_id,
    metadata: record.metadata_json,
  };
}

function mapEdge(record: KnowledgeEdgeRecord): KnowledgeGraphEdgeView {
  return {
    id: record.id,
    sourceId: record.source_node_id,
    targetId: record.target_node_id,
    edgeType: record.edge_type,
    weight: Number(record.weight),
  };
}

export async function fetchKnowledgeNodes(
  organizationId: string,
): Promise<KnowledgeGraphNodeView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as KnowledgeNodeRecord[]).map(mapNode);
}

export async function fetchKnowledgeEdges(
  organizationId: string,
): Promise<KnowledgeGraphEdgeView[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_edges")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  return (data as KnowledgeEdgeRecord[]).map(mapEdge);
}

export async function fetchKnowledgeNodeById(
  nodeId: string,
): Promise<KnowledgeGraphNodeView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("*")
    .eq("id", nodeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapNode(data as KnowledgeNodeRecord) : null;
}

export async function fetchLatestGraphSnapshot(
  organizationId: string,
): Promise<GraphSnapshotRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("graph_snapshots")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as GraphSnapshotRecord | null) ?? null;
}

export async function fetchKnowledgeIndexEntries(
  organizationId: string,
): Promise<Array<KnowledgeIndexRecord & { node: KnowledgeGraphNodeView }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_index")
    .select("*, knowledge_nodes!inner(*)")
    .eq("knowledge_nodes.organization_id", organizationId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const record = row as KnowledgeIndexRecord & { knowledge_nodes: KnowledgeNodeRecord };
    return {
      ...record,
      node: mapNode(record.knowledge_nodes),
    };
  });
}

export async function upsertKnowledgeNode(input: {
  organizationId: string;
  userId: string;
  nodeType: KnowledgeNodeRecord["node_type"];
  sourceType: string;
  sourceId: string;
  label: string;
  summary?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<KnowledgeNodeRecord> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("knowledge_nodes")
    .upsert(
      {
        organization_id: input.organizationId,
        user_id: input.userId,
        node_type: input.nodeType,
        source_type: input.sourceType,
        source_id: input.sourceId,
        label: input.label,
        summary: input.summary ?? null,
        metadata_json: input.metadata ?? {},
        updated_at: now,
      },
      { onConflict: "organization_id,node_type,source_type,source_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as KnowledgeNodeRecord;
}

export async function upsertKnowledgeEdge(input: {
  organizationId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: KnowledgeEdgeRecord["edge_type"];
  weight?: number;
  metadata?: Record<string, unknown>;
}): Promise<KnowledgeEdgeRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_edges")
    .upsert(
      {
        organization_id: input.organizationId,
        source_node_id: input.sourceNodeId,
        target_node_id: input.targetNodeId,
        edge_type: input.edgeType,
        weight: input.weight ?? 1,
        metadata_json: input.metadata ?? {},
      },
      { onConflict: "organization_id,source_node_id,target_node_id,edge_type" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as KnowledgeEdgeRecord;
}

export async function replaceKnowledgeLabels(
  nodeId: string,
  labels: string[],
): Promise<void> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("knowledge_labels")
    .delete()
    .eq("node_id", nodeId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (labels.length === 0) return;

  const { error } = await supabase.from("knowledge_labels").insert(
    labels.map((label) => ({ node_id: nodeId, label })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertKnowledgeIndex(input: {
  nodeId: string;
  searchText: string;
}): Promise<void> {
  const supabase = await createClient();
  const tokens = input.searchText.split(/\s+/).filter(Boolean);

  const { error } = await supabase.from("knowledge_index").upsert(
    {
      node_id: input.nodeId,
      search_text: input.searchText,
      token_count: tokens.length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "node_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertGraphSnapshot(input: {
  organizationId: string;
  userId: string;
  nodeCount: number;
  edgeCount: number;
  snapshotJson: Record<string, unknown>;
}): Promise<GraphSnapshotRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("graph_snapshots")
    .insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      node_count: input.nodeCount,
      edge_count: input.edgeCount,
      snapshot_json: input.snapshotJson,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GraphSnapshotRecord;
}

export async function clearKnowledgeGraph(organizationId: string): Promise<void> {
  const supabase = await createClient();

  const { error: edgeError } = await supabase
    .from("knowledge_edges")
    .delete()
    .eq("organization_id", organizationId);

  if (edgeError) {
    throw new Error(edgeError.message);
  }

  const { error: nodeError } = await supabase
    .from("knowledge_nodes")
    .delete()
    .eq("organization_id", organizationId);

  if (nodeError) {
    throw new Error(nodeError.message);
  }
}
