export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToId(id: string, behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth"): void {
  const story = document.getElementById("categories");
  if (story?.dataset.motion === "1" && (id === "categories" || id === "wholesale")) {
    const sticky = story.querySelector<HTMLElement>(".bay-sticky");
    const stickyH = sticky?.offsetHeight ?? window.innerHeight;
    const travel = Math.max(1, story.offsetHeight - stickyH);
    const start = story.getBoundingClientRect().top + window.scrollY;
    const portion = id === "wholesale" ? 0.93 : 0.52;
    window.scrollTo({ top: start + travel * portion, behavior });
    return;
  }
  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior, block: "start" });
}
