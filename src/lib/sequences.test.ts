import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../content";
import { CLUSTER, matrixScatter } from "./sequences";

describe("distribution core cluster", () => {
  it("places every category in one overlapping instrument", () => {
    expect(Object.keys(CLUSTER).sort()).toEqual([...CATEGORY_IDS].sort());
    for (const pose of Object.values(CLUSTER)) {
      expect(Math.hypot(pose.x, pose.y)).toBeLessThan(280);
      expect(pose.s).toBeGreaterThan(0.7);
      expect(pose.s).toBeLessThan(1.4);
    }
    const smart = CLUSTER["smart-home"];
    const safety = CLUSTER.safety;
    expect(smart.s).toBeLessThan(safety.s);
    expect(Math.hypot(smart.x, smart.y)).toBeGreaterThan(80);
  });
});

describe("wholesale matrix scatter", () => {
  it("starts as a field and differs by row", () => {
    const retail = CATEGORY_IDS.map((_, index) => matrixScatter(index, 0));
    const wholesale = CATEGORY_IDS.map((_, index) => matrixScatter(index, 1));
    for (let index = 0; index < retail.length; index += 1) {
      expect(Math.hypot(retail[index].x, retail[index].y)).toBeGreaterThan(70);
      expect(retail[index].y).not.toBe(wholesale[index].y);
      expect(Math.abs(retail[index].x)).toBeLessThan(420);
    }
  });
});
