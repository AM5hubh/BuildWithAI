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
import type { ModelInfo } from "../utils/openrouterModels";

/**
 * Central state store using Zustand
 * Manages flow state, nodes, edges, and execution state with database persistence
 */
interface FlowStore {
  // Flow state
  projectId: string | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedEdgePos: { x: number; y: number } | null;
  isSyncing: boolean;

  // Models state
  models: ModelInfo[];
  loadingModels: boolean;

  // Execution state
  executionState: FlowExecutionState;

  // UI state
  rightPanelTab: "inspector" | "output";
  rightPanelWidth: number;
  rightPanelVisible: boolean;

  // Actions
  setProjectId: (projectId: string | null) => void;
  saveFlowToDatabase: () => Promise<void>;
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

  // Models actions
  setModels: (models: ModelInfo[]) => void;
  setLoadingModels: (loading: boolean) => void;
  fetchModels: () => Promise<void>;

  // Execution actions
  setExecutionState: (state: Partial<FlowExecutionState>) => void;
  clearExecution: () => void;
  setRightPanelTab: (tab: "inspector" | "output") => void;
  setRightPanelWidth: (width: number) => void;
  setRightPanelVisible: (visible: boolean) => void;
  toggleRightPanelVisible: () => void;

  // Flow save/load
  saveFlow: () => Flow;
  loadFlow: (flow: Flow) => void;
}

let nodeIdCounter = 1;

// Save to database with debounce
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 2000; // 2 second debounce

export const useFlowStore = create<FlowStore>((set, get) => ({
  projectId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedEdgePos: null,
  isSyncing: false,
  models: [],
  loadingModels: false,

  executionState: {
    isRunning: false,
    currentBlockId: null,
    results: {},
    errors: {},
  },

  rightPanelTab: "inspector",
  rightPanelWidth: 380,
  rightPanelVisible: true,

  setProjectId: (projectId) => set({ projectId }),

  saveFlowToDatabase: async () => {
    const { projectId, nodes, edges } = get();
    if (!projectId) return;

    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce the save
    saveTimeout = setTimeout(async () => {
      try {
        set({ isSyncing: true });
        const token = localStorage.getItem("authToken");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

        const response = await fetch(`${apiUrl}/api/flows`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId, nodes, edges }),
        });

        if (!response.ok) {
          throw new Error("Failed to save flow");
        }

        console.log("✓ Flow saved to database");
      } catch (error) {
        console.error("Error saving flow:", error);
      } finally {
        set({ isSyncing: false });
      }
    }, SAVE_DELAY);
  },

  setModels: (models) => set({ models }),
  setLoadingModels: (loading) => set({ loadingModels: loading }),

  fetchModels: async () => {
    set({ loadingModels: true });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/models`);
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      set({ models: data.models || [] });
    } catch (error) {
      console.error("Failed to fetch models:", error);
      set({ models: [] });
    } finally {
      set({ loadingModels: false });
    }
  },

  setNodes: (nodes) => {
    set({ nodes });
    // Auto-save to database
    get().saveFlowToDatabase();
  },

  setEdges: (edges) => {
    set({ edges });
    // Auto-save to database
    get().saveFlowToDatabase();
  },

  setSelectedNodeId: (nodeId: string | null) =>
    set((state) => ({
      selectedNodeId: nodeId,
      // Auto-focus inspector when selecting a node so users see its config immediately.
      rightPanelTab: nodeId ? "inspector" : state.rightPanelTab,
    })),

  setSelectedEdge: (edgeId, pos) =>
    set({ selectedEdgeId: edgeId, selectedEdgePos: pos }),

  deleteEdge: (edgeId) => {
    const newEdges = get().edges.filter((e) => e.id !== edgeId);
    set({
      edges: newEdges,
      selectedEdgeId: null,
      selectedEdgePos: null,
    });
    // Auto-save
    get().saveFlowToDatabase();
  },

  onNodesChange: (changes) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: newNodes });
    // Auto-save
    get().saveFlowToDatabase();
  },

  onEdgesChange: (changes) => {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: newEdges });
    // Auto-save
    get().saveFlowToDatabase();
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

    const newNodes = [...get().nodes, newNode];
    set({ nodes: newNodes });
    // Auto-save
    get().saveFlowToDatabase();
  },

  deleteNode: (nodeId) => {
    const newNodes = get().nodes.filter((n) => n.id !== nodeId);
    const newEdges = get().edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId,
    );
    set({
      nodes: newNodes,
      edges: newEdges,
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    // Auto-save
    get().saveFlowToDatabase();
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

    const newNodes = [...get().nodes, newNode];
    set({ nodes: newNodes });
    // Auto-save
    get().saveFlowToDatabase();
  },

  updateNodeData: (nodeId, data) => {
    const newNodes = get().nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
    );
    set({ nodes: newNodes });
    // Auto-save
    get().saveFlowToDatabase();
  },

  setExecutionState: (state) => {
    set({
      executionState: { ...get().executionState, ...state },
    });
  },

  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setRightPanelWidth: (width) => {
    const clamped = Math.max(260, Math.min(width, 720));
    set({ rightPanelWidth: clamped });
  },
  setRightPanelVisible: (visible) => set({ rightPanelVisible: visible }),
  toggleRightPanelVisible: () =>
    set((state) => ({ rightPanelVisible: !state.rightPanelVisible })),

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
