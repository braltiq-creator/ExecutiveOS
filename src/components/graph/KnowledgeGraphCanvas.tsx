"use client";

import { useMemo, useRef, useState } from "react";
import type {
  KnowledgeGraphEdgeView,
  KnowledgeGraphNodeView,
  KnowledgeNodeType,
} from "@/lib/knowledge/types";
import { NODE_TYPE_COLORS, formatNodeType } from "@/lib/knowledge/types";

type KnowledgeGraphCanvasProps = {
  nodes: KnowledgeGraphNodeView[];
  edges: KnowledgeGraphEdgeView[];
  selectedNodeId: string | null;
  collapsedNodeIds: Set<string>;
  onSelectNode: (nodeId: string) => void;
  onToggleCollapse: (nodeId: string) => void;
};

type PositionedNode = KnowledgeGraphNodeView & { x: number; y: number };

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 640;

export function KnowledgeGraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  collapsedNodeIds,
  onSelectNode,
  onToggleCollapse,
}: KnowledgeGraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 40, y: 40, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef({ x: 0, y: 0, originX: 0, originY: 0 });

  const positionedNodes = useMemo(
    () => layoutNodes(nodes, collapsedNodeIds),
    [nodes, collapsedNodeIds],
  );

  const visibleNodeIds = new Set(positionedNodes.map((node) => node.id));
  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.sourceId) && visibleNodeIds.has(edge.targetId),
  );

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setTransform((current) => ({
      ...current,
      scale: Math.min(Math.max(current.scale * delta, 0.4), 2.5),
    }));
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.target !== svgRef.current) return;
    setIsPanning(true);
    panOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!isPanning) return;
    setTransform((current) => ({
      ...current,
      x: panOrigin.current.originX + (event.clientX - panOrigin.current.x),
      y: panOrigin.current.originY + (event.clientY - panOrigin.current.y),
    }));
  }

  function handlePointerUp() {
    setIsPanning(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="h-[640px] w-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#fafafa" />
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          {visibleEdges.map((edge) => {
            const source = positionedNodes.find((node) => node.id === edge.sourceId);
            const target = positionedNodes.find((node) => node.id === edge.targetId);
            if (!source || !target) return null;

            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#d4d4d8"
                strokeWidth={1.5}
                opacity={0.8}
              />
            );
          })}

          {positionedNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const color = NODE_TYPE_COLORS[node.nodeType as KnowledgeNodeType] ?? "#71717a";

            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                className="cursor-pointer"
                onClick={() => onSelectNode(node.id)}
                onDoubleClick={() => onToggleCollapse(node.id)}
              >
                <circle
                  r={isSelected ? 18 : 14}
                  fill={color}
                  stroke={isSelected ? "#18181b" : "#ffffff"}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  y={28}
                  textAnchor="middle"
                  className="fill-zinc-700 text-[10px] font-medium"
                >
                  {truncate(node.label, 22)}
                </text>
                <text
                  y={40}
                  textAnchor="middle"
                  className="fill-zinc-400 text-[9px] uppercase tracking-wide"
                >
                  {formatNodeType(node.nodeType)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function layoutNodes(
  nodes: KnowledgeGraphNodeView[],
  collapsedNodeIds: Set<string>,
): PositionedNode[] {
  const visible = nodes.filter((node) => !collapsedNodeIds.has(node.id));
  const grouped = groupByType(visible);
  const types = Object.keys(grouped);
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const positioned: PositionedNode[] = [];

  types.forEach((type, typeIndex) => {
    const ringRadius = 120 + typeIndex * 70;
    const group = grouped[type];

    group.forEach((node, index) => {
      const angle = (index / Math.max(group.length, 1)) * Math.PI * 2;
      positioned.push({
        ...node,
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius,
      });
    });
  });

  return positioned;
}

function groupByType(
  nodes: KnowledgeGraphNodeView[],
): Record<string, KnowledgeGraphNodeView[]> {
  return nodes.reduce<Record<string, KnowledgeGraphNodeView[]>>((acc, node) => {
    acc[node.nodeType] = acc[node.nodeType] ?? [];
    acc[node.nodeType].push(node);
    return acc;
  }, {});
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
