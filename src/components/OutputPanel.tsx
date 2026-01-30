import React from "react";
import { useFlowStore } from "../store/flowStore";

type DisplayFormat = "text" | "json" | "markdown";

const tryParseJson = (value: any) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const renderMarkdown = (text: string) => {
  // Minimal, safe markdown rendering without external deps.
  const escapeHtml = (val: string) =>
    val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Handle code fences first to avoid double-processing inside.
  let html = escapeHtml(text);
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_match, code) =>
      `<pre class="bg-gray-900 text-gray-100 p-3 rounded border border-gray-800 overflow-auto text-xs"><code>${code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</code></pre>`,
  );

  // Headings
  html = html.replace(
    /^### (.*)$/gm,
    '<h3 class="text-sm font-semibold mt-2 mb-1">$1</h3>',
  );
  html = html.replace(
    /^## (.*)$/gm,
    '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>',
  );
  html = html.replace(
    /^# (.*)$/gm,
    '<h1 class="text-lg font-semibold mt-4 mb-2">$1</h1>',
  );

  // Bold / italic / inline code
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1 bg-gray-100 rounded text-xs">$1</code>',
  );

  // Line breaks
  html = html.replace(/\n/g, "<br/>");

  return (
    <div
      className="prose prose-sm max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const isEmbeddingVector = (value: any): value is number[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((v) => typeof v === "number");

const downsampleVector = (vector: number[], maxPoints = 128) => {
  if (vector.length <= maxPoints) return vector;
  const chunkSize = Math.ceil(vector.length / maxPoints);
  const downsampled: number[] = [];
  for (let i = 0; i < vector.length; i += chunkSize) {
    const chunk = vector.slice(i, i + chunkSize);
    const avg = chunk.reduce((sum, v) => sum + v, 0) / chunk.length;
    downsampled.push(avg);
  }
  return downsampled;
};

const renderEmbeddingVisualization = (vector: number[]) => {
  const downsampled = downsampleVector(vector, 128);
  const maxAbs = Math.max(...downsampled.map((v) => Math.abs(v)), 1e-6);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span>Embedding visualization</span>
        <span>{vector.length} dimensions</span>
      </div>
      <div className="h-16 bg-gray-50 border border-gray-200 rounded flex items-end gap-[1px] p-1 overflow-hidden">
        {downsampled.map((value, idx) => {
          const normalized = Math.min(Math.abs(value) / maxAbs, 1);
          const height = Math.max(2, Math.round(normalized * 56));
          return (
            <div
              key={idx}
              className={value >= 0 ? "bg-blue-500" : "bg-purple-500"}
              style={{ height, width: 2 }}
              title={`#${idx}: ${value.toFixed(4)}`}
            />
          );
        })}
      </div>
      <div className="mt-1 text-[10px] text-gray-500">
        Downsampled to {downsampled.length} bars for display.
      </div>
    </div>
  );
};

const getAudioUrl = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") {
    return value.startsWith("data:audio/") || value.startsWith("mock:audio/")
      ? value
      : null;
  }
  if (typeof value === "object" && typeof value.audioUrl === "string") {
    return value.audioUrl;
  }
  return null;
};

const getAudioUrls = (
  value: any,
): Array<{ index?: number; text?: string; audioUrl: string }> | null => {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value.audioUrls)) {
    return value.audioUrls.filter(
      (item) => item && typeof item.audioUrl === "string",
    );
  }
  return null;
};

const getAudioFileName = (audioUrl: string) => {
  if (audioUrl.includes("audio/wav")) return "speech-output.wav";
  if (audioUrl.includes("audio/opus")) return "speech-output.opus";
  if (audioUrl.includes("audio/aac")) return "speech-output.aac";
  if (audioUrl.includes("audio/flac")) return "speech-output.flac";
  return "speech-output.mp3";
};

const renderFormattedResult = (result: any, format: DisplayFormat) => {
  if (format === "json") {
    const parsed = tryParseJson(result);
    const display =
      typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
    return (
      <pre className="text-xs font-mono text-gray-800 bg-gray-100 border border-gray-200 rounded p-2 whitespace-pre-wrap break-words overflow-auto">
        {display}
      </pre>
    );
  }

  if (format === "markdown") {
    const asText =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);
    return renderMarkdown(asText);
  }

  // Default text
  const asText =
    typeof result === "string" ? result : JSON.stringify(result, null, 2);
  return (
    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
      {asText}
    </div>
  );
};

