import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createStdioMcpServer } from "../mcp/stdioServer";
import { validateEnv } from "../config/validateEnv";

async function main() {
  try {
    validateEnv();
  } catch (error) {
    // stdout is reserved for the MCP protocol, so diagnostics go to stderr.
    console.error("Invalid environment configuration:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const server = createStdioMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("database-architect-agent MCP server running on stdio");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
