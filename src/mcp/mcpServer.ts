import { tools } from './tools';
import { getRegisteredTool, registeredTools } from './toolRegistry';
import type { ToolDefinition } from '../types/tool.types';

export function createMcpServer(registry: ToolDefinition<Record<string, unknown>, unknown>[] = tools) {
  const toolMap = new Map(registry.map((tool) => [tool.name, tool]));

  return {
    listTools() {
      return registry.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema: inputSchema ?? {},
      }));
    },

    async callTool(name: string, input: Record<string, unknown>) {
      const tool = toolMap.get(name);

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      return tool.execute(input);
    },
  };
}

// ---------------------------------------------------------------------------
// Procedural MCP-style surface backed by the Zod-validated tool registry.
// Used by the Claude tool executor, the CLI, and the HTTP controller.
// ---------------------------------------------------------------------------

export interface McpToolCallRequest {
  toolName: string;
  input?: unknown;
}

export interface McpToolCallResponse {
  success: boolean;
  toolName: string;
  data?: unknown;
  error?: string;
}

export function listMcpTools() {
  return registeredTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
}

export async function callMcpTool(
  request: McpToolCallRequest
): Promise<McpToolCallResponse> {
  const tool = getRegisteredTool(request.toolName);

  if (!tool) {
    return {
      success: false,
      toolName: request.toolName,
      error: `Tool not found: ${request.toolName}`,
    };
  }

  const parsedInput = tool.inputSchema.safeParse(request.input ?? {});

  if (!parsedInput.success) {
    return {
      success: false,
      toolName: request.toolName,
      error: parsedInput.error.message,
    };
  }

  try {
    const data = await tool.execute(parsedInput.data as never);

    return {
      success: true,
      toolName: request.toolName,
      data,
    };
  } catch (error) {
    return {
      success: false,
      toolName: request.toolName,
      error: error instanceof Error ? error.message : "Unknown tool error",
    };
  }
}
