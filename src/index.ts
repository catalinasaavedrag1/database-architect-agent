import { startHttpServer } from "./server";

async function main() {
  // Modo servicio: levanta el servidor HTTP para que otros microservicios
  // llamen a /agent/analyze y /tools/:name.
  await startHttpServer();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { createApp, startHttpServer } from "./server";
export { createMcpServer } from "./mcp/mcpServer";
export {
  databaseArchitectAgent,
  runDatabaseArchitect,
  DatabaseArchitectAgent,
} from "./agent/databaseArchitect.agent";
