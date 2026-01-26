#!/usr/bin/env node

/**
 * Test script to verify OpenRouter models fetching
 * Run with: node test-models.js
 */

const BASE_URL = "http://localhost:3001";

async function testModelsEndpoint() {
  console.log("🧪 Testing OpenRouter Models Endpoint\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("─".repeat(50));

  try {
    console.log("\n📡 Fetching models from /api/models...\n");
    const response = await fetch(`${BASE_URL}/api/models`);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}\nMake sure backend server is running on port 3001`,
      );
    }

    const data = await response.json();
    console.log(`✓ Successfully fetched models\n`);
    console.log(`📊 Models available: ${data.count}\n`);

    // Display first 10 models
    console.log("📋 Sample Models:");
    console.log("─".repeat(80));
    data.models.slice(0, 10).forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.name}`);
      console.log(`   ID: ${model.id}`);
      if (model.description) {
        console.log(`   Description: ${model.description}`);
      }
      if (model.context_length) {
        console.log(
          `   Context: ${model.context_length.toLocaleString()} tokens`,
        );
      }
      if (model.pricing) {
        console.log(
          `   Pricing: $${model.pricing.prompt}/1K input, $${model.pricing.completion}/1K output`,
        );
      }
    });

    console.log("\n" + "─".repeat(80));
    console.log(`\n✅ Models endpoint is working!\n`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log(
      "\n💡 Make sure to run 'npm run dev' in another terminal first.",
    );
    process.exit(1);
  }
}

testModelsEndpoint();
