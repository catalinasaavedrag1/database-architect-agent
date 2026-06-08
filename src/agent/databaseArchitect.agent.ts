import { claudeConfig, createClaudeClient } from '../config/claude';
import { databaseArchitectSystemPrompt } from './systemPrompt';
import { agentRules } from './agentRules';
import { responseFormat } from './responseFormat';
import type { AgentRequest, AgentResponse } from '../types/agent.types';

export class DatabaseArchitectAgent {
  async analyze(request: AgentRequest): Promise<AgentResponse> {
    const client = createClaudeClient();
    const userPrompt = JSON.stringify(
      {
        request,
        rules: agentRules,
        expectedResponse: responseFormat,
      },
      null,
      2,
    );

    const message = await client.messages.create({
      model: claudeConfig.model,
      max_tokens: claudeConfig.maxTokens,
      system: databaseArchitectSystemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content
      .map((part) => ('text' in part ? part.text : ''))
      .filter(Boolean)
      .join('\n');

    return {
      summary: content,
      recommendations: [],
      risks: [],
      sql: [],
      requiresApproval: false,
    };
  }
}

