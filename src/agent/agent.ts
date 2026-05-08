import type { Agent, Task, WorkflowStep } from './types.js';
import { getTool } from './tools.js';

export interface AgentContext {
  agent: Agent;
  task: Task;
  messages: Array<{ role: string; content: string }>;
  metadata: Record<string, unknown>;
}

export class AgentEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async execute(agent: Agent, task: Task): Promise<{ output: unknown; messages: Array<{ role: string; content: string }> }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: JSON.stringify(task.input) }
    ];

    const context: AgentContext = {
      agent,
      task,
      messages,
      metadata: {}
    };

    const response = await this.callClaude(messages);
    messages.push({ role: 'assistant', content: response });

    const parsed = this.parseResponse(response);
    
    if (parsed.toolCalls) {
      for (const toolCall of parsed.toolCalls) {
        const tool = getTool(toolCall.name);
        if (tool) {
          const result = await tool.execute(toolCall.input);
          messages.push({ role: 'user', content: JSON.stringify({ tool: toolCall.name, result }) });
        }
      }
      const finalResponse = await this.callClaude(messages);
      messages.push({ role: 'assistant', content: finalResponse });
      return { output: this.parseResponse(finalResponse), messages };
    }

    return { output: parsed, messages };
  }

  private async callClaude(messages: Array<{ role: string; content: string }>): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    return data.content?.[0]?.text || '';
  }

  private parseResponse(response: string): unknown {
    try {
      return JSON.parse(response);
    } catch {
      return { text: response };
    }
  }
}

export async function executeWorkflow(agent: Agent, steps: WorkflowStep[], initialInput: Record<string, unknown>): Promise<unknown> {
  let result = initialInput;
  for (const step of steps) {
    const task: Task = {
      id: crypto.randomUUID(),
      agentId: step.agentId,
      status: 'pending',
      input: { ...step.input, previousResult: result },
      output: null,
      error: null,
      createdAt: Date.now(),
      completedAt: null
    };
    const engine = new AgentEngine(process.env.ANTHROPIC_API_KEY || '');
    const stepResult = await engine.execute(agent, task);
    result = stepResult.output;
  }
  return result;
}