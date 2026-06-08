import { readTablesMetadata } from "../database/metadataReader";
import type { DatabaseTable } from "./readSchema.tool";

export interface ReadTablesInput {
  schemaName?: string;
}

export async function readTablesTool(
  input: ReadTablesInput = {}
): Promise<DatabaseTable[]> {
  const tables = await readTablesMetadata();

  if (!input.schemaName) {
    return tables;
  }

  return tables.filter(
    (table) =>
      table.schemaName.toLowerCase() === input.schemaName!.toLowerCase()
  );
}
