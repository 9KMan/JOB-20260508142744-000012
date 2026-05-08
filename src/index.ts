import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { agentsRoute } from './routes/agents.js';
import { tasksRoute } from './routes/tasks.js';
import { workflowsRoute } from './routes/workflows.js';
import { documentsRoute } from './routes/documents.js';
import type { Env } from './db/schema.js';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: ['http://localhost:5173', 'https://lexagent.example.com'],
  credentials: true
}));

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

app.route('/api/agents', agentsRoute);
app.route('/api/tasks', tasksRoute);
app.route('/api/workflows', workflowsRoute);
app.route('/api/documents', documentsRoute);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));
app.onError((c, err) => c.json({ error: err.message }, 500));

export default app;