import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

/**
 * Custom Node Component for Model Block
 */
export const ModelNode = memo(({ data, id, selected }: NodeProps) => {
  const deleteNode = useFlowStore((state) => state.deleteNode);

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-lg bg-white border-2 ${
        selected ? "border-blue-500" : "border-gray-300"
      } min-w-[200px]`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="font-semibold text-sm">AI Model</div>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>

      <div className="text-xs text-gray-600">
        {data.config?.model || "liquid/lfm-2.5-1.2b-instruct:free (free)"}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
});

ModelNode.displayName = "ModelNode";
