import type { JsonObject, ToolDefinition } from './tool.types';

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpServerAdapter {
  listTools(): Pick<ToolDefinition, 'name' | 'description' | 'inputSchema'>[];
  callTool(name: string, input: JsonObject): Promise<unknown>;
}

