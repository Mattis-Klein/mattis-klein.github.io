import { CATEGORY_IDS, type CategoryId } from "../content";

/** Opaque fraction of each 210px sprite, unioned across the twelve yaw views. */
const SPRITE_BOX = 210;
const SPRITE_CONTENT: Record<CategoryId, { l: number; t: number; r: number; b: number }> = {
  surveillance: { l: 0.2, t: 0.24, r: 0.8, b: 0.84 },
  networking: { l: 0, t: 0.36, r: 1, b: 0.92 },
  "smart-home": { l: 0.19, t: 0.07, r: 0.81, b: 0.84 },
  access: { l: 0.22, t: 0.03, r: 0.77, b: 0.81 },
  safety: { l: 0.21, t: 0.38, r: 0.79, b: 0.82 },
};

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
  surveillance: { x: 0.35, y: 0.1, z: 0.22, rx: 0, ry: 0.4, rz: 0 },
  networking: { x: 1.35, y: 0.12, z: -0.08, rx: 0, ry: 0.12, rz: 0 },
  "smart-home": { x: 2.2, y: 0.1, z: 0.16, rx: 0, ry: -0.12, rz: 0 },
  access: { x: 2.95, y: 0.14, z: -0.02, rx: 0, ry: -0.32, rz: 0 },
  safety: { x: 3.65, y: 0.08, z: 0.24, rx: 0, ry: -0.5, rz: 0 },
  plinthA: { x: 2.0, y: 0, z: 0.02, rx: 0, ry: 0.08, rz: 0 },
  plinthB: { x: 1.45, y: -0.6, z: 0, rx: 0, ry: 0, rz: 0 },
};

const ROUTES: Record<PartId, Pose> = {
  surveillance: { x: 0.55, y: 0.1, z: 0.28, rx: 0, ry: 0.5, rz: 0 },
  "smart-home": { x: 1.25, y: 0.12, z: -0.15, rx: 0, ry: 0.28, rz: 0 },
  safety: { x: 1.9, y: 0.08, z: 0.22, rx: 0, ry: 0.12, rz: 0 },
  networking: { x: 2.85, y: 0.1, z: 0.12, rx: 0, ry: -0.28, rz: 0 },
  access: { x: 3.6, y: 0.12, z: -0.08, rx: 0, ry: -0.48, rz: 0 },
  plinthA: { x: 1.25, y: 0, z: 0.05, rx: 0, ry: 0.12, rz: 0 },
  plinthB: { x: 3.2, y: 0, z: 0.02, rx: 0, ry: -0.12, rz: 0 },
};

const CAM_HERO: CameraPose = { x: 0.04, y: 1.2, z: 3.85, tx: 0.04, ty: 0.42, tz: 0 };
const CAM_STATIONS: CameraPose = { x: 2.05, y: 1.85, z: 7.6, tx: 2.05, ty: 0.24, tz: 0 };
const CAM_ROUTES: CameraPose = { x: 2.2, y: 1.5, z: 7.15, tx: 2.2, ty: 0.3, tz: 0 };

export type StoryBeat = "assembly" | "separate" | "stations" | "reroute" | "routes";

export function storyPhase(progress: number): StoryBeat {
  if (progress < 0.08) return "assembly";
  if (progress < 0.34) return "separate";
  if (progress < 0.56) return "stations";
  if (progress < 0.94) return "reroute";
  return "routes";
}

const LIFT: Record<CategoryId, { x: number; y: number; ry: number }> = {
  surveillance: { x: -0.08, y: 0.55, ry: 0.7 },
  networking: { x: 0.2, y: 0.38, ry: -0.45 },
  "smart-home": { x: 0.05, y: 0.55, ry: 0.35 },
  access: { x: 0.28, y: 0.48, ry: -0.7 },
  safety: { x: -0.12, y: 0.22, ry: 0.4 },
};

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
    stations: smooth((progress - 0.06) / 0.46),
    routes: smooth((progress - 0.58) / 0.36),
  };
}

function bow(amount: number): number {
  return Math.sin(clamp01(amount) * Math.PI);
}

