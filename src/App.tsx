import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { Toolbar } from "./components/Toolbar";
import { FlowCanvas } from "./components/FlowCanvas";
import { RightPanel } from "./components/RightPanel";
import { SyncIndicator } from "./components/SyncIndicator";
import { useFlowStore } from "./store/flowStore";
import { loadFlowLocally } from "./utils/flowPersistence";

// Import blocks to ensure they are registered
import "./blocks";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

/**
 * Main App Component
 * Composable AI Studio - Build AI applications visually
 */
function App() {
  const navigate = useNavigate();
  const { setNodes, setEdges, addNode, fetchModels } = useFlowStore();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Initialize with a default example flow or load from localStorage
  useEffect(() => {
    const initializeFlow = () => {
      // Try to load from localStorage first
      const savedFlow = loadFlowLocally();

      if (savedFlow && savedFlow.nodes.length > 0) {
        // Restore from localStorage
        setNodes(savedFlow.nodes);
        setEdges(savedFlow.edges);
        console.log("✓ Flow restored from localStorage");
        return;
      }

      // Otherwise create default flow
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

    // Fetch available models from backend
    fetchModels();

    // Load user info
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    initializeFlow();
  }, [setNodes, setEdges, addNode, fetchModels]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        {/* Header with Sync Indicator */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/projects")}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Back to Projects"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold">BuildWithAi</h1>
                <p className="text-sm text-blue-100">Composable AI Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xs text-blue-100">
                Build AI applications visually with drag-and-drop blocks
              </div>
              <SyncIndicator />

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 bg-opacity-50 hover:bg-opacity-70 transition-all"
                  >
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-300">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
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
