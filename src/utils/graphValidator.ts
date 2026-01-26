import { Node, Edge } from "reactflow";

/**
 * Graph validation utility
 * Helps debug and fix issues with flow graphs
 */

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    validEdges: number;
    orphanedNodes: string[];
    disconnectedComponents: number;
  };
}

/**
 * Validate the flow graph structure
 */
export function validateGraph(
  nodes: Node[],
  edges: Edge[],
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Check for invalid edges
  let validEdges = 0;
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(
        `Edge "${edge.id}" references non-existent source node: ${edge.source}`,
      );
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(
        `Edge "${edge.id}" references non-existent target node: ${edge.target}`,
      );
    }
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      validEdges++;
    }
  });

  // Check for self-loops
  edges.forEach((edge) => {
    if (edge.source === edge.target) {
      errors.push(
        `Self-loop detected on node "${edge.source}". A block cannot connect to itself.`,
      );
    }
  });

  // Check for orphaned nodes
  const connectedNodes = new Set<string>();
  edges.forEach((edge) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  const orphanedNodes = nodes
    .filter((n) => !connectedNodes.has(n.id))
    .map((n) => n.id);

  if (orphanedNodes.length > 0) {
    warnings.push(
      `Found ${orphanedNodes.length} disconnected node(s): ${orphanedNodes
        .map((id) => `"${nodeMap.get(id)?.data?.label || id}"`)
        .join(", ")}`,
    );
  }

  // Check for duplicate edges
  const edgeSet = new Set<string>();
  edges.forEach((edge) => {
    const key = `${edge.source}-${edge.target}`;
    if (edgeSet.has(key)) {
      warnings.push(`Duplicate edge detected: ${edge.source} → ${edge.target}`);
    }
    edgeSet.add(key);
  });

  // Count disconnected components
  const visited = new Set<string>();
  let components = 0;

  function dfs(nodeId: string) {
    visited.add(nodeId);
    edges.forEach((edge) => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        dfs(edge.target);
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        dfs(edge.source);
      }
    });
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      components++;
      dfs(node.id);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      validEdges,
      orphanedNodes,
      disconnectedComponents: components,
    },
  };
}

/**
 * Log validation results in a user-friendly way
 */
export function logValidationResults(result: GraphValidationResult): void {
  console.group("[Graph Validation]");
  console.log(`Validity: ${result.isValid ? "✅ Valid" : "❌ Invalid"}`);
  console.log(
    `Nodes: ${result.stats.nodeCount}, Edges: ${result.stats.edgeCount}`,
  );
  console.log(`Valid edges: ${result.stats.validEdges}`);
  console.log(
    `Disconnected components: ${result.stats.disconnectedComponents}`,
  );

  if (result.errors.length > 0) {
    console.group("Errors:");
    result.errors.forEach((err) => console.error(`  ❌ ${err}`));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group("Warnings:");
    result.warnings.forEach((warn) => console.warn(`  ⚠️  ${warn}`));
    console.groupEnd();
  }

  console.groupEnd();
}
