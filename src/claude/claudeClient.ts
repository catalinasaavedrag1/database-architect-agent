import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";

let client: Anthropic | null = null;

/**
 * Lazily build the Anthropic client so that importing modules that depend on
 * Claude (controllers, the agent, the CLI) does not crash the process when no
 * API key is configured. The key is only required the moment a request is made.
 */
export function getClaudeClient(): Anthropic {
  if (!env.claude.apiKey) {
    throw new Error("Missing CLAUDE_API_KEY in environment variables");
  }

  if (!client) {
    client = new Anthropic({ apiKey: env.claude.apiKey });
  }

  return client;
}
