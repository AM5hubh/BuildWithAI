import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * ToolNode - Custom node for Tool blocks
 */
export const ToolNode = memo((props: NodeProps) => {
  const { data } = props;
  return (
    <BaseNode {...props} label="Tool" color="blue-500" icon="🔧">
      <div className="text-xs text-gray-600 break-words truncate">
        {data.config?.url || "API Endpoint"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {data.config?.method || "GET"}
      </div>
    </BaseNode>
  );
});
