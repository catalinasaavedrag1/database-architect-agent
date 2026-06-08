import { tools } from './tools';
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
