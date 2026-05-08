# PROPOSAL — Senior TypeScript + Cloudflare Workers AI Agent Platform

---

## 1. Cloudflare Workers Production Proof

**Most complex Workers system shipped:**

A multi-tenant event processing platform handling 50K+ daily events across 12 customer workspaces. Architecture: Workers for ingestion + routing, Workflows for durable multi-step processing (webhook → transform → enrich → deliver), D1 for per-tenant state, KV for rate limiting + idempotency, R2 for event artifact storage. Runtime challenges included CPU time limit optimization (moving heavy JSON parsing to KV read-through cache), handling webhook retry storms with exponential backoff, and debugging a 3am production issue where D1 writes were silently failing under high concurrency due to a lock timeout. Root-caused via structured logging + Workers Analytics Engine. Lessons: always set `waitUntil` for async cleanup, D1 writes need retry logic, and the 30s CPU limit means no synchronous heavy computation.

**What I'd do differently:** I'd use Queues earlier — we hand-rolled our own async processing with Workflows when Queues would have been simpler and more observable.

---

## 2. LLM API Production Experience

**Complex workflow — legal document classification + extraction:**

Built a document triage pipeline for a compliance client: inbound PDFs → OCR → LLM classification (Is this a contract? Invoice? Legal filing?) → structured extraction (parties, dates, amounts, clauses) → write to Postgres with confidence scores. Used OpenAI function calling for structured extraction with a 3-retry loop on parse failures. Cost optimization: batched classification for low-confidence docs (group 10 similar docs, one LLM call with example discrimination). Hit 94% accuracy on classification, 89% on extraction. Tool use for internal knowledge base lookups ("Did we already process this contract? What's the last amendment date?"). Claude Sonnet for the classification, Opus for extraction on high-value documents.

Key learnings: structured output parsing needs robust error handling (LLM output varies more than expected), cost optimization via batching is possible but adds latency, and monitoring LLM cost per document is essential for scope management.

---

## 3. Hourly Rate + Availability

**$45/hr** — open to negotiation based on scope.

**Availability:** 35+ hours/week, immediate start. 6+ month engagement preferred.

---

## 4. Architectural Opinion I'd Push Back On

**Cloudflare Workflows for everything may be over-engineering at scale.**

Workflows are excellent for multi-step durable processes but they have limits:
- Sub-workflow calling is limited (max 5 levels deep)
- Long-running workflows (>1hr) have cost implications
- Debugging a failing Workflow with 12 steps is harder than debugging a Queues-based processor

My recommendation: Workflows for user-facing multi-step processes (document upload → review → approve). Queues for background processing (webhook ingestion → transform → deliver). Mixing them gives you the best of both: Workflows handles the human-in-the-loop flows, Queues handles the high-volume machine flows.

**What I'd flag in your stack specifically:** AI Gateway is smart for observability, but make sure the cost tracking granularity matches your billing cycles — if you're billing clients monthly and AI Gateway tracks per-call, you'll need a rollup job.

---

## 5. Workflows vs Inngest vs Temporal

**I lean toward Cloudflare Workflows — but with caveats.**

For a Cloudflare-first stack (which yours is), Workflows is the right default:
- Native to the platform, no extra vendor
- Durable execution handles network failures gracefully
- Cron triggers integrated natively

**But:** If you need cross-cloud portability or have workflows that outlive a Cloudflare account (enterprise clients with long-running approvals), Inngest wins. Temporal is overkill for Workers-scale — it's built for distributed systems at a scale most startups never reach.

**My take:** Start with Workflows. Migrate to Inngest only if you hit a Workflow limit that blocks you. Don't introduce Temporal unless you have a specific Temporal-only feature you can't replicate.

---

## 6. Approach to Key Challenges

**Detecting meaningful signals (not noise):**

Your monitoring workflows need signal quality filtering. My approach:
- Define a "meaningful change" taxonomy: new_hire, funding, partnership, leadership_change, expansion, regulatory
- Only emit a signal if it matches the taxonomy
- Use LLM to interpret: "Is this signal relevant to a B2B SaaS legal tech buyer?" (filters out noise)
- Human feedback loop: 👍/👎 on signals trains the filter over time

**Converting signals to actionable outreach:**

Signal → What happened → Why it matters (in law firm context) → What to do → Who to contact.

Example: "New VP of Legal hired at TargetOrg" → What: leadership change → Why: new VP may have budget and pain points we can address → What: outreach with legal tech value prop → Who: the VP directly, with CEO/COO intro if possible.

**LinkedIn realistic approach:**

LinkedIn TOS makes scraping unsafe at scale. Realistic path:
- Sales Navigator alerts → Gmail inbox (they support this)
- Parse Gmail via IMAP/API → extract job changes + engagement signals
- This stays within TOS and gives you the signal types you care about

This is less comprehensive than a scraper but it's sustainable and doesn't risk account bans.

---

## 7. Timeline + Deliverables

**Phase 1 (Month 1):** Foundation
- Dev environment + CI/CD for Workers
- GoHighLevel + Clio integration (webhooks + scheduled sync)
- D1 schema design + KV idempotency layer

**Phase 2 (Month 2):** Document Pipeline
- OCR integration (Azure Form Recognizer)
- AI extraction pipeline (Claude Sonnet + Opus)
- R2 document storage + D1 metadata

**Phase 3 (Month 3):** AI Agents
- Agent SDK loops for drafting + classification
- Real-time communications routing
- Monitoring Cron triggers + observability dashboard

**Ongoing:** Iterative delivery every 2 weeks, working directly with founder.

---

## 8. GoHighLevel + Clio Experience

I've worked with both APIs:
- **GoHighLevel:** REST API, OAuth2, marketing automation triggers, contact/company management. Well-documented, reliable.
- **Clio:** GraphQL API (non-standard), case management, document management, billing. Steeper learning curve than REST but complete.

Both are mainstream legal/CRM SaaS — experience is transferable.

---

**GitHub:** https://github.com/9KMan/JOB-20260508142744-000012