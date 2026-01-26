import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { TextFormatterOperation } from "../../types/Block";
import { useFlowStore } from "../../store/flowStore";

/**
 * TextFormatterNode - Visual node for text formatting block
 */
export const TextFormatterNode = memo(({ data, id, selected }: NodeProps) => {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const op: TextFormatterOperation =
    data.config?.textOperation || data.config?.operation || "uppercase";
  const hint = data.config?.findText || data.config?.replaceWith;

  return (
    <div
      className={`rounded-lg border-2 p-4 w-52 bg-indigo-50 ${
        selected ? "border-indigo-500 shadow-lg" : "border-indigo-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-indigo-900">📝 Text Formatter</div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-indigo-700 mb-1">
        <span className="inline-block bg-indigo-200 px-2 py-1 rounded capitalize">
          {op}
        </span>
      </div>
      {hint ? (
        <div className="text-xs text-indigo-600 truncate">{hint}</div>
      ) : (
        <div className="text-xs text-indigo-500">
          Configure find/replace or template
        </div>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

TextFormatterNode.displayName = "TextFormatterNode";
