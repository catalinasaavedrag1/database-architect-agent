import express, { type NextFunction, type Request, type Response } from 'express';
import { DatabaseArchitectAgent } from './agent/databaseArchitect.agent';
import { handleDatabaseArchitectQuestion } from './api/databaseArchitect.controller';
import { env } from './config/env';
import { createMcpServer } from './mcp/mcpServer';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();
  const mcpServer = createMcpServer();
  const agent = new DatabaseArchitectAgent();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'database-architect-agent',
      environment: env.nodeEnv,
    });
  });

  app.get('/tools', (_req: Request, res: Response) => {
    res.json({ tools: mcpServer.listTools() });
  });

  app.post('/tools/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await mcpServer.callTool(req.params.name, req.body ?? {});
      res.json({ result });
    } catch (error) {
      next(error);
    }
  });

  app.post('/agent/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await agent.analyze(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/agent/database-architect', async (req: Request, res: Response) => {
    const result = await handleDatabaseArchitectQuestion(req.body);
    res.status(result.success ? 200 : 400).json(result);
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Request failed', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  });

  return app;
}

export async function startHttpServer(port = env.port) {
  const app = createApp();

  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info(`Database Architect Agent listening on port ${port}`);
      resolve();
    });
  });
}
