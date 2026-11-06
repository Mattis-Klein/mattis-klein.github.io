import { CATEGORY_IDS, type CategoryId } from "../content";

export const FLIGHT_SIZE = 160;

export type LatticeModule = {
  id: CategoryId;
  index: string;
  short: string;
  x: number;
  y: number;
  tagX: number;
  tagY: number;
  size: number;
  depth: number;
};

export const LATTICE = {
  width: 760,
  height: 600,
  joint: { x: 50, y: 46 },
  modules: [
    {
      id: "surveillance",
      index: "01",
      short: "Surveillance",
      x: 26,
      y: 30,
      tagX: 26,
      tagY: 12,
      size: 158,
      depth: 1.15,
    },
    {
      id: "networking",
      index: "02",
      short: "Networking",
      x: 74,
      y: 32,
      tagX: 74,
      tagY: 13,
      size: 156,
      depth: 0.72,
    },
    {
      id: "access",
      index: "04",
      short: "Access",
      x: 22,
      y: 68,
      tagX: 22,
      tagY: 88,
      size: 150,
      depth: 0.9,
    },
    {
      id: "smart-home",
      index: "03",
      short: "Smart home",
      x: 78,
      y: 70,
      tagX: 78,
      tagY: 88,
      size: 132,
      depth: 0.55,
    },
    {
      id: "safety",
      index: "05",
      short: "Life safety",
      x: 50,
      y: 76,
      tagX: 50,
      tagY: 93,
      size: 148,
      depth: 1.35,
    },
  ] as const satisfies readonly LatticeModule[],
};

const INK = "#142B44";
const BLUE = "#1688CE";
const TOP = "#FFFFFF";
const FRONT = "#E6EEF6";
const SIDE = "#F4F8FB";
const AX = 0.84;
const AY = 0.48;

export type DrawShape = {
  kind: "path" | "circle" | "line";
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  draw?: boolean;
};

function project(x: number, y: number, z: number): [number, number] {
  return [80 + (x - y) * AX, 104 + (x + y) * AY - z];
}

function poly(points: [number, number][]): string {
  return `${points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
    .join("")}Z`;
}

function line(a: [number, number], b: [number, number]): string {
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

function face(d: string, fill: string, sw = 1.8): DrawShape {
  return { kind: "path", d, fill, stroke: INK, sw };
}

function box(x: number, y: number, z: number, w: number, d: number, h: number): DrawShape[] {
  const p = (px: number, py: number, pz: number) => project(x + px, y + py, z + pz);
  const side = poly([p(w, 0, 0), p(w, d, 0), p(w, d, h), p(w, 0, h)]);
  const front = poly([p(0, d, 0), p(w, d, 0), p(w, d, h), p(0, d, h)]);
  const top = poly([p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)]);
  return [face(side, SIDE), face(front, FRONT), face(top, TOP)];
}

function ring(cx: number, cy: number, z: number, radius: number, segments = 36): [number, number][] {
  const points: [number, number][] = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(project(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, z));
  }
  return points;
}

function disc(cx: number, cy: number, z: number, radius: number, height: number): DrawShape[] {
  const top = ring(cx, cy, z + height, radius);
  const bottom = ring(cx, cy, z, radius);
  let left = 0;
  let right = 0;
  bottom.forEach((point, index) => {
    if (point[0] < bottom[left][0]) left = index;
    if (point[0] > bottom[right][0]) right = index;
  });
  const walk = (direction: number) => {
    const indexes: number[] = [];
    let cursor = left;
    indexes.push(cursor);
    while (cursor !== right) {
      cursor = (cursor + direction + bottom.length) % bottom.length;
      indexes.push(cursor);
    }
    return indexes;
  };
  const forward = walk(1);
  const backward = walk(-1);
  const average = (indexes: number[]) =>
    indexes.reduce((sum, index) => sum + bottom[index][1], 0) / indexes.length;
  const front = average(forward) > average(backward) ? forward : backward;
  const side = [...front.map((index) => bottom[index]), ...[...front].reverse().map((index) => top[index])];
  return [face(poly(side), SIDE), face(poly(top), TOP)];
}

function accentLine(a: [number, number], b: [number, number], sw = 2.2): DrawShape {
  return { kind: "path", d: line(a, b), stroke: BLUE, sw, fill: "none" };
}

