import React from "react";
import { useFlowStore } from "../store/flowStore";

interface EdgeContextMenuProps {
  edgeId: string | null;
  position: { x: number; y: number } | null;
}

/**
 * EdgeContextMenu - Shows a popup to delete an edge
 */
export const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  edgeId,
  position,
}) => {
  const deleteEdge = useFlowStore((state) => state.deleteEdge);
  const setSelectedEdge = useFlowStore((state) => state.setSelectedEdge);

  if (!edgeId || !position) return null;

  const handleDelete = () => {
    deleteEdge(edgeId);
    setSelectedEdge(null, null);
  };

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left font-medium border-b border-gray-200"
      >
        🗑️ Delete Link
      </button>
      <button
        onClick={() => setSelectedEdge(null, null)}
        className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition text-left"
      >
        Close
      </button>
    </div>
  );
};
