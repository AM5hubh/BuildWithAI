import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";

export const TextExtractorNode = memo((props: NodeProps) => {
  const { data } = props;
  const extractionType = data?.config?.extractionType || "regex";
  const pattern = data?.config?.pattern || "(?<=Summary: ).*";

  return (
    <BaseNode
      {...props}
      label="Text Extractor"
      color="indigo-500"
      minWidth="min-w-[220px]"
    >
      <div className="text-xs text-gray-600">
        {extractionType === "regex" ? `Regex: ${pattern}` : `Between tags`}
      </div>
    </BaseNode>
  );
});

TextExtractorNode.displayName = "TextExtractorNode";
