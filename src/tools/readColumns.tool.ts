import { readColumnsMetadata } from "../database/metadataReader";
import type { DatabaseColumn } from "./readSchema.tool";

export interface ReadColumnsInput {
  schemaName?: string;
  tableName?: string;
}

export async function readColumnsTool(
  input: ReadColumnsInput = {}
): Promise<DatabaseColumn[]> {
  let columns: DatabaseColumn[] = [...(await readColumnsMetadata())];

  if (input.schemaName) {
    columns = columns.filter(
      (column) =>
        column.schemaName.toLowerCase() === input.schemaName!.toLowerCase()
    );
  }

  if (input.tableName) {
    columns = columns.filter(
      (column) =>
        column.tableName.toLowerCase() === input.tableName!.toLowerCase()
    );
  }

  return columns;
}
