import { Node, Edge } from "reactflow";

/**
 * Topological Sort Implementation
 * Used to determine the correct execution order of blocks
 * Handles disconnected components (multiple independent flows)
 *
 * @param nodes - All nodes in the flow
 * @param edges - All edges (connections) in the flow
 * @returns Sorted array of node IDs in execution order
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  // Handle empty graph
  if (nodes.length === 0) {
    return [];
  }

  // Build adjacency list and in-degree map
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Initialize all nodes
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph from edges - with validation
  let validEdges = 0;
  edges.forEach((edge) => {
    const from = edge.source;
    const to = edge.target;

    // Only add edges if both nodes exist in the graph
    if (nodeMap.has(from) && nodeMap.has(to)) {
      const neighbors = adjacencyList.get(from);
      if (neighbors && !neighbors.includes(to)) {
        // Avoid duplicate edges
        neighbors.push(to);
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
        validEdges++;
      }
    } else {
      console.warn(
        `Skipping edge with invalid nodes: ${from} → ${to}. ` +
          `From exists: ${nodeMap.has(from)}, To exists: ${nodeMap.has(to)}`,
      );
    }
  });

  // Find nodes with no dependencies (in-degree = 0)
  // This includes isolated nodes (no connections) and nodes with only outgoing edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  // If no starting nodes found, we have a problem
  if (queue.length === 0 && nodes.length > 0) {
    console.error("No root nodes found (all nodes have incoming edges)");
  }

  // Perform topological sort using Kahn's algorithm
  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    // Reduce in-degree for neighbors
    const neighbors = adjacencyList.get(current) || [];
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    // Find nodes that are NOT in sorted
    const sortedSet = new Set(sorted);
    const unsortedNodeIds = nodes
      .filter((node) => !sortedSet.has(node.id))
      .map((n) => n.id);

    // Check if unsorted nodes have any incoming edges (would indicate a real cycle)
    const edgeMap = new Map<string, number>();
    edges.forEach((edge) => {
      edgeMap.set(edge.target, (edgeMap.get(edge.target) || 0) + 1);
    });

    // Filter to only nodes that actually have incoming edges (real cycle indicators)
    const cycleNodesWithEdges = unsortedNodeIds.filter((id) => edgeMap.has(id));

    if (cycleNodesWithEdges.length > 0) {
      // This is a real cycle
      const cycleNodeLabels = cycleNodesWithEdges
        .map((nodeId) => {
          const node = nodeMap.get(nodeId);
          const label = node?.data?.label || node?.type || nodeId;
          return `"${label}"`;
        })
        .join(" → ");

      console.error(
        "Real cycle detected. Problematic nodes:",
        cycleNodesWithEdges,
      );
      throw new Error(
        `Cycle detected in flow graph. Cannot execute.\n` +
          `${cycleNodeLabels}\n\n` +
          `Please remove any connections that create loops.`,
      );
    } else {
      // Just orphaned/unconnected nodes - add them to the sorted list
      // They will be executed but have no dependencies
      console.warn(
        `Found ${unsortedNodeIds.length} orphaned node(s) with no connections. ` +
          `Adding to execution order.`,
      );
      unsortedNodeIds.forEach((id) => sorted.push(id));
    }
  }

  return sorted;
}
