# BuildWithAi - Composable AI Studio

A no/low-code platform that allows users to visually build mini AI applications by connecting modular "intelligence blocks" using a node-based flow.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Flow Builder**: React Flow
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: Google OAuth 2.0 + JWT
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
│   ├── pages/             # Page components (Login, etc.)
│   └── utils/             # Utility functions
├── backend/
│   ├── models/            # MongoDB schemas (User, Flow)
│   ├── routes/            # API routes (auth, flows)
│   ├── middleware/        # Express middleware (auth)
│   ├── db/                # Database connection
│   ├── utils/             # JWT utilities
│   └── server.js          # Express server entry point
├── public/                # Static assets
├── docs/                  # Documentation
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas cloud)
- Google OAuth credentials

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the project root (use `.env.example` as template):

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_ID=your_client_id
JWT_SECRET=your_secret_key
MONGODB_URI=mongodb://localhost:27017/buildwithai
OPENROUTER_API_KEY=your_api_key
```

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id
JWT_SECRET=your_secret_key
MONGODB_URI=mongodb://localhost:27017/buildwithai
OPENROUTER_API_KEY=your_api_key
PORT=3001
```

### Development

**Terminal 1 - Backend Server:**

```bash
npm run server
```

Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend Development:**

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Build

```bash
npm run build
```

## Authentication Flow

1. User navigates to `/login`
2. Clicks "Sign in with Google"
3. Google OAuth verification happens
4. Backend verifies Google token and creates/updates user in MongoDB
5. JWT token returned and stored in localStorage
6. User redirected to app and can create/manage flows
7. All flows are associated with user ID in MongoDB

## Core Features

1. **Flow Builder** - Drag-and-drop node-based UI
2. **Intelligence Blocks** - Modular AI components:
   - **Prompt Block**: Template-based prompt generation
   - **Model Block**: LLM execution (OpenRouter)
   - **Output Block**: Result display and formatting
   - **Tool Blocks**: Text Extraction, Web Search, File Reader
   - **Data Blocks**: Memory, DataSource
   - **Logic Blocks**: Condition, TextFormatter
3. **Execution Engine** - Sequential flow execution with async support
4. **Output Panel** - Live result display with format options (text/JSON/markdown)
5. **User Flows** - Save/load flows per user via MongoDB
6. **Node Tooltips** - Hover to see execution results
7. **Resizable UI** - Collapsible right panel for more workspace

## Architecture

- Blocks follow standardized schema: `{ id, type, config, input, output }`
- Execution uses topological sort for dependency resolution
- Block registry pattern for extensibility
- JWT-protected API endpoints
- MongoDB for user and flow persistence
- Clean separation: UI logic, execution engine, block definitions

## API Endpoints

### Authentication

- `POST /auth/google-login` - Verify Google token and login
- `POST /auth/logout` - Logout (client-side)
- `GET /auth/me` - Get current user info
- `GET /auth/verify` - Verify JWT token validity

### AI & Models

- `POST /api/execute` - Execute AI model with prompt
- `GET /api/models` - List available models
- `GET /api/health` - Health check

### Flows (User-specific)

- `POST /api/flows/save` - Save a flow
- `GET /api/flows/:id` - Get flow details
- `GET /api/flows` - List user's flows
- `DELETE /api/flows/:id` - Delete a flow

## Quick Start Example

1. Start both servers (frontend and backend)
2. Go to `http://localhost:5173/login`
3. Sign in with Google
4. Build a flow:
   - Add Prompt block: `"What is {topic}?"`
   - Add Model block: Select a free model
   - Add Output block
   - Connect them
   - Click "Run"
5. View results in output panel
6. Flow auto-saves to MongoDB

## For Detailed Setup Instructions

See [AUTH_SETUP.md](./AUTH_SETUP.md) for:

- Google OAuth configuration
- MongoDB setup (local or cloud)
- Environment variable setup
- Troubleshooting guide
- Database schema reference
