import { nanoid } from 'nanoid';
import type { KVNamespace } from '@cloudflare/workers-types';

export interface IdempotencyRecord {
  processedAt: number;
  result?: string;
}

export async function checkIdempotency(
  key: string,
  cache: KVNamespace
): Promise<boolean> {
  const existing = await cache.get(`idempotency:${key}`);
  return existing !== null;
}

export async function setIdempotency(
  key: string,
  result: string,
  cache: KVNamespace
): Promise<void> {
  const record: IdempotencyRecord = {
    processedAt: Date.now(),
    result
  };
  await cache.put(`idempotency:${key}`, JSON.stringify(record));
}

export function generateKeyHash(key: string): string {
  return nanoid(16);
}