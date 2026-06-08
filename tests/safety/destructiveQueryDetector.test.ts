import { describe, it, expect } from "vitest";
import { detectDestructiveQuery } from "../../src/safety/destructiveQueryDetector";
import { approvalRequiredForSql } from "../../src/safety/approvalRequired";

describe("detectDestructiveQuery", () => {
  it("flags a destructive statement with reasons", () => {
    const result = detectDestructiveQuery("DROP TABLE dbo.Customers");

    expect(result.destructive).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("treats a plain SELECT as non-destructive", () => {
    expect(detectDestructiveQuery("SELECT * FROM dbo.Customers").destructive).toBe(
      false
    );
  });

  it("ignores destructive keywords inside line comments", () => {
    const result = detectDestructiveQuery("SELECT 1 -- DROP TABLE dbo.Customers");

    expect(result.destructive).toBe(false);
  });

  it("ignores destructive keywords inside block comments", () => {
    const result = detectDestructiveQuery("SELECT 1 /* DELETE FROM x */");

    expect(result.destructive).toBe(false);
  });
});

describe("approvalRequiredForSql", () => {
  it("requires approval for destructive SQL", () => {
    expect(approvalRequiredForSql("UPDATE dbo.Orders SET total = 0").required).toBe(
      true
    );
  });

  it("does not require approval for read-only SQL", () => {
    expect(approvalRequiredForSql("SELECT * FROM dbo.Orders").required).toBe(false);
  });
});
