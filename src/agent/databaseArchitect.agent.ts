import { DATABASE_ARCHITECT_SYSTEM_PROMPT } from "./systemPrompt";
import { readSchemaTool, FullDatabaseSchema } from "../tools/readSchema.tool";

export interface DatabaseArchitectRequest {
  userQuestion: string;
  includeSchema?: boolean;
}

export interface DatabaseArchitectResponse {
  systemPrompt: string;
  userQuestion: string;
  schema?: FullDatabaseSchema;
  agentInstruction: string;
}

export async function databaseArchitectAgent(
  request: DatabaseArchitectRequest
): Promise<DatabaseArchitectResponse> {
  const { userQuestion, includeSchema = true } = request;

  if (!userQuestion || userQuestion.trim().length === 0) {
    throw new Error("User question is required");
  }

  let schema: FullDatabaseSchema | undefined;

  if (includeSchema) {
    schema = await readSchemaTool();
  }

  const agentInstruction = buildAgentInstruction(userQuestion, schema);

  return {
    systemPrompt: DATABASE_ARCHITECT_SYSTEM_PROMPT,
    userQuestion,
    schema,
    agentInstruction,
  };
}

function buildAgentInstruction(
  userQuestion: string,
  schema?: FullDatabaseSchema
): string {
  const schemaText = schema ? summarizeSchema(schema) : "No schema provided.";

  return `
${DATABASE_ARCHITECT_SYSTEM_PROMPT}
# User Question
${userQuestion}
# Database Schema Context
${schemaText}
# Task
Analyze the user's request using the provided database schema.
You must:
1. Avoid inventing tables or columns.
2. Use only the schema provided.
3. Identify risks.
4. Suggest improvements.
5. Mark destructive SQL as requiring human approval.
6. Prefer read-only analysis.
7. Provide SQL only when useful.
Return the answer in the required format:
## Diagnóstico
## Riesgos
## Recomendación
## Modelo propuesto
## SQL sugerido
## Validaciones necesarias
## Observaciones
`;
}

function summarizeSchema(schema: FullDatabaseSchema): string {
  const tableMap = new Map<string, string[]>();

  for (const column of schema.columns) {
    const tableKey = `${column.schemaName}.${column.tableName}`;

    if (!tableMap.has(tableKey)) {
      tableMap.set(tableKey, []);
    }

    tableMap.get(tableKey)!.push(
      `${column.columnName} ${column.dataType}${column.isNullable === "NO" ? " NOT NULL" : ""}`
    );
  }

  const tablesSummary = Array.from(tableMap.entries())
    .map(([tableName, columns]) => {
      return `Table: ${tableName}\nColumns:\n${columns.map((c) => `- ${c}`).join("\n")}`;
    })
    .join("\n\n");

  const primaryKeysSummary = schema.primaryKeys
    .map(
      (pk) =>
        `- ${pk.schemaName}.${pk.tableName}.${pk.columnName} (${pk.constraintName})`
    )
    .join("\n");

  const foreignKeysSummary = schema.foreignKeys
    .map(
      (fk) =>
        `- ${fk.schemaName}.${fk.tableName}.${fk.columnName} -> ${fk.referencedSchemaName}.${fk.referencedTableName}.${fk.referencedColumnName} (${fk.foreignKeyName})`
    )
    .join("\n");

  const indexesSummary = schema.indexes
    .map(
      (idx) =>
        `- ${idx.schemaName}.${idx.tableName}.${idx.indexName} | ${idx.columnName} | ${idx.indexType} | unique=${idx.isUnique}`
    )
    .join("\n");

  return `
## Tables and Columns
${tablesSummary}
## Primary Keys
${primaryKeysSummary || "No primary keys found."}
## Foreign Keys
${foreignKeysSummary || "No foreign keys found."}
## Indexes
${indexesSummary || "No indexes found."}
`;
}

export class DatabaseArchitectAgent {
  async analyze(request: DatabaseArchitectRequest): Promise<DatabaseArchitectResponse> {
    return databaseArchitectAgent(request);
  }
}
