import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  OnSelectionChangeParams,
  EdgeMouseHandler,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlowStore } from "../store/flowStore";
import { PromptNode, ModelNode, OutputNode } from "./nodes";
import { ToolNode } from "./nodes/ToolNode";
import { MemoryNode } from "./nodes/MemoryNode";
import { DataSourceNode } from "./nodes/DataSourceNode";
import { TextFormatterNode } from "./nodes/TextFormatterNode";
import { TextExtractorNode } from "./nodes/TextExtractorNode";
import { WebSearchNode } from "./nodes/WebSearchNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { FileReaderNode } from "./nodes/FileReaderNode";
import { EdgeContextMenu } from "./EdgeContextMenu";

// Define custom node types
const nodeTypes = {
  prompt: PromptNode,
  model: ModelNode,
  output: OutputNode,
  tool: ToolNode,
  memory: MemoryNode,
  datasource: DataSourceNode,
  textFormatter: TextFormatterNode,
  textExtractor: TextExtractorNode,
  webSearch: WebSearchNode,
  condition: ConditionNode,
  fileReader: FileReaderNode,
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
    selectedEdgeId,
    selectedEdgePos,
    setSelectedNodeId,
    setSelectedEdge,
    executionState,
  } = useFlowStore();

  const nodeClassName = useCallback(
    (node: Node) => {
      const isRunning =
        executionState.isRunning && executionState.currentBlockId === node.id;

      return isRunning
        ? "running-node animate-pulse ring-2 ring-blue-400 ring-offset-2 ring-offset-white shadow-lg shadow-blue-200 scale-[1.02] transition-transform duration-300"
        : "transition-transform duration-200";
    },
    [executionState.currentBlockId, executionState.isRunning],
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const newId = selectedNodes?.[0]?.id ?? null;
      if (newId === selectedNodeId) return;
      setSelectedNodeId(newId);
    },
    [selectedNodeId, setSelectedNodeId],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge: any) => {
      event.preventDefault();
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      // edge is the edge object, extract the id
      setSelectedEdge(edge.id, { x: mouseX, y: mouseY });
    },
    [setSelectedEdge],
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
        onEdgeClick={handleEdgeClick}
        onPaneClick={() => setSelectedEdge(null, null)}
        nodeTypes={nodeTypes}
        nodeClassName={nodeClassName}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      <EdgeContextMenu edgeId={selectedEdgeId} position={selectedEdgePos} />
    </div>
  );
};
