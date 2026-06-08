import { documentSchemaTool } from '../tools/documentSchema.tool';
import { FullDatabaseSchema } from '../tools/readSchema.tool';

export class DocumentationService {
  async documentSchema() {
    return documentSchemaTool();
  }
}

export const documentationService = new DocumentationService();

export function generateSchemaSummary(schema: FullDatabaseSchema): string {
  const lines: string[] = [];

  lines.push("# Database Summary");
  lines.push("");
  lines.push(`Total tables: ${schema.tables.length}`);
  lines.push(`Total columns: ${schema.columns.length}`);
  lines.push(`Total primary keys: ${schema.primaryKeys.length}`);
  lines.push(`Total foreign keys: ${schema.foreignKeys.length}`);
  lines.push(`Total indexes: ${schema.indexes.length}`);
  lines.push("");
  lines.push("## Tables");
  lines.push("");

  for (const table of schema.tables) {
    lines.push(`- ${table.schemaName}.${table.tableName}`);
  }

  return lines.join("\n");
}
