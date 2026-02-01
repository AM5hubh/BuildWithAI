import React from "react";
import { BaseNode } from "./BaseNode";

/**
 * MemoryNode - Custom node for Memory blocks
 */
export function MemoryNode(props: any) {
  const { data } = props;
  const op = data.config?.memoryOperation || data.config?.operation || "set";

  return (
    <BaseNode {...props} label="Memory" color="cyan-500" icon="💾">
      <div className="text-xs text-gray-600 break-words">
        <span className="inline-block bg-gray-200 px-2 py-1 rounded">{op}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        key: {data.config?.key || "data"}
      </div>
    </BaseNode>
  );
}
