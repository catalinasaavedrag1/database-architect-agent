import sql from "mssql";
import { readSchemaFromPool } from "../tools/readSchema.tool";
import type { FullDatabaseSchema } from "../tools/readSchema.tool";

/**
 * Conexión read-only a la BD de un microservicio que vive en SQL Server.
 * Permite revisar/migrar CUALQUIER ms sin tener que reconfigurar el agente:
 * se conecta al vuelo, introspecta el esquema y cierra la conexión.
 */
export interface SqlServerConnectionConfig {
  host: string;
  port?: number;
  database: string;
  user: string;
  password: string;
  encrypt?: boolean;
  trustCert?: boolean;
}

export async function introspectSqlServer(
  conn: SqlServerConnectionConfig
): Promise<FullDatabaseSchema> {
  const pool = new sql.ConnectionPool({
    server: conn.host,
    port: conn.port ?? 1433,
    database: conn.database,
    user: conn.user,
    password: conn.password,
    options: {
      encrypt: conn.encrypt ?? false,
      trustServerCertificate: conn.trustCert ?? true,
    },
    pool: { max: 2, min: 0, idleTimeoutMillis: 10000 },
  });

  await pool.connect();
  try {
    return await readSchemaFromPool(pool);
  } finally {
    await pool.close();
  }
}
