import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * MemoryBlock - Stores and retrieves data in memory
 * Can set, get, or append data to memory storage
 * Operations: "set", "get", "append", "clear"
 */
const memoryBlockDefinition: BlockDefinition = {
  type: "memory",
  label: "Memory",
  description: "Store and retrieve data in memory",
  defaultConfig: {
    operation: "set",
    key: "data",
    value: null,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const { operation = "set", key = "data", value } = block.config;

    // Get or initialize memory storage from global scope
    // In a real app, this would be managed by a more persistent store
    (globalThis as any).__FLOW_MEMORY__ =
      (globalThis as any).__FLOW_MEMORY__ || {};
    const memory = (globalThis as any).__FLOW_MEMORY__;

    try {
      switch (operation) {
        case "set": {
          // Set value from config or input
          const dataToStore = value !== null ? value : input;
          memory[key] = dataToStore;
          return {
            success: true,
            operation: "set",
            key,
            value: dataToStore,
          };
        }

        case "get": {
          // Retrieve value from memory
          const retrievedValue = memory[key];
          if (retrievedValue === undefined) {
            return {
              success: false,
              error: `Key "${key}" not found in memory`,
            };
          }
          return retrievedValue;
        }

        case "append": {
          // Append to array in memory
          if (!Array.isArray(memory[key])) {
            memory[key] = [];
          }
          memory[key].push(input);
          return {
            success: true,
            operation: "append",
            key,
            arrayLength: memory[key].length,
          };
        }

        case "clear": {
          // Clear all memory or specific key
          if (key === "*") {
            (globalThis as any).__FLOW_MEMORY__ = {};
            return { success: true, operation: "clear", cleared: "all" };
          } else {
            delete memory[key];
            return {
              success: true,
              operation: "clear",
              key,
            };
          }
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Memory operation failed: ${error.message}`);
      }
      throw new Error("Memory operation failed");
    }
  },
};

// Register the block
blockRegistry.register(memoryBlockDefinition);

export default memoryBlockDefinition;
