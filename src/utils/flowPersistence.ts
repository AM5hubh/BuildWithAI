/**
 * Hybrid persistence utilities
 * Saves to localStorage immediately and syncs to backend in background
 */

import { Flow } from "../types/Flow";

const STORAGE_KEY = "composable-ai-flow";
const BACKEND_SYNC_DELAY = 3000; // 3 second debounce

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Save flow to localStorage immediately
 */
export const saveFlowLocally = (nodes: any[], edges: any[]): void => {
  try {
    const flow: Flow = {
      id: `flow-${Date.now()}`,
      name: "My Flow",
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

/**
 * Load flow from localStorage
 */
export const loadFlowLocally = (): Flow | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
};

/**
 * Auto-sync to backend with debounce
 */
export const syncFlowToBackend = async (
  nodes: any[],
  edges: any[],
  onSyncStart?: () => void,
  onSyncEnd?: () => void,
): Promise<void> => {
  // Clear existing timeout
  if (syncTimeout) clearTimeout(syncTimeout);

  // Debounce the sync
  syncTimeout = setTimeout(async () => {
    try {
      onSyncStart?.();

      const flow: Flow = {
        id: `flow-${Date.now()}`,
        name: "My Flow",
        nodes,
        edges,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const response = await fetch("/api/flows/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flow),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log("✓ Flow synced to backend:", result.id);
      onSyncEnd?.();
    } catch (error) {
      console.warn("Failed to sync to backend (will try again):", error);
      // Don't call onSyncEnd on error, will retry next change
    }
  }, BACKEND_SYNC_DELAY);
};

/**
 * Load flow from backend
 */
export const loadFlowFromBackend = async (
  flowId: string,
): Promise<Flow | null> => {
  try {
    const response = await fetch(`/api/flows/${flowId}`);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to load from backend:", error);
    return null;
  }
};

/**
 * Clear all local storage
 */
export const clearLocalFlow = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};
