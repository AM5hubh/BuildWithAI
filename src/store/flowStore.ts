import { create } from "zustand";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { Flow, FlowExecutionState } from "../types/Flow";

/**
 * Central state store using Zustand
 * Manages flow state, nodes, edges, and execution state
 */
interface FlowStore {
  // Flow state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedEdgePos: { x: number; y: number } | null;

  // Execution state
  executionState: FlowExecutionState;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdge: (
    edgeId: string | null,
    pos: { x: number; y: number } | null,
  ) => void;

  // Execution actions
  setExecutionState: (state: Partial<FlowExecutionState>) => void;
  clearExecution: () => void;

  // Flow save/load
  saveFlow: () => Flow;
  loadFlow: (flow: Flow) => void;
}

let nodeIdCounter = 1;

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedEdgePos: null,

  executionState: {
    isRunning: false,
    currentBlockId: null,
    results: {},
    errors: {},
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  setSelectedEdge: (edgeId, pos) =>
    set({ selectedEdgeId: edgeId, selectedEdgePos: pos }),

  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: null,
      selectedEdgePos: null,
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (type, position) => {
    const newNode: Node = {
      id: `${type}-${nodeIdCounter++}`,
      type,
      position,
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
        config: {},
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode: Node = {
      ...node,
      id: `${node.type}-${nodeIdCounter++}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },

  setExecutionState: (state) => {
    set({
      executionState: { ...get().executionState, ...state },
    });
  },

  clearExecution: () => {
    set({
      executionState: {
        isRunning: false,
        currentBlockId: null,
        results: {},
        errors: {},
      },
    });
  },

  saveFlow: () => {
    const { nodes, edges } = get();
    return {
      id: `flow-${Date.now()}`,
      name: "My Flow",
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  loadFlow: (flow) => {
    set({
      nodes: flow.nodes,
      edges: flow.edges,
    });
  },
}));
