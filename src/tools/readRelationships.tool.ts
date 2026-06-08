import { getDbConnection } from "../database/connection";
import { metadataQueries } from "../database/metadataQueries";
import { DatabaseForeignKey } from "./readSchema.tool";

export interface ReadRelationshipsInput {
  schemaName?: string;
  tableName?: string;
}

export async function readRelationshipsTool(
  input: ReadRelationshipsInput = {}
): Promise<DatabaseForeignKey[]> {
  const pool = await getDbConnection();
  const result = await pool
    .request()
    .query<DatabaseForeignKey>(metadataQueries.getForeignKeys);
  let relationships: DatabaseForeignKey[] = [...result.recordset];

  if (input.schemaName) {
    relationships = relationships.filter(
      (relation) =>
        relation.schemaName.toLowerCase() === input.schemaName!.toLowerCase()
    );
  }

  if (input.tableName) {
    relationships = relationships.filter(
      (relation) =>
        relation.tableName.toLowerCase() === input.tableName!.toLowerCase()
    );
  }

  return relationships;
}
