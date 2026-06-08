import { callMcpTool } from "../mcp/mcpServer";

export async function executeClaudeTool(
  toolName: string,
  input: unknown
): Promise<unknown> {
  const result = await callMcpTool({
    toolName,
    input,
  });

  if (!result.success) {
    return {
      error: result.error,
    };
  }

  return result.data;
}
