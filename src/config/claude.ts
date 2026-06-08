import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

export const claudeConfig = {
  model: env.CLAUDE_MODEL,
  maxTokens: env.CLAUDE_MAX_TOKENS,
};

export function createClaudeClient() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required to call Claude.');
  }

  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
}

