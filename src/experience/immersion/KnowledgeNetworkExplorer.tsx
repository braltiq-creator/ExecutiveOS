"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ForceGraph2D, {
  type ForceGraphMethods,
  type NodeObject,
} from "react-force-graph-2d";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import type {
  ImmersionNetworkModel,
  ImmersionNetworkNode,
} from "@/experience/immersion/types";

const GROUP_COLOR: Record<string, string> = {
  Organisation: "#6a9fd8",
  Region: "#3d9e8f",
  Factory: "#c4a35a",
  Dealer: "#8b7bb8",
  MachineModel: "#6a9fd8",
  Decision: "#8b7bb8",
  Risk: "#c4785a",
  Opportunity: "#3d9e8f",
  default: "#8b93a7",
};

type Props = {
  model: ImmersionNetworkModel;
  className?: string;
};

type GraphNode = NodeObject & ImmersionNetworkNode;

export function KnowledgeNetworkExplorer({ model, className }: Props) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(
    () => ({
      nodes: model.nodes.map((n) => ({ ...n })),
      links: model.links.map((l) => ({ ...l })),
    }),
    [model.nodes, model.links],
  );

  const selected = model.nodes.find((n) => n.id === selectedId) ?? null;
  const selectedLinks = model.links.filter(
    (l) =>
      l.source === selectedId ||
      l.target === selectedId ||
      (typeof l.source === "object" &&
        (l.source as { id?: string }).id === selectedId) ||
      (typeof l.target === "object" &&
        (l.target as { id?: string }).id === selectedId),
  );

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label;
      const fontSize = 12 / globalScale;
      const r = Math.sqrt(node.val ?? 4) * 3.2;
      const color = GROUP_COLOR[node.group] ?? GROUP_COLOR.default;
      const isSelected = node.id === selectedId;

      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = isSelected ? 1 : 0.85;
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = "#e8eaef";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (globalScale > 0.7) {
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#e8eaef";
        ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + r + 2);
      }
    },
    [selectedId],
  );

  if (model.emptyReason || model.nodes.length === 0) {
    return (
      <section
        className={cn(
          "rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)] bg-[#12151c] p-6",
          className,
        )}
        data-knowledge-network="empty"
      >
        <IntelligenceProvenanceBadge provenance="insufficient" />
        <p className="mt-3 text-[1.05rem] font-semibold">{model.title}</p>
        <p className="mt-2 text-sm text-[#8b93a7]">
          {model.emptyReason ??
            "No verified knowledge graph entities for this organisation yet."}
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,white_8%,transparent)] bg-[#12151c]",
        className,
      )}
      data-knowledge-network="true"
      aria-label={model.title}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color-mix(in_srgb,white_8%,transparent)] px-4 py-3">
        <div>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[#6a9fd8]">
            Explore network
          </p>
          <h3 className="mt-1 text-[1.05rem] font-semibold tracking-tight">
            {model.title}
          </h3>
          <p className="mt-1 text-[0.75rem] text-[#8b93a7]">{model.sourceLabel}</p>
        </div>
        <IntelligenceProvenanceBadge provenance="derived" />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div ref={containerRef} className="relative h-[min(64vh,560px)] bg-[#0a0c10]">
          <ForceGraph2D
            ref={graphRef}
            graphData={data}
            nodeId="id"
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node, color, ctx) => {
              const r = Math.sqrt((node as GraphNode).val ?? 4) * 3.2;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkColor={() => "rgba(106, 159, 216, 0.28)"}
            linkWidth={1}
            backgroundColor="#0a0c10"
            onNodeClick={(node) => setSelectedId(String(node.id))}
            onBackgroundClick={() => setSelectedId(null)}
            cooldownTicks={80}
            onEngineStop={() => graphRef.current?.zoomToFit(400, 48)}
          />
        </div>

        <aside className="border-t border-[color-mix(in_srgb,white_8%,transparent)] p-4 lg:border-l lg:border-t-0">
          {!selected ? (
            <p className="text-sm text-[#8b93a7]">
              Select a node to inspect relationships and provenance.
            </p>
          ) : (
            <div className="space-y-3" data-network-provenance-panel="true">
              <IntelligenceProvenanceBadge provenance={selected.provenance} />
              <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                {selected.group}
              </p>
              <p className="text-[1rem] font-semibold leading-snug">
                {selected.label}
              </p>
              {selected.summary ? (
                <p className="text-sm text-[#8b93a7]">{selected.summary}</p>
              ) : null}
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Relationships
                </p>
                <ul className="mt-2 space-y-1.5">
                  {selectedLinks.length === 0 ? (
                    <li className="text-sm text-[#8b93a7]">No edges</li>
                  ) : (
                    selectedLinks.map((l, i) => {
                      const sourceId =
                        typeof l.source === "string"
                          ? l.source
                          : String((l.source as { id?: string }).id ?? "");
                      const targetId =
                        typeof l.target === "string"
                          ? l.target
                          : String((l.target as { id?: string }).id ?? "");
                      const other =
                        sourceId === selected.id ? targetId : sourceId;
                      const otherNode = model.nodes.find((n) => n.id === other);
                      return (
                        <li key={`${sourceId}-${targetId}-${i}`}>
                          <button
                            type="button"
                            className="w-full rounded border border-[color-mix(in_srgb,white_8%,transparent)] px-2 py-1.5 text-left text-sm hover:border-[#6a9fd8]/40"
                            onClick={() => setSelectedId(other)}
                          >
                            <span className="text-[0.65rem] uppercase tracking-[0.06em] text-[#6a9fd8]">
                              {l.label}
                            </span>
                            <span className="mt-0.5 block">
                              {otherNode?.label ?? other}
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
