# BuildWithAi - Composable AI Studio

A no/low-code platform that allows users to visually build mini AI applications by connecting modular "intelligence blocks" using a node-based flow.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Flow Builder**: React Flow
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **AI Provider**: OpenRouter (unified access to multiple AI models)

## Project Structure

```
BuildWithAi/
├── src/
│   ├── components/         # React UI components
│   ├── blocks/            # Intelligence block definitions
│   ├── engine/            # Execution engine for running flows
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Express API server
├── public/                # Static assets
└── docs/                  # Documentation
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the frontend development server:

```bash
npm run dev
```

Run the backend server:

```bash
npm run server
```

### Build

```bash
npm run build
```

## Core Features

1. **Flow Builder** - Drag-and-drop node-based UI
2. **Intelligence Blocks** - Modular AI components (Prompt, Model, Output)
3. **Execution Engine** - Sequential flow execution with async support
4. **Output Panel** - Live result display with loading/error states
5. **Remix & Reuse** - Save and reload flows as JSON

## Architecture

- Blocks follow a standardized schema: `{ id, type, config, input, output }`
- Execution uses topological sort for dependency resolution
- Block registry pattern for extensibility
- Clean separation between UI, execution, and block logic
