import { callMcpTool } from "../src/mcp/mcpServer";

async function main() {
  const result = await callMcpTool({
    toolName: "read_tables",
    input: {},
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
