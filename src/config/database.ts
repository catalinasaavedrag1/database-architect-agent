import { env } from './env';
import type { DatabaseConnectionConfig } from '../types/database.types';

export const databaseConfig: DatabaseConnectionConfig = {
  host: env.database.host ?? '',
  port: env.database.port,
  database: env.database.name ?? '',
  user: env.database.user ?? '',
  password: env.database.password ?? '',
  encrypt: env.database.encrypt,
  trustServerCertificate: env.database.trustCert,
};
