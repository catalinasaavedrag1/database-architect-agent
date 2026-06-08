import { Pool } from 'pg';
import type { DatabaseClient, QueryParams, QueryResult } from '../types/database.types';

export class PostgresClient implements DatabaseClient {
  readonly engine = 'postgres' as const;
  private readonly pool: Pool;

  constructor(connectionString: string, ssl = false) {
    this.pool = new Pool({
      connectionString,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
  }

  async query<T = Record<string, unknown>>(statement: string, params?: QueryParams): Promise<QueryResult<T>> {
    const normalized = this.normalizeParams(statement, params);
    const result = await this.pool.query(normalized.statement, normalized.values);

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount ?? result.rows.length,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private normalizeParams(statement: string, params?: QueryParams) {
    if (!params) {
      return { statement, values: [] };
    }

    if (Array.isArray(params)) {
      return { statement, values: params };
    }

    const values: unknown[] = [];
    const normalizedStatement = statement.replace(/@([a-zA-Z0-9_]+)/g, (_match, key: string) => {
      values.push(params[key]);
      return `$${values.length}`;
    });

    return { statement: normalizedStatement, values };
  }
}

