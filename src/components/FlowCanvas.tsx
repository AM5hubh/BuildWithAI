import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlowStore } from "../store/flowStore";
import { PromptNode, ModelNode, OutputNode } from "./nodes";

// Define custom node types
const nodeTypes = {
  prompt: PromptNode,
  model: ModelNode,
  output: OutputNode,
};

/**
 * FlowCanvas Component
 * Main React Flow canvas for building AI flows
 */
export const FlowCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore();

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
