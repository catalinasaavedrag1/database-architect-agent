import { describe, it, expect } from "vitest";
import { analyzeRelationships } from "../../src/services/relationshipAnalyzer.service";
import { sampleSchema } from "../fixtures/sampleSchema";

describe("analyzeRelationships", () => {
  const result = analyzeRelationships(sampleSchema);

  it("counts total foreign-key relationships", () => {
    expect(result.totalRelationships).toBe(1);
  });

  it("flags tables that participate in no relationship", () => {
    expect(result.orphanRiskTables).toEqual(["dbo.OrphanTable"]);
  });

  it("reports no highly-connected tables for a small schema", () => {
    expect(result.highlyConnectedTables).toEqual([]);
  });

  it("counts both ends of a relationship", () => {
    const hub = "dbo.Hub";
    const schema = {
      ...sampleSchema,
      tables: [{ schemaName: "dbo", tableName: "Hub", tableType: "BASE TABLE" }],
      foreignKeys: Array.from({ length: 5 }, (_, i) => ({
        foreignKeyName: `FK_${i}`,
        schemaName: "dbo",
        tableName: "Hub",
        columnName: `Col${i}`,
        referencedSchemaName: "dbo",
        referencedTableName: `Ref${i}`,
        referencedColumnName: "Id",
      })),
    };

    const hubResult = analyzeRelationships(schema);
    const hubEntry = hubResult.highlyConnectedTables.find(
      (t) => t.tableName === hub
    );

    expect(hubEntry?.relationshipCount).toBe(5);
  });
});
