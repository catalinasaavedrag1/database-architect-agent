import sql from 'mssql';
import type { DatabaseClient, QueryParams, QueryResult } from '../types/database.types';

export class SqlServerClient implements DatabaseClient {
  readonly engine = 'sqlserver' as const;
  private pool?: sql.ConnectionPool;

  constructor(private readonly connectionString: string) {}

  async query<T = Record<string, unknown>>(statement: string, params?: QueryParams): Promise<QueryResult<T>> {
    const pool = await this.getPool();
    const request = pool.request();

    if (params && !Array.isArray(params)) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value as sql.ISqlTypeFactoryWithNoParams);
      }
    }

    const result = await request.query(statement);

    return {
      rows: (result.recordset ?? []) as T[],
      rowCount: result.rowsAffected?.[0] ?? result.recordset?.length ?? 0,
    };
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = undefined;
    }
  }

  private async getPool() {
    if (!this.pool) {
      this.pool = await new sql.ConnectionPool(this.connectionString).connect();
    }

    return this.pool;
  }
}

