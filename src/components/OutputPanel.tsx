import React from "react";
import { useFlowStore } from "../store/flowStore";

/**
 * OutputPanel Component
 * Displays execution results, loading states, and errors
 */
export const OutputPanel: React.FC = () => {
  const { executionState, nodes } = useFlowStore();
  const { isRunning, currentBlockId, results, errors } = executionState;

  // Find output block results
  const outputNodes = nodes.filter((n) => n.type === "output");
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-80 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Output Panel</h3>

      {/* Loading State */}
      {isRunning && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-700">Executing...</span>
          </div>
          {currentBlockId && (
            <div className="text-xs text-blue-600 mt-1">
              Current: {currentBlockId}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-semibold text-red-700 mb-2">Errors:</div>
          {Object.entries(errors).map(([blockId, error]) => (
            <div key={blockId} className="text-xs text-red-600 mb-1">
              <strong>{blockId}:</strong> {error}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {hasResults && !isRunning && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Results:
          </div>

          {/* Show output block results prominently */}
          {outputNodes.map((node) => {
            const result = results[node.id];
            if (!result) return null;

            return (
              <div
                key={node.id}
                className="p-3 bg-green-50 border border-green-200 rounded"
              >
                <div className="text-xs font-semibold text-green-700 mb-1">
                  Final Output:
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {typeof result === "string"
                    ? result
                    : JSON.stringify(result, null, 2)}
                </div>
              </div>
            );
          })}

          {/* Show all intermediate results */}
          <details className="mt-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
              View all block outputs
            </summary>
            <div className="mt-2 space-y-2">
              {Object.entries(results).map(([blockId, result]) => (
                <div
                  key={blockId}
                  className="p-2 bg-gray-50 border border-gray-200 rounded"
                >
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {blockId}:
                  </div>
                  <div className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
                    {typeof result === "string"
                      ? result
                      : JSON.stringify(result, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !isRunning && (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">Run your flow to see results here</div>
        </div>
      )}
    </div>
  );
};
