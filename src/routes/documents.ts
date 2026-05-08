import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../db/schema.js';

const documentSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional()
});

export const documentsRoute = new Hono<{ Bindings: Env }>();

documentsRoute.get('/', async (c) => {
  const type = c.req.query('type');
  let query = 'SELECT * FROM documents ORDER BY created_at DESC';
  if (type) {
    query = 'SELECT * FROM documents WHERE type = ? ORDER BY created_at DESC';
    const docs = await c.env.DB.prepare(query).bind(type).all();
    return c.json(docs.results);
  }
  const docs = await c.env.DB.prepare(query).all();
  return c.json(docs.results);
});

documentsRoute.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
  const { name, type, content, metadata } = parsed.data;
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare(`
    INSERT INTO documents (id, name, type, content, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, name, type || null, content, JSON.stringify(metadata || {}), now).run();
  return c.json({ id, name, type, content, metadata: metadata || {}, createdAt: now }, 201);
});

documentsRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await c.env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();
  if (!doc) {
    return c.json({ error: 'Document not found' }, 404);
  }
  return c.json(doc);
});