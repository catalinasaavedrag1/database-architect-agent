import { describe, it, expect } from "vitest";
import { analyzeSchema } from "../../src/services/schemaAnalyzer.service";
import { sampleSchema } from "../fixtures/sampleSchema";

describe("analyzeSchema", () => {
  const result = analyzeSchema(sampleSchema);

  it("counts tables and columns", () => {
    expect(result.totalTables).toBe(3);
    expect(result.totalColumns).toBe(5);
  });

  it("detects tables without a primary key", () => {
    expect(result.tablesWithoutPrimaryKey).toEqual(["dbo.OrphanTable"]);
  });

  it("detects tables without any foreign key", () => {
    expect(result.tablesWithoutForeignKeys).toEqual([
      "dbo.Customers",
      "dbo.OrphanTable",
    ]);
  });

  it("lists nullable columns fully qualified", () => {
    expect(result.nullableColumns).toEqual([
      "dbo.Customers.Name",
      "dbo.OrphanTable.Note",
    ]);
  });
});
