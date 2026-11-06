import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../content";
import {
  LATTICE,
  heroField,
  heroRoutes,
  latticeCoversCategories,
  moduleShapes,
  moduleVector,
} from "./lattice";

function numbersOf(shape: ReturnType<typeof moduleShapes>[number]): number[] {
  if (shape.kind === "circle") {
    const radius = shape.r ?? 0;
    const cx = shape.cx ?? 0;
    const cy = shape.cy ?? 0;
    return [cx - radius, cy - radius, cx + radius, cy + radius];
  }
  if (shape.kind === "line") {
    return [shape.x1 ?? 0, shape.y1 ?? 0, shape.x2 ?? 0, shape.y2 ?? 0];
  }
  return (shape.d?.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

describe("supply lattice", () => {
  it("includes every category once and keeps smart home off center", () => {
    expect(latticeCoversCategories()).toBe(true);
    const smart = LATTICE.modules.find((mod) => mod.id === "smart-home");
    const largest = Math.max(...LATTICE.modules.map((mod) => mod.size));
    expect(smart).toBeTruthy();
    expect(smart?.size).toBeLessThan(largest);
    expect(Math.hypot((smart?.x ?? 0) - 50, (smart?.y ?? 0) - 50)).toBeGreaterThan(18);
  });

  it("separates module anchors on a narrow stage", () => {
    const width = 300;
    const height = width * (LATTICE.height / LATTICE.width);
    for (let i = 0; i < LATTICE.modules.length; i += 1) {
      for (let j = i + 1; j < LATTICE.modules.length; j += 1) {
        const a = LATTICE.modules[i];
        const b = LATTICE.modules[j];
        const dx = ((a.x - b.x) / 100) * width;
        const dy = ((a.y - b.y) / 100) * height;
        expect(Math.hypot(dx, dy)).toBeGreaterThan(46);
      }
    }
  });

  it("points each module away from the joint", () => {
    for (const mod of LATTICE.modules) {
      const vector = moduleVector(mod);
      expect(Math.hypot(vector.ox, vector.oy)).toBeCloseTo(1, 4);
      expect(Math.hypot(mod.x - LATTICE.joint.x, mod.y - LATTICE.joint.y)).toBeGreaterThan(12);
    }
  });

  it("draws routes and a field without building labels", () => {
    expect(heroRoutes()).toHaveLength(5);
    expect(heroField().length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(LATTICE)).not.toMatch(/BUILDING|HOME VOLUME|CONNECTED VOLUMES/i);
  });

  it("keeps isometric and flat drawings inside their tiles", () => {
    for (const id of CATEGORY_IDS) {
      for (const shape of moduleShapes(id, "iso")) {
        const values = numbersOf(shape);
        for (let index = 0; index < values.length; index += 2) {
          expect(values[index]).toBeGreaterThan(-1);
          expect(values[index]).toBeLessThan(161);
          expect(values[index + 1]).toBeGreaterThan(-1);
          expect(values[index + 1]).toBeLessThan(161);
        }
      }
      for (const shape of moduleShapes(id, "flat")) {
        const values = numbersOf(shape);
        for (let index = 0; index < values.length; index += 2) {
          expect(values[index]).toBeGreaterThan(0);
          expect(values[index]).toBeLessThan(64);
          expect(values[index + 1]).toBeGreaterThan(0);
          expect(values[index + 1]).toBeLessThan(64);
        }
      }
    }
  });
});
