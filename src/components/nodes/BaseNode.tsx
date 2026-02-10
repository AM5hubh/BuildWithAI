import React, { memo, ReactNode } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "../../store/flowStore";
import { NodeOutputTooltip } from "../NodeOutputTooltip";

interface BaseNodeCustomProps {
  label: string;
  color: string;
  icon?: ReactNode;
  hasSourceHandle?: boolean;
  hasTargetHandle?: boolean;
  minWidth?: string;
  maxWidth?: string;
  children?: ReactNode;
}

type BaseNodeProps = NodeProps & BaseNodeCustomProps;

/**
 * BaseNode Component
 * Common wrapper for all node types with unified styling and behavior
 *
 * @param label - Display name of the node
 * @param color - Tailwind color for the status indicator (e.g., "purple-500", "green-500")
 * @param icon - Optional icon or emoji to display before the label
 * @param hasSourceHandle - Whether to show the right (output) handle
 * @param hasTargetHandle - Whether to show the left (input) handle
 * @param minWidth - Minimum width CSS class (e.g., "min-w-[200px]")
 * @param maxWidth - Maximum width CSS class (e.g., "max-w-[204px]")
 * @param children - Content to display below the header
 */
export const BaseNode = memo((props: BaseNodeProps) => {
  const {
    id,
    selected,
    label,
    color,
    icon,
    hasSourceHandle = true,
    hasTargetHandle = true,
    minWidth = "min-w-[200px]",
    maxWidth,
    children,
  } = props;

  const deleteNode = useFlowStore((state) => state.deleteNode);
  const executionState = useFlowStore((state) => state.executionState);
  const isExecuting =
    executionState.isRunning && executionState.currentBlockId === id;

  return (
    <NodeOutputTooltip nodeId={id}>
      <div
        className={`relative px-4 py-3 shadow-md rounded-lg bg-white border-2 ${
          selected ? "border-blue-500" : "border-gray-300"
        } ${minWidth} ${maxWidth || ""}`}
      >
        {hasTargetHandle && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 !bg-blue-500"
          />
        )}

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {isExecuting ? (
              <div
                className={`w-3 h-3 border-2 border-${color} border-t-transparent rounded-full animate-spin`}
              />
            ) : (
              <div className={`w-3 h-3 rounded-full bg-${color}`} />
            )}
            <div className="font-semibold text-sm flex items-center gap-1">
              {icon}
              {label}
            </div>
          </div>
          <button
            onClick={() => deleteNode(id)}
            className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
            title="Delete block"
          >
            ×
          </button>
        </div>

        {children}

        {hasSourceHandle && (
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 !bg-blue-500"
          />
        )}
      </div>
    </NodeOutputTooltip>
  );
});

BaseNode.displayName = "BaseNode";
