import { describe, expect, it } from "vitest";
import { categoryFromKey, railProgress } from "./categoryStage";

describe("category keyboard selection", () => {
  it("moves through the range and wraps", () => {
    expect(categoryFromKey("surveillance", "ArrowDown")).toBe("networking");
    expect(categoryFromKey("safety", "ArrowRight")).toBe("surveillance");
    expect(categoryFromKey("networking", "ArrowUp")).toBe("surveillance");
    expect(categoryFromKey("surveillance", "ArrowLeft")).toBe("safety");
  });

  it("jumps to the ends", () => {
    expect(categoryFromKey("access", "Home")).toBe("surveillance");
    expect(categoryFromKey("smart-home", "End")).toBe("safety");
    expect(categoryFromKey("access", "Enter")).toBeNull();
  });
});

describe("contact rail", () => {
  it("grows down the page and reverses", () => {
    expect(railProgress(100, 200, 800)).toBe(0);
    expect(railProgress(500, 200, 800)).toBeCloseTo(0.5);
    expect(railProgress(800, 200, 800)).toBe(1);
    expect(railProgress(420, 200, 800)).toBeGreaterThan(railProgress(400, 200, 800));
  });
});
