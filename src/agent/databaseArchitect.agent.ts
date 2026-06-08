import { DATABASE_ARCHITECT_SYSTEM_PROMPT } from "./systemPrompt";
import { readSchemaTool, FullDatabaseSchema } from "../tools/readSchema.tool";
import { parsePrismaSchema } from "../database/prismaSchemaParser";
import {
  introspectSqlServer,
  type SqlServerConnectionConfig,
} from "../database/introspectSqlServer";
import { claudeConfig, createClaudeClient } from "../config/claude";

export interface DatabaseArchitectRequest {
  userQuestion: string;
  /** Nombre del microservicio bajo revisión (solo para contexto del prompt). */
  serviceName?: string;
  /** Esquema ya introspectado del ms a revisar. Tiene prioridad sobre el resto. */
  schema?: FullDatabaseSchema;
  /** Contenido de un `schema.prisma` del ms a revisar. Se parsea a `FullDatabaseSchema`. */
  prismaSchema?: string;
  /** Conexión read-only a un ms en SQL Server: se introspecta al vuelo. */
  sqlServer?: SqlServerConnectionConfig;
  /** Si no se pasa otra fuente, lee la BD propia del agente. Default: true. */
  includeSchema?: boolean;
}

export interface DatabaseArchitectResponse {
  systemPrompt: string;
  userQuestion: string;
  serviceName?: string;
  schema?: FullDatabaseSchema;
  agentInstruction: string;
  /** Respuesta de Claude. Solo presente cuando se ejecuta `runDatabaseArchitect`. */
  analysis?: string;
}

export async function databaseArchitectAgent(
  request: DatabaseArchitectRequest
): Promise<DatabaseArchitectResponse> {
  const { userQuestion, serviceName, prismaSchema, sqlServer, includeSchema = true } = request;

  if (!userQuestion || userQuestion.trim().length === 0) {
    throw new Error("User question is required");
  }

  // Resolución del esquema a analizar, de mayor a menor prioridad:
  // 1) schema explícito  2) schema.prisma  3) conexión SQL Server del ms
  // 4) BD propia del agente (includeSchema)
  let schema: FullDatabaseSchema | undefined = request.schema;

  if (!schema && prismaSchema && prismaSchema.trim().length > 0) {
    schema = parsePrismaSchema(prismaSchema);
  }

  if (!schema && sqlServer) {
    schema = await introspectSqlServer(sqlServer);
  }

  if (!schema && !prismaSchema && !sqlServer && includeSchema) {
    schema = await readSchemaTool();
  }

  const agentInstruction = buildAgentInstruction(userQuestion, schema, serviceName);

  return {
    systemPrompt: DATABASE_ARCHITECT_SYSTEM_PROMPT,
    userQuestion,
    serviceName,
    schema,
    agentInstruction,
  };
}

function buildAgentInstruction(
  userQuestion: string,
  schema?: FullDatabaseSchema,
  serviceName?: string
): string {
  const schemaText = schema ? summarizeSchema(schema) : "No schema provided.";
  const serviceLine = serviceName ? `\n# Microservicio bajo revisión\n${serviceName}` : "";

  return `${serviceLine}
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

/**
 * Construye el prompt y además lo envía a Claude, devolviendo su análisis en
 * `analysis`. Requiere `CLAUDE_API_KEY` (o `ANTHROPIC_API_KEY`) configurada.
 */
export async function runDatabaseArchitect(
  request: DatabaseArchitectRequest
): Promise<DatabaseArchitectResponse> {
  const built = await databaseArchitectAgent(request);
  const client = createClaudeClient();

  const message = await client.messages.create({
    model: claudeConfig.model,
    max_tokens: claudeConfig.maxTokens,
    system: built.systemPrompt,
    messages: [{ role: "user", content: built.agentInstruction }],
  });

  const analysis = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  return { ...built, analysis };
}

export class DatabaseArchitectAgent {
  /** Construye el prompt sin llamar a Claude (útil para inspección y tests). */
  async build(request: DatabaseArchitectRequest): Promise<DatabaseArchitectResponse> {
    return databaseArchitectAgent(request);
  }

  /** Construye el prompt y lo ejecuta contra Claude. */
  async analyze(request: DatabaseArchitectRequest): Promise<DatabaseArchitectResponse> {
    return runDatabaseArchitect(request);
  }
}
