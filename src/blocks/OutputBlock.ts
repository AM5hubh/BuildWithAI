import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * OutputBlock - Displays the final result
 * Simply passes through the input for display
 */
const outputBlockDefinition: BlockDefinition = {
  type: "output",
  label: "Output",
  description: "Display the final result",
  defaultConfig: {
    displayFormat: "text",
  },

  execute: async (_block: Block, input: any): Promise<any> => {
    // Output block just passes through the input
    // The actual display is handled by the UI component
    return input;
  },
};

// Register the block
blockRegistry.register(outputBlockDefinition);

export default outputBlockDefinition;
