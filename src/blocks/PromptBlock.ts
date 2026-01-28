import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * PromptBlock - Accepts a prompt template with variables
 * Supports dynamic input from connected blocks merged with static variables
 * Input variables override static variables with the same name
 */
const promptBlockDefinition: BlockDefinition = {
  type: "prompt",
  label: "Prompt",
  description:
    "Create a prompt template with variables that accept input from connected blocks",
  defaultConfig: {
    template: "Explain {topic} in simple terms.",
    variables: { topic: "quantum computing" },
    includeInput: false,
    inputPlaceholder: "{input}",
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      template = "",
      variables = {},
      includeInput = false,
      inputPlaceholder = "{input}",
    } = block.config;

    // Replace variables in template
    let processedPrompt = template;

    // Priority 0: If includeInput is enabled, insert the entire input first
    if (includeInput && input !== undefined && input !== null) {
      const inputDisplay =
        typeof input === "string" ? input : JSON.stringify(input, null, 2);
      processedPrompt = processedPrompt.replace(
        new RegExp(inputPlaceholder.replace(/[{}]/g, "\\$&"), "g"),
        inputDisplay,
      );
    }

    // Priority 1: Replace from input (if data comes from connected block like API endpoint)
    // This allows real-time data from previous blocks to populate the prompt
    if (input && typeof input === "object") {
      Object.keys(input).forEach((key) => {
        const placeholder = `{${key}}`;
        if (processedPrompt.includes(placeholder)) {
          processedPrompt = processedPrompt.replace(
            new RegExp(placeholder, "g"),
            String(input[key]),
          );
        }
      });
    }

    // Priority 2: Replace from config variables (static defaults)
    // These are fallbacks if input doesn't provide the value
    Object.keys(variables).forEach((key) => {
      const placeholder = `{${key}}`;
      if (processedPrompt.includes(placeholder)) {
        processedPrompt = processedPrompt.replace(
          new RegExp(placeholder, "g"),
          variables[key],
        );
      }
    });

    return processedPrompt;
  },
};

// Register the block
blockRegistry.register(promptBlockDefinition);

export default promptBlockDefinition;
