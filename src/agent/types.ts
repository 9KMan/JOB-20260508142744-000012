export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: unknown;
  error: string | null;
  createdAt: number;
  completedAt: number | null;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: number;
}

export interface WorkflowStep {
  agentId: string;
  input: Record<string, unknown>;
  condition?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}