import { describe, it, expect } from "vitest";
import { analyzeIndexes } from "../../src/services/indexAnalyzer.service";
import { sampleSchema } from "../fixtures/sampleSchema";

describe("analyzeIndexes", () => {
  const result = analyzeIndexes(sampleSchema);

  it("lists tables that have at least one index", () => {
    expect(result.indexedTables.sort()).toEqual(["dbo.Customers", "dbo.Orders"]);
  });

  it("detects tables without any index", () => {
    expect(result.tablesWithoutIndexes).toEqual(["dbo.OrphanTable"]);
  });

  it("reports no duplicates when every index name is unique per table", () => {
    expect(result.duplicatedIndexNames).toEqual([]);
  });

  it("detects a repeated index entry on the same table", () => {
    const schema = {
      ...sampleSchema,
      indexes: [
        ...sampleSchema.indexes,
        { ...sampleSchema.indexes[0] }, // duplicate of IX_Customers_Name
      ],
    };

    const dup = analyzeIndexes(schema);
    expect(dup.duplicatedIndexNames).toContain("dbo.Customers.IX_Customers_Name");
  });
});
