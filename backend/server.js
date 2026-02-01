/**
 * Backend Express Server
 * Handles AI execution requests, flow persistence, and authentication
 */
import express, { json, static as serveStatic } from "express";
import cors from "cors";
import OpenAI from "openai";
import googleTTS from "google-tts-api";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connect.js";
import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";
import flowRoutes from "./routes/flowRoutes.js";
import { authMiddleware } from "./middleware/auth.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(json());

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, "../dist")));

// Initialize database and routes
(async () => {
  try {
    await connectDB();
    app.use("/auth", authRoutes);
    app.use("/api/projects", projectsRoutes);
    app.use("/api", authMiddleware, flowRoutes);
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
})();

/**
 * AI Execution Endpoint
 * POST /api/execute
 * Executes an AI model with the given prompt
 */
app.post("/api/execute", async (req, res) => {
  try {
    const { prompt, model, temperature = 0.7, maxTokens = 1024 } = req.body;
    console.log(req.body);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!model) {
      return res.status(400).json({ error: "Model is required" });
    }

    // Normalize model parameter - handle both string and object
    let modelId = model;
    if (typeof model === "object" && model.id) {
      modelId = model.id;
    } else if (typeof model !== "string") {
      modelId = "liquid/lfm-2.5-1.2b-instruct:free";
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      // Return a mock response for demo purposes
      console.warn("OPENROUTER_API_KEY not set. Returning mock response.");
      return res.json({
        result: `[Mock Response] This is a simulated AI response to: "${prompt.substring(0, 50)}..."\n\nTo use real AI, set your OPENROUTER_API_KEY environment variable.`,
        mock: true,
      });
    }

    // Use OpenRouter API (OpenAI-compatible)
    const openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "BuildWithAi",
      },
    });

    const completion = await openrouter.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const result =
      completion.choices[0]?.message?.content || "No response generated";

    res.json({
      result,
      mock: false,
      usage: completion.usage,
      model: completion.model,
    });
  } catch (error) {
    console.error("AI execution error:", error);
    res.status(500).json({
      error: "AI execution failed",
      message: error.message,
    });
  }
});

/**
 * Vision API Endpoint
 * POST /api/vision
 * Analyzes images using vision models
 */
app.post("/api/vision", async (req, res) => {
  try {
    const {
      imageUrl,
      prompt = "Analyze this image",
      model,
      temperature = 0.7,
      maxTokens = 1024,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Normalize model parameter
    let modelId = "openai/gpt-4-vision";
    if (model) {
      if (typeof model === "string") {
        modelId = model;
      } else if (typeof model === "object" && model.id) {
        modelId = model.id;
      }
    }

    if (String(modelId).toLowerCase().includes("embedding")) {
      modelId = "openai/gpt-4-vision"; // Ensure it does not use an embedding model
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        result: `[Mock Vision Response] Analysis of image at ${imageUrl}:\n\nThis is a simulated vision response. To use real vision models, set OPENROUTER_API_KEY.`,
        mock: true,
      });
    }

    const openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "BuildWithAi",
      },
    });

    const completion = await openrouter.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const result =
      completion.choices[0]?.message?.content || "No response generated";

    res.json({
      result,
      mock: false,
      model: completion.model,
    });
  } catch (error) {
    console.error("Vision API error:", error);
    res.status(error.status || 500).json({
      error: "Vision API call failed",
      message: error.message,
      status: error.status,
    });
  }
});

/**
 * Embedding API Endpoint
 * POST /api/embedding
 * Generates vector embeddings for text
 */
app.post("/api/embedding", async (req, res) => {
  try {
    const { text, model } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Normalize model parameter - handle both string and object
    let modelId = "openai/text-embedding-3-small";
    if (model) {
      if (typeof model === "string") {
        modelId = model;
      } else if (typeof model === "object" && model.id) {
        modelId = model.id;
      }
    }

    if (!String(modelId).toLowerCase().includes("embedding")) {
      modelId = "openai/text-embedding-3-small";
    }

    console.log("[Embedding] Using model:", modelId);

    if (!process.env.OPENROUTER_API_KEY) {
      // Return mock embedding (array of random numbers)
      const mockEmbedding = Array(1536)
        .fill(0)
        .map(() => Math.random());
      return res.json({
        embedding: mockEmbedding,
        mock: true,
        size: 1536,
      });
    }

    const openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "BuildWithAi",
      },
    });

    const embedding = await openrouter.embeddings.create({
      model: modelId,
      input: text,
    });

    const vector = embedding.data[0]?.embedding || [];

    res.json({
      embedding: vector,
      mock: false,
      model: embedding.model,
      size: vector.length,
    });
  } catch (error) {
    console.error("Embedding API error:", error);
    res.status(error.status || 500).json({
      error: "Embedding API call failed",
      message: error.message,
      status: error.status,
    });
  }
});

