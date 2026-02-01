import { Block, BlockDefinition } from "../../types/Block";
import { blockRegistry } from "../registry";

/**
 * ModelBlock - Executes different types of AI models
 * Supports: Text generation, Vision, Embeddings, Speech-to-text/Text-to-speech
 */
const modelBlockDefinition: BlockDefinition = {
  type: "model",
  label: "AI Model",
  description:
    "Execute AI models: text generation, vision, embeddings, or speech",
  defaultConfig: {
    model: "liquid/lfm-2.5-1.2b-instruct:free",
    modelType: "text",
    temperature: 0.7,
    maxTokens: 1024,
    visionImageUrl: "",
    embeddingInput: "",
    speechInput: "",
    speechVoice: "alloy",
    speechFormat: "mp3",
  },

  execute: async (block: Block, input: any): Promise<any> => {
    let {
      model = "liquid/lfm-2.5-1.2b-instruct:free",
      modelType = "text",
      temperature = 0.7,
      maxTokens = 1024,
      visionImageUrl = "",
      embeddingInput = "",
      speechInput = "",
      speechVoice = "alloy",
      speechFormat = "mp3",
    } = block.config;

    // Ensure model is a string ID
    if (typeof model === "object" && model && "id" in model) {
      model = (model as any).id;
    }
    model = String(model || "liquid/lfm-2.5-1.2b-instruct:free");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

    try {
      if (modelType === "text") {
        return await executeTextModel(
          apiUrl,
          model,
          input,
          temperature,
          maxTokens,
        );
      } else if (modelType === "vision") {
        return await executeVisionModel(
          apiUrl,
          model,
          visionImageUrl,
          input,
          temperature,
          maxTokens,
        );
      } else if (modelType === "embedding") {
        return await executeEmbeddingModel(
          apiUrl,
          model,
          embeddingInput || input,
        );
      } else if (modelType === "speech") {
        return await executeSpeechModel(
          apiUrl,
          speechInput || input,
          speechVoice,
          speechFormat,
        );
      } else {
        throw new Error(`Unsupported model type: ${modelType}`);
      }
    } catch (error) {
      throw new Error(
        `Model execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
};

async function executeTextModel(
  apiUrl: string,
  model: string,
  prompt: any,
  temperature: number,
  maxTokens: number,
): Promise<any> {
  const promptText =
    typeof prompt === "string" ? prompt : JSON.stringify(prompt);

  const response = await fetch(`${apiUrl}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: promptText,
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
}

async function executeVisionModel(
  apiUrl: string,
  model: string,
  imageUrl: string,
  prompt: any,
  temperature: number,
  maxTokens: number,
): Promise<any> {
  if (!imageUrl) {
    throw new Error("Vision model requires an image URL");
  }

  let modelId = model;
  if (modelId.toLowerCase().includes("embedding")) {
    modelId = "openai/gpt-4o-mini";
  }

  const promptText = typeof prompt === "string" ? prompt : "Analyze this image";

  const response = await fetch(`${apiUrl}/api/vision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageUrl,
      prompt: promptText,
      model: modelId,
      temperature,
      maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Vision API call failed: ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ""}`,
    );
  }

  const data = await response.json();
  return data.result;
}

async function executeEmbeddingModel(
  apiUrl: string,
  model: string,
  input: any,
): Promise<any> {
  const text = typeof input === "string" ? input : JSON.stringify(input);

  // Ensure model is a string ID and embedding-capable
  let modelId =
    typeof model === "string" ? model : "openai/text-embedding-3-small";
  if (!modelId.toLowerCase().includes("embedding")) {
    modelId = "openai/text-embedding-3-small";
  }

  const response = await fetch(`${apiUrl}/api/embedding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model: modelId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Embedding API call failed: ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ""}`,
    );
  }

  const data = await response.json();
  return data.embedding;
}

async function executeSpeechModel(
  apiUrl: string,
  input: any,
  voice: string,
  format: string,
): Promise<any> {
  const text = typeof input === "string" ? input : JSON.stringify(input);

  const response = await fetch(`${apiUrl}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice,
      format,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Text-to-speech API call failed: ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ""}`,
    );
  }

  const data = await response.json();
  return data.audioUrl;
}

// Register the block
blockRegistry.register(modelBlockDefinition);

export default modelBlockDefinition;
