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
    model: "liquid/lfm-2.5-1.2b-instruct:free",
    temperature: 0.7,
    maxTokens: 1024,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      model = "liquid/lfm-2.5-1.2b-instruct:free",
      temperature = 0.7,
      maxTokens = 1024,
    } = block.config;

    // Convert input to string if it's not already
    const prompt = typeof input === "string" ? input : JSON.stringify(input);

    try {
      // Call backend API for AI execution
      // Use absolute URL to avoid proxy issues
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/execute`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API call failed: ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ""}`,
        );
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
