import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * WebSearchBlock - Search the web using various search APIs
 * Supports: DuckDuckGo, Brave Search, Google Custom Search, or custom API
 */
const webSearchBlockDefinition: BlockDefinition = {
  type: "webSearch",
  label: "Web Search",
  description: "Search the web and return results",
  defaultConfig: {
    searchEngine: "duckduckgo", // 'duckduckgo', 'brave', 'google', 'custom'
    apiKey: "",
    googleSearchEngineId: "",
    maxResults: 5,
    safeSearch: true,
    resultFormat: "summary", // 'summary', 'full', 'urls'
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      searchEngine = "duckduckgo",
      apiKey = "",
      googleSearchEngineId = "",
      maxResults = 5,
      safeSearch = true,
      resultFormat = "summary",
    } = block.config;

    // Use input as search query
    const query = typeof input === "string" ? input : String(input);

    if (!query || query.trim() === "") {
      throw new Error("Search query is required");
    }

    try {
      let results;

      if (searchEngine === "duckduckgo") {
        results = await searchDuckDuckGo(query, maxResults);
      } else if (searchEngine === "brave") {
        if (!apiKey) {
          throw new Error("Brave search requires an API key");
        }
        results = await searchBrave(query, apiKey, maxResults, safeSearch);
      } else if (searchEngine === "google") {
        if (!apiKey) {
          throw new Error("Google search requires an API key");
        }
        if (!googleSearchEngineId) {
          throw new Error("Google search requires a Search Engine ID (cx)");
        }
        results = await searchGoogle(
          query,
          apiKey,
          googleSearchEngineId,
          maxResults,
          safeSearch,
        );
      } else if (searchEngine === "custom") {
        throw new Error(
          "Custom search engine not implemented. Please use DuckDuckGo, Brave, or Google.",
        );
      } else {
        throw new Error(`Unsupported search engine: ${searchEngine}`);
      }

      // Format results based on preference
      switch (resultFormat) {
        case "summary":
          return results.map((r: any) => ({
            title: r.title,
            snippet: r.snippet,
            url: r.url,
          }));

        case "urls":
          return results.map((r: any) => r.url);

        case "full":
          return results;

        default:
          return results;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Web search failed: ${error.message}`);
      }
      throw new Error("Web search failed");
    }
  },
};

/**
 * DuckDuckGo Instant Answer API (free, no API key required)
 */
async function searchDuckDuckGo(
  query: string,
  maxResults: number,
): Promise<any[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
    );

    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    // Add abstract if available
    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        snippet: data.Abstract,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodedQuery}`,
      });
    }

    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - 1)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text.substring(0, 50),
            snippet: topic.Text,
            url: topic.FirstURL,
          });
        }
      }
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    return [];
  }
}

/**
 * Brave Search API (requires API key)
 */
async function searchBrave(
  query: string,
  apiKey: string,
  maxResults: number,
  safeSearch: boolean,
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(maxResults),
      safesearch: safeSearch ? "strict" : "off",
    });

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          "X-Subscription-Token": apiKey,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.web && data.web.results) {
      return data.web.results.map((result: any) => ({
        title: result.title,
        snippet: result.description,
        url: result.url,
      }));
    }

    return [];
  } catch (error) {
    throw new Error(
      `Brave search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Google Custom Search API (requires API key and Search Engine ID)
 */
async function searchGoogle(
  query: string,
  apiKey: string,
  searchEngineId: string,
  maxResults: number,
  safeSearch: boolean,
): Promise<any[]> {
  try {
    const clampedResults = Math.min(Math.max(maxResults, 1), 10);
    const params = new URLSearchParams({
      q: query,
      key: apiKey,
      cx: searchEngineId,
      num: String(clampedResults),
      safe: safeSearch ? "active" : "off",
    });

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        url: item.link,
      }));
    }

    return [];
  } catch (error) {
    throw new Error(
      `Google search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Register the block
blockRegistry.register(webSearchBlockDefinition);

export default webSearchBlockDefinition;
