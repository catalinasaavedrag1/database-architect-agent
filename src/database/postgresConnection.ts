import { Pool } from "pg";
import { env } from "../config/env";

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    password: env.database.password,
    ssl: env.database.encrypt ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