function surveillance(): DrawShape[] {
  const shapes = box(-36, -15, 0, 72, 30, 34);
  const lens = project(36, 0, 18);
  const ridge = project(-8, -15, 40);
  shapes.push(
    { kind: "circle", cx: lens[0], cy: lens[1], r: 13, fill: INK },
    { kind: "circle", cx: lens[0], cy: lens[1], r: 7.5, fill: "none", stroke: BLUE, sw: 2.4 },
    { kind: "circle", cx: lens[0] - 2.2, cy: lens[1] - 2.2, r: 2.2, fill: "#F7F9FC" },
    { kind: "circle", cx: ridge[0], cy: ridge[1], r: 3.2, fill: BLUE },
  );
  return shapes;
}

function networking(): DrawShape[] {
  const shapes = [...box(-40, -12, 0, 18, 24, 64), ...box(16, -12, 0, 18, 24, 64)];
  const ports = (x: number) => {
    const marks: DrawShape[] = [];
    for (const step of [0.28, 0.48, 0.68]) {
      const a = project(x, 12, 64 * step);
      const b = project(x + 12, 12, 64 * step);
      marks.push({ kind: "path", d: line(a, b), stroke: "#9BB3C7", sw: 1.6, fill: "none" });
    }
    return marks;
  };
  const a = project(-22, 0, 34);
  const b = project(16, 0, 34);
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  shapes.push(...ports(-40), ...ports(16), accentLine(a, b, 2.6), {
    kind: "circle",
    cx: mid[0],
    cy: mid[1],
    r: 4.2,
    fill: BLUE,
  });
  return shapes;
}

function smartHome(): DrawShape[] {
  const shapes = disc(0, 0, 0, 30, 16);
  const topZ = 16;
  for (let step = 0; step < 8; step += 1) {
    const angle = (step / 8) * Math.PI * 2;
    const inner = project(Math.cos(angle) * 14, Math.sin(angle) * 14, topZ);
    const outer = project(Math.cos(angle) * 22, Math.sin(angle) * 22, topZ);
    shapes.push({ kind: "path", d: line(inner, outer), stroke: "#9BB3C7", sw: 1.5, fill: "none" });
  }
  const hub = project(0, 0, topZ);
  const needle = project(16, -8, topZ);
  shapes.push(accentLine(hub, needle, 2.4), {
    kind: "circle",
    cx: hub[0],
    cy: hub[1],
    r: 3.3,
    fill: BLUE,
  });
  return shapes;
}

function access(): DrawShape[] {
  const shapes = box(-16, -8, 0, 32, 16, 78);
  const lock = project(0, 8, 48);
  const latchA = project(16, -2, 36);
  const latchB = project(28, -2, 36);
  shapes.push(
    { kind: "circle", cx: lock[0], cy: lock[1], r: 8, fill: "none", stroke: INK, sw: 1.8 },
    { kind: "circle", cx: lock[0], cy: lock[1], r: 2.6, fill: BLUE },
    accentLine(latchA, latchB, 2.4),
  );
  return shapes;
}

function safety(): DrawShape[] {
  const shapes = disc(0, 0, 0, 36, 14);
  const topZ = 14;
  for (let step = 0; step < 4; step += 1) {
    const angle = (step / 4) * Math.PI * 2 + Math.PI / 4;
    const inner = project(Math.cos(angle) * 16, Math.sin(angle) * 16, topZ);
    const outer = project(Math.cos(angle) * 26, Math.sin(angle) * 26, topZ);
    shapes.push({ kind: "path", d: line(inner, outer), stroke: INK, sw: 1.7, fill: "none" });
  }
  const innerRing = ring(0, 0, topZ, 10, 28);
  const hub = project(0, 0, topZ);
  shapes.push(face(poly(innerRing), "none", 1.6), {
    kind: "circle",
    cx: hub[0],
    cy: hub[1],
    r: 3.4,
    fill: BLUE,
  });
  return shapes;
}

