/**
 * Backend Express Server
 * Handles AI execution requests via OpenRouter API
 */
import express, { json } from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

/**
 * AI Execution Endpoint
 * POST /api/execute
 * Executes an AI model with the given prompt
 */
app.post("/api/execute", async (req, res) => {
  try {
    const {
      prompt,
      model = "anthropic/claude-3.5-sonnet",
      temperature = 0.7,
      maxTokens = 1024,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
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
      model,
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
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.OPENROUTER_API_KEY,
  });
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
