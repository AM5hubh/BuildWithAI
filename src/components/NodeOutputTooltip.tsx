import React, { useState } from "react";
import { useFlowStore } from "../store/flowStore";

interface NodeOutputTooltipProps {
  nodeId: string;
  children: React.ReactNode;
}

/**
 * Wrapper component that shows node output on hover
 */
export const NodeOutputTooltip: React.FC<NodeOutputTooltipProps> = ({
  nodeId,
  children,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const executionState = useFlowStore((state) => state.executionState);

  const output = executionState.results[nodeId];
  const error = executionState.errors[nodeId];

  const hasOutput = output !== undefined || error !== undefined;

  if (!hasOutput) {
    return <>{children}</>;
  }

  const renderOutput = () => {
    if (error) {
      return (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200 max-w-xs break-words">
          <div className="font-semibold mb-1">Error:</div>
          {String(error)}
        </div>
      );
    }

    const displayValue =
      typeof output === "string" ? output : JSON.stringify(output, null, 2);

    const truncated =
      displayValue.length > 300
        ? displayValue.substring(0, 300) + "..."
        : displayValue;

    return (
      <div className="text-xs text-gray-800 bg-white p-2 rounded border border-gray-300 shadow-lg max-w-xs break-words">
        <div className="font-semibold text-green-700 mb-1">Output:</div>
        <pre className="whitespace-pre-wrap font-mono text-xs">{truncated}</pre>
      </div>
    );
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-50 top-full left-0 mt-2 pointer-events-none">
          {renderOutput()}
        </div>
      )}
    </div>
  );
};
