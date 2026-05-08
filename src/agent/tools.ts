import type { Tool } from './types.js';

export const legalTools: Record<string, Tool> = {
  document_search: {
    id: 'document_search',
    name: 'Document Search',
    description: 'Search legal documents for relevant information',
    execute: async (input: Record<string, unknown>) => {
      const { query, documents } = input;
      const results = documents?.filter((doc: string) =>
        doc.toLowerCase().includes((query as string).toLowerCase())
      ) || [];
      return { results, count: results.length };
    }
  },
  contract_analysis: {
    id: 'contract_analysis',
    name: 'Contract Analysis',
    description: 'Analyze contract clauses and terms',
    execute: async (input: Record<string, unknown>) => {
      const { content } = input;
      const clauses = (content as string)?.split('\n\n') || [];
      return {
        clauseCount: clauses.length,
        riskFlags: clauses.filter((c: string) => /risk|liability|indemnify/i.test(c)).length
      };
    }
  },
  case_research: {
    id: 'case_research',
    name: 'Case Research',
    description: 'Search legal cases and precedents',
    execute: async (input: Record<string, unknown>) => {
      const { query } = input;
      return {
        matches: [],
        query,
        timestamp: Date.now()
      };
    }
  },
  document_summarize: {
    id: 'document_summarize',
    name: 'Document Summarize',
    description: 'Generate summary of legal documents',
    execute: async (input: Record<string, unknown>) => {
      const { content, maxLength = 500 } = input;
      const summary = (content as string)?.slice(0, maxLength as number) + '...';
      return { summary, originalLength: (content as string)?.length || 0 };
    }
  }
};

export const getTool = (id: string): Tool | undefined => legalTools[id];

export const listTools = (): Tool[] => Object.values(legalTools);