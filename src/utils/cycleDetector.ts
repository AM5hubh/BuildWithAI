import { Node, Edge } from "reactflow";

/**
 * Cycle Detection Utility
 * Detects cycles in a directed graph using DFS
 * Handles disconnected components properly
 */

export interface CycleInfo {
  hasCycle: boolean;
  cycleNodes: string[];
  cycleEdges: string[];
  cyclePath?: string[];
}

/**
 * Detect cycles in the flow graph using DFS
 * Properly handles disconnected nodes and multiple independent flows
 */
export function detectCycle(nodes: Node[], edges: Edge[]): CycleInfo {
  const adjacencyList = new Map<string, string[]>();
  const edgeMap = new Map<string, Edge[]>();

  // Build adjacency list and edge map
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    edgeMap.set(node.id, []);
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    edgeMap.get(edge.source)?.push(edge);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  let cycleFound = false;
  let cyclePath: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Cycle detected - reconstruct the cycle path
        const cycleStart = path.indexOf(neighbor);
        cyclePath = path.slice(cycleStart);
        cyclePath.push(neighbor); // Complete the cycle
        return true;
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }

  // Check all nodes for cycles (handles disconnected components)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      // Start a new DFS from unvisited nodes (handles multiple flows)
      if (dfs(node.id)) {
        cycleFound = true;
        break;
      }
    }
  }

  if (!cycleFound) {
    return {
      hasCycle: false,
      cycleNodes: [],
      cycleEdges: [],
    };
  }

  // Find edges that are part of the cycle
  const cycleNodeSet = new Set(cyclePath);
  const cycleEdgeIds: string[] = [];

  edges.forEach((edge) => {
    if (cycleNodeSet.has(edge.source) && cycleNodeSet.has(edge.target)) {
      // Check if this edge is actually part of the cycle path
      const sourceIdx = cyclePath.indexOf(edge.source);
      const targetIdx = cyclePath.indexOf(edge.target);

      if (
        sourceIdx >= 0 &&
        targetIdx >= 0 &&
        (targetIdx === sourceIdx + 1 ||
          (sourceIdx === cyclePath.length - 1 && targetIdx === 0))
      ) {
        cycleEdgeIds.push(edge.id);
      }
    }
  });

  return {
    hasCycle: true,
    cycleNodes: cyclePath,
    cycleEdges: cycleEdgeIds,
    cyclePath,
  };
}

/**
 * Get a human-readable description of the cycle
 */
export function describeCycle(cycleInfo: CycleInfo, nodes: Node[]): string {
  if (!cycleInfo.hasCycle || !cycleInfo.cyclePath) {
    return "No cycle detected";
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const cycleNames = cycleInfo.cyclePath.map((nodeId) => {
    const node = nodeMap.get(nodeId);
    return node?.data?.label || node?.type || nodeId;
  });

  return (
    `Circular dependency detected:\n` +
    cycleNames.join(" → ") +
    `\n\nThis creates an infinite loop that cannot be executed.`
  );
}
