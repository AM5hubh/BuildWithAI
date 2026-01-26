import React, { useEffect } from "react";
import { useFlowStore } from "../store/flowStore";

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

/**
 * ModelSelector Component
 * Displays available AI models from OpenRouter with search/filter capability
 * Categorized into FREE and PAID models
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
}) => {
  const { models, loadingModels, fetchModels } = useFlowStore();

  // Fetch models on component mount
  useEffect(() => {
    if (models.length === 0 && !loadingModels) {
      fetchModels();
    }
  }, [models.length, loadingModels, fetchModels]);

  // Categorize models
  const freeModels = models.filter((m) => m.isFree === true);
  const paidModels = models.filter((m) => m.isFree === false);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>

      {loadingModels ? (
        <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-300 rounded text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading models...</span>
          </div>
        </div>
      ) : models.length === 0 ? (
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded text-yellow-700 text-sm">
          No models available. Make sure the backend is running.
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          aria-label="Select AI model"
        >
          <option value="">Select a model...</option>

          {/* FREE MODELS Section */}
          {freeModels.length > 0 && (
            <optgroup label={`🆓 FREE MODELS (${freeModels.length})`}>
              {freeModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - FREE
                </option>
              ))}
            </optgroup>
          )}

          {/* PAID MODELS Section */}
          {paidModels.length > 0 && (
            <optgroup label={`💳 PAID MODELS (${paidModels.length})`}>
              {paidModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                  {model.pricing?.prompt && ` - $${model.pricing.prompt}/1K`}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      )}

      {/* Display model info */}
      {value && models.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          {(() => {
            const selected = models.find((m) => m.id === value);
            if (!selected) return null;

            return (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong>Model:</strong> {selected.name}
                  {selected.isFree && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      FREE
                    </span>
                  )}
                </div>
                {selected.description && (
                  <div>
                    <strong>Description:</strong> {selected.description}
                  </div>
                )}
                {selected.context_length && (
                  <div>
                    <strong>Context:</strong>{" "}
                    {selected.context_length.toLocaleString()} tokens
                  </div>
                )}
                {selected.pricing && !selected.isFree && (
                  <div>
                    <strong>Pricing:</strong> ${selected.pricing.prompt}/1K
                    input, ${selected.pricing.completion}/1K output
                  </div>
                )}
                {selected.isFree && (
                  <div className="text-green-700 font-medium">
                    ✓ This model is completely free to use!
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>
            📊 <strong>{models.length}</strong> models available
          </span>
          <span>
            🆓 <strong>{freeModels.length}</strong> free | 💳{" "}
            <strong>{paidModels.length}</strong> paid
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {freeModels.length > 0
            ? "Start with free models to test, upgrade to paid for better quality."
            : "All models require credits. Visit OpenRouter to add credits."}
        </p>
      </div>
    </div>
  );
};

export default ModelSelector;
