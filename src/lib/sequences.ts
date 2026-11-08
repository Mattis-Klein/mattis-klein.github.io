import type { CategoryId } from "../content";

export type Pose = {
  x: number;
  y: number;
  r: number;
  s: number;
};

/** Designed cluster around the core origin. Not a loose scatter of equal icons. */
export const CLUSTER: Record<CategoryId, Pose> = {
  surveillance: { x: -168, y: -36, r: -18, s: 1.22 },
  networking: { x: 156, y: -108, r: 14, s: 1.08 },
  access: { x: -138, y: 118, r: -10, s: 1.02 },
  "smart-home": { x: 168, y: 86, r: 16, s: 0.78 },
  safety: { x: 18, y: 36, r: -4, s: 1.28 },
};

export const CLUSTER_ORDER: CategoryId[] = [
  "safety",
  "networking",
  "access",
  "surveillance",
  "smart-home",
];

export function matrixScatter(index: number, row: 0 | 1): { x: number; y: number; r: number } {
  const angle = [-1.05, -0.55, 0.05, 0.62, 1.15][index] ?? 0;
  const distance = 100 + index * 8;
  const vertical = row === 0 ? -1 : 1;
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance * 0.72 * vertical),
    r: (index - 2) * 9 * vertical,
  };
}

export function clampUnit(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}
