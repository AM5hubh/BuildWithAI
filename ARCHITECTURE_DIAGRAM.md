# Multi-Model Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App.tsx                                │   │
│  │  - fetchModels() on init                                 │   │
│  │  - Initialize default flow                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Zustand Store (flowStore)                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  State:                                                  │   │
│  │  ├─ models: ModelInfo[]                                  │   │
│  │  ├─ loadingModels: boolean                               │   │
│  │  ├─ nodes, edges, ...                                    │   │
│  │  │                                                        │   │
│  │  Actions:                                                │   │
│  │  ├─ fetchModels() → GET /api/models                      │   │
│  │  ├─ setModels(models)                                    │   │
│  │  └─ setLoadingModels(bool)                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│        │                          │                        │      │
│        ▼                          ▼                        ▼      │
│  ┌─────────────┐  ┌──────────────────────┐  ┌────────────────┐  │
│  │ Model       │  │ Node Inspector       │  │ Flow Canvas    │  │
│  │ Selector    │  │ Panel                │  │                │  │
│  │             │  │ ┌──────────────────┐ │  │ - Nodes        │  │
│  │ - Dropdown  │  │ │ ModelSelector    │ │  │ - Edges        │  │
│  │ - Info      │  │ │ - Shows models   │ │  │ - Execution    │  │
│  │ - Loading   │  │ │ - Pricing info   │ │  │                │  │
│  │             │  │ │ - Context length │ │  │                │  │
│  │             │  │ │ - Description    │ │  │                │  │
│  │             │  │ └──────────────────┘ │  │                │  │
│  │             │  │                      │  │                │  │
│  │             │  │ Temperature, tokens  │  │                │  │
│  └─────────────┘  └──────────────────────┘  └────────────────┘  │
│        │                     │                                     │
│        └─────────────┬───────┘                                     │
│                      │ updateNodeData()                            │
│                      ▼                                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │          Model Block Config                                │   │
│  │  {                                                          │   │
│  │    model: "anthropic/claude-3.5-sonnet",                   │   │
│  │    temperature: 0.7,                                        │   │
│  │    maxTokens: 1024                                          │   │
│  │  }                                                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                      │                                             │
│                      └──────────────────┐                          │
│                                         │                          │
└─────────────────────────────────────────┼──────────────────────────┘
                                          │
                                          │ fetch()
                                          ▼
                    ┌─────────────────────────────────────┐
                    │        Backend (Express)             │
                    ├─────────────────────────────────────┤
                    │                                      │
                    │  GET /api/models                    │
                    │  ├─ Fetch from OpenRouter API       │
                    │  └─ Return cached models            │
                    │                                      │
                    │  POST /api/execute                  │
                    │  ├─ Use selected model ID           │
                    │  ├─ Call OpenRouter with model      │
                    │  └─ Return result                   │
                    │                                      │
                    └─────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                │                                     │
                ▼                                     ▼
        ┌──────────────────┐              ┌──────────────────────┐
        │ OpenRouter API   │              │ localStorage         │
        │                  │              │ (Model Cache)        │
        │ GET /models      │              │                      │
        │ ├─ 150+ models   │              │ openrouter_models_   │
        │ ├─ Pricing       │              │ cache: {             │
        │ ├─ Context len   │              │   data: [...],       │
        │ └─ Descriptions  │              │   timestamp: Date    │
        │                  │              │ }                    │
        │ POST /chat/      │              │                      │
        │ completions      │              │ (1 hour TTL)         │
        │ ├─ Model ID      │              │                      │
        │ ├─ Messages      │              │                      │
        │ └─ Config        │              │                      │
        └──────────────────┘              └──────────────────────┘
```

## Data Flow Diagram

```
User Selects Model
        │
        ▼
┌─────────────────────────────┐
│ ModelSelector Component     │
│ - Displays all models       │
│ - Shows pricing/context     │
└─────────────────────────────┘
        │
        │ onChange(modelId)
        ▼
┌─────────────────────────────┐
│ updateNodeData()            │
│ Updates Model Block config  │
└─────────────────────────────┘
        │
        │ Saved to store
        ▼
┌─────────────────────────────┐
│ Zustand Store               │
│ model: "selected-model-id"  │
└─────────────────────────────┘
        │
        │ Auto-sync to backend
        ▼
┌─────────────────────────────┐
│ Backend Flow Storage        │
│ Persists model selection    │
└─────────────────────────────┘
        │
        │ On flow execution
        ▼
┌─────────────────────────────┐
│ Execute Flow                │
│ - Read model ID from config │
│ - Send to /api/execute      │
└─────────────────────────────┘
        │
        │ POST { prompt, model, ... }
        ▼
