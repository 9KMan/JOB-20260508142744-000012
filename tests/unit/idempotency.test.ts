import { describe, it, expect } from 'vitest';
import { generateKeyHash } from '../../src/lib/idempotency';

describe('idempotency', () => {
  it('generates unique key hashes', () => {
    const key1 = generateKeyHash('test-event-1');
    const key2 = generateKeyHash('test-event-2');
    expect(key1).not.toBe(key2);
    expect(key1).toHaveLength(16);
  });
});
