# 🎨 BuildWithAi - Composable AI Studio

A powerful no/low-code platform for visually building AI applications by connecting modular blocks in a drag-and-drop interface.

> **Latest Feature:** Multi-Model AI Selection 🤖 - Choose from 150+ models including Claude, GPT-4, Llama, Mistral, and more!

## ✨ Features

### 🎯 Visual Flow Builder

- Drag-and-drop node-based interface
- Connect blocks to define execution flow
- Real-time visual feedback
- Auto-save to localStorage

### 🧩 Composable Blocks

- **Prompt Block** - Template-based prompt generation with variable substitution
- **Model Block** - Execute any AI model (150+ available from OpenRouter)
- **Output Block** - Display and format results
- **Tool Block** - HTTP API integration (GET, POST, PUT, DELETE)
- **Memory Block** - In-memory key-value storage
- **DataSource Block** - Load data from JSON, CSV, API, or mock sources

### 🤖 Multi-Model AI Support

- Choose from 150+ AI models
- Real-time model information (pricing, context length)
- Support for:
  - **Anthropic:** Claude 3.5 Sonnet, Opus, Haiku
  - **OpenAI:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
  - **Meta:** Llama 3.1 (70B, 8B)
  - **Mistral:** Large, Small, 7B Instruct
  - **And 100+ more...**

### ⚡ Execution Engine

- Smart topological sort for optimal execution
- Async block execution
- Real-time output streaming
- Error handling with detailed messages

### 💾 Persistence

- Hybrid storage (localStorage + backend)
- Auto-save on every change
- 3-second debounced backend sync
- Flow restore on page refresh

### 🎨 Modern UI

- Clean, intuitive interface
- React Flow canvas integration
- Tailwind CSS styling
- Responsive design
- Dark/Light mode ready

### 📱 Inspector Panel

- Block configuration UI
- Real-time property editing
- Model selection dropdown
- JSON configuration support
- Temperature and token controls

## 🚀 Quick Start

### 1. Installation

