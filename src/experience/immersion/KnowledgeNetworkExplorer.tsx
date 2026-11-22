"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from "react-force-graph-2d";
import { cn } from "@/lib/utils/cn";
import { IntelligenceProvenanceBadge } from "@/experience/immersion/IntelligenceProvenanceBadge";
import type {
  ImmersionNetworkLink,
  ImmersionNetworkModel,
  ImmersionNetworkNode,
} from "@/experience/immersion/types";

const GROUP_STYLE: Record<
  string,
  { fill: string; ring: string; rank: number; label: string }
> = {
  Organisation: {
    fill: "#6a9fd8",
    ring: "rgba(106,159,216,0.45)",
    rank: 0,
    label: "Organisation",
  },
  Factory: {
    fill: "#c4a35a",
    ring: "rgba(196,163,90,0.4)",
    rank: 1,
    label: "Factory",
  },
  Region: {
    fill: "#3d9e8f",
    ring: "rgba(61,158,143,0.4)",
    rank: 2,
    label: "Region",
  },
  MachineModel: {
    fill: "#7aa8d8",
    ring: "rgba(122,168,216,0.35)",
    rank: 3,
    label: "Model",
  },
  Dealer: {
    fill: "#8b7bb8",
    ring: "rgba(139,123,184,0.4)",
    rank: 4,
    label: "Dealer",
  },
  Decision: {
    fill: "#8b7bb8",
    ring: "rgba(139,123,184,0.4)",
    rank: 2,
    label: "Decision",
  },
  Risk: {
    fill: "#c4785a",
    ring: "rgba(196,120,90,0.4)",
    rank: 2,
    label: "Risk",
  },
  Opportunity: {
    fill: "#3d9e8f",
    ring: "rgba(61,158,143,0.4)",
    rank: 2,
    label: "Opportunity",
  },
  default: {
    fill: "#8b93a7",
    ring: "rgba(139,147,167,0.35)",
    rank: 5,
    label: "Entity",
  },
};

const RELATION_LEGEND = [
  { id: "CONTAINS", meaning: "Organisation owns / includes entity" },
  { id: "DEMANDS", meaning: "Region × model co-occurrence in demand" },
  { id: "PLANNED_AT", meaning: "Factory co-occurs with region" },
  { id: "LOCATED_IN", meaning: "Dealer co-occurs with region" },
];

type Props = {
  model: ImmersionNetworkModel;
  className?: string;
};

type GraphNode = NodeObject & ImmersionNetworkNode;
type GraphLink = LinkObject<GraphNode> & ImmersionNetworkLink;

function linkEndId(end: string | GraphNode | undefined): string {
  if (!end) return "";
  if (typeof end === "string") return end;
  return String(end.id ?? "");
}

function nodeRadius(node: GraphNode): number {
  return Math.max(5, Math.sqrt(node.val ?? 4) * 3.8);
}

