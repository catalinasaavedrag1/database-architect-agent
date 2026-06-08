import { describe, it, expect } from "vitest";
import { evaluateToolPermission } from "../../src/safety/toolPermission";

describe("evaluateToolPermission", () => {
  it("allows read-only allowlisted tools without approval", () => {
    const decision = evaluateToolPermission("read_schema");

    expect(decision.allowed).toBe(true);
    expect(decision.requiresApproval).toBe(false);
  });

  it("blocks an approval-required tool when not approved", () => {
    const decision = evaluateToolPermission("generate_migration");

    expect(decision.allowed).toBe(false);
    expect(decision.requiresApproval).toBe(true);
    expect(decision.reason).toMatch(/approval/i);
  });

  it("allows an approval-required tool once explicitly approved", () => {
    const decision = evaluateToolPermission("generate_migration", true);

    expect(decision.allowed).toBe(true);
    expect(decision.requiresApproval).toBe(true);
  });

  it("blocks an unknown (non-allowlisted) tool by default", () => {
    const decision = evaluateToolPermission("drop_everything");

    expect(decision.allowed).toBe(false);
    expect(decision.requiresApproval).toBe(true);
  });
});
