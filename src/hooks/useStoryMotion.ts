import { useEffect, useState, type RefObject } from "react";
import { CATEGORY_IDS } from "../content";
import { FLIGHT_SIZE, LATTICE } from "../lib/lattice";
import { railProgress } from "../lib/categoryStage";
import {
  flightArc,
  flightLayerOpacity,
  mixPose,
  moduleT,
  scrubProgress,
  staticOpacity,
  storyBounds,
  storyProgress,
} from "../lib/story";

function resetMotion(scope: HTMLElement) {
  scope.style.setProperty("--story", "1");
  scope.classList.remove("is-story", "is-compact-story");
  document.querySelectorAll<HTMLElement>("[data-scrub]").forEach((node) => {
    node.style.setProperty("--scrub", "1");
  });
  const art = document.querySelector<HTMLElement>(".lattice-art");
  const flight = document.querySelector<HTMLElement>(".flight-layer");
  const stage = document.getElementById("supply-stage");
  if (art) art.style.opacity = "1";
  stage?.style.setProperty("--spread", "0");
  stage?.style.setProperty("--px", "0");
  stage?.style.setProperty("--py", "0");
  document.documentElement.style.setProperty("--rail", "1");
  if (flight) {
    flight.style.visibility = "hidden";
    flight.style.opacity = "0";
  }
}

export function useStoryMotion(scopeRef: RefObject<HTMLElement | null>) {
  const [reduce, setReduce] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    if (reduce) {
      resetMotion(scope);
      return;
    }

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const compactQuery = window.matchMedia("(max-width: 800px)");
    const raf = { current: 0 };
    const listening = { current: false };

    const apply = () => {
      raf.current = 0;
      const compact = compactQuery.matches;
      const viewportHeight = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-scrub]").forEach((node) => {
        node.style.setProperty("--scrub", scrubProgress(node.getBoundingClientRect().top, viewportHeight).toFixed(4));
      });

      const stage = document.getElementById("supply-stage");
      const grid = document.getElementById("category-grid");
      const art = document.querySelector<HTMLElement>(".lattice-art");
      const flight = document.querySelector<HTMLElement>(".flight-layer");
      const hero = document.querySelector(".hero");
      const contact = document.getElementById("contact");
      if (hero && contact) {
        const railStart = hero.getBoundingClientRect().top + window.scrollY + hero.getBoundingClientRect().height * 0.35;
        const railEnd = contact.getBoundingClientRect().top + window.scrollY + 48;
        document.documentElement.style.setProperty("--rail", railProgress(window.scrollY, railStart, railEnd).toFixed(4));
      }
      if (!stage || !grid || !art || !flight) return;

      const gridTop = grid.getBoundingClientRect().top + window.scrollY;
      const bounds = storyBounds(gridTop, viewportHeight);
      const progress = storyProgress(window.scrollY, bounds.start, bounds.end);
      scope.style.setProperty("--story", progress.toFixed(4));
      scope.classList.toggle("is-story", !compact);
      scope.classList.toggle("is-compact-story", compact);
      stage.style.setProperty("--spread", compact ? progress.toFixed(4) : "0");

      const dim = compact ? 1 : staticOpacity(progress);
      art.style.opacity = String(dim);

      const slots = [...document.querySelectorAll<HTMLElement>("[data-module-slot]")];

      const layer = compact ? 0 : flightLayerOpacity(progress);
      const show = layer > 0.01;
      flight.style.visibility = show ? "visible" : "hidden";
      flight.style.opacity = String(layer);
      if (!show) return;

      const stageRect = stage.getBoundingClientRect();
      const slotRects = new Map<string, DOMRect>();
      slots.forEach((slot) => {
        const id = slot.dataset.moduleSlot;
        if (id) slotRects.set(id, slot.getBoundingClientRect());
      });
      flight.querySelectorAll<HTMLElement>("[data-flight]").forEach((node) => {
        const id = node.dataset.flight;
        if (!id) return;
        const spec = LATTICE.modules.find((item) => item.id === id);
        const slotRect = slotRects.get(id);
        const piece = document.querySelector<HTMLElement>(`[data-piece="${id}"]`);
        if (!spec || !slotRect) return;
        const pieceRect = piece?.getBoundingClientRect();
        const from = pieceRect && pieceRect.width > 0
          ? {
              x: pieceRect.left + pieceRect.width / 2,
              y: pieceRect.top + pieceRect.height / 2,
              s: pieceRect.width / FLIGHT_SIZE,
            }
          : {
              x: stageRect.left + (spec.x / 100) * stageRect.width,
              y: stageRect.top + (spec.y / 100) * stageRect.height,
              s: (stageRect.width * spec.size) / LATTICE.width / FLIGHT_SIZE,
            };
        const to = {
          x: slotRect.left + slotRect.width / 2,
          y: slotRect.top + slotRect.height / 2,
          s: Math.min(slotRect.width, slotRect.height) / FLIGHT_SIZE,
        };
        const indexInCatalog = Math.max(0, CATEGORY_IDS.indexOf(spec.id));
        const t = moduleT(progress, indexInCatalog);
        const pose = mixPose(from, to, t);
        const arc = flightArc(t, compact ? 0 : 22);
        node.style.transform = `translate3d(${pose.x}px, ${pose.y + arc}px, 0) translate(-50%, -50%) scale(${pose.s})`;
      });
    };

    const request = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    const onScroll = () => request();
    const setListening = (next: boolean) => {
      if (next && !listening.current) {
        window.addEventListener("scroll", onScroll, { passive: true });
        listening.current = true;
      } else if (!next && listening.current) {
        window.removeEventListener("scroll", onScroll);
        listening.current = false;
      }
    };

    const zones = [
      scope,
      ...document.querySelectorAll<HTMLElement>("[data-scrub]"),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.toggleAttribute("data-hot", entry.isIntersecting);
        });
        const anyHot = zones.some((zone) => zone.hasAttribute("data-hot"));
        setListening(anyHot);
        request();
      },
      { rootMargin: "220px 0px" },
    );
    zones.forEach((zone) => observer.observe(zone));

    const stage = document.getElementById("supply-stage");
    const onMove = (event: PointerEvent) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty("--px", x.toFixed(3));
      stage.style.setProperty("--py", y.toFixed(3));
    };
    const onLeave = () => {
      stage?.style.setProperty("--px", "0");
      stage?.style.setProperty("--py", "0");
    };
    if (fine && stage) {
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
    }

    window.addEventListener("resize", request);
    compactQuery.addEventListener("change", request);
    request();

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      observer.disconnect();
      setListening(false);
      window.removeEventListener("resize", request);
      compactQuery.removeEventListener("change", request);
      stage?.removeEventListener("pointermove", onMove);
      stage?.removeEventListener("pointerleave", onLeave);
      zones.forEach((zone) => zone.removeAttribute("data-hot"));
    };
  }, [reduce, scopeRef]);
}