export function KnowledgeNetworkExplorer({ model, className }: Props) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 900, h: 620 });

  const data = useMemo(() => {
    const byGroup = new Map<string, ImmersionNetworkNode[]>();
    for (const n of model.nodes) {
      const list = byGroup.get(n.group) ?? [];
      list.push(n);
      byGroup.set(n.group, list);
    }
    // Concentric seed so the canvas is used before force settling.
    const nodes = model.nodes.map((n) => {
      const style = GROUP_STYLE[n.group] ?? GROUP_STYLE.default;
      const peers = byGroup.get(n.group) ?? [n];
      const idx = peers.findIndex((p) => p.id === n.id);
      const ring = 40 + style.rank * 95;
      const angle = (idx / Math.max(peers.length, 1)) * Math.PI * 2 - Math.PI / 2;
      return {
        ...n,
        x: Math.cos(angle) * ring,
        y: Math.sin(angle) * ring,
      };
    });
    return {
      nodes,
      links: model.links.map((l) => ({ ...l })),
    };
  }, [model.nodes, model.links]);

  const neighborIds = useMemo(() => {
    const focus = selectedId ?? hoveredId;
    if (!focus) return new Set<string>();
    const set = new Set<string>([focus]);
    for (const l of model.links) {
      const s = linkEndId(l.source as string);
      const t = linkEndId(l.target as string);
      if (s === focus) set.add(t);
      if (t === focus) set.add(s);
    }
    return set;
  }, [model.links, selectedId, hoveredId]);

  const selected = model.nodes.find((n) => n.id === selectedId) ?? null;
  const selectedLinks = model.links.filter((l) => {
    const s = linkEndId(l.source as string);
    const t = linkEndId(l.target as string);
    return s === selectedId || t === selectedId;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        w: Math.max(480, Math.floor(rect.width)),
        h: Math.max(520, Math.floor(rect.height)),
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge") as unknown as {
      strength?: (n: number) => unknown;
    } | undefined;
    charge?.strength?.(-560);
    const link = fg.d3Force("link") as unknown as {
      distance?: (n: number | ((l: unknown) => number)) => unknown;
      strength?: (n: number) => unknown;
    } | undefined;
    link?.distance?.(120);
    link?.strength?.(0.45);
    const center = fg.d3Force("center") as unknown as {
      strength?: (n: number) => unknown;
    } | undefined;
    center?.strength?.(0.04);
  }, [data, size.w, size.h]);

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const style = GROUP_STYLE[node.group] ?? GROUP_STYLE.default;
      const r = nodeRadius(node);
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const isSelected = node.id === selectedId;
      const isHovered = node.id === hoveredId;
      const focusActive = Boolean(selectedId || hoveredId);
      const inFocus = !focusActive || neighborIds.has(String(node.id));
      const alpha = inFocus ? 1 : 0.18;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Soft depth halo for hierarchy
      ctx.beginPath();
      ctx.arc(x, y, r + (isSelected || isHovered ? 7 : 4), 0, Math.PI * 2);
      ctx.fillStyle = style.ring;
      ctx.fill();

      // Core
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
      grad.addColorStop(0, "#f2f5fa");
      grad.addColorStop(0.18, style.fill);
      grad.addColorStop(1, style.fill);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#e8eaef";
        ctx.lineWidth = 2.2 / globalScale;
        ctx.stroke();
      } else if (isHovered) {
        ctx.strokeStyle = "rgba(232,234,239,0.7)";
        ctx.lineWidth = 1.4 / globalScale;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(10,12,16,0.55)";
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();
      }

      // Labels: always org/factory/region; dealers/models only when focused neighbourhood.
      const showLabel =
        isSelected ||
        isHovered ||
        (focusActive && neighborIds.has(String(node.id))) ||
        node.group === "Organisation" ||
        node.group === "Factory" ||
        node.group === "Region";

      if (showLabel && globalScale > 0.45) {
        const fontSize = Math.max(10, 11.5 / Math.min(globalScale, 1.35));
        ctx.font = `500 ${fontSize}px "IBM Plex Sans", "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const label = node.label;
        const padX = 5;
        const padY = 2;
        const tw = ctx.measureText(label).width;
        const lx = x - tw / 2 - padX;
        const ly = y + r + 4;
        ctx.fillStyle = "rgba(10,12,16,0.82)";
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, tw + padX * 2, fontSize + padY * 2, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = inFocus ? "#e8eaef" : "#8b93a7";
        ctx.fillText(label, x, ly + padY);
      }

      ctx.restore();
    },
    [hoveredId, neighborIds, selectedId],
  );

  const paintLink = useCallback(
    (link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const s = link.source as GraphNode;
      const t = link.target as GraphNode;
      if (s?.x == null || t?.x == null) return;
      const sId = String(s.id);
      const tId = String(t.id);
      const focusActive = Boolean(selectedId || hoveredId);
      const connected =
        !focusActive ||
        (neighborIds.has(sId) && neighborIds.has(tId));
      const hot =
        selectedId != null &&
        (sId === selectedId || tId === selectedId);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.x, s.y!);
      ctx.lineTo(t.x, t.y!);
      ctx.strokeStyle = hot
        ? "rgba(106,159,216,0.85)"
        : connected
          ? "rgba(106,159,216,0.32)"
          : "rgba(106,159,216,0.06)";
      ctx.lineWidth = (hot ? 1.8 : 1) / globalScale;
      ctx.stroke();
      ctx.restore();
    },
    [hoveredId, neighborIds, selectedId],
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
        <div className="flex flex-wrap gap-2">
          <IntelligenceProvenanceBadge provenance="derived" />
          {model.demonstrationData ? (
            <span
              className="inline-flex items-center rounded-[4px] border border-[color-mix(in_srgb,#c4785a_50%,transparent)] px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-[#c4785a]"
              data-demo-disclosure="true"
            >
              Demonstration fixture · not live customer intelligence
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div
          ref={containerRef}
          className="relative h-[min(72vh,680px)] min-h-[520px] bg-[#0a0c10]"
          data-knowledge-network-canvas="true"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 40%, rgba(106,159,216,0.08), transparent 55%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "auto, 48px 48px, 48px 48px",
            }}
            aria-hidden
          />
          <ForceGraph2D
            ref={graphRef}
            width={size.w}
            height={size.h}
            graphData={data}
            nodeId="id"
            nodeCanvasObject={paintNode}
            nodeCanvasObjectMode={() => "replace"}
            nodePointerAreaPaint={(node, color, ctx) => {
              const r = nodeRadius(node as GraphNode) + 4;
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkCanvasObject={paintLink}
            linkCanvasObjectMode={() => "replace"}
            backgroundColor="rgba(0,0,0,0)"
            onNodeClick={(node) => setSelectedId(String(node.id))}
            onNodeHover={(node) =>
              setHoveredId(node ? String(node.id) : null)
            }
            onBackgroundClick={() => {
              setSelectedId(null);
              setHoveredId(null);
            }}
            cooldownTicks={140}
            warmupTicks={60}
            enableNodeDrag
            onEngineStop={() => {
              graphRef.current?.zoomToFit(600, 96);
              window.setTimeout(() => {
                graphRef.current?.zoomToFit(400, 88);
              }, 180);
            }}
          />

          <div
            className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2"
            aria-label="Network legend"
          >
            <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_86%,transparent)] px-3 py-2 backdrop-blur-md">
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Entity types
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {Object.entries(GROUP_STYLE)
                  .filter(([k]) =>
                    ["Organisation", "Factory", "Region", "MachineModel", "Dealer"].includes(
                      k,
                    ),
                  )
                  .map(([key, style]) => (
                    <li
                      key={key}
                      className="flex items-center gap-1.5 text-[0.7rem] text-[#e8eaef]"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: style.fill }}
                      />
                      {style.label}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="pointer-events-auto rounded-lg border border-[color-mix(in_srgb,white_10%,transparent)] bg-[color-mix(in_srgb,#0a0c10_86%,transparent)] px-3 py-2 backdrop-blur-md">
              <p className="text-[0.62rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                Relationships
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {RELATION_LEGEND.map((r) => (
                  <li key={r.id} className="text-[0.68rem] text-[#c5cad6]">
                    <span className="font-medium text-[#6a9fd8]">{r.id}</span>
                    <span className="text-[#8b93a7]"> — {r.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="max-h-[min(72vh,680px)] overflow-y-auto border-t border-[color-mix(in_srgb,white_8%,transparent)] p-4 lg:border-l lg:border-t-0">
          {!selected ? (
            <div className="space-y-3 text-sm text-[#8b93a7]">
              <p className="text-[0.65rem] uppercase tracking-[0.08em]">
                Inspection
              </p>
              <p>
                Select an entity to reveal relationships, evidence sources,
                provenance and significance. Hover to preview neighbourhood
                connections.
              </p>
              <p className="text-[0.75rem]">
                {model.nodes.length} entities · {model.links.length} relationships
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-network-provenance-panel="true">
              <div className="flex flex-wrap gap-1.5">
                <IntelligenceProvenanceBadge provenance={selected.provenance} />
                {selected.disclosure ? (
                  <span className="inline-flex items-center rounded-[4px] border border-[color-mix(in_srgb,#c4785a_45%,transparent)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.06em] text-[#c4785a]">
                    Demo fixture
                  </span>
                ) : null}
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  {selected.group}
                </p>
                <p className="mt-1 text-[1.1rem] font-semibold leading-snug">
                  {selected.label}
                </p>
                {selected.summary ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#b7becc]">
                    {selected.summary}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Significance
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#e8eaef]">
                  {selected.significance ??
                    "Significance not established beyond entity presence."}
                </p>
              </div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Evidence sources
                </p>
                <ul className="mt-1.5 space-y-1">
                  {(selected.evidenceSources?.length
                    ? selected.evidenceSources
                    : ["No explicit evidence source list on this node"]
                  ).map((src) => (
                    <li
                      key={src}
                      className="rounded border border-[color-mix(in_srgb,white_8%,transparent)] px-2 py-1.5 text-[0.75rem] text-[#c5cad6]"
                    >
                      {src}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.08em] text-[#8b93a7]">
                  Relationships ({selectedLinks.length})
                </p>
                <ul className="mt-2 space-y-1.5">
                  {selectedLinks.length === 0 ? (
                    <li className="text-sm text-[#8b93a7]">No edges</li>
                  ) : (
                    selectedLinks.map((l, i) => {
                      const sourceId = linkEndId(l.source as string);
                      const targetId = linkEndId(l.target as string);
                      const other =
                        sourceId === selected.id ? targetId : sourceId;
                      const otherNode = model.nodes.find((n) => n.id === other);
                      const otherStyle =
                        GROUP_STYLE[otherNode?.group ?? ""] ??
                        GROUP_STYLE.default;
                      return (
                        <li key={`${sourceId}-${targetId}-${i}`}>
                          <button
                            type="button"
                            className="w-full rounded-lg border border-[color-mix(in_srgb,white_8%,transparent)] px-2.5 py-2 text-left transition-colors hover:border-[color-mix(in_srgb,#6a9fd8_45%,transparent)]"
                            onClick={() => setSelectedId(other)}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: otherStyle.fill }}
                              />
                              <span className="text-[0.65rem] uppercase tracking-[0.06em] text-[#6a9fd8]">
                                {l.label}
                              </span>
                            </span>
                            <span className="mt-1 block text-sm font-medium text-[#e8eaef]">
                              {otherNode?.label ?? other}
                            </span>
                            {l.basis ? (
                              <span className="mt-1 block text-[0.7rem] leading-snug text-[#8b93a7]">
                                {l.basis}
                              </span>
                            ) : null}
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