export function assemblyPose(progress: number): Record<PartId, Pose> {
  const { stations, routes } = bayWeights(progress);
  const pose = {} as Record<PartId, Pose>;
  const rising = bow(stations) * (1 - routes);
  const crossing = bow(routes);
  for (const id of PARTS) {
    const mid = lerpPose(HERO[id], STATIONS[id], stations);
    const placed = lerpPose(mid, ROUTES[id], routes);
    const lift = LIFT[id as CategoryId];
    if (lift) {
      placed.x += lift.x * rising;
      placed.y += lift.y * rising + 0.18 * crossing;
      placed.ry += lift.ry * rising;
    }
    if (id === "plinthB") placed.y += (1 - routes) * -0.02;
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
  const hero = 1 - smooth((progress - 0.26) / 0.06);
  const panelIn = smooth((progress - 0.33) / 0.06);
  const panelOut = 1 - smooth((progress - 0.5) / 0.06);
  const routes = smooth((progress - 0.57) / 0.06);
  return { hero, panel: panelIn * panelOut, routes };
}

export const YAW_STEPS = 12;

export function yawBlend(ry: number): { lo: number; hi: number; mix: number } {
  const turn = Math.PI * 2;
  const wrapped = ((ry % turn) + turn) % turn;
  const exact = wrapped / (turn / YAW_STEPS);
  const lo = Math.floor(exact) % YAW_STEPS;
  const mix = exact - Math.floor(exact);
  return { lo, hi: (lo + 1) % YAW_STEPS, mix };
}

/** One crisp sprite at rest. Crossfade only while the view is actually moving. */
export function yawFrame(ry: number, moving: boolean): { lo: number; hi: number; mix: number } {
  const blend = yawBlend(ry);
  if (moving && blend.mix > 0.12 && blend.mix < 0.88) return blend;
  const index = blend.mix >= 0.5 ? blend.hi : blend.lo;
  return { lo: index, hi: index, mix: 0 };
}

const FOV = (30 * Math.PI) / 180;

export function projectPart(
  pose: Pose,
  camera: CameraPose,
  width: number,
  height: number,
): { x: number; y: number; scale: number } {
  const fx = camera.tx - camera.x;
  const fy = camera.ty - camera.y;
  const fz = camera.tz - camera.z;
  const fl = Math.hypot(fx, fy, fz) || 1;
  const forward = { x: fx / fl, y: fy / fl, z: fz / fl };
  const up = { x: 0, y: 1, z: 0 };
  const rx = forward.y * up.z - forward.z * up.y;
  const ry = forward.z * up.x - forward.x * up.z;
  const rz = forward.x * up.y - forward.y * up.x;
  const rl = Math.hypot(rx, ry, rz) || 1;
  const right = { x: rx / rl, y: ry / rl, z: rz / rl };
  const ux = right.y * forward.z - right.z * forward.y;
  const uy = right.z * forward.x - right.x * forward.z;
  const uz = right.x * forward.y - right.y * forward.x;
  const dx = pose.x - camera.x;
  const dy = pose.y - camera.y;
  const dz = pose.z - camera.z;
  const cx = dx * right.x + dy * right.y + dz * right.z;
  const cy = dx * ux + dy * uy + dz * uz;
  const cz = dx * forward.x + dy * forward.y + dz * forward.z;
  const depth = Math.max(0.35, cz);
  const focal = 1 / Math.tan(FOV / 2);
  const aspect = width / Math.max(1, height);
  const ndcX = (cx / depth) * (focal / aspect);
  const ndcY = (cy / depth) * focal;
  return {
    x: (ndcX * 0.5 + 0.5) * width,
    y: (1 - (ndcY * 0.5 + 0.5)) * height,
    scale: (Math.min(width, height) / 780) * (3.15 / depth),
  };
}

export type FigurePoint = { id: CategoryId; x: number; y: number; scale: number };

/** Screen box of the opaque sprite after `translate(-50%, -78%) scale()`. */
export function spriteBounds(point: FigurePoint): { left: number; top: number; right: number; bottom: number } {
  const box = SPRITE_CONTENT[point.id];
  const shift = (SPRITE_BOX - 0.78 * SPRITE_BOX) - SPRITE_BOX / 2;
  return {
    left: point.x + point.scale * (box.l * SPRITE_BOX - SPRITE_BOX / 2),
    right: point.x + point.scale * (box.r * SPRITE_BOX - SPRITE_BOX / 2),
    top: point.y + shift + point.scale * (box.t * SPRITE_BOX - SPRITE_BOX / 2),
    bottom: point.y + shift + point.scale * (box.b * SPRITE_BOX - SPRITE_BOX / 2),
  };
}

function unionBounds(items: FigurePoint[]) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const point of items) {
    const box = spriteBounds(point);
    left = Math.min(left, box.left);
    top = Math.min(top, box.top);
    right = Math.max(right, box.right);
    bottom = Math.max(bottom, box.bottom);
  }
  return { left, top, right, bottom, w: right - left, h: bottom - top };
}

/**
 * Object size and cluster spread for one pose in one viewport.
 * Size grows until the equipment fills the stage. Spread tightens only
 * enough to keep every opaque silhouette inside the padding.
 */
