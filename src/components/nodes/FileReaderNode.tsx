import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";
import { NodeOutputTooltip } from "../NodeOutputTooltip";

/**
 * FileReaderNode - Visual node for file reader block
 */
export const FileReaderNode = memo(({ data, id, selected }: NodeProps) => {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const sourceType = data.config?.sourceType || "url";
  const format = data.config?.fileFormat || "text";
  const url = data.config?.url || data.config?.endpoint || "";
  const executionState = useFlowStore((state) => state.executionState);
  const isExecuting =
    executionState.isRunning && executionState.currentBlockId === id;

  return (
    <NodeOutputTooltip nodeId={id}>
      <div
        className={`rounded-lg border-2 p-4 w-56 bg-slate-50 ${
          selected ? "border-slate-500 shadow-lg" : "border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            📂 File Reader
            {isExecuting && (
              <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
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
        <div className="text-xs text-slate-700 mb-1">
          Source: <span className="font-semibold capitalize">{sourceType}</span>
        </div>
        <div className="text-xs text-slate-700 mb-1">
          Format: <span className="font-semibold uppercase">{format}</span>
        </div>
        <div className="text-[11px] text-slate-600 truncate">
          {url || "(provide URL or input)"}
        </div>

        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </NodeOutputTooltip>
  );
});

FileReaderNode.displayName = "FileReaderNode";
