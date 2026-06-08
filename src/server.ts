import express, { type NextFunction, type Request, type Response } from 'express';
import { DatabaseArchitectAgent } from './agent/databaseArchitect.agent';
import { env } from './config/env';
import { createMcpServer } from './mcp/mcpServer';
import { logger } from './utils/logger';

/**
 * Autenticación servicio-a-servicio por API key (`x-internal-api-key`).
 * Si `INTERNAL_API_KEY` no está configurada, los endpoints quedan abiertos
 * (solo para desarrollo) y se registra una advertencia.
 */
function internalAuth(req: Request, res: Response, next: NextFunction) {
  const required = env.internalApiKey;
  if (!required) {
    return next();
  }
  const provided = req.header('x-internal-api-key');
  if (provided && provided === required) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

export function createApp() {
  const app = express();
  const mcpServer = createMcpServer();
  const agent = new DatabaseArchitectAgent();

  app.use(express.json({ limit: '1mb' }));

  if (!env.internalApiKey) {
    logger.warn(
      'INTERNAL_API_KEY no configurada: los endpoints /tools y /agent quedan abiertos (solo para desarrollo).'
    );
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'database-architect-agent',
      environment: env.nodeEnv,
    });
  });

  app.get('/tools', internalAuth, (_req: Request, res: Response) => {
    res.json({ tools: mcpServer.listTools() });
  });

  app.post('/tools/:name', internalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await mcpServer.callTool(req.params.name, req.body ?? {});
      res.json({ result });
    } catch (error) {
      next(error);
    }
  });

  app.post('/agent/analyze', internalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await agent.analyze(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
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
