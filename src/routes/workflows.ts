import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../db/schema.js';

const workflowSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.object({
    agentId: z.string(),
    input: z.record(z.unknown()).optional(),
    condition: z.string().optional()
  }))
});

export const workflowsRoute = new Hono<{ Bindings: Env }>();

workflowsRoute.get('/', async (c) => {
  const workflows = await c.env.DB.prepare('SELECT * FROM workflows ORDER BY created_at DESC').all();
  return c.json(workflows.results);
});

workflowsRoute.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = workflowSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
  const { name, steps } = parsed.data;
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO workflows (id, name, steps, created_at)
    VALUES (?, ?, ?, ?)
  `).bind(id, name, JSON.stringify(steps), now).run();
  return c.json({ id, name, steps, createdAt: now }, 201);
});

workflowsRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const workflow = await c.env.DB.prepare('SELECT * FROM workflows WHERE id = ?').bind(id).first();
  if (!workflow) {
    return c.json({ error: 'Workflow not found' }, 404);
  }
  return c.json(workflow);
});

workflowsRoute.post('/:id/execute', async (c) => {
  const id = c.req.param('id');
  const workflow = await c.env.DB.prepare('SELECT * FROM workflows WHERE id = ?').bind(id).first();
  if (!workflow) {
    return c.json({ error: 'Workflow not found' }, 404);
  }
  return c.json({ status: 'executed', workflowId: id, message: 'Workflow execution initiated' });
});