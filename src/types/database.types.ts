export type DatabaseEngine = 'postgres' | 'sqlserver';
export type QueryParams = Record<string, unknown> | unknown[];

export interface DatabaseConfig {
  engine: DatabaseEngine;
  connectionString?: string;
  ssl?: boolean;
  readOnly: boolean;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseClient {
  engine: DatabaseEngine;
  query<T = Record<string, unknown>>(statement: string, params?: QueryParams): Promise<QueryResult<T>>;
  close(): Promise<void>;
}

export interface TableMetadata {
  schema_name: string;
  table_name: string;
  table_type: string;
}

export interface ColumnMetadata {
  schema_name: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default?: string | null;
  ordinal_position?: number;
}

export interface RelationshipMetadata {
  constraint_name: string;
  schema_name: string;
  table_name: string;
  column_name: string;
  referenced_table_name: string;
  referenced_column_name: string;
}

export interface IndexMetadata {
  schema_name: string;
  table_name: string;
  index_name: string;
  is_unique?: boolean;
  index_type?: string;
  columns?: string | null;
  definition?: string;
}

