import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../content";
import {
  assemblyPose,
  bayCamera,
  copyOpacity,
  fitFigures,
  framedCamera,
  projectPart,
  spriteBounds,
  storyPhase,
  yawFrame,
} from "./bay";

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

  it("shows one crisp sprite at rest and blends only while moving", () => {
    const networking = assemblyPose(0).networking.ry;
    const rest = yawFrame(networking, false);
    expect(rest.mix).toBe(0);
    expect(rest.lo).toBe(rest.hi);
    const moving = yawFrame(networking, true);
    expect(moving.lo).not.toBe(moving.hi);
    expect(moving.mix).toBeGreaterThan(0.12);
    expect(moving.mix).toBeLessThan(0.88);
  });

  it("fills each viewport without clipping the opaque sprites", () => {
    const views = [
      { progress: 0, width: 860, height: 720 },
      { progress: 0, width: 390, height: 440 },
      { progress: 0, width: 320, height: 440 },
      { progress: 0.52, width: 860, height: 720 },
      { progress: 1, width: 860, height: 720 },
      { progress: 1, width: 390, height: 440 },
      { progress: 1, width: 1280, height: 640 },
    ];
    for (const view of views) {
      const pose = assemblyPose(view.progress);
      const camera = bayCamera(view.progress);
      const fitted = fitFigures(
        CATEGORY_IDS.map((id) => ({ id, ...projectPart(pose[id], camera, view.width, view.height) })),
        view.width,
        view.height,
      );
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      for (const point of fitted) {
        const box = spriteBounds(point);
        left = Math.min(left, box.left);
        top = Math.min(top, box.top);
        right = Math.max(right, box.right);
        bottom = Math.max(bottom, box.bottom);
        expect(box.left).toBeGreaterThanOrEqual(22);
        expect(box.top).toBeGreaterThanOrEqual(22);
        expect(box.right).toBeLessThanOrEqual(view.width - 22);
        expect(box.bottom).toBeLessThanOrEqual(view.height - 22);
      }
      const usedW = (right - left) / (view.width - 32);
      const usedH = (bottom - top) / (view.height - 32);
      expect(Math.max(usedW, usedH)).toBeGreaterThan(0.78);
      if (view.progress === 0) {
        let widest = 0;
        for (const point of fitted) {
          const box = spriteBounds(point);
          widest = Math.max(widest, box.right - box.left);
        }
        expect(widest / view.width).toBeGreaterThan(0.42);
      }
    }
  });

  it("frames the hardware camera inside the view at hero, stations, and routes", () => {
    for (const progress of [0, 0.52, 1]) {
      for (const aspect of [1.7, 1.15, 0.75]) {
        const camera = framedCamera(progress, aspect);
        const pose = assemblyPose(progress);
        const width = aspect * 100;
        for (const id of CATEGORY_IDS) {
          const point = projectPart(pose[id], camera, width, 100);
          const ndcX = (point.x / width) * 2 - 1;
          const ndcY = 1 - (point.y / 100) * 2;
          expect(Math.abs(ndcX)).toBeLessThan(0.92);
          expect(ndcY).toBeLessThan(0.92);
          expect(ndcY).toBeGreaterThan(-0.95);
        }
      }
    }
  });
});
