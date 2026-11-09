import { CATEGORY_IDS, type CategoryId } from "../content";

/** Load-time assembly. Scroll progress stays in charge the moment the page moves. */
export const OPENING_MS = 2100;

const DELAY: Record<CategoryId, number> = {
  surveillance: 0,
  access: 0.1,
  networking: 0.18,
  "smart-home": 0.28,
  safety: 0.38,
};

function smooth(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

export function shouldPlayOpening(input: { scrollY: number; hash: string; reduced: boolean }): boolean {
  if (input.reduced) return false;
  if (input.scrollY > 4) return false;
  const hash = input.hash.replace(/^#/, "");
  if (hash && hash !== "top") return false;
  return true;
}

/** 0 at the first frame, 1 when the entrance has finished. */
export function openingClock(elapsedMs: number): number {
  return smooth(elapsedMs / OPENING_MS);
}

/** 0 while a module is still traveling, 1 once it has reached the hero seat. */
export function partArrival(clock: number, id: CategoryId): number {
  return smooth((clock - DELAY[id]) / 0.62);
}

export function openingLight(clock: number): number {
  const total = CATEGORY_IDS.reduce((sum, id) => sum + partArrival(clock, id), 0);
  return total / CATEGORY_IDS.length;
}

/**
 * Pull a fitted hero point inward and dim it, then release it to the exact seat.
 * Clock 1 returns the fitted point unchanged.
 */
export function seatPoint(
  clock: number,
  id: CategoryId,
  point: { x: number; y: number; scale: number },
  center: { x: number; y: number },
): { x: number; y: number; scale: number; light: number; opacity: number } {
  const seated = partArrival(clock, id);
  const travel = 1 - seated;
  return {
    x: point.x + (center.x - point.x) * 0.46 * travel,
    y: point.y + (center.y - point.y) * 0.46 * travel + 18 * travel,
    scale: point.scale * (0.74 + 0.26 * seated),
    light: 0.62 + 0.38 * seated,
    opacity: 1,
  };
}
