import type { ConnectionPool } from "mssql";
import { getDbConnection } from "../database/connection";
import { metadataQueries } from "../database/metadataQueries";

export interface DatabaseTable {
  schemaName: string;
  tableName: string;
  tableType: string;
}

export interface DatabaseColumn {
  schemaName: string;
  tableName: string;
  columnName: string;
  dataType: string;
  maxLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  isNullable: string;
  defaultValue: string | null;
  ordinalPosition: number;
}

export interface DatabasePrimaryKey {
  schemaName: string;
  tableName: string;
  columnName: string;
  constraintName: string;
}

export interface DatabaseForeignKey {
  foreignKeyName: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  referencedSchemaName: string;
  referencedTableName: string;
  referencedColumnName: string;
}

export interface DatabaseIndex {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexType: string;
  isUnique: boolean;
  isPrimaryKey: boolean;
  columnName: string;
  keyOrdinal: number;
  isIncludedColumn: boolean;
}

export interface FullDatabaseSchema {
  tables: DatabaseTable[];
  columns: DatabaseColumn[];
  primaryKeys: DatabasePrimaryKey[];
  foreignKeys: DatabaseForeignKey[];
  indexes: DatabaseIndex[];
}

export async function readSchemaTool(): Promise<FullDatabaseSchema> {
  return readSchemaFromPool(await getDbConnection());
}

/** Lee el esquema de SQL Server usando un pool de conexión arbitrario. */
export async function readSchemaFromPool(
  pool: ConnectionPool
): Promise<FullDatabaseSchema> {
  const [
    tablesResult,
    columnsResult,
    primaryKeysResult,
    foreignKeysResult,
    indexesResult,
  ] = await Promise.all([
    pool.request().query<DatabaseTable>(metadataQueries.getTables),
    pool.request().query<DatabaseColumn>(metadataQueries.getColumns),
    pool.request().query<DatabasePrimaryKey>(metadataQueries.getPrimaryKeys),
    pool.request().query<DatabaseForeignKey>(metadataQueries.getForeignKeys),
    pool.request().query<DatabaseIndex>(metadataQueries.getIndexes),
  ]);

  return {
    tables: tablesResult.recordset,
    columns: columnsResult.recordset,
    primaryKeys: primaryKeysResult.recordset,
    foreignKeys: foreignKeysResult.recordset,
    indexes: indexesResult.recordset,
  };
}
