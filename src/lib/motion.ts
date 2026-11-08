import { ScrollTrigger } from "gsap/ScrollTrigger";

export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const SEQUENCE_END: Record<string, string> = {
  categories: "monument",
  "home-story": "monument",
  "category-surveillance": "monument",
  wholesale: "divide",
};

export function scrollToId(id: string, behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth"): void {
  const wide = window.matchMedia("(min-width: 900px)").matches;
  if (!reducedMotion() && wide) {
    const name = SEQUENCE_END[id];
    const trigger = name ? ScrollTrigger.getById(name) : undefined;
    if (trigger) {
      window.scrollTo({ top: Math.max(0, trigger.end - 8), behavior });
      return;
    }
  }
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior, block: "start" });
}
