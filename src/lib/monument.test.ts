import { describe, expect, it } from "vitest";
import { dividePhase, openingPhase } from "./monument";

describe("monument opening", () => {
  it("holds the type, then travels, then lands on the spread", () => {
    expect(openingPhase(0)).toBe("hero");
    expect(openingPhase(0.11)).toBe("hero");
    expect(openingPhase(0.4)).toBe("travel");
    expect(openingPhase(0.78)).toBe("spread");
    expect(openingPhase(1)).toBe("spread");
  });

  it("reverses", () => {
    expect(openingPhase(0.9)).toBe("spread");
    expect(openingPhase(0.2)).toBe("travel");
    expect(openingPhase(0)).toBe("hero");
  });
});

describe("retail wholesale divide", () => {
  it("opens the plate back into the circle", () => {
    expect(dividePhase(0)).toBe("plate");
    expect(dividePhase(0.4)).toBe("travel");
    expect(dividePhase(1)).toBe("split");
    expect(dividePhase(0.5)).toBe("travel");
  });
});
