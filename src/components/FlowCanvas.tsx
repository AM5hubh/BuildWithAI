import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlowStore } from "../store/flowStore";
import { PromptNode, ModelNode, OutputNode } from "./nodes";
import { ToolNode } from "./nodes/ToolNode";
import { MemoryNode } from "./nodes/MemoryNode";
import { DataSourceNode } from "./nodes/DataSourceNode";

// Define custom node types
const nodeTypes = {
  prompt: PromptNode,
  model: ModelNode,
  output: OutputNode,
  tool: ToolNode,
  memory: MemoryNode,
  datasource: DataSourceNode,
};

/**
 * FlowCanvas Component
 * Main React Flow canvas for building AI flows
 */
export const FlowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
  } = useFlowStore();

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const newId = selectedNodes?.[0]?.id ?? null;
      if (newId === selectedNodeId) return;
      setSelectedNodeId(newId);
    },
    [selectedNodeId, setSelectedNodeId],
  );

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
