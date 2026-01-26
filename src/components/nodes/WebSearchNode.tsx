import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

/**
 * WebSearchNode - Visual node for web search block
 */
export const WebSearchNode = memo(({ data, id, selected }: NodeProps) => {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const engine = data.config?.searchEngine || "duckduckgo";
  const maxResults = data.config?.maxResults ?? 5;
  const safe = data.config?.safeSearch ?? true;

  return (
    <div
      className={`rounded-lg border-2 p-4 w-56 bg-emerald-50 ${
        selected ? "border-emerald-500 shadow-lg" : "border-emerald-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-emerald-900">🔎 Web Search</div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-emerald-700">
        Engine: <span className="font-semibold capitalize">{engine}</span>
      </div>
      <div className="text-xs text-emerald-700">Max: {maxResults}</div>
      <div className="text-xs text-emerald-700">
        Safe search: {safe ? "on" : "off"}
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

WebSearchNode.displayName = "WebSearchNode";
