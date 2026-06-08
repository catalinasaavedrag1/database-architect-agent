import { env } from "../config/env";
import { getDbConnection } from "./connection";
import { getPostgresPool } from "./postgresConnection";
import { metadataQueries } from "./metadataQueries";
import { postgresMetadataQueries } from "./postgresMetadataQueries";
import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabaseIndex,
  DatabasePrimaryKey,
  DatabaseTable,
} from "../tools/readSchema.tool";

/**
 * Engine-aware metadata reader. Both branches return rows in the same camelCase
 * shape, so every downstream tool/analyzer is engine-agnostic. The engine is
 * chosen by `DB_ENGINE` (see `env.database.engine`), defaulting to SQL Server.
 */
async function runMetadataQuery<T>(
  sqlServerQuery: string,
  postgresQuery: string
): Promise<T[]> {
  if (env.database.engine === "postgres") {
    const pool = getPostgresPool();
    const result = await pool.query(postgresQuery);
    return result.rows as T[];
  }

  const pool = await getDbConnection();
  const result = await pool.request().query<T>(sqlServerQuery);
  return result.recordset;
}

export const readTablesMetadata = () =>
  runMetadataQuery<DatabaseTable>(
    metadataQueries.getTables,
    postgresMetadataQueries.getTables
  );

export const readColumnsMetadata = () =>
  runMetadataQuery<DatabaseColumn>(
    metadataQueries.getColumns,
    postgresMetadataQueries.getColumns
  );

export const readPrimaryKeysMetadata = () =>
  runMetadataQuery<DatabasePrimaryKey>(
    metadataQueries.getPrimaryKeys,
    postgresMetadataQueries.getPrimaryKeys
  );

export const readForeignKeysMetadata = () =>
  runMetadataQuery<DatabaseForeignKey>(
    metadataQueries.getForeignKeys,
    postgresMetadataQueries.getForeignKeys
  );

export const readIndexesMetadata = () =>
  runMetadataQuery<DatabaseIndex>(
    metadataQueries.getIndexes,
    postgresMetadataQueries.getIndexes
  );
