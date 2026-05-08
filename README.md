# Cloudflare Workers AI Agent Platform

Production-grade AI agent operations platform for law firms, built on Cloudflare Workers + Anthropic Claude.

## Overview

Multi-tenant automation infrastructure consolidating:
- CRM + case management integration (GoHighLevel, Clio)
- Document processing pipeline (OCR → AI extraction → case management)
- AI agents for drafting, classification, summarization
- Real-time communications routing
- Scheduled monitoring + observability

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Workers   │  │  Workflows  │  │   Agents Framework      │ │
│  │  (TypeScript)│  │  (durable)  │  │   (Claude Agent SDK)    │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │                │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌───────────┴─────────────┐ │
│  │  AI Gateway  │  │   Queues    │  │    D1 + KV + R2        │ │
│  │ (Anthropic) │  │ (async msg) │  │    (state + storage)    │ │
│  └─────────────┘  └─────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                │                      │
           ▼                ▼                      ▼
    ┌────────────┐   ┌────────────┐       ┌────────────┐
    │ GoHighLevel│   │    Clio    │       │   R2 Docs  │
    │    (CRM)   │   │  (cases)   │       │  (storage) │
    └────────────┘   └────────────┘       └────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Cloudflare Workers (TypeScript) |
| Durable Execution | Cloudflare Workflows |
| AI Agents | Cloudflare Agents + Anthropic Claude |
| Observability | Cloudflare AI Gateway |
| Async Messaging | Cloudflare Queues |
| State | Cloudflare D1 (SQL) + KV |
| Document Storage | Cloudflare R2 |
| CRM | GoHighLevel REST API |
| Case Management | Clio GraphQL API |
| OCR | Azure Form Recognizer / AWS Textract |
| Testing | Vitest + integration tests |

## Core Workstreams

### 1. CRM + Case Management Integration
- Real-time webhooks from GoHighLevel + Clio
- Scheduled bidirectional syncs with idempotency
- Payment processor integration
- KV-based idempotency keys for all operations

### 2. Document Processing Pipeline
- Multi-format support: PDF, scanned docs, images
- OCR via Azure Form Recognizer
- AI-driven structured extraction (invoices, contracts, filings)
- Results written back to Clio case management

### 3. AI Agents + Generators
- Long-form drafting agents (legal letters, filings, summaries)
- Classification agents (document routing, triage)
- Summarization agents (case notes, discovery)
- Claude Sonnet + Opus via Agent SDK loops

### 4. Real-Time Communications Routing
- Inbound message/event processing
- Intelligent AI-powered routing
- Multi-channel handling

### 5. Scheduled Monitoring + Observability
- Cron triggers for periodic external API checks
- Downstream action triggers on meaningful changes
- Structured logging, daily/weekly digests
- Operations dashboard (Next.js/Supabase)

## Getting Started

```bash
# Install dependencies
npm install

# Configure wrangler
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GOHIGHLEVEL_API_KEY
wrangler secret put CLIO_CLIENT_ID
wrangler secret put CLIO_CLIENT_SECRET

# Local development
npm run dev

# Run tests
npm test

# Deploy
npm run deploy
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `GOHIGHLEVEL_API_KEY` | GoHighLevel API key |
| `CLIO_CLIENT_ID` | Clio OAuth2 client ID |
| `CLIO_CLIENT_SECRET` | Clio OAuth2 client secret |
| `AZURE_FORM_RECOGNIZER_ENDPOINT` | Azure OCR endpoint |
| `AZURE_FORM_RECOGNIZER_KEY` | Azure OCR key |

## Project Structure

```
├── src/
│   ├── workers/           # Cloudflare Workers entry points
│   │   ├── webhook.ts     # Webhook handlers
│   │   ├── sync.ts        # Scheduled sync workers
│   │   ├── documents.ts    # Document processing
│   │   └── agents/        # AI agent workers
│   ├── workflows/          # Cloudflare Workflows definitions
│   │   ├── document-pipeline.ts
│   │   ├── onboarding.ts
│   │   └── monitoring.ts
│   ├── lib/
│   │   ├── anthropic.ts   # Anthropic API client + AI Gateway
│   │   ├── gohighlevel.ts # GHL REST client
│   │   ├── clio.ts        # Clio GraphQL client
│   │   └── ocr.ts         # OCR integration
│   └── types/             # TypeScript type definitions
├── tests/
│   ├── unit/              # Unit tests (Vitest)
│   └── integration/       # Integration tests against real APIs
├── wrangler.toml          # Cloudflare Workers config
├── package.json
└── README.md
```

## License

Proprietary — internal use only.