import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * Custom Node Component for Output Block
 */
export const OutputNode = memo((props: NodeProps) => {
  const { data } = props;
  const displayFormat = data?.config?.displayFormat || "text";

  return (
    <BaseNode
      {...props}
      label="Output"
      color="orange-500"
      hasSourceHandle={false}
    >
      <div className="text-xs text-gray-600">
        Display result ({displayFormat})
      </div>
    </BaseNode>
  );
});

OutputNode.displayName = "OutputNode";
