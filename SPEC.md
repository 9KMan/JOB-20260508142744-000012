# Senior TypeScript + Cloudflare Workers AI Agent Platform for Law Firm

## 1. Project Overview

**Project Name:** LexAgent - AI Agent Platform for Legal Firms
**GitHub Repo:** https://github.com/9KMan/JOB-20260508142744-000012
**Type:** AI-powered workflow automation platform

## 2. Technical Stack

- **Runtime:** Node.js 20+, TypeScript 5.x
- **Cloud:** Cloudflare Workers (edge deployment)
- **AI:** Anthropic Claude API (via Cloudflare Workers AI)
- **Database:** SQLite (via better-sqlite3) + Cloudflare D1
- **Frontend:** React 18 + Vite
- **API:** REST with Hono framework
- **Testing:** Vitest + Playwright

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Workers   │  │  Workers AI │  │       D1           │   │
│  │   (API)     │  │  (Claude)   │  │   (Database)       │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   React Frontend  │
                    │   (Vite + TS)     │
                    └───────────────────┘
```

## 4. Key Components

### Backend (Cloudflare Workers)

1. **Agent Engine** (`/src/agent/`)
   - `agent.ts` - Core AI agent orchestrator
   - `tools.ts` - Tool definitions for legal tasks
   - `context.ts` - Context management

2. **API Routes** (`/src/routes/`)
   - `tasks.ts` - Task management CRUD
   - `agents.ts` - Agent creation/execution
   - `documents.ts` - Document handling
   - `workflows.ts` - Workflow automation

3. **Database** (`/src/db/`)
   - `schema.ts` - D1 schema definitions
   - `migrations.ts` - Database migrations

### Frontend (React + Vite)

1. **Components** (`/src/components/`)
   - `AgentBuilder.tsx` - Visual agent configuration
   - `TaskQueue.tsx` - Task management dashboard
   - `DocumentViewer.tsx` - Legal document viewer
   - `WorkflowCanvas.tsx` - Workflow visualization

2. **Pages** (`/src/pages/`)
   - `Dashboard.tsx` - Main overview
   - `Agents.tsx` - Agent management
   - `Tasks.tsx` - Task queue
   - `Settings.tsx` - Configuration

## 5. Database Schema

```sql
-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  tools TEXT, -- JSON array of tool IDs
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  status TEXT DEFAULT 'pending',
  input TEXT, -- JSON
  output TEXT,
  error TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  completed_at INTEGER
);

-- Workflows table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  steps TEXT NOT NULL, -- JSON array of steps
  created_at INTEGER DEFAULT (unixepoch())
);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  content TEXT,
  metadata TEXT, -- JSON
  created_at INTEGER DEFAULT (unixepoch())
);
```

## 6. API Endpoints

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent
- `DELETE /api/agents/:id` - Delete agent

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task status
- `POST /api/tasks/:id/execute` - Execute task with agent

### Workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `POST /api/workflows/:id/execute` - Execute workflow

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document

## 7. Security

- API key authentication via Cloudflare Workers headers
- Input sanitization for all user inputs
- Rate limiting on all endpoints
- CORS configuration for frontend

## 8. Deliverables

- [x] Core backend API (Hono + Cloudflare Workers)
- [x] Agent engine with tool system
- [x] Database schema and migrations
- [x] Frontend React application
- [x] REST API documentation
- [x] Unit tests
- [x] Docker deployment configuration
- [x] README documentation

## 9. Deployment

### Cloudflare Workers
```bash
npm run deploy
```

### Docker (Local Development)
```bash
docker compose up
```

## 10. Environment Variables

```
ANTHROPIC_API_KEY=sk-...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
DATABASE_URL=file:./data.db
FRONTEND_URL=http://localhost:5173
```