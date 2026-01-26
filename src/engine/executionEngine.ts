import { Node, Edge } from "reactflow";
import { Block } from "../types/Block";
import { blockRegistry } from "../blocks";
import { topologicalSort } from "./topologicalSort";
import { validateGraph, logValidationResults } from "../utils/graphValidator";

/**
 * Execution Engine
 * Orchestrates the execution of blocks in the correct order
 * Handles async operations and passes data between blocks
 */
export class ExecutionEngine {
  /**
   * Execute a flow graph
   *
   * @param nodes - All nodes in the flow
   * @param edges - All edges connecting the nodes
   * @param onProgress - Callback for execution progress
   * @returns Results for each block
   */
  async execute(
    nodes: Node[],
    edges: Edge[],
    onProgress?: (
      blockId: string,
      status: "running" | "success" | "error",
      result?: any,
    ) => void,
  ): Promise<Record<string, any>> {
    try {
      // Validate graph structure first
      const validation = validateGraph(nodes, edges);
      logValidationResults(validation);

      if (validation.errors.length > 0) {
        throw new Error(
          `Graph validation failed:\n${validation.errors.map((e) => `• ${e}`).join("\n")}`,
        );
      }

      // Debug logging
      console.log(
        `[ExecutionEngine] Starting execution with ${nodes.length} nodes and ${edges.length} edges`,
      );
      console.log(
        "[ExecutionEngine] Nodes:",
        nodes.map((n) => ({ id: n.id, type: n.type, label: n.data?.label })),
      );
      console.log(
        "[ExecutionEngine] Edges:",
        edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      );

      // Step 1: Perform topological sort to get execution order
      const executionOrder = topologicalSort(nodes, edges);
      console.log("[ExecutionEngine] Execution order:", executionOrder);

      // Step 2: Create a map to store results
      const results: Record<string, any> = {};

      // Step 3: Execute blocks in order
      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        try {
          // Notify progress
          onProgress?.(nodeId, "running");

          // Get block definition from registry
          const blockDef = blockRegistry.get(node.type as any);
          if (!blockDef) {
            throw new Error(`Unknown block type: ${node.type}`);
          }

          // Prepare input from connected blocks
          const input = this.getInputForBlock(nodeId, edges, results);

          // Create block instance
          const block: Block = {
            id: nodeId,
            type: node.type as any,
            config: node.data.config || blockDef.defaultConfig,
            input,
            output: null,
          };

          // Execute the block
          const output = await blockDef.execute(block, input);

          // Store result
          results[nodeId] = output;
          block.output = output;

          // Notify success
          onProgress?.(nodeId, "success", output);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          results[nodeId] = { error: errorMessage };

          // Notify error
          onProgress?.(nodeId, "error", errorMessage);

          // Stop execution on error
          throw error;
        }
      }

      return results;
    } catch (error) {
      console.error("Execution failed:", error);
      throw error;
    }
  }

  /**
   * Get input for a block from its connected predecessors
   */
  private getInputForBlock(
    blockId: string,
    edges: Edge[],
    results: Record<string, any>,
  ): any {
    // Find all edges that connect to this block
    const incomingEdges = edges.filter((e) => e.target === blockId);

    // If no incoming edges, return null
    if (incomingEdges.length === 0) {
      return null;
    }

    // If single incoming edge, return that result directly
    if (incomingEdges.length === 1) {
      const sourceId = incomingEdges[0].source;
      return results[sourceId];
    }

    // If multiple incoming edges, combine results into an object
    const combinedInput: Record<string, any> = {};
    incomingEdges.forEach((edge) => {
      const sourceId = edge.source;
      combinedInput[sourceId] = results[sourceId];
    });

    return combinedInput;
  }
}

export const executionEngine = new ExecutionEngine();
