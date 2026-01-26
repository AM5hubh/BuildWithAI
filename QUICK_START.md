# Quick Start: Multi-Model Feature

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Backend Server

```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 3001).

### Step 2: Open the App

Navigate to `http://localhost:3000`

The app automatically:

- ✅ Fetches available models from OpenRouter
- ✅ Loads a default flow (Prompt → Model → Output)
- ✅ Populates the model dropdown

### Step 3: Select and Use a Model

1. Click on the **Model Block** in the canvas
2. Click the **AI Model** dropdown in the Inspector panel
3. Choose your model (e.g., "Claude 3.5 Sonnet")
4. See the model details (pricing, context length, description)
5. Adjust Temperature and Max Tokens if needed
6. Click **Run** to execute the flow

---

## 📊 Available Models

### Premium Models (Best Quality)

- **Claude 3.5 Sonnet** - Most capable, great for complex tasks
- **GPT-4 Turbo** - Excellent reasoning and analysis
- **Claude 3 Opus** - Powerful for long contexts

### Fast Models (Speed)

- **GPT-3.5 Turbo** - Quick responses, cost-effective
- **Mistral 7B** - Open source, very fast
- **Llama 3.1 8B** - Lightweight, responsive

### Large Models (Power)

- **Llama 3.1 70B** - Powerful open source
- **Mistral Large** - Advanced open model
- **Claude 3 Sonnet** - Balanced capability

### Cost-Effective

- **Claude 3 Haiku** - Smallest Claude, lowest cost
- **Mistral Small** - Quick and cheap
- **GPT-3.5 Turbo** - Budget-friendly OpenAI

---

## 🔧 Configuration

### Temperature (Creativity)

```
0 = Deterministic (same output every time)
0.5 = Balanced (coherent and creative)
1.0 = Moderate creativity
2.0 = Maximum randomness
```

**Examples:**

- Code generation: 0.2-0.5
- Creative writing: 0.7-1.0
- Brainstorming: 1.0-1.5

### Max Tokens (Response Length)

```
Higher = Longer responses (costs more)
Lower = Shorter responses (cheaper, faster)

Typical ranges:
- Short answer: 256-512
- Medium answer: 512-1024
- Long answer: 1024-2048
- Very long: 2048+
```

---

## 💡 Usage Examples

### Example 1: Summarize Text

```
Prompt Block:
Template: "Summarize this text: {text}"
Variables: { "text": "Long article here..." }

Model Block:
Model: GPT-3.5 Turbo (fast and cheap)
Temperature: 0.3 (factual)
Max Tokens: 256 (concise)

Output Block: Display result
```

### Example 2: Generate Creative Content

```
Prompt Block:
Template: "Write a {style} poem about {topic}"
Variables: { "style": "haiku", "topic": "spring" }

Model Block:
Model: Claude 3.5 Sonnet (creative)
Temperature: 1.2 (creative)
Max Tokens: 1024 (allow detailed response)

Output Block: Display result
```

### Example 3: Code Generation

```
Prompt Block:
Template: "Generate {language} code to: {task}"
Variables: { "language": "Python", "task": "sort a list" }

Model Block:
Model: GPT-4 Turbo (best for code)
Temperature: 0.2 (deterministic)
Max Tokens: 512 (concise code)

Output Block: Display code
```

---

## ⚡ Performance Tips

### For Speed

1. Use smaller models: Mistral 7B, GPT-3.5 Turbo
2. Lower max tokens to what you need
3. Use lower temperature (less processing)

### For Quality

1. Use better models: Claude 3.5 Sonnet, GPT-4
2. Increase max tokens for detailed responses
3. Use appropriate temperature (0.7 typical)

### For Cost

1. Use smaller models: Claude 3 Haiku, Mistral Small
2. Lower token usage (shorter prompts, lower max tokens)
3. Batch similar requests together

### For Accuracy

1. Use Claude 3.5 Sonnet or GPT-4
2. Set temperature lower (0.2-0.5)
3. Provide clear prompts with examples

---

## 🧪 Testing Models

### Test Script

```bash
node test-models.js
```

Shows:

- List of available models
- Pricing information
- Context lengths
- Model descriptions
- Confirms backend connection

### Manual Testing

1. **Check Models Endpoint**

   ```bash
   curl http://localhost:3001/api/models
   ```

