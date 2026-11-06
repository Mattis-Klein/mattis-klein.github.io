import { describe, expect, it } from "vitest";
import {
  flightArc,
  flightLayerOpacity,
  glyphOpacity,
  mixPose,
  moduleT,
  scrubProgress,
  staticOpacity,
  storyBounds,
  storyProgress,
} from "./story";

describe("story progress", () => {
  it("is zero at the start, one at the end, and reverses", () => {
    expect(storyProgress(200, 200, 800)).toBe(0);
    expect(storyProgress(800, 200, 800)).toBe(1);
    expect(storyProgress(500, 200, 800)).toBeCloseTo(0.5);
    expect(storyProgress(350, 200, 800)).toBeGreaterThan(storyProgress(340, 200, 800));
    expect(storyProgress(0, 200, 800)).toBe(0);
    expect(storyProgress(900, 200, 800)).toBe(1);
  });

  it("keeps a short, finite travel even when the grid is near the top", () => {
    const bounds = storyBounds(100, 800);
    expect(bounds.end - bounds.start).toBeGreaterThanOrEqual(160);
    expect(bounds.start).toBeGreaterThanOrEqual(0);
  });

  it("maps a section crossing the viewport from hidden to settled", () => {
    expect(scrubProgress(900, 800)).toBe(0);
    expect(scrubProgress(200, 800)).toBe(1);
    const mid = scrubProgress(500, 800);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe("module flight", () => {
  it("staggers the departure and still reunites at both ends", () => {
    expect(moduleT(0, 0)).toBe(0);
    expect(moduleT(0, 4)).toBe(0);
    expect(moduleT(1, 0)).toBe(1);
    expect(moduleT(1, 4)).toBe(1);
    expect(moduleT(0.25, 0)).toBeGreaterThan(moduleT(0.25, 4));
  });

  it("lifts midway and returns on the way back", () => {
    expect(flightArc(0, 40)).toBeCloseTo(0);
    expect(flightArc(1, 40)).toBeCloseTo(0);
    expect(flightArc(0.5, 40)).toBeCloseTo(-40);
    expect(flightArc(0.25, 40)).toBeCloseTo(flightArc(0.75, 40));
  });

  it("mixes poses in screen space", () => {
    expect(mixPose({ x: 0, y: 10, s: 1 }, { x: 100, y: 50, s: 0.5 }, 0.5)).toEqual({
      x: 50,
      y: 30,
      s: 0.75,
    });
  });

  it("fades the tray out and the category marks back in", () => {
    expect(staticOpacity(0)).toBe(1);
    expect(staticOpacity(1)).toBe(0);
    expect(flightLayerOpacity(0)).toBe(0);
    expect(flightLayerOpacity(0.5)).toBeGreaterThan(0.8);
    expect(flightLayerOpacity(1)).toBe(0);
    expect(glyphOpacity(0)).toBe(1);
    expect(glyphOpacity(0.45)).toBe(1);
    expect(glyphOpacity(1)).toBe(1);
  });
});
