import { describe, it, expect } from "vitest";
import { generateSchemaSummary } from "../../src/services/documentation.service";
import { sampleSchema } from "../fixtures/sampleSchema";

describe("generateSchemaSummary", () => {
  const summary = generateSchemaSummary(sampleSchema);

  it("includes the headline counts", () => {
    expect(summary).toContain("Total tables: 3");
    expect(summary).toContain("Total columns: 5");
    expect(summary).toContain("Total foreign keys: 1");
    expect(summary).toContain("Total indexes: 2");
  });

  it("lists every table fully qualified", () => {
    expect(summary).toContain("- dbo.Customers");
    expect(summary).toContain("- dbo.Orders");
    expect(summary).toContain("- dbo.OrphanTable");
  });
});
