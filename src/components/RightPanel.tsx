import React, { useEffect, useRef } from "react";
import { NodeInspectorPanel } from "./NodeInspectorPanel";
import { OutputPanel } from "./OutputPanel";
import { useFlowStore } from "../store/flowStore";

/**
 * RightPanel - houses Inspector and Output panels with a toggle
 */
export const RightPanel: React.FC = () => {
  const {
    rightPanelTab,
    setRightPanelTab,
    rightPanelWidth,
    setRightPanelWidth,
    rightPanelVisible,
    setRightPanelVisible,
    toggleRightPanelVisible,
  } = useFlowStore();

  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseMove = (event: MouseEvent) => {
    const delta = startXRef.current - event.clientX;
    setRightPanelWidth(startWidthRef.current + delta);
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "";
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    startXRef.current = event.clientX;
    startWidthRef.current = rightPanelWidth;
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      // Clean up any stray listeners on unmount
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, []);

  if (!rightPanelVisible) {
    return (
      <div className="w-8 bg-white border-l border-gray-200 flex items-center justify-center shadow-inner">
        <button
          onClick={() => setRightPanelVisible(true)}
          className="-rotate-90 text-xs text-gray-600 hover:text-blue-600"
          title="Show panel"
        >
          ▸ Panel
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative bg-white border-l border-gray-200  flex flex-col shadow-sm"
      style={{ width: `${rightPanelWidth}px`, minWidth: 260, maxWidth: 720 }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-200"
        role="separator"
        aria-label="Resize right panel"
      />

      <div className="flex border-b border-gray-200 items-center">
        <div className="flex flex-1">
          <button
            onClick={() => setRightPanelTab("inspector")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 ${
              rightPanelTab === "inspector"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-600 hover:bg-gray-50"
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setRightPanelTab("output")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition border-b-2 ${
              rightPanelTab === "output"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-600 hover:bg-gray-50"
            }`}
          >
            Output
          </button>
        </div>
        <button
          onClick={toggleRightPanelVisible}
          className="px-3 py-2 text-xs text-gray-500 hover:text-red-600"
          title="Hide panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightPanelTab === "inspector" ? (
          <NodeInspectorPanel />
        ) : (
          <OutputPanel />
        )}
      </div>
    </div>
  );
};
