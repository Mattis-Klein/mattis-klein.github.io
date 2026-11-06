import type { CategoryId } from "../content";

export type SceneShape = {
  d: string;
  fill: string;
  stroke?: string;
  sw?: number;
  strokeOpacity?: number;
};

export type SceneHotspot = {
  id: CategoryId;
  index: string;
  x: number;
  y: number;
};

export type SceneLabel = {
  text: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
};

export type SceneModel = {
  width: number;
  height: number;
  transform: string;
  shapes: SceneShape[];
  routes: string[];
  hotspots: SceneHotspot[];
  labels: SceneLabel[];
};

type XY = [number, number];
type Box = { x: number; y: number; z: number; w: number; d: number; h: number };

const AX = 0.58;
const AY = 0.5;
const INK = "#142B44";
const BLUE = "#1688CE";

const points: XY[] = [];

function project(x: number, y: number, z: number): XY {
  const point: XY = [(x - y) * AX, (x + y) * AY - z];
  points.push(point);
  return point;
}

function poly(pts: XY[]): string {
  return `${pts
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
    .join("")}Z`;
}

function faces(box: Box) {
  const { x, y, z, w, d, h } = box;
  return {
    top: poly([
      project(x, y, z + h),
      project(x + w, y, z + h),
      project(x + w, y + d, z + h),
      project(x, y + d, z + h),
    ]),
    side: poly([
      project(x + w, y, z),
      project(x + w, y + d, z),
      project(x + w, y + d, z + h),
      project(x + w, y, z + h),
    ]),
    front: poly([
      project(x, y + d, z),
      project(x + w, y + d, z),
      project(x + w, y + d, z + h),
      project(x, y + d, z + h),
    ]),
  };
}

function frontWindow(box: Box, u0: number, u1: number, v0: number, v1: number): string {
  const y = box.y + box.d;
  const x0 = box.x + box.w * u0;
  const x1 = box.x + box.w * u1;
  const z0 = box.z + box.h * v0;
  const z1 = box.z + box.h * v1;
  return poly([project(x0, y, z0), project(x1, y, z0), project(x1, y, z1), project(x0, y, z1)]);
}

function sideWindow(box: Box, u0: number, u1: number, v0: number, v1: number): string {
  const x = box.x + box.w;
  const y0 = box.y + box.d * u0;
  const y1 = box.y + box.d * u1;
  const z0 = box.z + box.h * v0;
  const z1 = box.z + box.h * v1;
  return poly([project(x, y0, z0), project(x, y1, z0), project(x, y1, z1), project(x, y0, z1)]);
}

function grid(
  draw: (u0: number, u1: number, v0: number, v1: number) => string,
  cols: number,
  rows: number,
  lit: string[],
  insetX = 0.16,
  insetZ = 0.14,
): SceneShape[] {
  const gap = 0.045;
  const uw = (1 - insetX * 2 - gap * (cols - 1)) / cols;
  const uh = (1 - insetZ * 2 - gap * (rows - 1)) / rows;
  const shapes: SceneShape[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const u0 = insetX + col * (uw + gap);
      const top = insetZ + row * (uh + gap);
      const v1 = 1 - top;
      const v0 = v1 - uh;
      const on = lit.includes(`${col}-${row}`);
      shapes.push({
        d: draw(u0, u0 + uw, v0, v1),
        fill: on ? "#7EBFDF" : "#C9D8E6",
      });
    }
  }
  return shapes;
}

function solid(box: Box, tone: "mass" | "plinth" | "glass"): SceneShape[] {
  const drawn = faces(box);
  if (tone === "glass") {
    return [
      { d: drawn.side, fill: "rgba(255,255,255,0.35)", stroke: BLUE, sw: 1.25, strokeOpacity: 0.7 },
      { d: drawn.front, fill: "rgba(214,230,242,0.78)", stroke: BLUE, sw: 1.25, strokeOpacity: 0.85 },
      { d: drawn.top, fill: "rgba(255,255,255,0.88)", stroke: BLUE, sw: 1.25, strokeOpacity: 0.85 },
    ];
  }
  if (tone === "plinth") {
    return [
      { d: drawn.side, fill: "#E7EEF5", stroke: "#DCE8F1", sw: 1 },
      { d: drawn.front, fill: "#DCE8F1", stroke: "#DCE8F1", sw: 1 },
      { d: drawn.top, fill: "#F7F9FC", stroke: "#C5D4E2", sw: 1.1 },
    ];
  }
  return [
    { d: drawn.side, fill: "#F4F8FB", stroke: INK, sw: 1.2 },
    { d: drawn.front, fill: "#E6EEF6", stroke: INK, sw: 1.2 },
    { d: drawn.top, fill: "#FFFFFF", stroke: INK, sw: 1.2 },
  ];
}

