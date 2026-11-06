export type Point = {
  x: number;
  y: number;
  s: number;
};

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge1 === edge0) return value >= edge1 ? 1 : 0;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function storyBounds(gridTop: number, viewportHeight: number): { start: number; end: number } {
  const start = Math.max(0, gridTop - viewportHeight * 1.05);
  const end = Math.max(start + 180, gridTop - viewportHeight * 0.58);
  return { start, end };
}

export function storyProgress(scrollY: number, start: number, end: number): number {
  if (end <= start) return scrollY >= end ? 1 : 0;
  return clamp01((scrollY - start) / (end - start));
}

export function scrubProgress(top: number, viewportHeight: number): number {
  const start = viewportHeight * 0.92;
  const end = viewportHeight * 0.38;
  if (start === end) return 1;
  return clamp01((start - top) / (start - end));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function mixPose(from: Point, to: Point, t: number): Point {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    s: lerp(from.s, to.s, t),
  };
}

/** Catalog order peels apart slightly, and every module has arrived by progress 1. */
export function moduleT(progress: number, index: number): number {
  const lead = Math.max(0, index) * 0.045;
  const span = 1 - lead;
  return smoothstep(0, 1, clamp01((progress - lead) / span));
}

export function flightArc(t: number, amplitude = 36): number {
  return -Math.sin(Math.PI * clamp01(t)) * amplitude;
}

export function staticOpacity(progress: number): number {
  return 1 - smoothstep(0.04, 0.22, progress);
}

export function flightLayerOpacity(progress: number): number {
  return smoothstep(0.04, 0.14, progress) * (1 - smoothstep(0.86, 0.98, progress));
}

/** Category marks stay on the cards. The flight dissolves into them; it does not blank them. */
export function glyphOpacity(progress: number): number {
  if (progress <= 0 || progress >= 1) return 1;
  return 1;
}
