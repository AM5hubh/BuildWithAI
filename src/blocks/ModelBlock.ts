import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * ModelBlock - Executes an LLM call using OpenRouter API
 * Sends the input prompt to the backend API
 */
const modelBlockDefinition: BlockDefinition = {
  type: "model",
  label: "AI Model",
  description: "Execute an AI model with the given prompt",
  defaultConfig: {
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7,
    maxTokens: 1024,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      model = "anthropic/claude-3.5-sonnet",
      temperature = 0.7,
      maxTokens = 1024,
    } = block.config;

    // Convert input to string if it's not already
    const prompt = typeof input === "string" ? input : JSON.stringify(input);

    try {
      // Call backend API for AI execution
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model,
          temperature,
          maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      throw new Error(
        `Model execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
};

// Register the block
blockRegistry.register(modelBlockDefinition);

export default modelBlockDefinition;