/**
 * OutputPanel Component
 * Displays execution results, loading states, and errors
 */
export const OutputPanel: React.FC = () => {
  const { executionState, nodes } = useFlowStore();
  const { isRunning, currentBlockId, results, errors } = executionState;

  // Find output block results
  const outputNodes = nodes.filter((n) => n.type === "output");
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Output Panel</h3>

      {/* Loading State */}
      {isRunning && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-700">Executing...</span>
          </div>
          {currentBlockId && (
            <div className="text-xs text-blue-600 mt-1">
              Current: {currentBlockId}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-semibold text-red-700 mb-2">Errors:</div>
          {Object.entries(errors).map(([blockId, error]) => (
            <div key={blockId} className="text-xs text-red-600 mb-1">
              <strong>{blockId}:</strong> {error}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {hasResults && !isRunning && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Results:
          </div>

          {/* Show output block results prominently */}
          {outputNodes.map((node) => {
            const result = results[node.id];
            if (result === undefined || result === null) return null;

            const format: DisplayFormat =
              (node.data?.config?.displayFormat as DisplayFormat) || "text";

            return (
              <div
                key={node.id}
                className="p-3 bg-green-50 border border-green-200 rounded"
              >
                <div className="text-xs font-semibold text-green-700 mb-2">
                  Final Output ({format}):
                </div>
                {(() => {
                  const audioUrl = getAudioUrl(result);
                  if (!audioUrl) return null;
                  const isMock = audioUrl.startsWith("mock:");
                  const playableUrl = isMock
                    ? audioUrl.replace("mock:", "data:")
                    : audioUrl;
                  return (
                    <div className="mb-3 p-2 bg-white border border-green-200 rounded">
                      <div className="text-xs text-gray-600 mb-2">
                        Text-to-speech audio
                        {isMock ? " (mock)" : ""}
                      </div>
                      <audio controls src={playableUrl} className="w-full" />
                      <div className="mt-2">
                        <a
                          href={playableUrl}
                          download={getAudioFileName(playableUrl)}
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          Download audio
                        </a>
                      </div>
                    </div>
                  );
                })()}
                {(() => {
                  const audioUrls = getAudioUrls(result);
                  if (!audioUrls || audioUrls.length === 0) return null;
                  return (
                    <div className="mb-3 p-2 bg-white border border-green-200 rounded">
                      <div className="text-xs text-gray-600 mb-2">
                        Text-to-speech audio (parts)
                      </div>
                      <div className="space-y-2">
                        {audioUrls.map((item, idx) => (
                          <div
                            key={item.index ?? idx}
                            className="border border-gray-200 rounded p-2"
                          >
                            <div className="text-[10px] text-gray-500 mb-1">
                              Part {(item.index ?? idx) + 1}
                              {item.text ? `: ${item.text}` : ""}
                            </div>
                            <audio
                              controls
                              src={item.audioUrl}
                              className="w-full"
                            />
                            <div className="mt-1">
                              <a
                                href={item.audioUrl}
                                download={getAudioFileName(item.audioUrl)}
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                              >
                                Download part
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {isEmbeddingVector(result) &&
                  renderEmbeddingVisualization(result)}
                {renderFormattedResult(result, format)}
              </div>
            );
          })}

          {/* Show all intermediate results */}
          <details className="mt-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
              View all block outputs
            </summary>
            <div className="mt-2 space-y-2">
              {Object.entries(results).map(([blockId, result]) => (
                <div
                  key={blockId}
                  className="p-2 bg-gray-50 border border-gray-200 rounded"
                >
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {blockId}:
                  </div>
                  <div className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
                    {typeof result === "string"
                      ? result
                      : JSON.stringify(result, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !isRunning && (
        <div className="text-center text-gray-400 mt-8">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">Run your flow to see results here</div>
        </div>
      )}
    </div>
  );
};
