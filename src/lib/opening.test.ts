import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../content";
import { openingClock, openingLight, OPENING_MS, partArrival, seatPoint, shouldPlayOpening } from "./opening";

describe("page-load opening", () => {
  it("plays only for a fresh top-of-page visit", () => {
    expect(shouldPlayOpening({ scrollY: 0, hash: "", reduced: false })).toBe(true);
    expect(shouldPlayOpening({ scrollY: 0, hash: "#top", reduced: false })).toBe(true);
    expect(shouldPlayOpening({ scrollY: 0, hash: "#contact", reduced: false })).toBe(false);
    expect(shouldPlayOpening({ scrollY: 80, hash: "", reduced: false })).toBe(false);
    expect(shouldPlayOpening({ scrollY: 0, hash: "", reduced: true })).toBe(false);
  });

  it("eases across about two seconds and then stays seated", () => {
    expect(openingClock(0)).toBe(0);
    expect(openingClock(OPENING_MS / 2)).toBeGreaterThan(0.4);
    expect(openingClock(OPENING_MS / 2)).toBeLessThan(0.6);
    expect(openingClock(OPENING_MS)).toBe(1);
    expect(openingClock(OPENING_MS + 500)).toBe(1);
  });

  it("staggers the modules and releases every one at the hero seat", () => {
    expect(partArrival(0.2, "surveillance")).toBeGreaterThan(partArrival(0.2, "safety"));
    expect(partArrival(0, "networking")).toBe(0);
    for (const id of CATEGORY_IDS) {
      expect(partArrival(1, id)).toBe(1);
      const seated = seatPoint(1, id, { x: 40, y: 80, scale: 2 }, { x: 10, y: 20 });
      expect(seated.x).toBe(40);
      expect(seated.y).toBe(80);
      expect(seated.scale).toBe(2);
      expect(seated.light).toBe(1);
      const start = seatPoint(0, id, { x: 40, y: 80, scale: 2 }, { x: 10, y: 20 });
      expect(start.scale).toBeLessThan(2);
      expect(Math.abs(start.x - 10)).toBeLessThan(Math.abs(40 - 10));
      expect(start.opacity).toBe(1);
    }
    expect(openingLight(0)).toBe(0);
    expect(openingLight(1)).toBe(1);
  });
});
