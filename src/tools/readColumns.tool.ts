import { getDbConnection } from "../database/connection";
import { metadataQueries } from "../database/metadataQueries";
import { DatabaseColumn } from "./readSchema.tool";

export interface ReadColumnsInput {
  schemaName?: string;
  tableName?: string;
}

export async function readColumnsTool(
  input: ReadColumnsInput = {}
): Promise<DatabaseColumn[]> {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .query<DatabaseColumn>(metadataQueries.getColumns);
  let columns: DatabaseColumn[] = [...result.recordset];

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
