import { describe, it, expect } from "vitest";
import { safeJsonParse, safeStringify } from "../../src/utils/safeJson";

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns null for invalid JSON instead of throwing", () => {
    expect(safeJsonParse("{not json}")).toBeNull();
  });
});

describe("safeStringify", () => {
  it("stringifies a plain value", () => {
    expect(safeStringify({ a: 1 })).toContain('"a": 1');
  });

  it("does not throw on circular references", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(safeStringify(circular)).toBe("[Unserializable value]");
  });
});
