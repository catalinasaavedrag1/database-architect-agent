import { env } from './env';
import type { DatabaseConfig } from '../types/database.types';

export const databaseConfig: DatabaseConfig = {
  engine: env.DATABASE_ENGINE,
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL,
  readOnly: env.DATABASE_READ_ONLY,
};

