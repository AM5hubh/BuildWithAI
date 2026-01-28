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
  syncError: string | null;

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
  autoLayout: () => void;
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
  syncError: null,
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
        set({ isSyncing: true, syncError: null });
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to save flow");
        }

        console.log("✓ Flow saved to database");
        set({ isSyncing: false, syncError: null });
      } catch (error) {
        console.error("Error saving flow:", error);
        set({
          isSyncing: false,
          syncError: error instanceof Error ? error.message : "Failed to save",
        });
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

  autoLayout: () => {
    const nodes = get().nodes;
    const edges = get().edges;

    if (nodes.length === 0) return;

    // Build adjacency list to find connected components
    const adjacency = new Map<string, string[]>();
    nodes.forEach((node) => adjacency.set(node.id, []));

    edges.forEach((edge) => {
      adjacency.get(edge.source)?.push(edge.target);
    });

    // Find root nodes (nodes with no incoming edges)
    const incomingCount = new Map<string, number>();
    nodes.forEach((node) => incomingCount.set(node.id, 0));
    edges.forEach((edge) => {
      incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
    });

    const rootNodes = nodes.filter((node) => incomingCount.get(node.id) === 0);

    // Layout configuration
    const HORIZONTAL_SPACING = 300;
    const VERTICAL_SPACING = 150;
    const START_X = 100;
    const START_Y = 100;

    // Assign levels using BFS
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    const queue: { id: string; level: number }[] = [];

    rootNodes.forEach((node) => {
      queue.push({ id: node.id, level: 0 });
      visited.add(node.id);
    });

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      levels.set(id, level);

      const children = adjacency.get(id) || [];
      children.forEach((childId) => {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    // Handle disconnected nodes
    nodes.forEach((node) => {
      if (!levels.has(node.id)) {
        levels.set(node.id, 0);
      }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, Node[]>();
    nodes.forEach((node) => {
      const level = levels.get(node.id) || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });

    // Position nodes
    const newNodes = nodes.map((node) => {
      const level = levels.get(node.id) || 0;
      const nodesInLevel = nodesByLevel.get(level) || [];
      const indexInLevel = nodesInLevel.findIndex((n) => n.id === node.id);

      return {
        ...node,
        position: {
          x: START_X + level * HORIZONTAL_SPACING,
          y: START_Y + indexInLevel * VERTICAL_SPACING,
        },
      };
    });

    set({ nodes: newNodes });
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
