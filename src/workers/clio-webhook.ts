import type { Context } from 'hono';
import type { KVNamespace } from '@cloudflare/workers-types';
import { checkIdempotency, setIdempotency } from '../lib/idempotency';

interface Env {
  CACHE: KVNamespace;
  CLIO_CLIENT_ID: string;
  CLIO_CLIENT_SECRET: string;
}

export async function handleWebhookClio(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const webhookId = body?.webhook_id as string;

    if (!webhookId) {
      return c.json({ error: 'Missing webhook_id' }, 400);
    }

    const alreadyProcessed = await checkIdempotency(webhookId, c.env.CACHE);
    if (alreadyProcessed) {
      return c.json({ status: 'duplicate' });
    }

    const eventType = body?.event_type as string;
    console.log(`Clio webhook: ${eventType}`);

    await setIdempotency(webhookId, 'processed', c.env.CACHE);
    return c.json({ status: 'ok' });
  } catch (error) {
    console.error('Clio webhook error:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
}
