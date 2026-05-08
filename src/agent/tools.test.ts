import { describe, it, expect } from 'vitest';
import { getTool, listTools, legalTools } from './tools.js';

describe('Legal Tools', () => {
  describe('getTool', () => {
    it('returns tool for valid id', () => {
      const tool = getTool('document_search');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('Document Search');
    });

    it('returns undefined for invalid id', () => {
      const tool = getTool('nonexistent');
      expect(tool).toBeUndefined();
    });
  });

  describe('listTools', () => {
    it('returns all available tools', () => {
      const tools = listTools();
      expect(tools).toHaveLength(4);
      expect(tools.map(t => t.id)).toContain('document_search');
      expect(tools.map(t => t.id)).toContain('contract_analysis');
      expect(tools.map(t => t.id)).toContain('case_research');
      expect(tools.map(t => t.id)).toContain('document_summarize');
    });
  });

  describe('document_search', () => {
    it('searches documents with matching query', async () => {
      const tool = getTool('document_search')!;
      const result = await tool.execute({
        query: 'contract',
        documents: ['contract agreement', 'invoice', 'contractor form']
      });
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('count', 2);
    });
  });

  describe('contract_analysis', () => {
    it('counts clauses and risk flags', async () => {
      const tool = getTool('contract_analysis')!;
      const result = await tool.execute({
        content: 'Section 1: Parties agree\n\nSection 2: Risk of liability\n\nSection 3: Indemnification clause'
      });
      expect(result).toHaveProperty('clauseCount', 3);
      expect(result).toHaveProperty('riskFlags', 2);
    });
  });

  describe('document_summarize', () => {
    it('truncates content to maxLength', async () => {
      const tool = getTool('document_summarize')!;
      const result = await tool.execute({
        content: 'This is a very long document content that should be summarized.',
        maxLength: 20
      });
      expect(result).toHaveProperty('summary');
      expect((result as { summary: string }).summary.length).toBeLessThanOrEqual(23);
      expect(result).toHaveProperty('originalLength');
    });
  });
});