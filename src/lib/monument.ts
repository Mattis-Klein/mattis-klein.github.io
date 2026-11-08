/** Beats for the opening scrub. Progress is 0 at the hero and 1 on the category spread. */
export function openingPhase(progress: number): "hero" | "travel" | "spread" {
  if (progress < 0.12) return "hero";
  if (progress < 0.78) return "travel";
  return "spread";
}

/** Beats for the later scrub. Progress is 0 on the corner plate and 1 on the split circle. */
export function dividePhase(progress: number): "plate" | "travel" | "split" {
  if (progress < 0.14) return "plate";
  if (progress < 0.78) return "travel";
  return "split";
}
