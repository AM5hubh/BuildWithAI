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
  const [queryParams, setQueryParams] = useState("{}");
  const [bodyTemplate, setBodyTemplate] = useState("{}");
  const [authType, setAuthType] = useState("none");
  const [authValue, setAuthValue] = useState("");
  const [responseSelector, setResponseSelector] = useState("");
  const [fallbackValue, setFallbackValue] = useState("null");

  const [textOperation, setTextOperation] = useState("uppercase");
  const [findText, setFindText] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [separator, setSeparator] = useState(",");
  const [textTemplate, setTextTemplate] = useState("{input}");

  const [searchEngine, setSearchEngine] = useState("duckduckgo");
  const [apiKey, setApiKey] = useState("");
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
    setVariables(JSON.stringify(cfg.variables || {}, null, 2));
    setModel(cfg.model || "anthropic/claude-3.5-sonnet");
    setTemperature(cfg.temperature ?? 0.7);
    setMaxTokens(cfg.maxTokens ?? 1024);
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

    setSearchEngine(cfg.searchEngine || "duckduckgo");
    setApiKey(cfg.apiKey || "");
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
      case "webSearch": {
        updatedConfig.searchEngine = searchEngine as any;
        updatedConfig.apiKey = apiKey;
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
      <ModelSelector
        value={model}
        onChange={(newModel) => setModel(newModel)}
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
