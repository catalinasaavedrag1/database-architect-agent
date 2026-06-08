import { describe, it, expect } from "vitest";
import {
  validateReadOnlySql,
  assertReadOnlySql,
} from "../../src/safety/sqlGuard";

describe("validateReadOnlySql", () => {
  it("allows a plain SELECT statement", () => {
    const result = validateReadOnlySql("SELECT * FROM dbo.Customers");

    expect(result.isAllowed).toBe(true);
    expect(result.riskLevel).toBe("SAFE");
    expect(result.requiresHumanApproval).toBe(false);
  });

  it("allows a WITH (CTE) read query", () => {
    const result = validateReadOnlySql(
      "WITH cte AS (SELECT 1 AS x) SELECT x FROM cte"
    );

    expect(result.isAllowed).toBe(true);
    expect(result.riskLevel).toBe("SAFE");
  });

  it("does not false-positive on identifiers that contain a keyword substring", () => {
    const result = validateReadOnlySql("SELECT created_at FROM dbo.Logs");

    expect(result.isAllowed).toBe(true);
  });

  it("blocks a DELETE statement and requires approval", () => {
    const result = validateReadOnlySql("DELETE FROM dbo.Customers");

    expect(result.isAllowed).toBe(false);
    expect(result.riskLevel).toBe("DANGEROUS");
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.reasons.join(" ")).toMatch(/DELETE/i);
  });

  it("blocks a DROP statement", () => {
    expect(validateReadOnlySql("DROP TABLE dbo.Customers").isAllowed).toBe(false);
  });

  it("blocks stacked statements that smuggle a destructive command", () => {
    const result = validateReadOnlySql(
      "SELECT * FROM dbo.Customers; DROP TABLE dbo.Orders"
    );

    expect(result.isAllowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("rejects an empty query", () => {
    const result = validateReadOnlySql("   ");

    expect(result.isAllowed).toBe(false);
    expect(result.reasons).toContain("Query is empty");
  });
});

describe("assertReadOnlySql", () => {
  it("does not throw for a read-only query", () => {
    expect(() => assertReadOnlySql("SELECT 1")).not.toThrow();
  });

  it("throws for a destructive query", () => {
    expect(() => assertReadOnlySql("DELETE FROM dbo.Customers")).toThrow(
      /SqlGuard/
    );
  });
});
