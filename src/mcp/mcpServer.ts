import { tools } from './tools';
import { getRegisteredTool, registeredTools } from './toolRegistry';
import { evaluateToolPermission } from '../safety/toolPermission';
import { withTimeout } from '../utils/withTimeout';
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
  /** Explicit human approval for tools outside the read-only allowlist. */
  approved?: boolean;
}

export interface McpToolCallResponse {
  success: boolean;
  toolName: string;
  data?: unknown;
  error?: string;
  durationMs?: number;
  requiresApproval?: boolean;
}

const TOOL_TIMEOUT_MS = 30_000;

export function listMcpTools() {
  return registeredTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
}

export async function callMcpTool(
  request: McpToolCallRequest
): Promise<McpToolCallResponse> {
  const startedAt = Date.now();
  const tool = getRegisteredTool(request.toolName);

  if (!tool) {
    return {
      success: false,
      toolName: request.toolName,
      error: `Tool not found: ${request.toolName}`,
      durationMs: Date.now() - startedAt,
    };
  }

  const permission = evaluateToolPermission(tool.name, request.approved);

  if (!permission.allowed) {
    return {
      success: false,
      toolName: request.toolName,
      error: permission.reason,
      requiresApproval: true,
      durationMs: Date.now() - startedAt,
    };
  }

  const parsedInput = tool.inputSchema.safeParse(request.input ?? {});

  if (!parsedInput.success) {
    return {
      success: false,
      toolName: request.toolName,
      error: parsedInput.error.message,
      durationMs: Date.now() - startedAt,
    };
  }

  try {
    const data = await withTimeout(
      Promise.resolve(tool.execute(parsedInput.data as never)),
      TOOL_TIMEOUT_MS,
      `tool:${tool.name}`
    );

    return {
      success: true,
      toolName: request.toolName,
      data,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      success: false,
      toolName: request.toolName,
      error: error instanceof Error ? error.message : "Unknown tool error",
      durationMs: Date.now() - startedAt,
    };
  }
}
