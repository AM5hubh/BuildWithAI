import { Node, Edge } from "reactflow";

/**
 * Flow data structure
 * Represents the complete state of a flow canvas
 */
export interface Flow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Execution state for a flow
 */
export interface FlowExecutionState {
  isRunning: boolean;
  currentBlockId: string | null;
  results: Record<string, any>;
  errors: Record<string, string>;
}
