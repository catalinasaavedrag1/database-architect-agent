import { getDbConnection } from "../database/connection";
import { metadataQueries } from "../database/metadataQueries";
import { DatabaseTable } from "./readSchema.tool";

export interface ReadTablesInput {
  schemaName?: string;
}

export async function readTablesTool(
  input: ReadTablesInput = {}
): Promise<DatabaseTable[]> {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .query<DatabaseTable>(metadataQueries.getTables);

  if (!input.schemaName) {
    return result.recordset;
  }

  return result.recordset.filter(
    (table) =>
      table.schemaName.toLowerCase() === input.schemaName!.toLowerCase()
  );
}
