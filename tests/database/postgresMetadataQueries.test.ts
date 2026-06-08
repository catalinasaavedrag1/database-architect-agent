import { describe, it, expect } from "vitest";
import { postgresMetadataQueries } from "../../src/database/postgresMetadataQueries";

/**
 * These queries can only be executed against a live Postgres instance, but the
 * critical contract is that each one aliases its columns to the exact camelCase
 * keys the downstream shapes expect. A mismatch here silently breaks the
 * analyzers, so we assert the quoted aliases are present.
 */
describe("postgresMetadataQueries", () => {
  it("aliases table columns to the DatabaseTable shape", () => {
    for (const alias of ['"schemaName"', '"tableName"', '"tableType"']) {
      expect(postgresMetadataQueries.getTables).toContain(alias);
    }
  });

  it("aliases column metadata to the DatabaseColumn shape", () => {
    for (const alias of [
      '"schemaName"',
      '"tableName"',
      '"columnName"',
      '"dataType"',
      '"isNullable"',
      '"ordinalPosition"',
    ]) {
      expect(postgresMetadataQueries.getColumns).toContain(alias);
    }
  });

  it("aliases foreign keys to the DatabaseForeignKey shape", () => {
    for (const alias of [
      '"foreignKeyName"',
      '"referencedSchemaName"',
      '"referencedTableName"',
      '"referencedColumnName"',
    ]) {
      expect(postgresMetadataQueries.getForeignKeys).toContain(alias);
    }
  });

  it("aliases indexes to the DatabaseIndex shape", () => {
    for (const alias of [
      '"indexName"',
      '"isUnique"',
      '"isPrimaryKey"',
      '"keyOrdinal"',
    ]) {
      expect(postgresMetadataQueries.getIndexes).toContain(alias);
    }
  });

  it("excludes system schemas", () => {
    for (const query of Object.values(postgresMetadataQueries)) {
      expect(query).toContain("pg_catalog");
    }
  });
});
