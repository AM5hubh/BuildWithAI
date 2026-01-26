import React from "react";
import { useFlowStore } from "../store/flowStore";

/**
 * SyncIndicator - Shows the sync status with backend
 */
export const SyncIndicator: React.FC = () => {
  const isSyncing = useFlowStore((state) => state.isSyncing);

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs">
      {isSyncing ? (
        <>
          <div className="animate-spin w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full" />
          <span className="text-yellow-600">Syncing...</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-white">Synced</span>
        </>
      )}
    </div>
  );
};
