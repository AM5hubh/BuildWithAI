import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * ToolBlock - Makes HTTP API calls to external tools/services
 * Supports GET, POST, PUT, DELETE requests with headers and body
 */
const toolBlockDefinition: BlockDefinition = {
  type: "tool",
  label: "Tool",
  description: "Call an external API or tool",
  defaultConfig: {
    url: "https://api.example.com/endpoint",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      url = "",
      method = "GET",
      headers = {},
      timeout = 30000,
    } = block.config;

    if (!url) {
      throw new Error("Tool URL is required");
    }

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: AbortSignal.timeout(timeout),
      };

      // Add body for POST/PUT requests
      if ((method === "POST" || method === "PUT") && input) {
        fetchOptions.body =
          typeof input === "string" ? input : JSON.stringify(input);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
      throw new Error("Tool execution failed");
    }
  },
};

// Register the block
blockRegistry.register(toolBlockDefinition);

export default toolBlockDefinition;
