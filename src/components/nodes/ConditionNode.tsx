import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * ConditionNode - Visual node for conditional logic block
 */
export const ConditionNode = memo((props: NodeProps) => {
  const { data } = props;
  const operator = data.config?.operator || "equals";
  const compareValue = data.config?.compareValue ?? "";

  return (
    <BaseNode
      {...props}
      label="Condition"
      color="yellow-500"
      icon="⚖"
      minWidth="min-w-[208px]"
      hasSourceHandle={false}
    >
      <div className="text-xs text-gray-600">
        Operator: <span className="font-semibold">{operator}</span>
      </div>
      <div className="text-xs text-gray-600 truncate">
        Compare: {compareValue || "(none)"}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">Outputs true/false</div>

      <div className="absolute right-6 top-10 text-[10px] text-green-600">
        True
      </div>
      <div className="absolute right-6 top-[72px] text-[10px] text-red-600">
        False
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 !bg-green-500"
        style={{ top: "42%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 !bg-red-500"
        style={{ top: "72%" }}
      />
    </BaseNode>
  );
});

ConditionNode.displayName = "ConditionNode";
