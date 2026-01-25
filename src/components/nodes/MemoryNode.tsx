import { Handle, Position } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

/**
 * MemoryNode - Custom node for Memory blocks
 * Cyan colored node with storage icon styling
 */
export function MemoryNode({ data, id }: any) {
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const isSelected = data.isSelected;

  return (
    <div
      className={`rounded-lg border-2 p-4 w-48 bg-cyan-50 ${
        isSelected ? "border-cyan-500 shadow-lg" : "border-cyan-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-semibold text-cyan-900">💾 Memory</div>
        <button
          onClick={() => deleteNode(id)}
          className="text-gray-400 hover:text-red-500 text-lg leading-none transition"
          title="Delete block"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-cyan-700 break-words">
        <span className="inline-block bg-cyan-200 px-2 py-1 rounded">
          {data.config?.operation || "set"}
        </span>
      </div>
      <div className="text-xs text-cyan-600 mt-1">
        key: {data.config?.key || "data"}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
