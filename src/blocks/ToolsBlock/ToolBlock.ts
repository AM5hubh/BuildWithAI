import { Block, BlockDefinition } from "../../types/Block";
import { blockRegistry } from "../registry";

/**
 * ToolBlock - Makes HTTP API calls to external tools/services
 * Supports GET, POST, PUT, DELETE requests with:
 * - Query parameters
 * - Variable substitution in request body
 * - Response field selection
 * - Authentication (Bearer, API Key)
 */
const toolBlockDefinition: BlockDefinition = {
  type: "tool",
  label: "Tool",
  description:
    "Call an external API or tool with authentication & response mapping",
  defaultConfig: {
    url: "https://api.example.com/endpoint",
    method: "POST",
    queryParams: {},
    bodyTemplate: "{}",
    headers: {
      "Content-Type": "application/json",
    },
    authType: "none", // 'none', 'bearer', 'apiKey'
    authValue: "",
    responseFieldSelector: "", // e.g., "data.results[0].text" or leave empty for full response
    timeout: 30000,
    fallbackValue: null,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      url = "",
      method = "GET",
      queryParams = {},
      bodyTemplate = "{}",
      headers = {},
      authType = "none",
      authValue = "",
      responseFieldSelector = "",
      timeout = 30000,
      fallbackValue = null,
    } = block.config;

    if (!url) {
      throw new Error("Tool URL is required");
    }

    try {
      // Build URL with query parameters
      let finalUrl = url;
      if (Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          // Support variable substitution in query params
          const substitutedValue = substituteVariables(String(value), input);
          params.append(key, substitutedValue);
        });
        finalUrl = `${url}?${params.toString()}`;
      }

      // Prepare request body with variable substitution
      let body: string | null = null;
      if (method === "POST" || method === "PUT") {
        if (bodyTemplate && bodyTemplate !== "{}") {
          // Parse template and substitute variables
          const templateObj =
            typeof bodyTemplate === "string"
              ? JSON.parse(bodyTemplate)
              : bodyTemplate;
          body = JSON.stringify(substituteInObject(templateObj, input));
        } else if (input) {
          body = typeof input === "string" ? input : JSON.stringify(input);
        }
      }

      // Prepare headers with authentication
      const finalHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers,
      };

      if (authType === "bearer" && authValue) {
        finalHeaders["Authorization"] = `Bearer ${authValue}`;
      } else if (authType === "apiKey" && authValue) {
        finalHeaders["X-API-Key"] = authValue;
      }

      // Make the API request
      const fetchOptions: RequestInit = {
        method,
        headers: finalHeaders,
        signal: AbortSignal.timeout(timeout),
      };

      if (body) {
        fetchOptions.body = body;
      }

      const response = await fetch(finalUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      let data = await response.json();

      // Apply response field selector if provided
      if (responseFieldSelector) {
        data = selectFieldFromResponse(data, responseFieldSelector);
      }

      return data;
    } catch (error) {
      // Return fallback value if provided, otherwise throw error
      if (fallbackValue !== null && fallbackValue !== undefined) {
        console.warn(`Tool execution failed, using fallback:`, error);
        return fallbackValue;
      }

      if (error instanceof Error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
      throw new Error("Tool execution failed");
    }
  },
};

/**
 * Substitute variables in a string using dot notation
 * e.g., "Hello {name}" with input {name: "World"} -> "Hello World"
 */
function substituteVariables(template: string, input: any): string {
  if (!input) return template;

  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = getNestedValue(input, key.trim());
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Recursively substitute variables in an object
 */
function substituteInObject(obj: any, input: any): any {
  if (typeof obj === "string") {
    return substituteVariables(obj, input);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => substituteInObject(item, input));
  }

  if (typeof obj === "object" && obj !== null) {
    const result: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      result[key] = substituteInObject(value, input);
    });
    return result;
  }

  return obj;
}

/**
 * Get nested value from object using dot notation
 * e.g., getNestedValue({user: {name: "John"}}, "user.name") -> "John"
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (current === undefined || current === null) return undefined;

    // Handle array indexing like "results[0]"
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const [, arrayKey, index] = match;
      return current[arrayKey]?.[parseInt(index)];
    }

    return current[key];
  }, obj);
}

/**
 * Select a field from response using path notation
 * e.g., "data.results[0].text" returns response.data.results[0].text
 */
function selectFieldFromResponse(response: any, selector: string): any {
  const parts = selector.split(".");
  let current = response;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;

    // Handle array indexing like "results[0]"
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const [, key, index] = match;
      current = current[key]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

// Register the block
blockRegistry.register(toolBlockDefinition);

export default toolBlockDefinition;