2. **Test Execution**
   ```bash
   curl -X POST http://localhost:3001/api/execute \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Hello, how are you?",
       "model": "anthropic/claude-3.5-sonnet",
       "temperature": 0.7,
       "maxTokens": 100
     }'
   ```

---

## 🔐 Setup Requirements

### Environment Variables

Create `.env` file in project root:

```env
# OpenRouter API Key (required for real AI)
OPENROUTER_API_KEY=your_key_here

# Site info (required by OpenRouter)
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=BuildWithAi

# Server port (optional)
PORT=3001
```

### Get OpenRouter API Key

1. Visit https://openrouter.ai
2. Sign up (free)
3. Get API key from dashboard
4. Add to `.env` file

---

## 🐛 Troubleshooting

### Problem: No Models Loading

```
❌ "No models available"
```

**Solution:**

1. Check if backend is running: `npm run dev`
2. Verify backend is on port 3001
3. Check browser console for errors
4. Clear cache: localStorage.clear()

### Problem: "Cannot execute flow"

```
❌ "Model execution failed"
```

**Solution:**

1. Check `OPENROUTER_API_KEY` is set
2. Verify model exists (check dropdown)
3. Check prompt is not empty
4. Review backend logs

### Problem: Wrong Model Used

```
❌ Different model than selected
```

**Solution:**

1. Verify model selection was saved
2. Check Inspector shows correct model
3. Look at backend logs to see which model was used
4. Refresh page and try again

### Problem: Slow Response

```
⏳ Takes >30 seconds
```

**Solution:**

1. Try faster model: GPT-3.5 Turbo
2. Lower max tokens
3. Simplify prompt
4. Check internet connection

---

## 📚 Learning Resources

### OpenRouter

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Available Models](https://openrouter.ai/models)
- [Pricing Info](https://openrouter.ai/pricing)

### Prompt Engineering

- [Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Examples & Patterns](https://github.com/openai/openai-cookbook)

### LLM Comparison

- [Models Benchmark](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)
- [Token Costs](https://openrouter.ai/pricing)

---

## ✨ Feature Highlights

### What's New

✅ Choose from 150+ AI models  
✅ See model pricing in real-time  
✅ View context length for each model  
✅ Auto-complete with model descriptions  
✅ Smart caching (1-hour)  
✅ Fallback to popular models  
✅ Full TypeScript support

### Coming Soon

🚀 Model search/filter  
🚀 Model comparison tool  
🚀 Pricing calculator  
🚀 Performance benchmarks  
🚀 Custom provider support

---

## 💬 Common Questions

**Q: Can I use my own API key?**  
A: Yes! Set `OPENROUTER_API_KEY` in `.env`

**Q: Are there free models?**  
A: Yes! Meta Llama 3.1 is free on OpenRouter

**Q: What if I don't have an API key?**  
A: The app will show mock responses for demo

**Q: Can I add custom models?**  
A: Yes! Edit `src/utils/openrouterModels.ts`

**Q: Which model is best?**  
A: Claude 3.5 Sonnet for quality, GPT-3.5 Turbo for speed

**Q: How much do models cost?**  
A: From $0.00001 to $0.02 per 1K tokens (varies by model)

**Q: Can I use multiple models in one flow?**  
A: Yes! Add multiple Model blocks and connect them

**Q: How do I save my flow with the selected model?**  
A: It auto-saves! Check the sync indicator in the header

---

**Quick Reference Card**

```
🎯 Quick Start
1. npm run dev
2. http://localhost:3000
3. Click Model Block → Select Model → Run

⚙️ Configuration
Temperature: 0.2 (precise) → 2.0 (creative)
Max Tokens: 256 (short) → 2048 (long)

💰 Costs
Fast: GPT-3.5 Turbo, Mistral 7B
Quality: Claude 3.5 Sonnet, GPT-4 Turbo
Cheap: Claude 3 Haiku, Mistral Small

🔧 Endpoints
GET /api/models - List models
POST /api/execute - Run model
POST /api/flows/save - Save flow
GET /api/flows/:id - Load flow

📊 Models: 150+
Providers: OpenAI, Anthropic, Meta, Mistral, etc.
```

---

**Need Help?** Check the documentation files:

- [MULTI_MODEL_SETUP.md](./MULTI_MODEL_SETUP.md) - Detailed guide
- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - System design
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was changed
