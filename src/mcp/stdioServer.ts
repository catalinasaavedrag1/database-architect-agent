import fs from "fs";
import path from "path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callMcpTool } from "./mcpServer";
import { registeredTools } from "./toolRegistry";
import { mcpResources } from "./resources";
import { safeStringify } from "../utils/safeJson";

const optionalText = z.string().optional();
const requiredQuery = z.string().min(1);

/**
 * Input shapes (raw Zod shapes) per tool, as required by `registerTool`. These
 * mirror the zod schemas in `schemas/toolInput.schemas.ts`; the authoritative
 * validation still runs inside `callMcpTool`.
 */
const toolInputShapes: Record<string, z.ZodRawShape> = {
  read_schema: {},
  read_tables: { schemaName: optionalText },
  read_columns: { schemaName: optionalText, tableName: optionalText },
  read_relationships: { schemaName: optionalText, tableName: optionalText },
  read_indexes: { schemaName: optionalText, tableName: optionalText },
  validate_sql: { query: requiredQuery },
  explain_query: { query: requiredQuery },
  document_schema: {},
};

const resourceFiles: Record<string, string> = {
  "database-architect://docs/security-rules": "security-rules.md",
  "database-architect://docs/tools": "tools.md",
};

/**
 * Build a real MCP server that exposes the database tool registry over the
 * Model Context Protocol. Each tool delegates to `callMcpTool`, so it inherits
 * the same Zod validation, read-only permission guard and execution timeout as
 * every other entry point.
 */
interface McpTextResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: "database-architect-agent",
    version: "0.1.0",
  });

  // `registerTool` is heavily generic over the Zod input shape, which trips
  // TS2589 (excessively deep instantiation) when driven from a `Record`. Pin a
  // concrete, simpler signature; runtime behaviour is unchanged.
  const registerTool = server.registerTool.bind(server) as unknown as (
    name: string,
    config: { description?: string; inputSchema?: z.ZodRawShape },
    cb: (args: Record<string, unknown>) => Promise<McpTextResult>
  ) => unknown;

  for (const tool of registeredTools) {
    registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: toolInputShapes[tool.name] ?? {},
      },
      async (args: Record<string, unknown>) => {
        const result = await callMcpTool({
          toolName: tool.name,
          input: args ?? {},
        });

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                result.success ? result.data : { error: result.error }
              ),
            },
          ],
          isError: !result.success,
        };
      }
    );
  }

  for (const resource of mcpResources) {
    const fileName = resourceFiles[resource.uri];

    if (!fileName) {
      continue;
    }

    server.registerResource(
      resource.name,
      resource.uri,
      {
        description: resource.description,
        mimeType: resource.mimeType,
      },
      async () => {
        const filePath = path.join(process.cwd(), "docs", fileName);
        const text = fs.readFileSync(filePath, "utf-8");

        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text,
            },
          ],
        };
      }
    );
  }

  return server;
}
