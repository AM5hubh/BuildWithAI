import { Handle, Position } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

/**
 * ToolNode - Custom node for Tool blocks
 * Blue colored node with API icon styling
 */
export function ToolNode({ data, id }: any) {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const isSelected = data.isSelected;

  return (
    <div
      className={`rounded-lg border-2 p-4 w-48 bg-blue-50 ${
        isSelected ? "border-blue-500 shadow-lg" : "border-blue-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-blue-900">🔧 Tool</div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-blue-700 break-words truncate">
        {data.config?.url || "API Endpoint"}
      </div>
      <div className="text-xs text-blue-600 mt-1">
        {data.config?.method || "GET"}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
