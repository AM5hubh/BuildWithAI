/**
 * Flow Serialization Utilities
 * Save and load flows as JSON
 */
import { Flow } from "../types/Flow";

export function saveFlowToJSON(flow: Flow): string {
  return JSON.stringify(flow, null, 2);
}

export function loadFlowFromJSON(json: string): Flow {
  try {
    const flow = JSON.parse(json);

    // Validate required fields
    if (!flow.id || !flow.nodes || !flow.edges) {
      throw new Error("Invalid flow format");
    }

    return flow as Flow;
  } catch (error) {
    throw new Error(
      `Failed to parse flow JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function downloadFlow(flow: Flow): void {
  const json = saveFlowToJSON(flow);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${flow.name || "flow"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
