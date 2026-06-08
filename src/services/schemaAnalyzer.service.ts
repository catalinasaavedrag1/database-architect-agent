import { readColumnsTool } from '../tools/readColumns.tool';
import { readIndexesTool } from '../tools/readIndexes.tool';
import { readRelationshipsTool } from '../tools/readRelationships.tool';
import { readSchemaTool, FullDatabaseSchema } from '../tools/readSchema.tool';
import { readTablesTool } from '../tools/readTables.tool';

export class SchemaAnalyzerService {
  async readSchema(schema = 'public') {
    const snapshot = await readSchemaTool();
    return { schema, ...snapshot };
  }

  async readTables(schema = 'public') {
    return readTablesTool({ schemaName: schema });
  }

  async readColumns(schema = 'public', tableName?: string) {
    return readColumnsTool({ schemaName: schema, tableName });
  }

  async readRelationships(schema = 'public', tableName?: string) {
    return readRelationshipsTool({ schemaName: schema, tableName });
  }

  async readIndexes(schema = 'public', tableName?: string) {
    return readIndexesTool({ schemaName: schema, tableName });
  }
}

export const schemaAnalyzerService = new SchemaAnalyzerService();

export interface SchemaAnalysisResult {
  totalTables: number;
  totalColumns: number;
  tablesWithoutPrimaryKey: string[];
  tablesWithoutForeignKeys: string[];
  nullableColumns: string[];
}

export function analyzeSchema(schema: FullDatabaseSchema): SchemaAnalysisResult {
  const tablesWithoutPrimaryKey: string[] = [];
  const tablesWithoutForeignKeys: string[] = [];
  const nullableColumns: string[] = [];

  for (const table of schema.tables) {
    const tableKey = `${table.schemaName}.${table.tableName}`;

    const hasPrimaryKey = schema.primaryKeys.some(
      (pk) =>
        pk.schemaName === table.schemaName && pk.tableName === table.tableName
    );

    const hasForeignKey = schema.foreignKeys.some(
      (fk) =>
        fk.schemaName === table.schemaName && fk.tableName === table.tableName
    );

    if (!hasPrimaryKey) {
      tablesWithoutPrimaryKey.push(tableKey);
    }

    if (!hasForeignKey) {
      tablesWithoutForeignKeys.push(tableKey);
    }
  }

  for (const column of schema.columns) {
    if (column.isNullable === "YES") {
      nullableColumns.push(
        `${column.schemaName}.${column.tableName}.${column.columnName}`
      );
    }
  }

  return {
    totalTables: schema.tables.length,
    totalColumns: schema.columns.length,
    tablesWithoutPrimaryKey,
    tablesWithoutForeignKeys,
    nullableColumns,
  };
}
