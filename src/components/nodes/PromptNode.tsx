import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";
import { PromptEditor } from "../modals/PromptEditor";

/**
 * Custom Node Component for Prompt Block
 */
export const PromptNode = memo(({ data, id, selected }: NodeProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const nodes = useFlowStore((state) => state.nodes);

  const block = nodes.find((node) => node.id === id);

  return (
    <>
      <div
        className={`px-4 py-3 shadow-md rounded-lg bg-white border-2 ${
          selected ? "border-blue-500" : "border-gray-300"
        } min-w-[200px]`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <div className="font-semibold text-sm">Prompt</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditorOpen(true)}
              className="text-gray-400 hover:text-purple-600 text-sm leading-none transition"
              title="Edit prompt"
            >
              ✎
            </button>
            <button
              onClick={() => deleteNode(id)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
              title="Delete block"
            >
              ×
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
          {data.config?.template || "No template set"}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-blue-500"
        />
      </div>

      {block && (
        <PromptEditor
          block={block}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </>
  );
});

PromptNode.displayName = "PromptNode";
