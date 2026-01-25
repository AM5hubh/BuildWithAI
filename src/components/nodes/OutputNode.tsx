import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

/**
 * Custom Node Component for Output Block
 */
export const OutputNode = memo(({ selected }: NodeProps) => {
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

      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <div className="font-semibold text-sm">Output</div>
      </div>

      <div className="text-xs text-gray-600">Display result</div>
    </div>
  );
});

OutputNode.displayName = "OutputNode";