export function clusterFactors(
  points: FigurePoint[],
  width: number,
  height: number,
  padding = 28,
): { size: number; spread: number } {
  if (points.length === 0 || width < 2 || height < 2) return { size: 1, spread: 1 };
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const place = (size: number, spread: number): FigurePoint[] =>
    points.map((point) => ({
      ...point,
      x: cx + (point.x - cx) * spread,
      y: cy + (point.y - cy) * spread,
      scale: point.scale * size,
    }));
  const fits = (size: number, spread: number) => {
    const box = unionBounds(place(size, spread));
    return box.w <= width - padding * 2 && box.h <= height - padding * 2;
  };
  let best = { size: 0.55, spread: 0.55 };
  for (let step = 0; step <= 40; step += 1) {
    const size = 0.55 + step * 0.12;
    const minSpread = Math.max(0.12, size * 0.16);
    if (minSpread > 3.6 || !fits(size, minSpread)) break;
    let lo = minSpread;
    let hi = 3.6;
    for (let i = 0; i < 14; i += 1) {
      const mid = (lo + hi) / 2;
      if (fits(size, mid)) lo = mid;
      else hi = mid;
    }
    best = { size, spread: lo };
  }
  return best;
}

/** Place the projected cluster so the equipment fills this stage without clipping. */
export function fitFigures(points: FigurePoint[], width: number, height: number, padding = 28): FigurePoint[] {
  if (points.length === 0 || width < 2 || height < 2) return points;
  const { size, spread } = clusterFactors(points, width, height, padding);
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const placed = points.map((point) => ({
    ...point,
    x: cx + (point.x - cx) * spread,
    y: cy + (point.y - cy) * spread,
    scale: point.scale * size,
  }));
  const box = unionBounds(placed);
  const dx = (width - box.left - box.right) / 2;
  const dy = (height - box.top - box.bottom) / 2;
  return placed.map((point) => ({ ...point, x: point.x + dx, y: point.y + dy }));
}

/** Dolly the shared camera until the modules fill the view and stay inside it. */
export function framedCamera(progress: number, aspect: number, tighten = 1): CameraPose {
  const base = bayCamera(progress);
  const pose = assemblyPose(progress);
  const ids = CATEGORY_IDS;
  const cx = ids.reduce((sum, id) => sum + pose[id].x, 0) / ids.length;
  const cy = ids.reduce((sum, id) => sum + pose[id].y, 0) / ids.length;
  const cz = ids.reduce((sum, id) => sum + pose[id].z, 0) / ids.length;
  for (const id of ids) {
    pose[id] = {
      ...pose[id],
      x: cx + (pose[id].x - cx) * tighten,
      y: cy + (pose[id].y - cy) * tighten,
      z: cz + (pose[id].z - cz) * tighten,
    };
  }
  const dx = base.x - base.tx;
  const dy = base.y - base.ty;
  const dz = base.z - base.tz;
  const length = Math.hypot(dx, dy, dz) || 1;
  const dir = { x: dx / length, y: dy / length, z: dz / length };
  const safeAspect = Math.max(0.4, aspect);
  const fits = (distance: number) => {
    const camera: CameraPose = {
      x: base.tx + dir.x * distance,
      y: base.ty + dir.y * distance,
      z: base.tz + dir.z * distance,
      tx: base.tx,
      ty: base.ty,
      tz: base.tz,
    };
    const width = safeAspect * 100;
    for (const id of CATEGORY_IDS) {
      const part = pose[id];
      const samples = [
        part,
        { ...part, x: part.x - 0.58 },
        { ...part, x: part.x + 0.58 },
        { ...part, y: part.y + 0.42 },
      ];
      for (const sample of samples) {
        const point = projectPart(sample, camera, width, 100);
        const ndcX = (point.x / width) * 2 - 1;
        const ndcY = 1 - (point.y / 100) * 2;
        if (Math.abs(ndcX) > 0.9 || ndcY > 0.88 || ndcY < -0.9) return false;
      }
    }
    return true;
  };
  let near = length * 0.38;
  let far = length * 2.4;
  if (!fits(far)) return { ...base, x: base.tx + dir.x * far, y: base.ty + dir.y * far, z: base.tz + dir.z * far };
  if (!fits(near)) {
    for (let step = 0; step < 16; step += 1) {
      const mid = (near + far) / 2;
      if (fits(mid)) far = mid;
      else near = mid;
    }
    near = far;
  }
  return {
    x: base.tx + dir.x * near,
    y: base.ty + dir.y * near,
    z: base.tz + dir.z * near,
    tx: base.tx,
    ty: base.ty,
    tz: base.tz,
  };
}
