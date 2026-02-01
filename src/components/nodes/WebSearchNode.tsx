import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * WebSearchNode - Visual node for web search block
 */
export const WebSearchNode = memo((props: NodeProps) => {
  const { data } = props;
  const engine = data.config?.searchEngine || "duckduckgo";
  const maxResults = data.config?.maxResults ?? 5;
  const safe = data.config?.safeSearch ?? true;

  return (
    <BaseNode
      {...props}
      label="Web Search"
      color="emerald-500"
      icon="🔎"
      minWidth="min-w-[224px]"
    >
      <div className="text-xs text-gray-600">
        Engine: <span className="font-semibold capitalize">{engine}</span>
      </div>
      <div className="text-xs text-gray-600">Max: {maxResults}</div>
      <div className="text-xs text-gray-600">
        Safe search: {safe ? "on" : "off"}
      </div>
    </BaseNode>
  );
});

WebSearchNode.displayName = "WebSearchNode";
