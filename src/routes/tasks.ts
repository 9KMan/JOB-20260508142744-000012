import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../db/schema.js';
import { AgentEngine } from '../agent/agent.js';

const taskSchema = z.object({
  agentId: z.string(),
  input: z.record(z.unknown()).optional()
});

const executeSchema = z.object({
  input: z.record(z.unknown()).optional()
});

export const tasksRoute = new Hono<{ Bindings: Env }>();

tasksRoute.get('/', async (c) => {
  const status = c.req.query('status');
  let query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  if (status) {
    query = 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC';
    const tasks = await c.env.DB.prepare(query).bind(status).all();
    return c.json(tasks.results);
  }
  const tasks = await c.env.DB.prepare(query).all();
  return c.json(tasks.results);
});

tasksRoute.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
  const { agentId, input } = parsed.data;
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO tasks (id, agent_id, status, input, created_at)
    VALUES (?, ?, 'pending', ?, ?)
  `).bind(id, agentId, JSON.stringify(input || {}), now).run();
  return c.json({ id, agentId, status: 'pending', input: input || {}, createdAt: now }, 201);
});

tasksRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const task = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  return c.json(task);
});

tasksRoute.post('/:id/execute', async (c) => {
  const id = c.req.param('id');
  const task = await c.env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  const agent = await c.env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(task.agent_id as string).first();
  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }
  await c.env.DB.prepare('UPDATE tasks SET status = ? WHERE id = ?').bind('running', id).run();
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    const engine = new AgentEngine(apiKey);
    const agentObj = {
      id: agent.id as string,
      name: agent.name as string,
      description: agent.description as string || '',
      systemPrompt: agent.system_prompt as string,
      tools: JSON.parse(agent.tools as string || '[]'),
      createdAt: agent.created_at as number,
      updatedAt: agent.updated_at as number
    };
    const taskObj = {
      id: task.id as string,
      agentId: task.agent_id as string,
      status: 'running' as const,
      input: JSON.parse(task.input as string || '{}'),
      output: null,
      error: null,
      createdAt: task.created_at as number,
      completedAt: null
    };
    const body = await c.req.json();
    if (body.input) {
      taskObj.input = { ...taskObj.input, ...body.input };
    }
    const result = await engine.execute(agentObj, taskObj);
    await c.env.DB.prepare(`
      UPDATE tasks SET status = 'completed', output = ?, completed_at = ? WHERE id = ?
    `).bind(JSON.stringify(result.output), Date.now(), id).run();
    return c.json({ status: 'completed', output: result.output });
  } catch (error) {
    await c.env.DB.prepare(`
      UPDATE tasks SET status = 'failed', error = ?, completed_at = ? WHERE id = ?
    `).bind((error as Error).message, Date.now(), id).run();
    return c.json({ status: 'failed', error: (error as Error).message }, 500);
  }
});