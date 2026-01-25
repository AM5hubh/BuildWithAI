import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * PromptBlock - Accepts a prompt template with variables
 * Variables are replaced with actual values from input
 */
const promptBlockDefinition: BlockDefinition = {
  type: "prompt",
  label: "Prompt",
  description: "Create a prompt template with variables",
  defaultConfig: {
    template: "Explain {topic} in simple terms.",
    variables: {},
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const { template = "", variables = {} } = block.config;

    // Replace variables in template
    let processedPrompt = template;

    // First, replace from input if available
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

    // Then, replace from config variables
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
