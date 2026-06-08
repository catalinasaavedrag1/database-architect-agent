import { getClaudeClient } from "./claudeClient";
import { claudeDatabaseTools } from "./claudeTools";
import { executeClaudeTool } from "./toolExecutor";
import { DATABASE_ARCHITECT_SYSTEM_PROMPT } from "../agent/systemPrompt";
import { env } from "../config/env";
import { safeStringify } from "../utils/safeJson";
import type {
  MessageParam,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages";

export interface ClaudeDatabaseArchitectInput {
  question: string;
}

export async function runClaudeDatabaseArchitect(
  input: ClaudeDatabaseArchitectInput
): Promise<string> {
  const claudeClient = getClaudeClient();

  const messages: MessageParam[] = [
    {
      role: "user",
      content: input.question,
    },
  ];

  while (true) {
    const response = await claudeClient.messages.create({
      model: env.claude.model,
      max_tokens: 4000,
      system: DATABASE_ARCHITECT_SYSTEM_PROMPT,
      tools: claudeDatabaseTools,
      messages,
    });

    const toolResults: ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "tool_use") {
        const toolResult = await executeClaudeTool(block.name, block.input);

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: safeStringify(toolResult),
        });
      }
    }

    if (toolResults.length === 0) {
      return response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
    }

    messages.push({
      role: "assistant",
      content: response.content,
    });
    messages.push({
      role: "user",
      content: toolResults,
    });
  }
}
