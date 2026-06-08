import { readForeignKeysMetadata } from "../database/metadataReader";
import type { DatabaseForeignKey } from "./readSchema.tool";

export interface ReadRelationshipsInput {
  schemaName?: string;
  tableName?: string;
}

export async function readRelationshipsTool(
  input: ReadRelationshipsInput = {}
): Promise<DatabaseForeignKey[]> {
  let relationships: DatabaseForeignKey[] = [...(await readForeignKeysMetadata())];

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
