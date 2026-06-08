import { getDbConnection } from "../database/connection";
import { metadataQueries } from "../database/metadataQueries";
import { DatabaseIndex } from "./readSchema.tool";

export interface ReadIndexesInput {
  schemaName?: string;
  tableName?: string;
}

export async function readIndexesTool(
  input: ReadIndexesInput = {}
): Promise<DatabaseIndex[]> {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .query<DatabaseIndex>(metadataQueries.getIndexes);
  let indexes: DatabaseIndex[] = [...result.recordset];

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
