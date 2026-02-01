import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * DataSourceNode - Custom node for DataSource blocks
 */
export const DataSourceNode = memo((props: NodeProps) => {
  const { data } = props;
  return (
    <BaseNode {...props} label="Data Source" color="amber-500" icon="📊">
      <div className="text-xs text-gray-600 break-words">
        <span className="inline-block bg-gray-200 px-2 py-1 rounded">
          {data.config?.sourceType || "mock"}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">
        {data.config?.url || "Local Data"}
      </div>
    </BaseNode>
  );
});
