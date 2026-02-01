import React, { memo, useState } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";
import { PromptEditor } from "../modals/PromptEditor";
import { BaseNode } from "./BaseNode";

/**
 * Custom Node Component for Prompt Block
 */
export const PromptNode = memo((props: NodeProps) => {
  const { data, id } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const nodes = useFlowStore((state) => state.nodes);
  const block = nodes.find((node) => node.id === id);

  return (
    <>
      <BaseNode
        {...props}
        label="Prompt"
        color="purple-500"
        maxWidth="max-w-[204px]"
      >
        <div className="text-xs text-gray-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis line-clamp-2">
          {data.config?.template || "No template set"}
        </div>

        {data.config?.includeInput && (
          <div className="text-[10px] text-emerald-600 mb-1">
            📎 Includes previous output:{" "}
            {data.config?.inputPlaceholder || "{input}"}
          </div>
        )}

        <div className="text-[10px] text-blue-500 mt-1">
          ← Input data from previous block
        </div>
      </BaseNode>

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
