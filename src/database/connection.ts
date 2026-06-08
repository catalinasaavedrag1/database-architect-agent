import { databaseConfig } from '../config/database';
import { PostgresClient } from './postgres.client';
import { SqlServerClient } from './sqlServer.client';
import type { DatabaseClient, DatabaseConfig } from '../types/database.types';

export async function createDatabaseConnection(config: DatabaseConfig = databaseConfig): Promise<DatabaseClient> {
  if (!config.connectionString) {
    throw new Error('DATABASE_URL is required to connect to a database.');
  }

  if (config.engine === 'postgres') {
    return new PostgresClient(config.connectionString, config.ssl);
  }

  return new SqlServerClient(config.connectionString);
}

