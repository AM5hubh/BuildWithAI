import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

/**
 * Custom Node Component for Model Block
 */
export const ModelNode = memo((props: NodeProps) => {
  const { data } = props;
  const modelType = data.config?.modelType;
  const icon =
    modelType === "vision"
      ? "👁️"
      : modelType === "embedding"
        ? "📊"
        : modelType === "speech"
          ? "🔊"
          : "📝";

  return (
    <BaseNode {...props} label="AI Model" color="green-500" icon={icon}>
      <div className="text-xs text-gray-600">
        {data.config?.model || "liquid/lfm-2.5-1.2b-instruct:free (free)"}
      </div>
      <div className="text-xs text-gray-500">
        {modelType === "vision"
          ? "Vision"
          : modelType === "embedding"
            ? "Embedding"
            : modelType === "speech"
              ? "Speech"
              : "Text"}
      </div>
    </BaseNode>
  );
});

ModelNode.displayName = "ModelNode";