/**
 * Text-to-Speech API Endpoint
 * POST /api/tts
 * Converts text to speech audio
 */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "alloy", format = "mp3" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      try {
        const parts = googleTTS.getAllAudioUrls(text, {
          lang: "en",
          slow: false,
          host: "https://translate.google.com",
        });

        const audioParts = await Promise.all(
          parts.map(async (part, index) => {
            const ttsResponse = await fetch(part.url);
            if (!ttsResponse.ok) {
              throw new Error(`Mock TTS fetch failed: ${ttsResponse.status}`);
            }

            const buffer = Buffer.from(await ttsResponse.arrayBuffer());
            const base64 = buffer.toString("base64");
            return {
              index,
              text: part.shortText,
              audioUrl: `data:audio/mpeg;base64,${base64}`,
            };
          }),
        );

        return res.json({
          audioUrls: audioParts,
          mock: true,
          message:
            "Mock TTS response via google-tts-api. Set OPENAI_API_KEY to use real text-to-speech.",
        });
      } catch (mockError) {
        console.error("Mock TTS error:", mockError);
        return res.status(500).json({
          error: "Mock TTS failed",
          message: mockError.message || "Unknown mock TTS error",
        });
      }
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: format,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64 = buffer.toString("base64");
    const audioUrl = `data:audio/${format};base64,${base64}`;

    res.json({
      audioUrl,
      mock: false,
      voice,
      format,
    });
  } catch (error) {
    console.error("TTS API error:", error);
    res.status(error.status || 500).json({
      error: "Text-to-speech API call failed",
      message: error.message,
      status: error.status,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
  });
});

/**
 * Get available models from OpenRouter
 * GET /api/models
 */
app.get("/api/models", async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    // Transform to simplified format with free/paid categorization
    const simplifiedModels = models.map((model) => {
      const promptPrice = parseFloat(model.pricing?.prompt || "0");
      const completionPrice = parseFloat(model.pricing?.completion || "0");
      const isFree = promptPrice === 0 && completionPrice === 0;

      return {
        id: model.id,
        name: model.name || model.id,
        description: model.description || "",
        pricing: model.pricing || {},
        context_length: model.context_length || 0,
        isFree,
      };
    });

    // Separate into free and paid categories
    const freeModels = simplifiedModels.filter((m) => m.isFree);
    const paidModels = simplifiedModels.filter((m) => !m.isFree);

    console.log(
      `✓ Fetched ${simplifiedModels.length} models (${freeModels.length} free, ${paidModels.length} paid)`,
    );

    res.json({
      models: simplifiedModels,
      freeModels,
      paidModels,
      count: simplifiedModels.length,
      stats: {
        total: simplifiedModels.length,
        free: freeModels.length,
        paid: paidModels.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    // Return popular models as fallback
    const fallbackModels = [
      {
        id: "meta-llama/llama-3.1-8b-instruct:free",
        name: "Llama 3.1 8B (Free)",
        description: "Meta's efficient open model - Free",
        isFree: true,
        pricing: { prompt: "0", completion: "0" },
      },
      {
        id: "google/gemini-flash-1.5",
        name: "Gemini Flash 1.5 (Free)",
        description: "Google's fast model - Free",
        isFree: true,
        pricing: { prompt: "0", completion: "0" },
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        description: "Most capable Claude model",
        isFree: false,
        pricing: { prompt: "0.003", completion: "0.015" },
      },
      {
        id: "openai/gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "OpenAI's most capable model",
        isFree: false,
        pricing: { prompt: "0.01", completion: "0.03" },
      },
      {
        id: "openai/gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Fast and efficient",
        isFree: false,
        pricing: { prompt: "0.0005", completion: "0.0015" },
      },
      {
        id: "mistralai/mistral-7b-instruct",
        name: "Mistral 7B Instruct",
        description: "Efficient open model",
        isFree: false,
        pricing: { prompt: "0.00025", completion: "0.00025" },
      },
    ];

    const freeFallback = fallbackModels.filter((m) => m.isFree);
    const paidFallback = fallbackModels.filter((m) => !m.isFree);

    res.json({
      models: fallbackModels,
      freeModels: freeFallback,
      paidModels: paidFallback,
      count: fallbackModels.length,
      stats: {
        total: fallbackModels.length,
        free: freeFallback.length,
        paid: paidFallback.length,
      },
      fallback: true,
    });
  }
});

/**
 * SPA Fallback Middleware
 * Serves index.html for all non-API routes
 * This allows React Router to handle client-side routing
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/execute`);

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn(
      "⚠️  OPENROUTER_API_KEY not set. API will return mock responses.",
    );
    console.log(
      "   Set OPENROUTER_API_KEY environment variable to use real AI.",
    );
  } else {
    console.log("✓ OpenRouter API key configured");
  }
});

export default app;
