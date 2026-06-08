import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

export const claudeConfig = {
  model: env.claude.model,
  maxTokens: 4096,
};

export function createClaudeClient() {
  if (!env.claude.apiKey) {
    throw new Error('CLAUDE_API_KEY is required to call Claude.');
  }

  return new Anthropic({
    apiKey: env.claude.apiKey,
  });
}
