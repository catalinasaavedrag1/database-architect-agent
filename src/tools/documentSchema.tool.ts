import { readSchemaTool } from "./readSchema.tool";

export async function documentSchemaTool(): Promise<string> {
  const schema = await readSchemaTool();
  const lines: string[] = [];

  lines.push("# Database Schema Documentation");
  lines.push("");

  for (const table of schema.tables) {
    lines.push(`## ${table.schemaName}.${table.tableName}`);
    lines.push("");

    const columns = schema.columns.filter(
      (column) =>
        column.schemaName === table.schemaName &&
        column.tableName === table.tableName
    );

    lines.push("| Column | Type | Nullable | Default |");
    lines.push("|---|---|---|---|");

    for (const column of columns) {
      lines.push(
        `| ${column.columnName} | ${column.dataType} | ${column.isNullable} | ${column.defaultValue ?? ""} |`
      );
    }

    const primaryKeys = schema.primaryKeys.filter(
      (pk) =>
        pk.schemaName === table.schemaName &&
        pk.tableName === table.tableName
    );

    if (primaryKeys.length > 0) {
      lines.push("");
      lines.push("**Primary Keys:**");

      for (const pk of primaryKeys) {
        lines.push(`- ${pk.columnName}`);
      }
    }

    const foreignKeys = schema.foreignKeys.filter(
      (fk) =>
        fk.schemaName === table.schemaName &&
        fk.tableName === table.tableName
    );

    if (foreignKeys.length > 0) {
      lines.push("");
      lines.push("**Foreign Keys:**");

      for (const fk of foreignKeys) {
        lines.push(
          `- ${fk.columnName} -> ${fk.referencedSchemaName}.${fk.referencedTableName}.${fk.referencedColumnName}`
        );
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}
