import { Node, Edge } from "reactflow";

/**
 * Topological Sort Implementation
 * Used to determine the correct execution order of blocks
 *
 * @param nodes - All nodes in the flow
 * @param edges - All edges (connections) in the flow
 * @returns Sorted array of node IDs in execution order
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  // Build adjacency list and in-degree map
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize all nodes
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph from edges
  edges.forEach((edge) => {
    const from = edge.source;
    const to = edge.target;

    adjacencyList.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) || 0) + 1);
  });

  // Find nodes with no dependencies (in-degree = 0)
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

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
    throw new Error("Cycle detected in flow graph. Cannot execute.");
  }

  return sorted;
}
