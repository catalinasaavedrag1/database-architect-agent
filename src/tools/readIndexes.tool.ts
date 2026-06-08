import { readIndexesMetadata } from "../database/metadataReader";
import type { DatabaseIndex } from "./readSchema.tool";

export interface ReadIndexesInput {
  schemaName?: string;
  tableName?: string;
}

export async function readIndexesTool(
  input: ReadIndexesInput = {}
): Promise<DatabaseIndex[]> {
  let indexes: DatabaseIndex[] = [...(await readIndexesMetadata())];

  if (input.schemaName) {
    indexes = indexes.filter(
      (index) =>
        index.schemaName.toLowerCase() === input.schemaName!.toLowerCase()
    );
  }

  if (input.tableName) {
    indexes = indexes.filter(
      (index) =>
        index.tableName.toLowerCase() === input.tableName!.toLowerCase()
    );
  }

  return indexes;
}
