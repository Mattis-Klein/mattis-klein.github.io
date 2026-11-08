import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../content";
import { assemblyPose, bayCamera, copyOpacity, storyPhase } from "./bay";

describe("supply bay", () => {
  it("moves from one assembly to stations and then to two routes", () => {
    expect(storyPhase(0)).toBe("assembly");
    expect(storyPhase(0.3)).toBe("separate");
    expect(storyPhase(0.52)).toBe("stations");
    expect(storyPhase(0.75)).toBe("reroute");
    expect(storyPhase(1)).toBe("routes");
  });

  it("returns the same pose at the same progress", () => {
    expect(assemblyPose(0.33)).toEqual(assemblyPose(0.33));
    expect(bayCamera(0.8)).toEqual(bayCamera(0.8));
  });

  it("actually relocates every module", () => {
    const hero = assemblyPose(0);
    const stations = assemblyPose(0.52);
    const routes = assemblyPose(1);
    for (const id of CATEGORY_IDS) {
      const moved = Math.hypot(stations[id].x - hero[id].x, stations[id].y - hero[id].y, stations[id].z - hero[id].z);
      expect(moved).toBeGreaterThan(0.35);
    }
    expect(routes.surveillance.x).toBeLessThan(routes.networking.x - 1);
    expect(routes.access.x).toBeGreaterThan(routes.safety.x);
    expect(routes.plinthA.x).toBeLessThan(routes.plinthB.x);
  });

  it("passes through different positions instead of jumping", () => {
    const samples = [0.12, 0.2, 0.28, 0.36, 0.44].map((progress) => assemblyPose(progress).surveillance);
    const keys = samples.map((pose) => `${pose.x.toFixed(2)}:${pose.y.toFixed(2)}`);
    expect(new Set(keys).size).toBe(samples.length);
    const hero = assemblyPose(0).surveillance;
    const mid = assemblyPose(0.28).surveillance;
    const stations = assemblyPose(0.55).surveillance;
    expect(mid.y).toBeGreaterThan(hero.y);
    expect(mid.y).toBeGreaterThan(stations.y);
    expect(Math.abs(mid.ry - hero.ry)).toBeGreaterThan(0.2);
  });

  it("keeps the hero copy up and the routes copy for the last beat", () => {
    expect(copyOpacity(0).hero).toBe(1);
    expect(copyOpacity(0).panel).toBe(0);
    expect(copyOpacity(0.5).panel).toBeGreaterThan(0.9);
    let blank = 0;
    for (let progress = 0; progress <= 1; progress += 0.02) {
      const opacity = copyOpacity(progress);
      if (opacity.hero < 0.25 && opacity.panel < 0.25 && opacity.routes < 0.25) blank += 0.02;
    }
    expect(blank).toBeLessThan(0.1);
    expect(copyOpacity(1).routes).toBe(1);
    expect(copyOpacity(1).hero).toBe(0);
  });
});
