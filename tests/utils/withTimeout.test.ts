import { describe, it, expect } from "vitest";
import { withTimeout } from "../../src/utils/withTimeout";

describe("withTimeout", () => {
  it("resolves with the value when the promise settles in time", async () => {
    await expect(withTimeout(Promise.resolve(42), 1000)).resolves.toBe(42);
  });

  it("rejects with a labelled error when the promise is too slow", async () => {
    const never = new Promise<number>(() => {});

    await expect(withTimeout(never, 10, "slow-op")).rejects.toThrow(
      /slow-op timed out after 10ms/
    );
  });

  it("propagates the original rejection", async () => {
    await expect(
      withTimeout(Promise.reject(new Error("boom")), 1000)
    ).rejects.toThrow("boom");
  });
});
