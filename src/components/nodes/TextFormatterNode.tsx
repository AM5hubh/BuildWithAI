import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { TextFormatterOperation } from "../../types/Block";
import { BaseNode } from "./BaseNode";

/**
 * TextFormatterNode - Visual node for text formatting block
 */
export const TextFormatterNode = memo((props: NodeProps) => {
  const { data } = props;
  const op: TextFormatterOperation =
    data.config?.textOperation || data.config?.operation || "uppercase";
  const hint = data.config?.findText || data.config?.replaceWith;

  return (
    <BaseNode
      {...props}
      label="Text Formatter"
      color="indigo-500"
      icon="📝"
      minWidth="min-w-[208px]"
    >
      <div className="text-xs text-gray-600 mb-1">
        <span className="inline-block bg-gray-200 px-2 py-1 rounded capitalize">
          {op}
        </span>
      </div>
      {hint ? (
        <div className="text-xs text-gray-500 truncate">{hint}</div>
      ) : (
        <div className="text-xs text-gray-500">
          Configure find/replace or template
        </div>
      )}
    </BaseNode>
  );
});

TextFormatterNode.displayName = "TextFormatterNode";
