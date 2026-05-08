import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../db/schema.js';

const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  tools: z.array(z.string()).optional()
});

export const agentsRoute = new Hono<{ Bindings: Env }>();

agentsRoute.get('/', async (c) => {
  const agents = await c.env.DB.prepare('SELECT * FROM agents ORDER BY created_at DESC').all();
  return c.json(agents.results);
});

agentsRoute.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = agentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
  const { name, description, systemPrompt, tools } = parsed.data;
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO agents (id, name, description, system_prompt, tools, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, description || null, systemPrompt, JSON.stringify(tools || []), now, now).run();
  return c.json({ id, name, description, systemPrompt, tools: tools || [], createdAt: now, updatedAt: now }, 201);
});

agentsRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const agent = await c.env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }
  return c.json(agent);
});

agentsRoute.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM agents WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});