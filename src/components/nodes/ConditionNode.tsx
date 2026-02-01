import React, { memo } from "react";
import { NodeProps } from "reactflow";
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
    >
      <div className="text-xs text-gray-600">
        Operator: <span className="font-semibold">{operator}</span>
      </div>
      <div className="text-xs text-gray-600 truncate">
        Compare: {compareValue || "(none)"}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">Outputs true/false</div>
    </BaseNode>
  );
});

ConditionNode.displayName = "ConditionNode";
