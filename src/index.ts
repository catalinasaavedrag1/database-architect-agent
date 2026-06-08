import { databaseArchitectAgent } from "./agent/databaseArchitect.agent";

async function main() {
  const result = await databaseArchitectAgent({
    userQuestion: "Analiza el modelo de datos y detecta problemas de relaciones.",
    includeSchema: true,
  });

  console.log(result.agentInstruction);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { createApp, startHttpServer } from "./server";
export { createMcpServer } from "./mcp/mcpServer";
export { databaseArchitectAgent, DatabaseArchitectAgent } from "./agent/databaseArchitect.agent";
