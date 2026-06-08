import { Tool } from "@anthropic-ai/sdk/resources/messages/messages";

export const claudeDatabaseTools: Tool[] = [
  {
    name: "read_schema",
    description: "Reads the full SQL Server database schema.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "read_tables",
    description: "Reads database tables. Optionally filter by schema.",
    input_schema: {
      type: "object",
      properties: {
        schemaName: { type: "string" },
      },
      required: [],
    },
  },
  {
    name: "read_columns",
    description: "Reads database columns. Optionally filter by schema and table.",
    input_schema: {
      type: "object",
      properties: {
        schemaName: { type: "string" },
        tableName: { type: "string" },
      },
      required: [],
    },
  },
  {
    name: "read_relationships",
    description: "Reads foreign key relationships.",
    input_schema: {
      type: "object",
      properties: {
        schemaName: { type: "string" },
        tableName: { type: "string" },
      },
      required: [],
    },
  },
  {
    name: "read_indexes",
    description: "Reads database indexes.",
    input_schema: {
      type: "object",
      properties: {
        schemaName: { type: "string" },
        tableName: { type: "string" },
      },
      required: [],
    },
  },
  {
    name: "validate_sql",
    description: "Validates whether a SQL query is safe and read-only.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "explain_query",
    description: "Returns an estimated SQL Server execution plan for a read-only query.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
];
