import type { Context } from 'hono';

export async function healthCheck(c: Context) {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0'
  });
}
