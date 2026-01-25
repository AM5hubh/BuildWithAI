import React, { useState } from "react";
import { NodeInspectorPanel } from "./NodeInspectorPanel";
import { OutputPanel } from "./OutputPanel";

/**
 * RightPanel - houses Inspector and Output panels with a toggle
 */
export const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"inspector" | "output">(
    "inspector",
  );

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("inspector")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === "inspector"
              ? "border-blue-600 text-blue-700 bg-blue-50"
              : "border-transparent text-gray-600 hover:bg-gray-50"
          }`}
        >
          Inspector
        </button>
        <button
          onClick={() => setActiveTab("output")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === "output"
              ? "border-blue-600 text-blue-700 bg-blue-50"
              : "border-transparent text-gray-600 hover:bg-gray-50"
          }`}
        >
          Output
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "inspector" ? <NodeInspectorPanel /> : <OutputPanel />}
      </div>
    </div>
  );
};
