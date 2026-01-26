/**
 * OpenRouter Models Service
 * Fetches and manages available AI models from OpenRouter API
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models";
const CACHE_KEY = "openrouter_models_cache";
const CACHE_DURATION = 3600000; // 1 hour

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  isFree?: boolean;
}

export interface ModelsCache {
  data: ModelInfo[];
  timestamp: number;
}

/**
 * Get all available models from OpenRouter
 */
export const fetchOpenRouterModels = async (): Promise<ModelInfo[]> => {
  try {
    // Check cache first
    const cached = getCachedModels();
    if (cached) {
      console.log("✓ Using cached OpenRouter models");
      return cached;
    }

    // Fetch from API
    const response = await fetch(OPENROUTER_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    // Cache the results
    cacheModels(models);

    console.log(`✓ Fetched ${models.length} models from OpenRouter`);
    return models;
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);
    // Return popular models as fallback
    return getPopularModels();
  }
};

/**
 * Get cached models if still valid
 */
function getCachedModels(): ModelInfo[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: ModelsCache = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

/**
 * Cache models in localStorage
 */
function cacheModels(models: ModelInfo[]): void {
  try {
    const cache: ModelsCache = {
      data: models,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

/**
 * Popular models to show if API fetch fails
 */
function getPopularModels(): ModelInfo[] {
  return [
    {
      id: "meta-llama/llama-3.1-8b-instruct:free",
      name: "Llama 3.1 8B (Free)",
      description: "Meta's efficient open model - Free",
      isFree: true,
    },
    {
      id: "google/gemini-flash-1.5",
      name: "Gemini Flash 1.5 (Free)",
      description: "Google's fast model - Free",
      isFree: true,
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      description: "Most capable Claude model",
      isFree: false,
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      description: "OpenAI's most capable model",
      isFree: false,
    },
    {
      id: "openai/gpt-4",
      name: "GPT-4",
      description: "OpenAI's reliable model",
      isFree: false,
    },
    {
      id: "openai/gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "Fast and efficient",
      isFree: false,
    },
    {
      id: "meta-llama/llama-3.1-70b",
      name: "Llama 3.1 70B",
      description: "Meta's powerful open model",
      isFree: false,
    },
    {
      id: "mistralai/mistral-7b-instruct",
      name: "Mistral 7B Instruct",
      description: "Efficient open model",
      isFree: false,
    },
  ];
}

/**
 * Get model display name
 */
export const getModelDisplayName = (
  modelId: string,
  models: ModelInfo[],
): string => {
  const model = models.find((m) => m.id === modelId);
  return model?.name || modelId;
};

/**
 * Get model description
 */
export const getModelDescription = (
  modelId: string,
  models: ModelInfo[],
): string => {
  const model = models.find((m) => m.id === modelId);
  return model?.description || "Select a model";
};