function flat(id: CategoryId): DrawShape[] {
  const stroke = { stroke: INK, sw: 1.7, fill: "none" as const, draw: true };
  if (id === "surveillance") {
    return [
      { kind: "path", d: "M8 26L36 26L36 42L8 42Z", ...stroke },
      { kind: "path", d: "M36 30L42 30L42 38L36 38", ...stroke },
      { kind: "circle", cx: 48, cy: 34, r: 9, ...stroke },
      { kind: "circle", cx: 48, cy: 34, r: 3.2, fill: BLUE },
    ];
  }
  if (id === "networking") {
    return [
      { kind: "path", d: "M12 16L24 16L24 48L12 48Z", ...stroke },
      { kind: "path", d: "M40 16L52 16L52 48L40 48Z", ...stroke },
      { kind: "line", x1: 24, y1: 32, x2: 40, y2: 32, stroke: BLUE, sw: 1.8, draw: true },
      { kind: "circle", cx: 32, cy: 32, r: 3.1, fill: BLUE },
    ];
  }
  if (id === "smart-home") {
    return [
      { kind: "circle", cx: 32, cy: 32, r: 16, ...stroke },
      { kind: "line", x1: 32, y1: 20, x2: 32, y2: 23, ...stroke },
      { kind: "line", x1: 32, y1: 41, x2: 32, y2: 44, ...stroke },
      { kind: "line", x1: 20, y1: 32, x2: 23, y2: 32, ...stroke },
      { kind: "line", x1: 41, y1: 32, x2: 44, y2: 32, ...stroke },
      { kind: "line", x1: 32, y1: 32, x2: 40, y2: 26, stroke: BLUE, sw: 1.8, draw: true },
      { kind: "circle", cx: 32, cy: 32, r: 2.4, fill: BLUE },
    ];
  }
  if (id === "access") {
    return [
      { kind: "path", d: "M22 8L42 8L42 56L22 56Z", ...stroke },
      { kind: "circle", cx: 32, cy: 28, r: 5, ...stroke },
      { kind: "circle", cx: 32, cy: 28, r: 1.7, fill: BLUE },
      { kind: "path", d: "M32 36L40 36", stroke: BLUE, sw: 1.8, fill: "none", draw: true },
    ];
  }
  return [
    { kind: "circle", cx: 32, cy: 32, r: 18, ...stroke },
    { kind: "circle", cx: 32, cy: 32, r: 7, ...stroke },
    { kind: "line", x1: 32, y1: 16, x2: 32, y2: 20, ...stroke },
    { kind: "line", x1: 32, y1: 44, x2: 32, y2: 48, ...stroke },
    { kind: "line", x1: 16, y1: 32, x2: 20, y2: 32, ...stroke },
    { kind: "line", x1: 44, y1: 32, x2: 48, y2: 32, ...stroke },
    { kind: "circle", cx: 32, cy: 32, r: 2.5, fill: BLUE },
  ];
}

const ISO: Record<CategoryId, () => DrawShape[]> = {
  surveillance,
  networking,
  "smart-home": smartHome,
  access,
  safety,
};

export function moduleShapes(id: CategoryId, variant: "iso" | "flat"): DrawShape[] {
  return variant === "flat" ? flat(id) : ISO[id]();
}

export function moduleById(id: CategoryId): LatticeModule {
  const found = LATTICE.modules.find((item) => item.id === id);
  if (!found) throw new Error(`Missing module ${id}`);
  return found;
}

export function moduleVector(mod: Pick<LatticeModule, "x" | "y">): { ox: number; oy: number } {
  const dx = mod.x - LATTICE.joint.x;
  const dy = mod.y - LATTICE.joint.y;
  const length = Math.hypot(dx, dy) || 1;
  return { ox: dx / length, oy: dy / length };
}

export function heroRoutes(): string[] {
  const originX = (LATTICE.joint.x / 100) * LATTICE.width;
  const originY = (LATTICE.joint.y / 100) * LATTICE.height;
  return LATTICE.modules.map((mod) => {
    const x = (mod.x / 100) * LATTICE.width;
    const y = (mod.y / 100) * LATTICE.height;
    return `M${originX.toFixed(1)} ${originY.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`;
  });
}

function fieldPoint(x: number, y: number, z = 0): [number, number] {
  const originX = (LATTICE.joint.x / 100) * LATTICE.width;
  const originY = (LATTICE.joint.y / 100) * LATTICE.height + 36;
  return [originX + (x - y) * 0.98, originY + (x + y) * 0.5 - z];
}

function fieldPoly(points: [number, number][]): string {
  return poly(points);
}

export function heroField(): string[] {
  const ground = fieldPoly([
    fieldPoint(-220, -90),
    fieldPoint(230, -90),
    fieldPoint(230, 110),
    fieldPoint(-220, 110),
  ]);
  const across = line(fieldPoint(-220, 10), fieldPoint(230, 10));
  const depth = line(fieldPoint(0, -90), fieldPoint(0, 110));
  return [ground, across, depth];
}

export function latticeCoversCategories(): boolean {
  const ids = LATTICE.modules.map((mod) => mod.id);
  return CATEGORY_IDS.every((id) => ids.includes(id)) && ids.length === CATEGORY_IDS.length;
}
