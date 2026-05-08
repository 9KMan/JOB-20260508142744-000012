import type { Context } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
}

export async function getSignals(c: Context<{ Bindings: Env }>) {
  const period = c.req.query('period') || '7d';
  const cutoff = period === '24h' ? Date.now() - 86400000 : Date.now() - 604800000;

  const signals = await c.env.DB
    .prepare('SELECT * FROM signals WHERE emitted_at > ? ORDER BY emitted_at DESC LIMIT 100')
    .bind(Math.floor(cutoff / 1000))
    .all();

  return c.json({ signals: signals.results, period });
}
