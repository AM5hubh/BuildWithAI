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
  | "datasource";

/**
 * Configuration for different block types
 */
export interface BlockConfig {
  // PromptBlock config
  template?: string;
  variables?: Record<string, string>;

  // ModelBlock config
  model?: string;
  temperature?: number;
  maxTokens?: number;

  // OutputBlock config
  displayFormat?: "text" | "json" | "markdown";

  // ToolBlock config
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  timeout?: number;

  // MemoryBlock config
  operation?: "set" | "get" | "append" | "clear";
  key?: string;
  value?: any;

  // DataSourceBlock config
  sourceType?: "json" | "csv" | "api" | "mock";
  format?: string;
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
