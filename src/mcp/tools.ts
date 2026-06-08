import { documentSchemaTool } from '../tools/documentSchema.tool';
import { explainQueryTool } from '../tools/explainQuery.tool';
import { generateMigrationTool } from '../tools/generateMigration.tool';
import { readColumnsTool } from '../tools/readColumns.tool';
import { readIndexesTool } from '../tools/readIndexes.tool';
import { readRelationshipsTool } from '../tools/readRelationships.tool';
import { readSchemaTool } from '../tools/readSchema.tool';
import { readTablesTool } from '../tools/readTables.tool';
import { suggestIndexesTool } from '../tools/suggestIndexes.tool';
import { validateSqlTool } from '../tools/validateSql.tool';
import type { ToolDefinition } from '../types/tool.types';

export const tools: ToolDefinition<Record<string, unknown>, unknown>[] = [
  {
    name: 'read_schema',
    description: 'Read tables, columns, primary keys, foreign keys, and indexes from SQL Server metadata.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => readSchemaTool(),
  },
  {
    name: 'read_tables',
    description: 'Read SQL Server table metadata, optionally filtered by schema.',
    inputSchema: {
      type: 'object',
      properties: {
        schemaName: { type: 'string' },
      },
    },
    execute: (input) => readTablesTool(input as { schemaName?: string }),
  },
  {
    name: 'read_columns',
    description: 'Read SQL Server column metadata, optionally filtered by schema or table.',
    inputSchema: {
      type: 'object',
      properties: {
        schemaName: { type: 'string' },
        tableName: { type: 'string' },
      },
    },
    execute: (input) => readColumnsTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: 'read_relationships',
    description: 'Read SQL Server foreign-key relationships, optionally filtered by schema or table.',
    inputSchema: {
      type: 'object',
      properties: {
        schemaName: { type: 'string' },
        tableName: { type: 'string' },
      },
    },
    execute: (input) => readRelationshipsTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: 'read_indexes',
    description: 'Read SQL Server indexes, optionally filtered by schema or table.',
    inputSchema: {
      type: 'object',
      properties: {
        schemaName: { type: 'string' },
        tableName: { type: 'string' },
      },
    },
    execute: (input) => readIndexesTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: 'explain_query',
    description: 'Return a SQL Server estimated execution plan XML for a read-only query.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
      },
    },
    execute: (input) => explainQueryTool(input as { query: string }),
  },
  {
    name: 'validate_sql',
    description: 'Validate whether a SQL statement is safe for read-only analysis.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
      },
    },
    execute: (input) => validateSqlTool(input as { query: string }),
  },
  suggestIndexesTool,
  generateMigrationTool,
  {
    name: 'document_schema',
    description: 'Generate markdown documentation from the current SQL Server schema.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => documentSchemaTool(),
  },
];