function line(a: XY, b: XY): string {
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

export function buildScene(): SceneModel {
  points.length = 0;
  const shapes: SceneShape[] = [];

  const plinth: Box = { x: -20, y: -16, z: -16, w: 520, d: 300, h: 16 };
  const tower: Box = { x: 292, y: 6, z: 0, w: 168, d: 124, h: 214 };
  const house: Box = { x: 28, y: 86, z: 0, w: 156, d: 112, h: 108 };
  const wing: Box = { x: 28, y: 198, z: 0, w: 92, d: 68, h: 64 };
  const bridge: Box = { x: 184, y: 112, z: 54, w: 108, d: 54, h: 36 };
  const roof: Box = { x: 332, y: 28, z: 214, w: 58, d: 40, h: 18 };

  shapes.push(...solid(plinth, "plinth"));
  shapes.push(...solid(tower, "mass"));
  shapes.push(
    ...grid((u0, u1, v0, v1) => frontWindow(tower, u0, u1, v0, v1), 4, 5, ["1-0", "3-1", "0-3", "2-2"], 0.12, 0.1),
  );
  shapes.push(
    ...grid((u0, u1, v0, v1) => sideWindow(tower, u0, u1, v0, v1), 3, 5, ["1-1", "2-4"], 0.18, 0.1),
  );
  shapes.push({
    d: frontWindow(tower, 0.14, 0.32, 0, 0.2),
    fill: "#142B44",
  });

  shapes.push(...solid(house, "mass"));
  shapes.push(
    ...grid((u0, u1, v0, v1) => frontWindow(house, u0, u1, v0, v1), 3, 2, ["0-0", "2-1"], 0.14, 0.16),
  );
  shapes.push(
    ...grid((u0, u1, v0, v1) => sideWindow(house, u0, u1, v0, v1), 2, 2, ["1-0"], 0.2, 0.16),
  );
  shapes.push({
    d: frontWindow(house, 0.62, 0.84, 0, 0.38),
    fill: "#142B44",
  });

  shapes.push(...solid(wing, "mass"));
  shapes.push(...grid((u0, u1, v0, v1) => frontWindow(wing, u0, u1, v0, v1), 2, 1, ["0-0"], 0.18, 0.22));

  shapes.push(...solid(bridge, "glass"));
  shapes.push(
    ...grid((u0, u1, v0, v1) => frontWindow(bridge, u0, u1, v0, v1), 3, 1, ["1-0"], 0.12, 0.28),
  );

  shapes.push(...solid(roof, "mass"));

  const rawSpots: { id: CategoryId; index: string; at: XY }[] = [
    { id: "surveillance", index: "01", at: project(70, 140, 124) },
    { id: "smart-home", index: "03", at: project(64, 248, 36) },
    { id: "networking", index: "02", at: project(238, 139, 82) },
    { id: "access", index: "04", at: project(330, 130, 30) },
    { id: "safety", index: "05", at: project(430, 40, 200) },
  ];

  const network = rawSpots[2].at;
  const routes = [rawSpots[0].at, rawSpots[1].at, rawSpots[3].at, rawSpots[4].at].map((at) =>
    line(network, at),
  );

  const homeLabel = project(70, 290, -6);
  const buildingLabel = project(470, 160, -6);

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 36;
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const originX = pad - minX;
  const originY = pad - minY;

  function place(point: XY): { x: number; y: number } {
    return {
      x: ((point[0] + originX) / width) * 100,
      y: ((point[1] + originY) / height) * 100,
    };
  }

  return {
    width,
    height,
    transform: `translate(${originX.toFixed(2)} ${originY.toFixed(2)})`,
    shapes,
    routes,
    hotspots: rawSpots.map((spot) => ({ id: spot.id, index: spot.index, ...place(spot.at) })),
    labels: [
      { text: "HOME", x: homeLabel[0], y: homeLabel[1], anchor: "middle" },
      { text: "BUILDING", x: buildingLabel[0], y: buildingLabel[1], anchor: "middle" },
    ],
  };
}
