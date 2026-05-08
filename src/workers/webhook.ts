import type { Context } from 'hono';
import type { KVNamespace } from '@cloudflare/workers-types';
import { checkIdempotency, setIdempotency } from '../lib/idempotency';

interface Env {
  CACHE: KVNamespace;
  GOHIGHLEVEL_API_KEY: string;
  GOHIGHLEVEL_LOCATION_ID: string;
}

export async function handleWebhookGHL(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const eventId = body?.event_id as string;

    if (!eventId) {
      return c.json({ error: 'Missing event_id' }, 400);
    }

    // Idempotency check
    const alreadyProcessed = await checkIdempotency(eventId, c.env.CACHE);
    if (alreadyProcessed) {
      return c.json({ status: 'duplicate', event_id: eventId });
    }

    // Process webhook based on event type
    const eventType = body?.type as string;
    switch (eventType) {
      case 'contact.create':
        await processContactCreate(body, c);
        break;
      case 'contact.update':
        await processContactUpdate(body, c);
        break;
      default:
        console.log(`Unhandled GHL event type: ${eventType}`);
    }

    await setIdempotency(eventId, 'processed', c.env.CACHE);
    return c.json({ status: 'ok', event_id: eventId });
  } catch (error) {
    console.error('GHL webhook error:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
}

async function processContactCreate(body: any, c: Context<{ Bindings: Env }>) {
  const contact = body?.contact;
  console.log('New GHL contact:', contact?.email);
  // TODO: Write to D1, emit signal
}

async function processContactUpdate(body: any, c: Context<{ Bindings: Env }>) {
  const contact = body?.contact;
  console.log('Updated GHL contact:', contact?.email);
  // TODO: Write to D1, emit signal
}
