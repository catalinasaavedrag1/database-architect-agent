import { startHttpServer } from './server';
import { logger } from './utils/logger';

if (require.main === module) {
  startHttpServer().catch((error) => {
    logger.error('Failed to start Database Architect Agent', error);
    process.exitCode = 1;
  });
}

export { createApp, startHttpServer } from './server';
export { createMcpServer } from './mcp/mcpServer';
export { DatabaseArchitectAgent } from './agent/databaseArchitect.agent';

