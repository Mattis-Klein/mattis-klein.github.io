import { CATEGORY_IDS, type CategoryId } from "../content";

/**
 * Supply bay.
 * Opening: five machined modules share one lit plinth.
 * Separate: they lift and turn into five stations.
 * Reroute: the stations travel into a retail lane and a wholesale lane.
 * Progress is 0 at the composed assembly and 1 when the lanes have settled.
 * The same progress always returns the same pose.
 */

export type PartId = CategoryId | "plinthA" | "plinthB";

export type Pose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

export type CameraPose = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
};

export const PARTS: readonly PartId[] = [...CATEGORY_IDS, "plinthA", "plinthB"];

const HERO: Record<PartId, Pose> = {
  surveillance: { x: -0.62, y: 0.36, z: 0.28, rx: 0.08, ry: -0.55, rz: 0 },
  networking: { x: 0.18, y: 0.2, z: 0.02, rx: 0, ry: 0.28, rz: 0 },
  "smart-home": { x: 0.78, y: 0.42, z: -0.22, rx: -0.06, ry: -0.42, rz: 0.04 },
  access: { x: -0.12, y: 0.34, z: -0.38, rx: 0.04, ry: 0.62, rz: 0 },
  safety: { x: 0.52, y: 0.22, z: 0.4, rx: 0, ry: -0.18, rz: 0 },
  plinthA: { x: 0.08, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
  plinthB: { x: 0.08, y: 0, z: 0, rx: 0, ry: 0.2, rz: 0 },
};

const STATIONS: Record<PartId, Pose> = {
  surveillance: { x: -0.15, y: 0.1, z: 0.22, rx: 0, ry: 0.4, rz: 0 },
  networking: { x: 0.95, y: 0.12, z: -0.08, rx: 0, ry: 0.12, rz: 0 },
  "smart-home": { x: 1.75, y: 0.1, z: 0.16, rx: 0, ry: -0.12, rz: 0 },
  access: { x: 2.45, y: 0.14, z: -0.02, rx: 0, ry: -0.32, rz: 0 },
  safety: { x: 3.15, y: 0.08, z: 0.24, rx: 0, ry: -0.5, rz: 0 },
  plinthA: { x: 1.45, y: 0, z: 0.02, rx: 0, ry: 0.08, rz: 0 },
  plinthB: { x: 1.45, y: -0.6, z: 0, rx: 0, ry: 0, rz: 0 },
};

const ROUTES: Record<PartId, Pose> = {
  surveillance: { x: -1.35, y: 0.1, z: 0.28, rx: 0, ry: 0.5, rz: 0 },
  "smart-home": { x: -0.85, y: 0.12, z: -0.15, rx: 0, ry: 0.28, rz: 0 },
  safety: { x: -0.25, y: 0.08, z: 0.22, rx: 0, ry: 0.12, rz: 0 },
  networking: { x: 0.85, y: 0.1, z: 0.12, rx: 0, ry: -0.28, rz: 0 },
  access: { x: 1.55, y: 0.12, z: -0.08, rx: 0, ry: -0.48, rz: 0 },
  plinthA: { x: -0.82, y: 0, z: 0.05, rx: 0, ry: 0.12, rz: 0 },
  plinthB: { x: 1.2, y: 0, z: 0.02, rx: 0, ry: -0.12, rz: 0 },
};

const CAM_HERO: CameraPose = { x: 0.12, y: 1.55, z: 4.55, tx: 0.08, ty: 0.38, tz: 0 };
const CAM_STATIONS: CameraPose = { x: 1.4, y: 2.15, z: 5.7, tx: 1.45, ty: 0.02, tz: 0 };
const CAM_ROUTES: CameraPose = { x: 0.15, y: 1.28, z: 5.35, tx: 0.15, ty: 0.22, tz: 0.05 };

export type StoryBeat = "assembly" | "separate" | "stations" | "reroute" | "routes";

export function storyPhase(progress: number): StoryBeat {
  if (progress < 0.16) return "assembly";
  if (progress < 0.46) return "separate";
  if (progress < 0.62) return "stations";
  if (progress < 0.88) return "reroute";
  return "routes";
}

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function smooth(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    rz: lerp(a.rz, b.rz, t),
  };
}

function lerpCamera(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    tx: lerp(a.tx, b.tx, t),
    ty: lerp(a.ty, b.ty, t),
    tz: lerp(a.tz, b.tz, t),
  };
}

export function bayWeights(progress: number): { stations: number; routes: number } {
  return {
    stations: smooth((progress - 0.16) / 0.3),
    routes: smooth((progress - 0.62) / 0.26),
  };
}

export function assemblyPose(progress: number): Record<PartId, Pose> {
  const { stations, routes } = bayWeights(progress);
  const pose = {} as Record<PartId, Pose>;
  for (const id of PARTS) {
    const mid = lerpPose(HERO[id], STATIONS[id], stations);
    const placed = lerpPose(mid, ROUTES[id], routes);
    if (id === "plinthB") {
      placed.y += (1 - routes) * -0.02;
    }
    pose[id] = placed;
  }
  return pose;
}

export function bayCamera(progress: number): CameraPose {
  const { stations, routes } = bayWeights(progress);
  return lerpCamera(lerpCamera(CAM_HERO, CAM_STATIONS, stations), CAM_ROUTES, routes);
}

export function plinthScale(progress: number): { a: number; b: number } {
  const { stations, routes } = bayWeights(progress);
  const wide = lerp(1, 1.35, stations);
  return { a: lerp(wide, 0.58, routes), b: lerp(0.01, 0.58, routes) };
}

export function copyOpacity(progress: number): { hero: number; panel: number; routes: number } {
  const hero = 1 - smooth((progress - 0.14) / 0.16);
  const panelIn = smooth((progress - 0.34) / 0.12);
  const panelOut = 1 - smooth((progress - 0.6) / 0.12);
  const routes = smooth((progress - 0.7) / 0.14);
  return { hero, panel: panelIn * panelOut, routes };
}