```bash
# Clone repository
git clone <repo-url>
cd BuildWithAi

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

### 2. Start Development Server

```bash
npm run dev
```

This starts:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 3. Build Default Flow

The app creates a default flow on first load:

1. Prompt Block → Model Block → Output Block
2. Connected in sequence for basic AI execution

### 4. Use Multi-Model Feature

1. Click on Model Block
2. Open Inspector (right panel)
3. Click "AI Model" dropdown
4. Select from 150+ available models
5. See real-time pricing and context info

### 5. Run Your Flow

1. Configure prompt template and variables
2. Select preferred AI model
3. Click "Run" button in toolbar
4. See results in Output panel

## 🛠️ Tech Stack

| Layer       | Technology         | Version    |
| ----------- | ------------------ | ---------- |
| Frontend    | React + TypeScript | 18.3 / 5.9 |
| Build Tool  | Vite (rolldown)    | Latest     |
| Flow Canvas | React Flow         | 11.11      |
| State       | Zustand            | 4.5        |
| Styling     | Tailwind CSS       | 3.4        |
| Backend     | Node.js + Express  | LTS / 4.22 |
| AI Provider | OpenRouter         | API v1     |

## 📁 Project Structure

```
BuildWithAi/
├── src/
│   ├── components/          # React components
│   │   ├── FlowCanvas.tsx   # Main canvas
│   │   ├── Toolbar.tsx      # Controls
│   │   ├── NodeInspectorPanel.tsx    # Block editor
│   │   ├── ModelSelector.tsx         # Model picker (NEW)
│   │   ├── RightPanel.tsx   # Inspector + Output
│   │   └── nodes/           # Block node components
│   ├── blocks/              # Block definitions
│   │   ├── PromptBlock.ts
│   │   ├── ModelBlock.ts
│   │   ├── OutputBlock.ts
│   │   ├── ToolBlock.ts
│   │   ├── MemoryBlock.ts
│   │   ├── DataSourceBlock.ts
│   │   └── registry.ts      # Block registry
│   ├── store/               # Zustand store
│   │   └── flowStore.ts     # Central state + models (UPDATED)
│   ├── utils/
│   │   ├── flowPersistence.ts      # Storage utilities
│   │   ├── openrouterModels.ts     # Model fetching (NEW)
│   │   └── executionEngine.ts      # Flow execution
│   ├── types/               # TypeScript types
│   └── App.tsx             # Main component
├── backend/
│   └── server.js            # Express server
│       ├── /api/execute     # AI execution
│       ├── /api/models      # Model listing (NEW)
│       └── /api/flows/*     # Flow persistence
├── flows/                   # Saved flows (backend)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 3 steps
- **[MULTI_MODEL_SETUP.md](./MULTI_MODEL_SETUP.md)** - Detailed model feature guide
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - System design and data flow
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was changed and why

## 🔌 API Endpoints

### Models

```
GET /api/models
- Returns all available AI models
- Response: { models: [], count: number }
```

### Execution

```
POST /api/execute
- Execute an AI model with a prompt
- Body: { prompt, model, temperature, maxTokens }
- Response: { result, usage, model }
```

### Flow Persistence

```
POST /api/flows/save       # Save flow
GET /api/flows/:id         # Load flow
GET /api/flows             # List all flows
DELETE /api/flows/:id      # Delete flow
```

## 🎮 Usage Examples

### Example 1: Text Summarization

```
Prompt: "Summarize in 3 bullet points: {text}"
Model: GPT-3.5 Turbo (fast, cheap)
Temperature: 0.3 (factual)
Tokens: 256 (concise)
```

### Example 2: Creative Writing

```
Prompt: "Write a {genre} story about {topic}"
Model: Claude 3.5 Sonnet (creative)
Temperature: 1.2 (creative)
Tokens: 1024+ (detailed)
```

### Example 3: Code Generation

```
Prompt: "Generate {lang} code to: {task}"
Model: GPT-4 Turbo (best for code)
Temperature: 0.2 (deterministic)
Tokens: 512 (concise)
```

## ⚙️ Configuration

### Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=BuildWithAi
PORT=3001
```

### Model Selection Tips

- **Speed:** Mistral 7B, GPT-3.5 Turbo
- **Quality:** Claude 3.5 Sonnet, GPT-4 Turbo
- **Cost:** Claude 3 Haiku, Mistral Small
- **Context:** Claude 3.5 Sonnet (200K tokens)

## 🧪 Testing

### Run Tests

```bash
node test-models.js
```

### Verify Backend

```bash
curl http://localhost:3001/api/models
```

## 📊 Performance

- Model loading: ~500ms first load, cached thereafter
- Flow execution: < 5s for most models
- Auto-save debounce: 3 seconds
- Cache duration: 1 hour

## 🔐 Security

- API keys stored locally in `.env`
- No keys sent to frontend
- OpenRouter model listing is public
- Flow data never leaves your instance

## 🚢 Deployment

### Frontend (Vercel, Netlify, etc.)

```bash
npm run build
# Upload dist/ folder
```

### Backend (Node.js host)

```bash
npm install --production
PORT=3001 node backend/server.js
```

## 🤝 Contributing

Contributions welcome! Areas for enhancement:

- Additional block types
- Custom provider support
- Flow templates library
- UI themes
- Export/import features

## 📝 License

MIT License - Feel free to use for personal and commercial projects

## 🔗 Resources

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [React Flow Docs](https://reactflow.dev/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎯 Roadmap

### Phase 1 ✅

- [x] Visual flow builder
- [x] Basic blocks (Prompt, Model, Output)
- [x] Multi-model support
- [x] Flow persistence

### Phase 2 🔄

- [ ] Advanced blocks (Tool, Memory, DataSource)
- [ ] Flow templates
- [ ] Model comparison tool
- [ ] Flow versioning

### Phase 3 📋

- [ ] Collaborative editing
- [ ] Flow marketplace
- [ ] Custom AI providers
- [ ] Mobile app

## 💡 Tips & Tricks

### Model Selection

- Use smaller models for prototyping (faster, cheaper)
- Use premium models for final output (better quality)
- Try multiple models to compare quality

### Prompt Engineering

- Use variables for flexibility
- Provide examples in prompts
- Use clear, specific instructions
- Test with different models

### Performance

- Lower max tokens when possible
- Use appropriate temperature
- Batch similar requests
- Cache results locally

## 🐛 Troubleshooting

### Models not loading?

1. Check backend is running: `npm run dev`
2. Verify port 3001 is available
3. Clear browser cache
4. Check browser console for errors

### Execution fails?

1. Verify API key in `.env`
2. Check prompt is not empty
3. Verify model exists
4. Check backend logs

### Wrong model used?

1. Refresh page
2. Re-select model
3. Check node config saved
4. Review execution logs

## 📞 Support

- Check [FAQ](./QUICK_START.md#common-questions)
- Review [Documentation](./MULTI_MODEL_SETUP.md)
- Check backend logs: `npm run dev`
- Browser console for frontend errors

---

**Built with ❤️ for AI enthusiasts**

**Last Updated:** January 25, 2026  
**Version:** 2.0 (Multi-Model Edition)  
**Status:** Production Ready ✅
