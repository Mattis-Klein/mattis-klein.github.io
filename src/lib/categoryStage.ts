import { CATEGORY_IDS, type CategoryId } from "../content";

export function categoryFromKey(current: CategoryId, key: string): CategoryId | null {
  const index = CATEGORY_IDS.indexOf(current);
  if (index < 0) return CATEGORY_IDS[0];
  if (key === "ArrowRight" || key === "ArrowDown") {
    return CATEGORY_IDS[(index + 1) % CATEGORY_IDS.length];
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return CATEGORY_IDS[(index - 1 + CATEGORY_IDS.length) % CATEGORY_IDS.length];
  }
  if (key === "Home") return CATEGORY_IDS[0];
  if (key === "End") return CATEGORY_IDS[CATEGORY_IDS.length - 1];
  return null;
}

export function railProgress(scrollY: number, start: number, end: number): number {
  if (end <= start) return scrollY >= end ? 1 : 0;
  const value = (scrollY - start) / (end - start);
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}
