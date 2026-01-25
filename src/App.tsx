import React, { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { Toolbar } from "./components/Toolbar";
import { FlowCanvas } from "./components/FlowCanvas";
import { RightPanel } from "./components/RightPanel";
import { useFlowStore } from "./store/flowStore";

// Import blocks to ensure they are registered
import "./blocks";

/**
 * Main App Component
 * Composable AI Studio - Build AI applications visually
 */
function App() {
  const { addNode, setEdges } = useFlowStore();

  // Initialize with a default example flow
  useEffect(() => {
    // Add default nodes for demo
    const initializeDefaultFlow = () => {
      const nodes = useFlowStore.getState().nodes;
      if (nodes.length === 0) {
        // Add Prompt Block
        addNode("prompt", { x: 100, y: 200 });

        // Add Model Block
        setTimeout(() => {
          addNode("model", { x: 400, y: 200 });
        }, 100);

        // Add Output Block
        setTimeout(() => {
          addNode("output", { x: 700, y: 200 });
        }, 200);

        // Connect them after nodes are created
        setTimeout(() => {
          const currentNodes = useFlowStore.getState().nodes;
          if (currentNodes.length >= 3) {
            setEdges([
              {
                id: "e1-2",
                source: currentNodes[0].id,
                target: currentNodes[1].id,
              },
              {
                id: "e2-3",
                source: currentNodes[1].id,
                target: currentNodes[2].id,
              },
            ]);

            // Set default config for prompt block
            useFlowStore.getState().updateNodeData(currentNodes[0].id, {
              config: {
                template: "Explain {topic} in simple terms.",
                variables: { topic: "quantum computing" },
              },
            });
          }
        }, 300);
      }
    };

    initializeDefaultFlow();
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">BuildWithAi</h1>
              <p className="text-sm text-blue-100">Composable AI Studio</p>
            </div>
            <div className="text-xs text-blue-100">
              Build AI applications visually with drag-and-drop blocks
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <Toolbar />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Flow Canvas */}
          <FlowCanvas />

          {/* Right Panel with toggle */}
          <RightPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
