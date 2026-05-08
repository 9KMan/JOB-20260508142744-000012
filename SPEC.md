# SPEC.md — Cloudflare Workers AI Agent Platform

## 1. Overview

**Project:** Production AI Agent Operations Platform for Law Firms
**Stack:** Cloudflare Workers + Agents Framework + Anthropic Claude
**Clients:** GoHighLevel (CRM), Clio (Case Management), Microsoft 365

---

## 2. Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │              Cloudflare Edge                │
                    │                                             │
  ┌─────────────┐   │  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
  │  Internet   │──▶│  │ Workers  │  │Workflows│  │  Agents   │ │
  │  (webhooks) │   │  │ (TS Fns) │  │(durable)│  │   SDK     │ │
  └─────────────┘   │  └────┬─────┘  └────┬────┘  └─────┬─────┘ │
                    │       │            │             │        │
                    │  ┌────┴────────────┴─────────────┴────┐  │
                    │  │           AI Gateway              │  │
                    │  │   (Anthropic + cost tracking)     │  │
                    │  └────────────────────────────────────┘  │
                    │                                             │
                    │  ┌──────────┐  ┌────────┐  ┌─────────────┐  │
                    │  │ D1 (SQL)│  │ KV    │  │ R2 (files)  │  │
                    │  │ state   │  │cache  │  │ documents   │  │
                    │  └──────────┘  └────────┘  └─────────────┘  │
                    │                                             │
                    │  ┌──────────────────────────────────────┐  │
                    │  │           Queues (async)             │  │
                    │  └──────────────────────────────────────┘  │
                    └─────────────────────────────────────────────┘
                              │           │           │
                    ┌──────────┘           │           └──────────┐
                    ▼                      ▼                     ▼
             ┌─────────────┐      ┌─────────────┐       ┌─────────────┐
             │ GoHighLevel │      │    Clio     │       │   Azure     │
             │    CRM      │      │    Cases   │       │  Document AI│
             └─────────────┘      └─────────────┘       └─────────────┘
```

---

## 3. Core Workstreams

### 3.1 CRM + Case Management Integration
```
Webhook ──▶ Workers ──▶ KV Idempotency Check ──▶ D1 State
              │                                    │
              └────▶ Queues ──▶ Workflows ──▶ Clio + GHL sync
```

- GoHighLevel REST API for CRM contacts/companies
- Clio GraphQL API for case management
- KV-based idempotency keys prevent duplicate webhook processing
- Scheduled sync runs every 15min via Cron Triggers

### 3.2 Document Processing Pipeline
```
Upload/R2 ──▶ OCR (Azure) ──▶ LLM Classification ──▶ LLM Extraction ──▶ Clio Write-back
                                    │                       │
                                    ▼                       ▼
                              D1 (metadata)          D1 (extracted data)
```

- Supported formats: PDF, JPEG, PNG, TIFF, DOCX
- Classification: Invoice, Contract, Legal Filing, Letter, Memo, Other
- Extraction fields vary by document type (configurable per type)
- Results stored in D1 with confidence scores

### 3.3 AI Agents (Claude Agent SDK)
```
Agent Loop: Input → Tool Use → LLM Reasoning → Action → Output

Tools available:
├── clio_search(query)      → Search Clio cases/contacts
├── ghl_search(query)       → Search GoHighLevel CRM
├── document_upload(r2_url)  → Attach document to case
├── ocr_process(url)        → Run OCR on document
└── draft_document(type)     → Generate draft from template
```

Agent types:
- **DraftingAgent:** Generates legal letters, summaries, filings
- **ClassificationAgent:** Routes documents to correct matter
- **SummarizationAgent:** Creates case notes from intake forms
- **MonitoringAgent:** Checks for meaningful changes, emits signals

### 3.4 Real-Time Communications Routing
```
Inbound Message ──▶ Workers ──▶ AI Interpretation ──▶ Routing Decision
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              Email Channel     Web Channel       Internal Channel
              (SendGrid?)      (webhook)         (Slack?)
```

### 3.5 Scheduled Monitoring + Observability
```
Cron Trigger (15min) ──▶ Check External APIs ──▶ Signal Detection ──▶ Action
                                  │
                                  ▼
                           AI Gateway Logs ──▶ Daily Digest
```

Signals detected:
- New GoHighLevel contact created
- Clio case status changed
- Document uploaded to matter
- External API health check failed

---

## 4. Data Model

### D1 Schema (SQLite)

```sql
-- CRM sync state
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  source TEXT, -- 'gohighlevel' | 'clio'
  external_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  synced_at INTEGER,
  UNIQUE(source, external_id)
);

-- Document metadata
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  source TEXT, -- 'r2' | 'upload'
  r2_key TEXT,
  classification TEXT,
  extracted_data TEXT, -- JSON
  confidence REAL,
  matter_id TEXT,
  created_at INTEGER,
  processed_at INTEGER
);

-- Signal history
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  type TEXT, -- 'new_contact' | 'case_update' | 'document_upload' | 'api_error'
  source TEXT,
  payload TEXT, -- JSON
  emitted_at INTEGER,
  action_taken TEXT
);

-- Idempotency keys
CREATE TABLE idempotency (
  key TEXT PRIMARY KEY,
  created_at INTEGER
);
```

### KV Schema

```
idempotency:{key_hash} → { processed_at, result }
rate_limit:{client_id} → { count, window_start }
agent_session:{id} → { state, tools_used, cost }
```

### R2 Buckets

```
documents-raw/          → Original uploads (preserved)
documents-processed/    → OCR output + extracted data
```

---

## 5. API Design

### Workers Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webhook/gohighlevel` | Receive GHL webhooks |
| `POST` | `/webhook/clio` | Receive Clio webhooks |
| `POST` | `/webhook/document` | Upload document for processing |
| `GET` | `/api/signals` | List signals (last 24h / 7d) |
| `POST` | `/api/agents/classify` | Invoke ClassificationAgent |
| `POST` | `/api/agents/draft` | Invoke DraftingAgent |
| `GET` | `/api/health` | Health check |

### Workflows

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `document-pipeline` | Queue message | OCR → Classify → Extract → Write to Clio |
| `crm-sync` | Cron (15min) | Fetch GHL → Fetch Clio → Diff → Update |
| `signal-digest` | Cron (daily) | Aggregate signals → Generate digest → Send |

---

## 6. Technical Decisions

1. **Workers-first:** No separate Node.js servers — all logic in TypeScript Workers
2. **Workflows + Queues hybrid:** Workflows for user-facing multi-step; Queues for high-volume background
3. **KV idempotency:** Every webhook processed through idempotency check before D1 write
4. **AI Gateway:** All Anthropic calls proxied through AI Gateway for cost + latency tracking
5. **Agents Framework:** Claude Agent SDK loops for complex reasoning (not simple API calls)
6. **Vitest + integration tests:** Real API mocks for unit; real API integration tests

---

## 7. Out of Scope (V1)

- Email sending (read only from Gmail/Sales Navigator)
- Full CRM write-back (read + limited write to specific endpoints)
- Mobile UI
- Multi-tenant billing
- Complex scoring / lead scoring

---

## 8. Success Metrics

- [ ] Document pipeline handles 10+ document types
- [ ] CRM sync completes without data loss (idempotency verified)
- [ ] AI agents produce usable drafts (human review required, not raw LLM)
- [ ] Operations dashboard displays signal history + system health
- [ ] All 5 workstreams operational simultaneously