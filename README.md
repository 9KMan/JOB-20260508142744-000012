# LexAgent - AI Agent Platform for Law Firms

AI-powered workflow automation platform built with TypeScript, Cloudflare Workers, and Anthropic Claude.

## Features

- **AI Agent Engine**: Create and manage AI agents with custom system prompts and tools
- **Task Management**: Queue, execute, and monitor AI tasks
- **Workflow Automation**: Chain multiple AI agents into automated workflows
- **Document Management**: Store and analyze legal documents
- **Edge Deployment**: Cloudflare Workers for global low-latency access

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript 5.x
- **Cloud**: Cloudflare Workers (edge deployment)
- **AI**: Anthropic Claude API
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: React 18 + Vite

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudflare Wrangler CLI
- Anthropic API key

### Installation

```bash
npm install
```

### Development

```bash
# Start backend (Cloudflare Workers)
npm run dev

# In another terminal, start frontend
cd frontend && npm run dev
```

### Deployment

```bash
npm run deploy
```

### Docker

```bash
docker compose up
```

## API Endpoints

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent
- `DELETE /api/agents/:id` - Delete agent

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks/:id/execute` - Execute task

### Workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `POST /api/workflows/:id/execute` - Execute workflow

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document

## Available Tools

| Tool | Description |
|------|-------------|
| `document_search` | Search legal documents |
| `contract_analysis` | Analyze contract clauses |
| `case_research` | Search legal cases |
| `document_summarize` | Generate document summaries |

## Environment Variables

```
ANTHROPIC_API_KEY=sk-...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

## License

MIT