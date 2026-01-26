import React from "react";
import { useFlowStore } from "../store/flowStore";
import { executionEngine } from "../engine/executionEngine";
import { downloadFlow } from "../utils/flowSerializer";
import { detectCycle, describeCycle } from "../utils/cycleDetector";

/**
 * Toolbar Component
 * Provides controls for running, saving, and managing the flow
 */
export const Toolbar: React.FC = () => {
  const {
    nodes,
    edges,
    executionState,
    setExecutionState,
    clearExecution,
    saveFlow,
  } = useFlowStore();

  const toolOptions = [
    { label: "API Tool", type: "tool" as const },
    { label: "Text Formatter", type: "textFormatter" as const },
    { label: "Web Search", type: "webSearch" as const },
    { label: "Condition", type: "condition" as const },
    { label: "File Reader", type: "fileReader" as const },
  ];

  const [selectedTool, setSelectedTool] = React.useState(toolOptions[0].type);

  const handleRun = async () => {
    if (nodes.length === 0) {
      alert("Please add some blocks to the canvas first.");
      return;
    }

    // Check for cycles before attempting execution
    const cycleInfo = detectCycle(nodes, edges);
    if (cycleInfo.hasCycle) {
      const description = describeCycle(cycleInfo, nodes);
      alert(
        "⚠️ Circular Dependency Detected!\n\n" +
          description +
          "\n\n💡 Tip: Remove one of the connections in the cycle to fix this.",
      );
      return;
    }

    // Clear previous execution
    clearExecution();

    // Set running state
    setExecutionState({ isRunning: true });

    try {
      // Execute the flow
      const results = await executionEngine.execute(
        nodes,
        edges,
        (blockId, status, result) => {
          setExecutionState({
            currentBlockId: blockId,
            results:
              status === "success"
                ? { ...executionState.results, [blockId]: result }
                : executionState.results,
            errors:
              status === "error"
                ? { ...executionState.errors, [blockId]: result }
                : executionState.errors,
          });
        },
      );

      setExecutionState({
        isRunning: false,
        currentBlockId: null,
        results,
      });
    } catch (error) {
      console.error("Execution error:", error);

      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      if (errorMessage.includes("Cycle detected")) {
        // Cycle was detected - provide helpful message
        alert(
          "⚠️ Circular Dependency Detected!\n\n" +
            errorMessage +
            "\n\n💡 Tip: Check your connections to ensure no block connects back to itself directly or indirectly.",
        );
      } else {
        alert(`Execution Error:\n\n${errorMessage}`);
      }

      setExecutionState({ isRunning: false, currentBlockId: null });
    }
  };

  const handleSave = () => {
    const flow = saveFlow();
    downloadFlow(flow);
  };

  const handleAddPrompt = () => {
    useFlowStore.getState().addNode("prompt", { x: 100, y: 100 });
  };

  const handleAddModel = () => {
    useFlowStore.getState().addNode("model", { x: 400, y: 100 });
  };

  const handleAddOutput = () => {
    useFlowStore.getState().addNode("output", { x: 700, y: 100 });
  };

  const handleAddTool = () => {
    useFlowStore.getState().addNode("tool", { x: 250, y: 300 });
  };

  const handleAddSelectedTool = () => {
    // Stagger positions horizontally for better visibility
    const index = toolOptions.findIndex((t) => t.type === selectedTool);
    const baseX = 200 + index * 120;
    const baseY = 300;
    useFlowStore.getState().addNode(selectedTool, { x: baseX, y: baseY });
  };

  const handleAddMemory = () => {
    useFlowStore.getState().addNode("memory", { x: 450, y: 300 });
  };

  const handleAddDataSource = () => {
    useFlowStore.getState().addNode("datasource", { x: 650, y: 300 });
  };

  const handleClear = () => {
    if (confirm("Clear all blocks?")) {
      useFlowStore.getState().setNodes([]);
      useFlowStore.getState().setEdges([]);
      clearExecution();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Flow Builder</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Block Buttons */}
          <div className="flex gap-2 border-r pr-3">
            <button
              onClick={handleAddPrompt}
              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
            >
              + Prompt
            </button>
            <button
              onClick={handleAddModel}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
            >
              + Model
            </button>
            <button
              onClick={handleAddOutput}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition"
            >
              + Output
            </button>
            <button
              onClick={handleAddTool}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              + Tool
            </button>
            <div className="flex items-center gap-2">
              <select
                value={selectedTool}
                onChange={(e) =>
                  setSelectedTool(e.target.value as typeof selectedTool)
                }
                className="px-2 py-1 text-sm border rounded"
                aria-label="Select tool block"
              >
                {toolOptions.map((tool) => (
                  <option key={tool.type} value={tool.type}>
                    {tool.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSelectedTool}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add Tool Block
              </button>
            </div>
            <button
              onClick={handleAddMemory}
              className="px-3 py-1.5 text-sm bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 transition"
            >
              + Memory
            </button>
            <button
              onClick={handleAddDataSource}
              className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
            >
              + Data Source
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleRun}
            disabled={executionState.isRunning}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executionState.isRunning ? "Running..." : "▶ Run"}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            💾 Save
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