┌─────────────────────────────┐
│ Backend /api/execute        │
│ - Receive model ID          │
│ - Pass to OpenRouter        │
└─────────────────────────────┘
        │
        │ API call with model
        ▼
┌─────────────────────────────┐
│ OpenRouter API              │
│ Execute with selected model │
└─────────────────────────────┘
        │
        │ Response
        ▼
┌─────────────────────────────┐
│ Output Panel                │
│ Display AI response         │
└─────────────────────────────┘
```

## Component Hierarchy

```
App
├── Toolbar
├── FlowCanvas
│   └── ReactFlow
│       ├── PromptNode
│       ├── ModelNode (uses selected model)
│       ├── OutputNode
│       ├── ToolNode
│       ├── MemoryNode
│       └── DataSourceNode
└── RightPanel
    ├── Tab: Inspector
    │   └── NodeInspectorPanel
    │       └── renderModel()
    │           └── ModelSelector ⭐ (NEW)
    │               ├── Dropdown
    │               ├── Loading State
    │               └── Model Info Display
    └── Tab: Output
        └── OutputPanel
```

## State Management Flow

```
┌──────────────────────────────────────────────────┐
│           FlowStore (Zustand)                     │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ fetchModels()                            │   │
│  │  1. Set loadingModels = true             │   │
│  │  2. Fetch GET /api/models                │   │
│  │  3. Set models = response                │   │
│  │  4. Set loadingModels = false            │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ updateNodeData(nodeId, newData)          │   │
│  │  1. Update node config                   │   │
│  │  2. Save to localStorage                 │   │
│  │  3. Sync to backend (debounced)          │   │
│  │  4. Update execution engine              │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ State Properties:                        │   │
│  │  • models: ModelInfo[]                   │   │
│  │  • loadingModels: boolean                │   │
│  │  • nodes: Node[]                         │   │
│  │  • edges: Edge[]                         │   │
│  │  • executionState: {}                    │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
└──────────────────────────────────────────────────┘
```

## Caching Strategy

```
App Start
    │
    ▼
useEffect(() => {
    fetchModels();
})
    │
    ├─ Check localStorage
    │  ├─ Key: openrouter_models_cache
    │  └─ If valid (< 1 hour): Use cached
    │
    └─ If not cached:
       ├─ Fetch GET /api/models
       │
       ├─ Backend Options:
       │  ├─ Success: Return OpenRouter models
       │  └─ Fallback: Return popular models
       │
       └─ Cache in localStorage
          ├─ Expires: 1 hour
          └─ Update on next fetch
```

## Model Selection Process

```
┌─────────────────────────────────────────┐
│ 1. User Opens Inspector                 │
│    (Clicks on Model Block)              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ 2. ModelSelector Mounts                 │
│    - Check if models loaded             │
│    - If not: Call fetchModels()         │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    Models cached?         Need to fetch
        │                       │
        ├─ Yes: Use cached      └─ Fetch from backend
        │       models              │
        │                           ├─ OpenRouter API available
        │                           │  ├─ Return all models
        │                           │
        │                           └─ Fallback models
        │                              └─ Return popular models
        │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 3. Dropdown Populated        │
        │    - Show all models         │
        │    - Show loading state      │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 4. User Selects Model        │
        │    - onChange event fired    │
        │    - Update node config      │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 5. Model Info Displayed      │
        │    - Name                    │
        │    - Description             │
        │    - Pricing                 │
        │    - Context length          │
        └──────────────────────────────┘
```

## API Request/Response Examples

### GET /api/models

**Request:**

```
GET http://localhost:3001/api/models
```

**Response (200 OK):**

```json
{
  "models": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "description": "Most capable Claude model",
      "context_length": 200000,
      "pricing": {
        "prompt": "0.003",
        "completion": "0.015"
      }
    },
    {
      "id": "openai/gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "description": "OpenAI's most capable model",
      "context_length": 128000,
      "pricing": {
        "prompt": "0.01",
        "completion": "0.03"
      }
    }
  ],
  "count": 150,
  "fallback": false
}
```

### POST /api/execute (Using Selected Model)

**Request:**

```json
{
  "prompt": "Explain quantum computing",
  "model": "anthropic/claude-3.5-sonnet",
  "temperature": 0.7,
  "maxTokens": 1024
}
```

**Response:**

```json
{
  "result": "Quantum computing leverages quantum mechanics...",
  "mock": false,
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 150
  },
  "model": "anthropic/claude-3.5-sonnet"
}
```

---

**Architecture Version:** 2.0  
**Last Updated:** January 25, 2026  
**Status:** Production Ready ✅
