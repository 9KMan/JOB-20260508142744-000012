import type { Context } from 'hono';

interface Env {
  ANTHROPIC_API_KEY: string;
}

export async function draftDocument(c: Context<{ Bindings: Env }>) {
  try {
    const { document_type, context, matter_id } = await c.req.json();

    if (!document_type || !context) {
      return c.json({ error: 'Missing document_type or context' }, 400);
    }

    // TODO: Implement Claude drafting
    // 1. Build prompt based on document_type and context
    // 2. Call Claude Opus via AI Gateway
    // 3. Return drafted document

    return c.json({
      draft: 'pending_implementation',
      document_type,
      matter_id
    });
  } catch (error) {
    console.error('Drafting error:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
}
