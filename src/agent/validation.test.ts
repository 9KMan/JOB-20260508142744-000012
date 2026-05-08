import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const agentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  tools: z.array(z.string()).optional()
});

const taskSchema = z.object({
  agentId: z.string(),
  input: z.record(z.unknown()).optional()
});

describe('Validation Schemas', () => {
  describe('agentSchema', () => {
    it('validates valid agent data', () => {
      const valid = {
        name: 'Legal Assistant',
        description: 'A helpful legal AI',
        systemPrompt: 'You are a legal assistant.',
        tools: ['document_search']
      };
      expect(agentSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects agent without name', () => {
      const invalid = {
        name: '',
        systemPrompt: 'You are a legal assistant.'
      };
      expect(agentSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects agent without systemPrompt', () => {
      const invalid = {
        name: 'Legal Assistant',
        systemPrompt: ''
      };
      expect(agentSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('taskSchema', () => {
    it('validates valid task data', () => {
      const valid = {
        agentId: '123e4567-e89b-12d3-a456-426614174000',
        input: { query: 'search contracts' }
      };
      expect(taskSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects task without agentId', () => {
      const invalid = {
        input: { query: 'search' }
      };
      expect(taskSchema.safeParse(invalid).success).toBe(false);
    });
  });
});