import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * FileReaderNode - Visual node for file reader block
 */
export const FileReaderNode = memo((props: NodeProps) => {
  const { data } = props;
  const sourceType = data.config?.sourceType || "url";
  const format = data.config?.fileFormat || "text";
  const url = data.config?.url || data.config?.endpoint || "";

  return (
    <BaseNode
      {...props}
      label="File Reader"
      color="slate-500"
      icon="📂"
      minWidth="min-w-[224px]"
    >
      <div className="text-xs text-gray-600 mb-1">
        Source: <span className="font-semibold capitalize">{sourceType}</span>
      </div>
      <div className="text-xs text-gray-600 mb-1">
        Format: <span className="font-semibold uppercase">{format}</span>
      </div>
      <div className="text-[11px] text-gray-500 truncate">
        {url || "(provide URL or input)"}
      </div>
    </BaseNode>
  );
});

FileReaderNode.displayName = "FileReaderNode";
