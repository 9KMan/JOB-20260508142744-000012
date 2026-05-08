import { Hono } from 'hono';
import type { Env } from '../index';

export async function classifyDocument(c: Context<{ Bindings: Env }>) {
  try {
    const { document_url, mime_type } = await c.req.json();

    if (!document_url) {
      return c.json({ error: 'Missing document_url' }, 400);
    }

    // TODO: Implement Claude classification
    // 1. Download document from R2/s3
    // 2. Send to Claude Sonnet for classification
    // 3. Return classification result

    return c.json({
      classification: 'pending',
      confidence: 0,
      document_url
    });
  } catch (error) {
    console.error('Classification error:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
}
