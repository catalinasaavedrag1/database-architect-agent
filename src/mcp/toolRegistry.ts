import { z } from "zod";
import { ToolDefinition } from "../types/tool.types";
import { readSchemaTool } from "../tools/readSchema.tool";
import { readTablesTool } from "../tools/readTables.tool";
import { readColumnsTool } from "../tools/readColumns.tool";
import { readRelationshipsTool } from "../tools/readRelationships.tool";
import { readIndexesTool } from "../tools/readIndexes.tool";
import { validateSqlTool } from "../tools/validateSql.tool";
import { explainQueryTool } from "../tools/explainQuery.tool";
import { documentSchemaTool } from "../tools/documentSchema.tool";
import {
  EmptyInputSchema,
  ReadTablesInputSchema,
  ReadColumnsInputSchema,
  ReadRelationshipsInputSchema,
  ReadIndexesInputSchema,
  ValidateSqlInputSchema,
  ExplainQueryInputSchema,
} from "../schemas/toolInput.schemas";

// `ToolDefinition` already declares an optional JSON-shaped `inputSchema`; the
// registry replaces it with a runtime Zod validator, so we omit and redeclare.
export interface RegisteredTool extends Omit<ToolDefinition, "inputSchema"> {
  inputSchema: z.ZodTypeAny;
}

export const registeredTools: RegisteredTool[] = [
  {
    name: "read_schema",
    description: "Reads full database schema.",
    inputSchema: EmptyInputSchema,
    execute: () => readSchemaTool(),
  },
  {
    name: "read_tables",
    description: "Reads tables.",
    inputSchema: ReadTablesInputSchema,
    execute: (input) => readTablesTool(input as { schemaName?: string }),
  },
  {
    name: "read_columns",
    description: "Reads columns.",
    inputSchema: ReadColumnsInputSchema,
    execute: (input) =>
      readColumnsTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: "read_relationships",
    description: "Reads foreign key relationships.",
    inputSchema: ReadRelationshipsInputSchema,
    execute: (input) =>
      readRelationshipsTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: "read_indexes",
    description: "Reads indexes.",
    inputSchema: ReadIndexesInputSchema,
    execute: (input) =>
      readIndexesTool(input as { schemaName?: string; tableName?: string }),
  },
  {
    name: "validate_sql",
    description: "Validates SQL safety.",
    inputSchema: ValidateSqlInputSchema,
    execute: (input) => validateSqlTool(input as { query: string }),
  },
  {
    name: "explain_query",
    description: "Explains read-only SQL query.",
    inputSchema: ExplainQueryInputSchema,
    execute: (input) => explainQueryTool(input as { query: string }),
  },
  {
    name: "document_schema",
    description: "Generates schema documentation.",
    inputSchema: EmptyInputSchema,
    execute: () => documentSchemaTool(),
  },
];

export function getRegisteredTool(name: string): RegisteredTool | undefined {
  return registeredTools.find((tool) => tool.name === name);
}
