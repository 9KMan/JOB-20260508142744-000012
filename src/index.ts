import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleWebhookGHL } from './workers/webhook';
import { handleWebhookClio } from './workers/clio-webhook';
import { handleDocumentUpload } from './workers/document';
import { getSignals } from './workers/signals';
import { classifyDocument } from './agents/classification';
import { draftDocument } from './agents/drafting';
import { healthCheck } from './workers/health';

const app = new Hono();

app.use('*', cors());

app.post('/webhook/gohighlevel', handleWebhookGHL);
app.post('/webhook/clio', handleWebhookClio);
app.post('/webhook/document', handleDocumentUpload);

app.get('/api/signals', getSignals);
app.post('/api/agents/classify', classifyDocument);
app.post('/api/agents/draft', draftDocument);
app.get('/api/health', healthCheck);

export default app;