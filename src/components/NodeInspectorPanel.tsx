import React, { useEffect, useState } from "react";
import { useFlowStore } from "../store/flowStore";

/**
 * NodeInspectorPanel
 * Shows selected block details and allows inline editing of configs
 */
export const NodeInspectorPanel: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState("{}");
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("{}");
  const [timeout, setTimeoutMs] = useState(30000);
  const [operation, setOperation] = useState("set");
  const [memKey, setMemKey] = useState("data");
  const [memValue, setMemValue] = useState("null");
  const [sourceType, setSourceType] = useState("mock");
  const [format, setFormat] = useState("json");
  const [displayFormat, setDisplayFormat] = useState("text");
  const [error, setError] = useState<string | null>(null);

  // Sync local state when selection changes
  useEffect(() => {
    if (!selectedNode) return;
    const cfg: any = selectedNode.data?.config || {};

    setTemplate(cfg.template || "Explain {topic} in simple terms.");
    setVariables(JSON.stringify(cfg.variables || {}, null, 2));
    setModel(cfg.model || "anthropic/claude-3.5-sonnet");
    setTemperature(cfg.temperature ?? 0.7);
    setMaxTokens(cfg.maxTokens ?? 1024);
    setUrl(cfg.url || "");
    setMethod(cfg.method || "GET");
    setHeaders(JSON.stringify(cfg.headers || {}, null, 2));
    setTimeoutMs(cfg.timeout ?? 30000);
    setOperation(cfg.operation || "set");
    setMemKey(cfg.key || "data");
    setMemValue(
      cfg.value !== undefined ? JSON.stringify(cfg.value, null, 2) : "null",
    );
    setSourceType(cfg.sourceType || "mock");
    setFormat(cfg.format || "json");
    setDisplayFormat(cfg.displayFormat || "text");
    setError(null);
  }, [selectedNodeId]);

  const parseJSON = (value: string, fallback: any) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      setError("Invalid JSON input");
      return fallback;
    }
  };

  const handleSave = () => {
    if (!selectedNode) return;
    setError(null);

    const cfg: any = selectedNode.data?.config || {};

    const updatedConfig = { ...cfg };

    switch (selectedNode.type) {
      case "prompt": {
        updatedConfig.template = template;
        updatedConfig.variables = parseJSON(variables, cfg.variables || {});
        break;
      }
      case "model": {
        updatedConfig.model = model;
        updatedConfig.temperature = Number(temperature);
        updatedConfig.maxTokens = Number(maxTokens);
        break;
      }
      case "tool": {
        updatedConfig.url = url;
        updatedConfig.method = method;
        updatedConfig.headers = parseJSON(headers, cfg.headers || {});
        updatedConfig.timeout = Number(timeout);
        break;
      }
      case "memory": {
        updatedConfig.operation = operation as any;
        updatedConfig.key = memKey;
        updatedConfig.value = parseJSON(memValue, cfg.value || null);
        break;
      }
      case "datasource": {
        updatedConfig.sourceType = sourceType;
        updatedConfig.url = url;
        updatedConfig.format = format;
        break;
      }
      case "output": {
        updatedConfig.displayFormat = displayFormat as any;
        break;
      }
      default:
        break;
    }

    updateNodeData(selectedNode.id, {
      ...selectedNode.data,
      config: updatedConfig,
    });
  };

  if (!selectedNode) {
    return (
      <div className="bg-white border-l border-gray-200 p-4 w-80 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inspector</h3>
        <div className="text-sm text-gray-500">
          Select a block to edit its settings.
        </div>
      </div>
    );
  }

  const renderPrompt = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Template
      </label>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Prompt template"
        rows={5}
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Variables (JSON)
      </label>
      <textarea
        value={variables}
        onChange={(e) => setVariables(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
        aria-label="Prompt variables JSON"
        rows={4}
      />
    </>
  );

  const renderModel = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Model
      </label>
      <input
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Model name"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Temperature
      </label>
      <input
        type="number"
        step="0.1"
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Temperature"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Max Tokens
      </label>
      <input
        type="number"
        value={maxTokens}
        onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
        className="w-full border border-gray-300 rounded p-2 text-sm"
        aria-label="Max tokens"
      />
    </>
  );

  const renderTool = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        URL
      </label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Tool URL"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Method
      </label>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="HTTP method"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Headers (JSON)
      </label>
      <textarea
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono mb-3"
        aria-label="Request headers JSON"
        rows={3}
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Timeout (ms)
      </label>
      <input
        type="number"
        value={timeout}
        onChange={(e) => setTimeoutMs(parseInt(e.target.value, 10))}
        className="w-full border border-gray-300 rounded p-2 text-sm"
        aria-label="Timeout in milliseconds"
      />
    </>
  );

  const renderMemory = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Operation
      </label>
      <select
        value={operation}
        onChange={(e) => setOperation(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Memory operation"
      >
        <option value="set">set</option>
        <option value="get">get</option>
        <option value="append">append</option>
        <option value="clear">clear</option>
      </select>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Key
      </label>
      <input
        value={memKey}
        onChange={(e) => setMemKey(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Memory key"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Value (JSON)
      </label>
      <textarea
        value={memValue}
        onChange={(e) => setMemValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
        aria-label="Memory value JSON"
        rows={3}
      />
    </>
  );

  const renderDataSource = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Source Type
      </label>
      <select
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Data source type"
      >
        <option value="mock">mock</option>
        <option value="json">json</option>
        <option value="csv">csv</option>
        <option value="api">api</option>
      </select>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        URL
      </label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Data source URL"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Format
      </label>
      <input
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm"
        aria-label="Data format"
      />
    </>
  );

  const renderOutput = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Display Format
      </label>
      <select
        value={displayFormat}
        onChange={(e) => setDisplayFormat(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm"
        aria-label="Output display format"
      >
        <option value="text">text</option>
        <option value="json">json</option>
        <option value="markdown">markdown</option>
      </select>
    </>
  );

  const renderForm = () => {
    switch (selectedNode?.type) {
      case "prompt":
        return renderPrompt();
      case "model":
        return renderModel();
      case "tool":
        return renderTool();
      case "memory":
        return renderMemory();
      case "datasource":
        return renderDataSource();
      case "output":
        return renderOutput();
      default:
        return (
          <div className="text-sm text-gray-500">No editor available.</div>
        );
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-80 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Inspector</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {selectedNode.type}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-800">
        <div className="text-xs text-gray-500">ID: {selectedNode.id}</div>
        {renderForm()}
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-4 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
      >
        Save Changes
      </button>
    </div>
  );
};
