import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { MindmapNode, MindmapEdge } from "@/types";
import { Network, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

interface MindmapViewProps {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

interface LayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  branchIndex: number;
  parentId: string | null;
  childIds: string[];
  angle: number;
  radius: number;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  path: string;
  branchIndex: number;
}

// 5 distinct category colors mapping to tokens with high-contrast edge highlights
const BRANCH_PALETTES = [
  {
    color: "var(--category-sources)",      // Blue
    highlight: "var(--category-artifacts)", // Orange
    name: "sources",
  },
  {
    color: "var(--category-chat)",         // Green
    highlight: "var(--category-memories)",  // Pink
    name: "chat",
  },
  {
    color: "var(--category-artifacts)",    // Orange
    highlight: "var(--category-sources)",   // Blue
    name: "artifacts",
  },
  {
    color: "var(--category-memories)",     // Pink
    highlight: "var(--category-chat)",      // Green
    name: "memories",
  },
  {
    color: "var(--category-workspaces)",   // Lilac
    highlight: "var(--category-artifacts)", // Orange
    name: "workspaces",
  },
];

export function MindmapView({ nodes, edges }: MindmapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Compute Tree Layout
  const { layoutNodes, layoutEdges, bounds, centerX, centerY } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return {
        layoutNodes: [] as LayoutNode[],
        layoutEdges: [] as LayoutEdge[],
        bounds: { minX: 0, maxX: 800, minY: 0, maxY: 520, width: 800, height: 520 },
        centerX: 400,
        centerY: 260,
      };
    }

    const cX = 500;
    const cY = 360;

    // 1. Identify in-degree and adjacency
    const inDegree: Record<string, number> = {};
    const childrenMap: Record<string, string[]> = {};
    const validNodeIds = new Set(nodes.map((n) => n.id));

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      childrenMap[n.id] = [];
    });

    edges.forEach((e) => {
      if (validNodeIds.has(e.source) && validNodeIds.has(e.target) && e.source !== e.target) {
        inDegree[e.target] = (inDegree[e.target] || 0) + 1;
        childrenMap[e.source].push(e.target);
      }
    });

    // 2. Identify Root
    let rootId = nodes[0].id;
    for (const n of nodes) {
      if (inDegree[n.id] === 0) {
        rootId = n.id;
        break;
      }
    }

    // 3. BFS to compute levels and parent hierarchy
    const levels: Record<string, number> = { [rootId]: 0 };
    const parents: Record<string, string | null> = { [rootId]: null };
    const visited = new Set<string>([rootId]);
    const queue = [rootId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const currLevel = levels[curr];
      const kids = childrenMap[curr] || [];
      for (const kid of kids) {
        if (!visited.has(kid)) {
          visited.add(kid);
          levels[kid] = currLevel + 1;
          parents[kid] = curr;
          queue.push(kid);
        }
      }
    }

    // Connect any disconnected nodes to root so nothing is dropped
    nodes.forEach((n) => {
      if (!visited.has(n.id)) {
        visited.add(n.id);
        levels[n.id] = 1;
        parents[n.id] = rootId;
        childrenMap[rootId].push(n.id);
      }
    });

    // Level-1 nodes (direct branches)
    const level1NodeIds = childrenMap[rootId] || [];
    const branchMap: Record<string, number> = {};
    level1NodeIds.forEach((id, idx) => {
      branchMap[id] = idx % BRANCH_PALETTES.length;
    });

    // Propagate branch index to all descendants
    const assignBranch = (nodeId: string, bIdx: number) => {
      const kids = childrenMap[nodeId] || [];
      for (const kid of kids) {
        branchMap[kid] = bIdx;
        assignBranch(kid, bIdx);
      }
    };
    level1NodeIds.forEach((id) => {
      assignBranch(id, branchMap[id]);
    });

    // Count descendant weights for angular wedge allocation
    const countSubtree = (nodeId: string): number => {
      const kids = childrenMap[nodeId] || [];
      let count = kids.length;
      for (const kid of kids) {
        count += countSubtree(kid);
      }
      return count;
    };

    const branchWeights = level1NodeIds.map((id) => Math.max(1.5, countSubtree(id)));
    const totalWeight = branchWeights.reduce((a, b) => a + b, 0) || 1;

    // Dimensions helper
    const getNodeDim = (label: string, level: number) => {
      if (level === 0) {
        const width = Math.max(140, Math.min(200, label.length * 9 + 40));
        return { width, height: 42 };
      }
      if (level === 1) {
        const width = Math.max(110, Math.min(160, label.length * 8 + 32));
        return { width, height: 36 };
      }
      const width = Math.max(88, Math.min(145, label.length * 7.5 + 24));
      return { width, height: 30 };
    };

    // Calculate radii
    const r1 = Math.max(190, Math.min(240, 160 + level1NodeIds.length * 10));
    const r2Base = r1 + 175;

    const computedNodes: Record<string, LayoutNode> = {};

    // Position Root
    const rootNode = nodes.find((n) => n.id === rootId) || nodes[0];
    const rootDim = getNodeDim(rootNode.label, 0);
    computedNodes[rootId] = {
      id: rootId,
      label: rootNode.label,
      x: cX,
      y: cY,
      width: rootDim.width,
      height: rootDim.height,
      level: 0,
      branchIndex: 0,
      parentId: null,
      childIds: childrenMap[rootId],
      angle: 0,
      radius: 0,
    };

    // Position Level 1 and descendants in angular wedges
    let currentAngle = -Math.PI / 2; // Start from top

    level1NodeIds.forEach((l1Id, i) => {
      const weight = branchWeights[i];
      const wedgeSpan = (weight / totalWeight) * (2 * Math.PI);
      const l1Angle = currentAngle + wedgeSpan / 2;
      const bIdx = branchMap[l1Id] ?? (i % BRANCH_PALETTES.length);

      const l1NodeObj = nodes.find((n) => n.id === l1Id)!;
      const l1Dim = getNodeDim(l1NodeObj.label, 1);
      const l1X = cX + r1 * Math.cos(l1Angle);
      const l1Y = cY + r1 * Math.sin(l1Angle);

      computedNodes[l1Id] = {
        id: l1Id,
        label: l1NodeObj.label,
        x: l1X,
        y: l1Y,
        width: l1Dim.width,
        height: l1Dim.height,
        level: 1,
        branchIndex: bIdx,
        parentId: rootId,
        childIds: childrenMap[l1Id] || [],
        angle: l1Angle,
        radius: r1,
      };

      // Position Level 2 children of this branch
      const l2Children = childrenMap[l1Id] || [];
      if (l2Children.length > 0) {
        const padSpan = wedgeSpan * 0.12;
        const usableSpan = wedgeSpan - 2 * padSpan;

        l2Children.forEach((l2Id, k) => {
          const childAngle =
            l2Children.length === 1
              ? l1Angle
              : currentAngle + padSpan + (k / (l2Children.length - 1)) * usableSpan;

          // Radial stagger (alternate +32px) to prevent adjacent collision
          const staggeredR2 = r2Base + (k % 2 === 1 ? 34 : 0);

          const l2NodeObj = nodes.find((n) => n.id === l2Id)!;
          const l2Dim = getNodeDim(l2NodeObj.label, 2);
          const l2X = cX + staggeredR2 * Math.cos(childAngle);
          const l2Y = cY + staggeredR2 * Math.sin(childAngle);

          computedNodes[l2Id] = {
            id: l2Id,
            label: l2NodeObj.label,
            x: l2X,
            y: l2Y,
            width: l2Dim.width,
            height: l2Dim.height,
            level: 2,
            branchIndex: bIdx,
            parentId: l1Id,
            childIds: childrenMap[l2Id] || [],
            angle: childAngle,
            radius: staggeredR2,
          };

          // Level 3 grandchildren (if any)
          const l3Children = childrenMap[l2Id] || [];
          if (l3Children.length > 0) {
            const r3 = staggeredR2 + 140;
            l3Children.forEach((l3Id, m) => {
              const l3Angle = childAngle + (m - (l3Children.length - 1) / 2) * 0.15;
              const l3NodeObj = nodes.find((n) => n.id === l3Id)!;
              const l3Dim = getNodeDim(l3NodeObj.label, 3);
              computedNodes[l3Id] = {
                id: l3Id,
                label: l3NodeObj.label,
                x: cX + r3 * Math.cos(l3Angle),
                y: cY + r3 * Math.sin(l3Angle),
                width: l3Dim.width,
                height: l3Dim.height,
                level: 3,
                branchIndex: bIdx,
                parentId: l2Id,
                childIds: childrenMap[l3Id] || [],
                angle: l3Angle,
                radius: r3,
              };
            });
          }
        });
      }

      currentAngle += wedgeSpan;
    });

    // Collision avoidance pass (repulsion between non-root nodes)
    const nodeList = Object.values(computedNodes);
    for (let iter = 0; iter < 4; iter++) {
      for (let a = 0; a < nodeList.length; a++) {
        for (let b = a + 1; b < nodeList.length; b++) {
          const nodeA = nodeList[a];
          const nodeB = nodeList[b];
          if (nodeA.level === 0 || nodeB.level === 0) continue;

          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.hypot(dx, dy);
          const minSeparation = (nodeA.width + nodeB.width) / 2 + 16;

          if (dist < minSeparation && dist > 0.001) {
            const overlap = (minSeparation - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            nodeB.x += nx * overlap * 0.7;
            nodeB.y += ny * overlap * 0.7;
            nodeA.x -= nx * overlap * 0.7;
            nodeA.y -= ny * overlap * 0.7;
          }
        }
      }
    }

    // Compute Bézier edges
    const computedEdges: LayoutEdge[] = [];
    nodeList.forEach((node) => {
      if (!node.parentId) return;
      const parentNode = computedNodes[node.parentId];
      if (!parentNode) return;

      const pX = parentNode.x;
      const pY = parentNode.y;
      const cXNode = node.x;
      const cYNode = node.y;

      let path = "";
      if (parentNode.level === 0) {
        // From root to level 1: smooth outward curve
        const cp1x = cX + (node.radius * 0.35) * Math.cos(node.angle);
        const cp1y = cY + (node.radius * 0.35) * Math.sin(node.angle);
        const cp2x = cX + (node.radius * 0.75) * Math.cos(node.angle);
        const cp2y = cY + (node.radius * 0.75) * Math.sin(node.angle);
        path = `M ${pX} ${pY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cXNode} ${cYNode}`;
      } else {
        // Radial dendrogram curve
        const midR = (parentNode.radius + node.radius) / 2;
        const cp1x = cX + midR * Math.cos(parentNode.angle);
        const cp1y = cY + midR * Math.sin(parentNode.angle);
        const cp2x = cX + midR * Math.cos(node.angle);
        const cp2y = cY + midR * Math.sin(node.angle);
        path = `M ${pX} ${pY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cXNode} ${cYNode}`;
      }

      computedEdges.push({
        id: `${parentNode.id}->${node.id}`,
        source: parentNode.id,
        target: node.id,
        path,
        branchIndex: node.branchIndex,
      });
    });

    // Compute bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodeList.forEach((n) => {
      minX = Math.min(minX, n.x - n.width / 2);
      maxX = Math.max(maxX, n.x + n.width / 2);
      minY = Math.min(minY, n.y - n.height / 2);
      maxY = Math.max(maxY, n.y + n.height / 2);
    });

    const pad = 60;
    const bWidth = maxX - minX + pad * 2;
    const bHeight = maxY - minY + pad * 2;

    return {
      layoutNodes: nodeList,
      layoutEdges: computedEdges,
      bounds: {
        minX: minX - pad,
        maxX: maxX + pad,
        minY: minY - pad,
        maxY: maxY + pad,
        width: Math.max(800, bWidth),
        height: Math.max(520, bHeight),
      },
      centerX: cX,
      centerY: cY,
    };
  }, [nodes, edges]);

  // Fit to view calculation
  const handleFitToView = useCallback(() => {
    if (!containerRef.current || bounds.width === 0 || bounds.height === 0) return;
    const containerW = containerRef.current.clientWidth || 800;
    const containerH = containerRef.current.clientHeight || 520;

    const scaleX = (containerW - 40) / bounds.width;
    const scaleY = (containerH - 40) / bounds.height;
    const fitScale = Math.min(1.1, Math.max(0.45, Math.min(scaleX, scaleY)));

    // Center the bounding box in the container
    const bboxCenterX = (bounds.minX + bounds.maxX) / 2;
    const bboxCenterY = (bounds.minY + bounds.maxY) / 2;

    const panOffsetX = containerW / 2 - bboxCenterX * fitScale;
    const panOffsetY = containerH / 2 - bboxCenterY * fitScale;

    setZoom(fitScale);
    setPan({ x: panOffsetX, y: panOffsetY });
  }, [bounds]);

  // Auto fit-to-view on initial render or node count change
  useEffect(() => {
    handleFitToView();
  }, [handleFitToView]);

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("g[data-node]")) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Keyboard navigation & branch path highlighting
  const activeNodeId = hoveredNode || selectedNode;
  const activePathNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const path = new Set<string>([activeNodeId]);
    const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

    // Trace path to root
    let curr = nodeMap.get(activeNodeId);
    while (curr && curr.parentId) {
      path.add(curr.parentId);
      curr = nodeMap.get(curr.parentId);
    }

    // Include immediate children of active node
    const targetNode = nodeMap.get(activeNodeId);
    if (targetNode) {
      targetNode.childIds.forEach((cid) => path.add(cid));
    }

    return path;
  }, [activeNodeId, layoutNodes]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        No mind map nodes generated.
      </div>
    );
  }

  // Sort nodes so hovered/active node is drawn last (top of z-order)
  const sortedNodes = [...layoutNodes].sort((a, b) => {
    if (a.id === activeNodeId) return 1;
    if (b.id === activeNodeId) return -1;
    return a.level - b.level;
  });

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full h-[540px] rounded-[var(--radius-base)] border border-border bg-card overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom and Fit controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-card/90 p-1 backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer transition-colors duration-200"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer transition-colors duration-200"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleFitToView}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer transition-colors duration-200"
          title="Fit to View"
          aria-label="Fit map to view"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer transition-colors duration-200"
          title="Reset Zoom & Pan"
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Header Info */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-xs font-mono text-muted-foreground pointer-events-none">
        <Network className="h-3.5 w-3.5 text-category-sources" />
        <span>{nodes.length} Concept Nodes · Radial Hierarchy</span>
      </div>

      {/* SVG Canvas with Pan & Zoom */}
      <div
        className={`w-full h-full flex items-center justify-center ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <svg
          className="w-full h-full overflow-visible"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Layer 1: Edges (Always rendered behind nodes) */}
          <g className="edges">
            {layoutEdges.map((edge) => {
              const palette = BRANCH_PALETTES[edge.branchIndex % BRANCH_PALETTES.length];
              const isDirectlyConnected =
                activeNodeId === edge.source || activeNodeId === edge.target;
              const isInActivePath =
                activePathNodeIds.has(edge.source) && activePathNodeIds.has(edge.target);

              // Distinct highlight color differing from branch node color
              const strokeColor = isDirectlyConnected
                ? palette.highlight
                : isInActivePath
                ? palette.color
                : palette.color;

              const strokeWidth = isDirectlyConnected ? 3 : isInActivePath ? 2 : 1.5;
              const isAnimated = isDirectlyConnected;

              return (
                <path
                  key={edge.id}
                  d={edge.path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={activeNodeId ? (isInActivePath ? 1 : 0.4) : 0.85}
                  strokeDasharray={isAnimated ? "8 5" : "none"}
                  className={`transition-all duration-200 ${
                    isAnimated ? "animate-mindmap-dash" : ""
                  }`}
                />
              );
            })}
          </g>

          {/* Layer 2: Nodes */}
          <g className="nodes">
            {sortedNodes.map((node) => {
              const isRoot = node.level === 0;
              const isLevel1 = node.level === 1;
              const isActive = activeNodeId === node.id;
              const palette = BRANCH_PALETTES[node.branchIndex % BRANCH_PALETTES.length];

              // Styling calculation: High contrast, theme-aware, no hardcoded colors
              let fill = "var(--card)";
              let stroke = "var(--border)";
              let strokeWidth = 1;
              let textColor = "var(--foreground)";

              if (isRoot) {
                // Root = filled with foreground contrast token
                fill = "var(--primary)";
                stroke = isActive ? palette.color : "var(--primary)";
                strokeWidth = isActive ? 2.5 : 1.5;
                textColor = "var(--primary-foreground)";
              } else if (isLevel1) {
                // Level 1 = branch-color border and tinted fill
                fill = isActive
                  ? `color-mix(in srgb, ${palette.color} 22%, var(--card))`
                  : `color-mix(in srgb, ${palette.color} 10%, var(--card))`;
                stroke = palette.color;
                strokeWidth = isActive ? 2.5 : 1.5;
                textColor = "var(--foreground)";
              } else {
                // Level 2+ = smaller pill with muted border, tinted on hover
                fill = isActive
                  ? `color-mix(in srgb, ${palette.color} 18%, var(--card))`
                  : "var(--card)";
                stroke = isActive ? palette.color : "var(--border)";
                strokeWidth = isActive ? 2.5 : 1;
                textColor = "var(--foreground)";
              }

              // Truncate display text if needed
              const maxChars = isRoot ? 22 : isLevel1 ? 18 : 16;
              const displayText =
                node.label.length > maxChars
                  ? `${node.label.slice(0, maxChars - 2)}...`
                  : node.label;

              return (
                <g
                  key={node.id}
                  data-node="true"
                  tabIndex={0}
                  role="button"
                  aria-label={`Concept: ${node.label}`}
                  transform={`translate(${node.x}, ${node.y}) scale(${isActive ? 1.04 : 1})`}
                  style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    outline: "none",
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => setSelectedNode(node.id)}
                  onBlur={() => setSelectedNode(null)}
                  onClick={() =>
                    setSelectedNode((curr) => (curr === node.id ? null : node.id))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedNode((curr) => (curr === node.id ? null : node.id));
                    }
                  }}
                  className="cursor-pointer transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <title>{node.label}</title>

                  <rect
                    x={-node.width / 2}
                    y={-node.height / 2}
                    width={node.width}
                    height={node.height}
                    rx={node.height / 2}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-colors duration-200"
                  />

                  <text
                    textAnchor="middle"
                    dy={isRoot ? 4.5 : isLevel1 ? 4 : 3.5}
                    fill={textColor}
                    fontSize={isRoot ? 12.5 : isLevel1 ? 11.5 : 10.5}
                    fontWeight={isRoot ? 700 : isLevel1 ? 600 : 500}
                    className="pointer-events-none select-none font-sans"
                  >
                    {displayText}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
