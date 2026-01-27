import { Handle, Position } from "reactflow";
import { useFlowStore } from "../../store/flowStore";
import { NodeOutputTooltip } from "../NodeOutputTooltip";

/**
 * DataSourceNode - Custom node for DataSource blocks
 * Amber colored node with database icon styling
 */
export function DataSourceNode({ data, id }: any) {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const isSelected = data.isSelected;
  const executionState = useFlowStore((state) => state.executionState);
  const isExecuting =
    executionState.isRunning && executionState.currentBlockId === id;

  return (
    <NodeOutputTooltip nodeId={id}>
      <div
        className={`rounded-lg border-2 p-4 w-48 bg-amber-50 ${
          isSelected ? "border-amber-500 shadow-lg" : "border-amber-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="font-semibold text-amber-900 flex items-center gap-2">
            📊 Data Source
            {isExecuting && (
              <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <button
            onClick={() => deleteNode(id)}
            className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
            title="Delete block"
          >
            ×
          </button>
        </div>
        <div className="text-xs text-amber-700 break-words">
          <span className="inline-block bg-amber-200 px-2 py-1 rounded">
            {data.config?.sourceType || "mock"}
          </span>
        </div>
        <div className="text-xs text-amber-600 mt-1 truncate">
          {data.config?.url || "Local Data"}
        </div>

        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </NodeOutputTooltip>
  );
}
