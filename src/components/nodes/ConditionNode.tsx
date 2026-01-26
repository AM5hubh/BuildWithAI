import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

/**
 * ConditionNode - Visual node for conditional logic block
 */
export const ConditionNode = memo(({ data, id, selected }: NodeProps) => {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const operator = data.config?.operator || "equals";
  const compareValue = data.config?.compareValue ?? "";

  return (
    <div
      className={`rounded-lg border-2 p-4 w-52 bg-yellow-50 ${
        selected ? "border-yellow-500 shadow-lg" : "border-yellow-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-yellow-900">⚖ Condition</div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-yellow-700">
        Operator: <span className="font-semibold">{operator}</span>
      </div>
      <div className="text-xs text-yellow-700 truncate">
        Compare: {compareValue || "(none)"}
      </div>
      <div className="text-[11px] text-yellow-600 mt-1">Outputs true/false</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";
