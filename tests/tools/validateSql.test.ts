import { describe, it, expect } from "vitest";
import { validateSqlTool } from "../../src/tools/validateSql.tool";

describe("validateSqlTool", () => {
  it("echoes the query and marks read-only SQL as allowed", () => {
    const output = validateSqlTool({ query: "SELECT 1" });

    expect(output.query).toBe("SELECT 1");
    expect(output.isAllowed).toBe(true);
  });

  it("marks destructive SQL as not allowed", () => {
    const output = validateSqlTool({ query: "DROP TABLE dbo.Customers" });

    expect(output.isAllowed).toBe(false);
    expect(output.requiresHumanApproval).toBe(true);
  });
});
