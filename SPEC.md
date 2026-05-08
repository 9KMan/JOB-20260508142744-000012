# SPEC.md — Senior TypeScript + Cloudflare Workers AI Agent Platform

## 1. Project Overview

**Client:** Law firm (unconfirmed name)
**Platform:** Cloudflare Workers + Agents framework (Anthropic Claude)
**Goal:** Build a production AI agent operations platform for a law firm, consolidating automation infrastructure on Cloudflare.

**Stack:**
- Cloudflare Workers (TypeScript functions)
- Cloudflare Workflows (durable execution)
- Cloudflare Agents Framework (Claude Agent SDK loops)
- Cloudflare AI Gateway (Anthropic API observability + cost tracking)
- Cloudflare Queues (async messaging)
- Cloudflare D1 + KV (state + idempotency)
- Cloudflare R2 (document storage)
- GoHighLevel (CRM), Clio (case management), Microsoft 365

---

## 2. Core Workstreams

### 2.1 CRM + Case Management Integration
- Real-time webhooks from GoHighLevel + Clio
- Scheduled bidirectional syncs with idempotency
- Payment processor integration
- Error handling + retry logic

### 2.2 Document Processing Pipeline
- OCR via Azure Form Recognizer / AWS Textract / Google Document AI
- AI-driven structured extraction (invoices, contracts, filings)
- Results written back to Clio case management
- Multi-format support (PDF, scanned docs, images)

### 2.3 AI Agents + Generators
- Long-form drafting agents (legal letters, filings, summaries)
- Classification agents (document routing, triage)
- Summarization agents (case notes, discovery)
- Multi-step reasoning workflows (Anthropic Claude Sonnet + Opus)
- Claude Agent SDK loops with tool use + structured output

### 2.4 Real-Time Communications Routing
- Inbound message/event processing across channels
- Intelligent routing with AI interpretation
- Multi-channel handling (email, web, etc.)

### 2.5 Scheduled Monitoring + Observability
- Cron triggers for periodic external API/system checks
- Downstream action triggers on meaningful changes
- Structured logging, daily/weekly digests
- Operations dashboard (Next.js/Supabase)

---

## 3. Technical Decisions

- **Workers-first architecture:** Every workflow as a TypeScript function (no separate servers)
- **Durable execution:** Cloudflare Workflows over Inngest/Temporal (native to Cloudflare, fits the stack)
- **Observability:** AI Gateway wrapping all Anthropic calls — cost tracking + latency per call
- **Idempotency:** KV-based idempotency keys for all webhook + sync operations
- **Document storage:** R2 for raw + processed documents, D1 for metadata + state
- **Agent hosting:** Cloudflare Agents Framework (Agent SDK loops, not just API calls)
- **Testing:** Vitest with integration tests against real APIs (not mocks) — testing discipline required
- **Spanish-language support:** Prompts/templates for Spanish-language content review (team is bilingual)

---

## 4. Signal Sources / Scope (V1)

Not applicable — this is an internal platform build, not an outbound/GTM tool.

---

## 5. Out of Scope (V1)

- Email sending automation
- Full CRM write-back (read + limited write only)
- Clay/Apollo enrichment
- Complex scoring systems
- Mobile-first UI

---

## 6. Quality Bar

- Production-grade: shipped Workers to production, debugged runtime issues, written wrangler.toml by hand
- LLM API experience: structured outputs, tool use, retries, cost optimization at scale
- API integration: REST, webhooks, OAuth, HMAC verification, rate limiting
- Testing discipline: Vitest + integration tests against real APIs
- Git hygiene: clean commit history, code review habits

---

## 7. Success Metrics (V1)

- All 5 core workstreams delivered and operational
- Zero data loss on bidirectional syncs (idempotency verified)
- Document processing pipeline handles 10+ document types
- AI agents produce usable drafts (not raw LLM output)
- Operations dashboard live for the ops team