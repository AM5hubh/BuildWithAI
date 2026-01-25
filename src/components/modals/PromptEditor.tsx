import React, { useState } from "react";
import { Node } from "reactflow";
import { useFlowStore } from "../../store/flowStore";

interface PromptEditorProps {
  block: Node;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PromptEditor Modal - Allows users to edit prompt block templates
 */
export const PromptEditor: React.FC<PromptEditorProps> = ({
  block,
  isOpen,
  onClose,
}) => {
  const [template, setTemplate] = useState(
    (block.data as any)?.config?.template || "Explain {topic} in simple terms.",
  );
  const [variables, setVariables] = useState<Record<string, string>>(
    (block.data as any)?.config?.variables || {},
  );
  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleSave = () => {
    updateNodeData(block.id, {
      ...(block.data || {}),
      config: {
        ...((block.data as any)?.config || {}),
        template,
        variables,
      },
    });
    onClose();
  };

  const handleAddVariable = () => {
    if (newVarName.trim()) {
      setVariables({
        ...variables,
        [newVarName]: newVarValue,
      });
      setNewVarName("");
      setNewVarValue("");
    }
  };

  const handleRemoveVariable = (varName: string) => {
    const newVars = { ...variables };
    delete newVars[varName];
    setVariables(newVars);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">Edit Prompt</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Template Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Template
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Enter your prompt template. Use {variable} for placeholders."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {"{variable}"} syntax for dynamic placeholders
            </p>
          </div>

          {/* Variables Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variables
            </label>

            {/* Existing Variables */}
            <div className="space-y-2 mb-3">
              {Object.entries(variables).map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-center gap-2 bg-purple-50 p-2 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-purple-900">
                      {"{" + name + "}"}
                    </div>
                    <div className="text-xs text-purple-700 truncate">
                      {value}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveVariable(name)}
                    className="text-red-500 hover:text-red-700 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Variable */}
            <div className="space-y-2">
              <input
                type="text"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                placeholder="Variable name"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAddVariable();
                }}
              />
              <input
                type="text"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                placeholder="Default value"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleAddVariable();
                }}
              />
              <button
                onClick={handleAddVariable}
                className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
              >
                + Add Variable
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
