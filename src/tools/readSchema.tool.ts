import {
  readColumnsMetadata,
  readForeignKeysMetadata,
  readIndexesMetadata,
  readPrimaryKeysMetadata,
  readTablesMetadata,
} from "../database/metadataReader";

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
  const [tables, columns, primaryKeys, foreignKeys, indexes] = await Promise.all([
    readTablesMetadata(),
    readColumnsMetadata(),
    readPrimaryKeysMetadata(),
    readForeignKeysMetadata(),
    readIndexesMetadata(),
  ]);

  return {
    tables,
    columns,
    primaryKeys,
    foreignKeys,
    indexes,
  };
}
