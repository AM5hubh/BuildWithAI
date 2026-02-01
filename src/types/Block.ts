/**
 * Core Block Interface
 * All blocks must implement this standardized schema for consistency
 */
export interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  input: any;
  output: any;
}

export type BlockType =
  | "prompt"
  | "model"
  | "output"
  | "tool"
  | "memory"
  | "datasource"
  | "textFormatter"
  | "textExtractor"
  | "webSearch"
  | "condition"
  | "fileReader";

// Operation types for specific blocks
export type MemoryOperation = "set" | "get" | "append" | "clear";
export type TextFormatterOperation =
  | "uppercase"
  | "lowercase"
  | "trim"
  | "replace"
  | "capitalize"
  | "template"
  | "split"
  | "join"
  | "length"
  | "reverse"
  | "removeSpaces"
  | "slugify";

/**
 * Configuration for different block types
 */
export interface BlockConfig {
  // Legacy field retained for backward compatibility
  operation?: string;

  // PromptBlock config
  template?: string;
  variables?: Record<string, string>;
  includeInput?: boolean;
  inputPlaceholder?: string;

  // ModelBlock config
  model?: string;
  modelType?: "text" | "vision" | "embedding" | "speech"; // text, vision, embedding, speech
  temperature?: number;
  maxTokens?: number;
  visionImageUrl?: string;
  embeddingInput?: string;
  speechInput?: string;
  speechVoice?: "alloy" | "echo" | "fern" | "onyx" | "nova" | "shimmer";
  speechFormat?: "mp3" | "opus" | "aac" | "flac";

  // OutputBlock config
  displayFormat?: "text" | "json" | "markdown";

  // ToolBlock config
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  timeout?: number;

  // MemoryBlock config
  memoryOperation?: MemoryOperation;
  key?: string;
  value?: any;

  // DataSourceBlock config
  sourceType?: "json" | "csv" | "api" | "mock" | "url" | "upload" | "input";
  format?: string;

  // TextFormatterBlock config
  textOperation?: TextFormatterOperation;
  findText?: string;
  replaceWith?: string;
  separator?: string;
  textTemplate?: string;

  // TextExtractorBlock config
  extractionType?: "regex" | "between";
  pattern?: string;
  startDelimiter?: string;
  endDelimiter?: string;

  // WebSearchBlock config
  searchEngine?: "duckduckgo" | "brave" | "google" | "custom";
  apiKey?: string;
  googleSearchEngineId?: string;
  maxResults?: number;
  safeSearch?: boolean;
  resultFormat?: "summary" | "full" | "urls";

  // ConditionBlock config
  operator?: string;
  compareValue?: string;
  ifTrueValue?: any;
  ifFalseValue?: any;
  caseSensitive?: boolean;

  // FileReaderBlock config
  fileFormat?: "text" | "json" | "csv" | "pdf";
  encoding?: string;
  csvDelimiter?: string;
  parseJson?: boolean;
  queryParams?: Record<string, string>;
  bodyTemplate?: string;
  authType?: string;
  authValue?: string;
  responseFieldSelector?: string;
  fallbackValue?: any;
}

/**
 * Execution result for a block
 */
export interface BlockExecutionResult {
  blockId: string;
  output: any;
  error?: string;
  timestamp: number;
}

/**
 * Block definition for registry
 */
export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  defaultConfig: BlockConfig;
  execute: (block: Block, input: any) => Promise<any>;
}
