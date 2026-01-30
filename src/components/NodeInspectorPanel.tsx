import React, { useEffect, useState } from "react";
import { useFlowStore } from "../store/flowStore";
import { ModelSelector } from "./ModelSelector";

/**
 * NodeInspectorPanel
 * Shows selected block details and allows inline editing of configs
 */
export const NodeInspectorPanel: React.FC = () => {
  const { selectedNodeId, nodes, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [template, setTemplate] = useState("");
  const [variablesList, setVariablesList] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [includeInput, setIncludeInput] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("{input}");
  const [model, setModel] = useState("liquid/lfm-2.5-1.2b-instruct:free");

  // Helper to normalize model values - ensure always a string
  const handleModelChange = (newModel: any) => {
    if (typeof newModel === "object" && newModel && "id" in newModel) {
      setModel((newModel as any).id);
    } else {
      setModel(String(newModel || "liquid/lfm-2.5-1.2b-instruct:free"));
    }
  };
  const [modelType, setModelType] = useState<
    "text" | "vision" | "embedding" | "speech"
  >("text");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [visionImageUrl, setVisionImageUrl] = useState("");
  const [embeddingInput, setEmbeddingInput] = useState("");
  const [speechInput, setSpeechInput] = useState("");
  const [speechVoice, setSpeechVoice] = useState<
    "alloy" | "echo" | "fern" | "onyx" | "nova" | "shimmer"
  >("alloy");
  const [speechFormat, setSpeechFormat] = useState<
    "mp3" | "opus" | "aac" | "flac"
  >("mp3");
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
  const [queryParams, setQueryParams] = useState("{}");
  const [bodyTemplate, setBodyTemplate] = useState("{}");
  const [authType, setAuthType] = useState("none");
  const [authValue, setAuthValue] = useState("");
  const [responseSelector, setResponseSelector] = useState("");
  const [fallbackValue, setFallbackValue] = useState("null");

  // Ensure embedding uses a valid embedding model
  useEffect(() => {
    if (modelType === "embedding") {
      const modelValue = typeof model === "string" ? model : "";
      if (!modelValue || !modelValue.toLowerCase().includes("embedding")) {
        setModel("openai/text-embedding-3-small");
      }
    }
  }, [modelType, model]);

  // Ensure vision uses a non-embedding model (vision-capable)
  useEffect(() => {
    if (modelType === "vision") {
      const modelValue = typeof model === "string" ? model : "";
      if (!modelValue || modelValue.toLowerCase().includes("embedding")) {
        setModel("openai/gpt-4o-mini");
      }
    }
  }, [modelType, model]);

  const [textOperation, setTextOperation] = useState("uppercase");
  const [findText, setFindText] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [separator, setSeparator] = useState(",");
  const [textTemplate, setTextTemplate] = useState("{input}");

  const [extractionType, setExtractionType] = useState("regex");
  const [pattern, setPattern] = useState("(?<=Summary: ).*");
  const [startDelimiter, setStartDelimiter] = useState("<start>");
  const [endDelimiter, setEndDelimiter] = useState("<end>");

  const [searchEngine, setSearchEngine] = useState("duckduckgo");
  const [apiKey, setApiKey] = useState("");
  const [googleSearchEngineId, setGoogleSearchEngineId] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [safeSearch, setSafeSearch] = useState(true);
  const [resultFormat, setResultFormat] = useState("summary");

  const [condOperator, setCondOperator] = useState("equals");
  const [compareValue, setCompareValue] = useState("");
  const [ifTrueValue, setIfTrueValue] = useState("true");
  const [ifFalseValue, setIfFalseValue] = useState("false");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const [fileFormat, setFileFormat] = useState("text");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [parseJson, setParseJson] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync local state when selection changes
  useEffect(() => {
    if (!selectedNode) return;
    const cfg: any = selectedNode.data?.config || {};

    setTemplate(cfg.template || "Explain {topic} in simple terms.");
    const vars =
      cfg.variables && typeof cfg.variables === "object"
        ? Object.entries(cfg.variables).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        : [];
    setVariablesList(vars);
    setIncludeInput(cfg.includeInput ?? false);
    setInputPlaceholder(cfg.inputPlaceholder || "{input}");
    // Normalize model - if it's an object, extract the ID
    const modelValue = cfg.model;
    const normalizedModel =
      typeof modelValue === "object" && modelValue && "id" in modelValue
        ? (modelValue as any).id
        : String(modelValue || "liquid/lfm-2.5-1.2b-instruct:free");
    setModel(normalizedModel);
    setModelType(cfg.modelType || "text");
    setTemperature(cfg.temperature ?? 0.7);
    setMaxTokens(cfg.maxTokens ?? 1024);
    setVisionImageUrl(cfg.visionImageUrl || "");
    setEmbeddingInput(cfg.embeddingInput || "");
    setSpeechInput(cfg.speechInput || "");
    setSpeechVoice(cfg.speechVoice || "alloy");
    setSpeechFormat(cfg.speechFormat || "mp3");
    setUrl(cfg.url || "");
    setMethod(cfg.method || "GET");
    setHeaders(JSON.stringify(cfg.headers || {}, null, 2));
    setTimeoutMs(cfg.timeout ?? 30000);
    setOperation(cfg.memoryOperation || cfg.operation || "set");
    setMemKey(cfg.key || "data");
    setMemValue(
      cfg.value !== undefined ? JSON.stringify(cfg.value, null, 2) : "null",
    );
    setSourceType(cfg.sourceType || "mock");
    setFormat(cfg.format || "json");
    setDisplayFormat(cfg.displayFormat || "text");
    setQueryParams(JSON.stringify(cfg.queryParams || {}, null, 2));
    setBodyTemplate(
      typeof cfg.bodyTemplate === "string"
        ? cfg.bodyTemplate
        : JSON.stringify(cfg.bodyTemplate || {}, null, 2),
    );
    setAuthType(cfg.authType || "none");
    setAuthValue(cfg.authValue || "");
    setResponseSelector(cfg.responseFieldSelector || "");
    setFallbackValue(
      cfg.fallbackValue !== undefined
        ? JSON.stringify(cfg.fallbackValue, null, 2)
        : "null",
    );

    setTextOperation(cfg.textOperation || cfg.operation || "uppercase");
    setFindText(cfg.findText || "");
    setReplaceWith(cfg.replaceWith || "");
    setSeparator(cfg.separator || ",");
    setTextTemplate(cfg.textTemplate || cfg.template || "{input}");

    setExtractionType(cfg.extractionType || "regex");
    setPattern(cfg.pattern || "(?<=Summary: ).*");
    setStartDelimiter(cfg.startDelimiter || "<start>");
    setEndDelimiter(cfg.endDelimiter || "<end>");

    setSearchEngine(cfg.searchEngine || "duckduckgo");
    setApiKey(cfg.apiKey || "");
    setGoogleSearchEngineId(cfg.googleSearchEngineId || "");
    setMaxResults(cfg.maxResults ?? 5);
    setSafeSearch(cfg.safeSearch ?? true);
    setResultFormat(cfg.resultFormat || "summary");

    setCondOperator(cfg.operator || "equals");
    setCompareValue(cfg.compareValue ?? "");
    setIfTrueValue(
      cfg.ifTrueValue !== undefined ? JSON.stringify(cfg.ifTrueValue) : "true",
    );
    setIfFalseValue(
      cfg.ifFalseValue !== undefined
        ? JSON.stringify(cfg.ifFalseValue)
        : "false",
    );
    setCaseSensitive(cfg.caseSensitive ?? false);

    setFileFormat(cfg.fileFormat || "text");
    setCsvDelimiter(cfg.csvDelimiter || ",");
    setParseJson(cfg.parseJson ?? true);
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
        updatedConfig.variables = variablesList.reduce(
          (acc: Record<string, string>, item) => {
            const key = item.key.trim();
            if (key) {
              acc[key] = item.value;
            }
            return acc;
          },
          {},
        );
        updatedConfig.includeInput = includeInput;
        updatedConfig.inputPlaceholder = inputPlaceholder;
        break;
      }
      case "model": {
        // Ensure model is a string ID, not an object
        let modelId = model;
        if (typeof model === "object" && model && "id" in model) {
          modelId = (model as any).id;
        }
        updatedConfig.model = String(
          modelId || "liquid/lfm-2.5-1.2b-instruct:free",
        );
        updatedConfig.modelType = modelType;
        updatedConfig.temperature = Number(temperature);
        updatedConfig.maxTokens = Number(maxTokens);
        updatedConfig.visionImageUrl = visionImageUrl;
        updatedConfig.embeddingInput = embeddingInput;
        updatedConfig.speechInput = speechInput;
        updatedConfig.speechVoice = speechVoice;
        updatedConfig.speechFormat = speechFormat;
        break;
      }
      case "tool": {
        updatedConfig.url = url;
        updatedConfig.method = method;
        updatedConfig.headers = parseJSON(headers, cfg.headers || {});
        updatedConfig.timeout = Number(timeout);
        updatedConfig.queryParams = parseJSON(
          queryParams,
          cfg.queryParams || {},
        );
        updatedConfig.bodyTemplate = bodyTemplate;
        updatedConfig.authType = authType;
        updatedConfig.authValue = authValue;
        updatedConfig.responseFieldSelector = responseSelector;
        updatedConfig.fallbackValue = parseJSON(fallbackValue, null);
        break;
      }
      case "memory": {
        updatedConfig.memoryOperation = operation as any;
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
      case "textFormatter": {
        updatedConfig.textOperation = textOperation as any;
        updatedConfig.findText = findText;
        updatedConfig.replaceWith = replaceWith;
        updatedConfig.separator = separator;
        updatedConfig.textTemplate = textTemplate;
        break;
      }
      case "textExtractor": {
        updatedConfig.extractionType = extractionType as any;
        updatedConfig.pattern = pattern;
        updatedConfig.startDelimiter = startDelimiter;
        updatedConfig.endDelimiter = endDelimiter;
        break;
      }
      case "webSearch": {
        updatedConfig.searchEngine = searchEngine as any;
        updatedConfig.apiKey = apiKey;
        updatedConfig.googleSearchEngineId = googleSearchEngineId;
        updatedConfig.maxResults = Number(maxResults);
        updatedConfig.safeSearch = safeSearch;
        updatedConfig.resultFormat = resultFormat as any;
        break;
      }
      case "condition": {
        updatedConfig.operator = condOperator;
        updatedConfig.compareValue = compareValue;
        updatedConfig.ifTrueValue = parseJSON(ifTrueValue, true);
        updatedConfig.ifFalseValue = parseJSON(ifFalseValue, false);
        updatedConfig.caseSensitive = caseSensitive;
        break;
      }
      case "fileReader": {
        updatedConfig.sourceType = sourceType;
        updatedConfig.url = url;
        updatedConfig.fileFormat = fileFormat as any;
        updatedConfig.csvDelimiter = csvDelimiter;
        updatedConfig.parseJson = parseJson;
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
        placeholder="Use {variable_name} for placeholders. Input data from connected blocks will be merged with these variables."
      />
      <p className="text-xs text-gray-500 mb-3">
        💡 Variables are replaced in order: input data (from connected blocks) →
        configured variables (below)
      </p>

      <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-3">
        <input
          type="checkbox"
          checked={includeInput}
          onChange={(e) => setIncludeInput(e.target.checked)}
        />
        Include entire previous block output
      </label>

      {includeInput && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder for Previous Output
          </label>
          <input
            type="text"
            value={inputPlaceholder}
            onChange={(e) => setInputPlaceholder(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            aria-label="Input placeholder"
            placeholder="{input}"
          />
          <p className="text-xs text-gray-500 mb-3">
            Use this placeholder in your template to include the previous
            block's output. Example: "Summarize this: {"{input}"}"
          </p>
        </>
      )}

      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Variables
        </label>
        <button
          type="button"
          onClick={() =>
            setVariablesList((prev) => [...prev, { key: "", value: "" }])
          }
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          + Add variable
        </button>
      </div>

      {variablesList.length === 0 && (
        <div className="text-xs text-gray-500 mb-3">
          No variables yet. Add key/value pairs to use as defaults.
        </div>
      )}

      <div className="space-y-2">
        {variablesList.map((item, index) => (
          <div key={`var-${index}`} className="flex gap-2 items-center">
            <input
              type="text"
              value={item.key}
              onChange={(e) =>
                setVariablesList((prev) =>
                  prev.map((v, i) =>
                    i === index ? { ...v, key: e.target.value } : v,
                  ),
                )
              }
              className="flex-1 border border-gray-300 rounded p-2 text-sm"
              placeholder="variable_name"
              aria-label={`Variable name ${index + 1}`}
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) =>
                setVariablesList((prev) =>
                  prev.map((v, i) =>
                    i === index ? { ...v, value: e.target.value } : v,
                  ),
                )
              }
              className="flex-1 border border-gray-300 rounded p-2 text-sm"
              placeholder="value"
              aria-label={`Variable value ${index + 1}`}
            />
            <button
              type="button"
              onClick={() =>
                setVariablesList((prev) => prev.filter((_, i) => i !== index))
              }
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
              aria-label={`Remove variable ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const renderModel = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Model Type
      </label>
      <select
        value={modelType}
        onChange={(e) => setModelType(e.target.value as any)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Model type"
      >
        <option value="text">Text Generation</option>
        <option value="vision">Vision (Image Analysis)</option>
        <option value="embedding">Embedding (Vector Representation)</option>
        <option value="speech">Text-to-Speech</option>
      </select>

      {modelType === "text" && (
        <>
          <ModelSelector
            value={model}
            onChange={(newModel) => handleModelChange(newModel)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Temperature
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            aria-label="Temperature"
          />
          <p className="text-xs text-gray-500 mb-3">
            Controls randomness: 0 = deterministic, 1 = balanced, 2 = creative
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            min="1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            aria-label="Max tokens"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum length of the generated response
          </p>
        </>
      )}

      {modelType === "vision" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Vision Model
          </label>
          <ModelSelector
            value={model}
            onChange={(newModel) => handleModelChange(newModel)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Image URL
          </label>
          <input
            type="text"
            value={visionImageUrl}
            onChange={(e) => setVisionImageUrl(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            placeholder="https://example.com/image.jpg"
            aria-label="Image URL"
          />
          <p className="text-xs text-gray-500 mb-3">
            Provide a URL to the image you want to analyze
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
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
            min="1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            aria-label="Max tokens"
          />
        </>
      )}

      {modelType === "embedding" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Embedding Model
          </label>
          <ModelSelector
            value={model}
            onChange={(newModel) => handleModelChange(newModel)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Text Input (optional)
          </label>
          <textarea
            value={embeddingInput}
            onChange={(e) => setEmbeddingInput(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            placeholder="Leave empty to use input from previous block"
            rows={3}
            aria-label="Embedding input text"
          />
          <p className="text-xs text-gray-500 mt-1">
            Converts text to a vector representation for similarity searches or
            ML models
          </p>
        </>
      )}

      {modelType === "speech" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Text Input (optional)
          </label>
          <textarea
            value={speechInput}
            onChange={(e) => setSpeechInput(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            placeholder="Leave empty to use input from previous block"
            rows={3}
            aria-label="Speech input text"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice
          </label>
          <select
            value={speechVoice}
            onChange={(e) => setSpeechVoice(e.target.value as any)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            aria-label="Voice selection"
          >
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fern">Fern</option>
            <option value="onyx">Onyx</option>
            <option value="nova">Nova</option>
            <option value="shimmer">Shimmer</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio Format
          </label>
          <select
            value={speechFormat}
            onChange={(e) => setSpeechFormat(e.target.value as any)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            aria-label="Audio format"
          >
            <option value="mp3">MP3</option>
            <option value="opus">Opus</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Generates spoken audio from text
          </p>
        </>
      )}
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

      <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
        Query Params (JSON)
      </label>
      <textarea
        value={queryParams}
        onChange={(e) => setQueryParams(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono mb-3"
        aria-label="Query params JSON"
        rows={3}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Body Template (JSON or string)
      </label>
      <textarea
        value={bodyTemplate}
        onChange={(e) => setBodyTemplate(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono mb-3"
        aria-label="Body template"
        rows={3}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Auth Type
      </label>
      <select
        value={authType}
        onChange={(e) => setAuthType(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Auth type"
      >
        <option value="none">none</option>
        <option value="bearer">bearer</option>
        <option value="apiKey">apiKey</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Auth Value
      </label>
      <input
        value={authValue}
        onChange={(e) => setAuthValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Auth value"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Response Field Selector
      </label>
      <input
        value={responseSelector}
        onChange={(e) => setResponseSelector(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Response selector"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fallback Value (JSON)
      </label>
      <textarea
        value={fallbackValue}
        onChange={(e) => setFallbackValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
        aria-label="Fallback value"
        rows={3}
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
        <option value="url">url</option>
        <option value="upload">upload</option>
        <option value="input">input</option>
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

  const renderTextFormatter = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Operation
      </label>
      <select
        value={textOperation}
        onChange={(e) => setTextOperation(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Text formatter operation"
      >
        <option value="uppercase">uppercase</option>
        <option value="lowercase">lowercase</option>
        <option value="trim">trim</option>
        <option value="replace">replace</option>
        <option value="capitalize">capitalize</option>
        <option value="template">template</option>
        <option value="split">split</option>
        <option value="join">join</option>
        <option value="length">length</option>
        <option value="reverse">reverse</option>
        <option value="removeSpaces">removeSpaces</option>
        <option value="slugify">slugify</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Find Text
      </label>
      <input
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Find text"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Replace With
      </label>
      <input
        value={replaceWith}
        onChange={(e) => setReplaceWith(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Replace with"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Separator
      </label>
      <input
        value={separator}
        onChange={(e) => setSeparator(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Separator"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Template (use {`{input}`})
      </label>
      <textarea
        value={textTemplate}
        onChange={(e) => setTextTemplate(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
        aria-label="Text template"
        rows={3}
      />
    </>
  );

  const renderWebSearch = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Engine
      </label>
      <select
        value={searchEngine}
        onChange={(e) => setSearchEngine(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Search engine"
      >
        <option value="duckduckgo">duckduckgo</option>
        <option value="brave">brave</option>
        <option value="google">google</option>
        <option value="custom">custom</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        API Key (if required)
      </label>
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="API key"
      />

      {searchEngine === "google" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Search Engine ID (cx)
          </label>
          <input
            value={googleSearchEngineId}
            onChange={(e) => setGoogleSearchEngineId(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            aria-label="Google Search Engine ID"
          />
        </>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Max Results
      </label>
      <input
        type="number"
        min={1}
        value={maxResults}
        onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Max results"
      />

      <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-3">
        <input
          type="checkbox"
          checked={safeSearch}
          onChange={(e) => setSafeSearch(e.target.checked)}
        />
        Safe search
      </label>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Result Format
      </label>
      <select
        value={resultFormat}
        onChange={(e) => setResultFormat(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm"
        aria-label="Result format"
      >
        <option value="summary">summary</option>
        <option value="full">full</option>
        <option value="urls">urls</option>
      </select>
    </>
  );

  const renderCondition = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Operator
      </label>
      <select
        value={condOperator}
        onChange={(e) => setCondOperator(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Condition operator"
      >
        <option value="equals">equals</option>
        <option value="notEquals">notEquals</option>
        <option value="contains">contains</option>
        <option value="notContains">notContains</option>
        <option value="greaterThan">greaterThan</option>
        <option value="lessThan">lessThan</option>
        <option value="greaterThanOrEqual">greaterThanOrEqual</option>
        <option value="lessThanOrEqual">lessThanOrEqual</option>
        <option value="exists">exists</option>
        <option value="isEmpty">isEmpty</option>
        <option value="isNumber">isNumber</option>
        <option value="startsWith">startsWith</option>
        <option value="endsWith">endsWith</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Compare Value
      </label>
      <input
        value={compareValue}
        onChange={(e) => setCompareValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Compare value"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        If True (JSON)
      </label>
      <textarea
        value={ifTrueValue}
        onChange={(e) => setIfTrueValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono mb-3"
        aria-label="If true value"
        rows={2}
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        If False (JSON)
      </label>
      <textarea
        value={ifFalseValue}
        onChange={(e) => setIfFalseValue(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-xs font-mono mb-3"
        aria-label="If false value"
        rows={2}
      />

      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        Case sensitive
      </label>
    </>
  );

  const renderFileReader = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Source Type
      </label>
      <select
        value={sourceType}
        onChange={(e) => setSourceType(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="File source type"
      >
        <option value="url">url</option>
        <option value="upload">upload</option>
        <option value="input">input</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        URL or Input
      </label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="File URL or input"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        File Format
      </label>
      <select
        value={fileFormat}
        onChange={(e) => setFileFormat(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="File format"
      >
        <option value="text">text</option>
        <option value="json">json</option>
        <option value="csv">csv</option>
        <option value="pdf">pdf</option>
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        CSV Delimiter
      </label>
      <input
        value={csvDelimiter}
        onChange={(e) => setCsvDelimiter(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="CSV delimiter"
      />

      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={parseJson}
          onChange={(e) => setParseJson(e.target.checked)}
        />
        Parse JSON
      </label>
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

  const renderTextExtractor = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Extraction Type
      </label>
      <select
        value={extractionType}
        onChange={(e) => setExtractionType(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
        aria-label="Extraction type"
      >
        <option value="regex">regex</option>
        <option value="between">between</option>
      </select>

      {extractionType === "regex" ? (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regex Pattern
          </label>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            aria-label="Regex pattern"
          />
          <p className="text-xs text-gray-500 mt-1">
            First capture group is returned; otherwise first match.
          </p>
        </>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Delimiter
          </label>
          <input
            value={startDelimiter}
            onChange={(e) => setStartDelimiter(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm mb-3"
            aria-label="Start delimiter"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Delimiter
          </label>
          <input
            value={endDelimiter}
            onChange={(e) => setEndDelimiter(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm"
            aria-label="End delimiter"
          />
        </>
      )}
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
      case "textFormatter":
        return renderTextFormatter();
      case "textExtractor":
        return renderTextExtractor();
      case "webSearch":
        return renderWebSearch();
      case "condition":
        return renderCondition();
      case "fileReader":
        return renderFileReader();
      default:
        return (
          <div className="text-sm text-gray-500">No editor available.</div>
        );
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 p-4 w-full overflow-y-auto">
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
