import React, { useState } from "react";
import type { MindmapNode, MindmapEdge } from "@/types";
import { Network, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MindmapViewProps {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export function MindmapView({ nodes, edges }: MindmapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        No mind map nodes generated.
      </div>
    );
  }

  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const rootNode = nodes[0];
  const otherNodes = nodes.slice(1);

  const nodePositions: Record<string, { x: number; y: number }> = {
    [rootNode.id]: { x: centerX, y: centerY },
  };

  const radius = Math.min(width, height) * 0.35;
  otherNodes.forEach((node, idx) => {
    const angle = (idx / otherNodes.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative flex flex-col items-center w-full h-[520px] rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-xl border border-border bg-surface/90 p-1 backdrop-blur-xs shadow-2xs">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
          className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-secondary cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
          className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-secondary cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-secondary cursor-pointer"
          title="Reset Zoom"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-muted">
        <Network className="h-3.5 w-3.5 text-accent" />
        <span>{nodes.length} Concept Nodes</span>
      </div>

      {/* SVG Canvas */}
      <div className="w-full h-full flex items-center justify-center overflow-auto cursor-grab">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-w-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Render Edges */}
          {edges.map((edge) => {
            const start = nodePositions[edge.source] || nodePositions[rootNode.id];
            const end = nodePositions[edge.target];
            if (!start || !end) return null;

            const isHighlighted =
              hoveredNode === edge.source || hoveredNode === edge.target;

            return (
              <line
                key={edge.id}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isHighlighted ? "#C86B16" : "rgba(128, 128, 128, 0.25)"}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={isHighlighted ? "none" : "4 2"}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node, idx) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const isRoot = idx === 0;
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x={isRoot ? -75 : -60}
                  y={isRoot ? -20 : -16}
                  width={isRoot ? 150 : 120}
                  height={isRoot ? 40 : 32}
                  rx={isRoot ? 10 : 8}
                  fill={isRoot ? "var(--accent)" : isHovered ? "var(--surface-elevated)" : "var(--surface)"}
                  stroke={
                    isRoot
                      ? "var(--accent)"
                      : isHovered
                      ? "var(--accent)"
                      : "var(--border)"
                  }
                  strokeWidth={isHovered || isRoot ? 2 : 1}
                  className="transition-all duration-200"
                />

                <text
                  textAnchor="middle"
                  dy={isRoot ? 5 : 4}
                  fill={isRoot ? "#ffffff" : isHovered ? "var(--accent)" : "var(--foreground)"}
                  fontSize={isRoot ? 12 : 10}
                  fontWeight={isRoot ? 700 : 500}
                  className="pointer-events-none select-none font-sans"
                >
                  {node.label.length > 18
                    ? `${node.label.slice(0, 16)}...`
                    : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
