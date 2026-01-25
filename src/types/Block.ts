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

export type BlockType = "prompt" | "model" | "output";

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
