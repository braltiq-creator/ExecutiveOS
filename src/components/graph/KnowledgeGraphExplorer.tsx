"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  expandGraphNodeAction,
  queryGraphAction,
  rebuildGraphAction,
  searchGraphAction,
} from "@/lib/knowledge/actions";
import type {
  GraphPageData,
  GraphSearchResult,
  KnowledgeGraphNodeView,
  KnowledgeSearchFilter,
} from "@/lib/knowledge/types";
import { formatEdgeType, formatNodeType } from "@/lib/knowledge/types";
import { KnowledgeGraphCanvas } from "@/components/graph/KnowledgeGraphCanvas";

type KnowledgeGraphExplorerProps = {
  data: GraphPageData;
};

const QUICK_QUERIES = [
  { queryType: "meetings_for_initiative", label: "Meetings for initiative", term: "Alpha" },
  { queryType: "decisions_for_person", label: "Decisions for CFO", term: "CFO" },
  { queryType: "risks_blocking_objective", label: "Risks blocking objective", term: "Objective" },
  { queryType: "memory_about_topic", label: "Memory about pricing", term: "pricing" },
];

export function KnowledgeGraphExplorer({ data }: KnowledgeGraphExplorerProps) {
  const router = useRouter();
  const [graph, setGraph] = useState(data.graph);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<KnowledgeSearchFilter | "">("");
  const [searchResults, setSearchResults] = useState<GraphSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId],
  );

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    const ids = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.sourceId === selectedNodeId) ids.add(edge.targetId);
      if (edge.targetId === selectedNodeId) ids.add(edge.sourceId);
    }
    return graph.nodes.filter((node) => ids.has(node.id));
  }, [graph.edges, graph.nodes, selectedNodeId]);

  function handleRebuild() {
    setError(null);
    startTransition(async () => {
      const result = await rebuildGraphAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await searchGraphAction({
        query: searchQuery,
        filter: searchFilter || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSearchResults(result.data ?? []);
    });
  }

  function handleQuickQuery(queryType: string, term: string) {
    setError(null);

    startTransition(async () => {
      const result = await queryGraphAction({ queryType, term });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setGraph({
          nodes: result.data.nodes,
          edges: result.data.edges,
          stats: graph.stats,
        });
      }
    });
  }

  function handleExpandNode(nodeId: string) {
    setError(null);

    startTransition(async () => {
      const result = await expandGraphNodeAction({ nodeId, depth: 1 });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setGraph((current) => mergeGraphViews(current, result.data!));
      }
    });
  }

  function handleToggleCollapse(nodeId: string) {
    setCollapsedNodeIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Knowledge Graph</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Executive Knowledge Graph
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Explore connected executives, meetings, decisions, initiatives, risks, and
            memory across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRebuild}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {isPending ? "Rebuilding..." : "Rebuild graph"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Nodes" value={String(graph.stats.nodeCount)} />
        <StatCard label="Relationships" value={String(graph.stats.edgeCount)} />
        <StatCard
          label="Last built"
          value={
            graph.stats.lastBuiltAt
              ? new Date(graph.stats.lastBuiltAt).toLocaleString()
              : "Not built"
          }
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Search graph</h2>
            <form onSubmit={handleSearch} className="mt-4 space-y-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search people, initiatives, risks..."
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              <select
                value={searchFilter}
                onChange={(event) =>
                  setSearchFilter(event.target.value as KnowledgeSearchFilter | "")
                }
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="">All entities</option>
                <option value="people">People</option>
                <option value="initiatives">Initiatives</option>
                <option value="meetings">Meetings</option>
                <option value="risks">Risks</option>
                <option value="documents">Documents</option>
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <li key={result.node.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(result.node.id)}
                      className="w-full rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-left text-sm hover:bg-zinc-100"
                    >
                      <span className="font-medium text-zinc-900">{result.node.label}</span>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {formatNodeType(result.node.nodeType)} · score{" "}
                        {Math.round(result.score * 100)}%
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Graph queries</h2>
            <div className="mt-4 space-y-2">
              {QUICK_QUERIES.map((query) => (
                <button
                  key={query.queryType}
                  type="button"
                  onClick={() => handleQuickQuery(query.queryType, query.term)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                >
                  {query.label}
                </button>
              ))}
            </div>
          </section>

          {selectedNode ? (
            <NodeDetailPanel
              node={selectedNode}
              connectedNodes={connectedNodes}
              edges={graph.edges}
              onExpand={() => handleExpandNode(selectedNode.id)}
            />
          ) : null}
        </aside>

        <KnowledgeGraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          selectedNodeId={selectedNodeId}
          collapsedNodeIds={collapsedNodeIds}
          onSelectNode={setSelectedNodeId}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
    </div>
  );
}

function NodeDetailPanel({
  node,
  connectedNodes,
  edges,
  onExpand,
}: {
  node: KnowledgeGraphNodeView;
  connectedNodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphExplorerProps["data"]["graph"]["edges"];
  onExpand: () => void;
}) {
  const nodeEdges = edges.filter(
    (edge) => edge.sourceId === node.id || edge.targetId === node.id,
  );

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {formatNodeType(node.nodeType)}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-zinc-900">{node.label}</h2>
      {node.summary ? (
        <p className="mt-2 text-sm leading-6 text-zinc-600">{node.summary}</p>
      ) : null}

      <button
        type="button"
        onClick={onExpand}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-900"
      >
        Expand connections
      </button>

      {connectedNodes.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Connected entities
          </p>
          <ul className="mt-2 space-y-2">
            {connectedNodes.slice(0, 8).map((connected) => (
              <li key={connected.id} className="text-sm text-zinc-700">
                {connected.label}{" "}
                <span className="text-zinc-400">({formatNodeType(connected.nodeType)})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {nodeEdges.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Relationships
          </p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {nodeEdges.slice(0, 6).map((edge) => (
              <li key={edge.id}>{formatEdgeType(edge.edgeType)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function mergeGraphViews(
  current: GraphPageData["graph"],
  incoming: GraphPageData["graph"],
): GraphPageData["graph"] {
  const nodeMap = new Map(current.nodes.map((node) => [node.id, node]));
  for (const node of incoming.nodes) nodeMap.set(node.id, node);

  const edgeMap = new Map(current.edges.map((edge) => [edge.id, edge]));
  for (const edge of incoming.edges) edgeMap.set(edge.id, edge);

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
    stats: current.stats,
  };
}
