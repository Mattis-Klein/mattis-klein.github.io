import { useEffect, useRef } from "react";
import { CATEGORY_IDS } from "../content";
import { assemblyPose, bayCamera, fitFigures, projectPart, yawFrame, type PartId } from "../lib/bay";
import { seatPoint, shouldPlayOpening } from "../lib/opening";
import type { AssemblyHandle } from "./AssemblyCanvas";

type BayFiguresProps = {
  handleRef: { current: AssemblyHandle | null };
};

export function BayFigures({ handleRef }: BayFiguresProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Partial<Record<PartId, HTMLDivElement | null>>>({});

  useEffect(() => {
    let last = Number.NaN;
    let lastOpen = 1;
    let crisp = false;
    let snapTimer = 0;
    const apply = (progress: number, force = false, settle = false, opening?: number) => {
      const root = rootRef.current;
      if (!root) return;
      const clock = opening === undefined ? lastOpen : opening;
      const delta = Math.abs(progress - last);
      const openDelta = Math.abs(clock - lastOpen);
      const moving = !settle && !Number.isNaN(last) && delta >= 0.0004;
      if (!force && !moving && crisp && delta < 0.0004 && openDelta < 0.002) return;
      last = progress;
      lastOpen = clock;
      const rect = root.getBoundingClientRect();
      const pose = assemblyPose(progress);
      const camera = bayCamera(progress);
      const fitted = fitFigures(
        CATEGORY_IDS.map((id) => ({ id, ...projectPart(pose[id], camera, rect.width, rect.height) })),
        rect.width,
        rect.height,
      );
      const gathering = clock < 0.999 && progress < 0.004;
      const center = fitted.reduce(
        (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
        { x: 0, y: 0 },
      );
      center.x /= fitted.length;
      center.y /= fitted.length;
      root.dataset.posed = "1";
      for (const point of fitted) {
        const node = nodes.current[point.id];
        if (!node) continue;
        const seated = gathering ? seatPoint(clock, point.id, point, center) : null;
        const x = seated ? seated.x : point.x;
        const y = seated ? seated.y : point.y;
        const scale = seated ? seated.scale : point.scale;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -78%) scale(${scale})`;
        node.style.opacity = seated ? String(seated.opacity) : "";
        node.style.filter = seated ? `brightness(${seated.light})` : "";
        const blend = yawFrame(pose[point.id].ry, moving && !gathering);
        const images = node.querySelectorAll("img");
        const sources = [String(blend.lo), String(blend.hi)];
        images.forEach((image, index) => {
          if (image.dataset.yaw !== sources[index]) {
            image.dataset.yaw = sources[index];
            image.src = `/bay/${point.id}-${sources[index]}.webp`;
          }
          image.style.opacity = index === 0 ? String(1 - blend.mix) : String(blend.mix);
        });
      }
      if (moving) {
        crisp = false;
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(() => apply(last, true, true), 90);
      } else {
        crisp = true;
      }
    };
    handleRef.current = {
      setFrame: (progress, _focus, opening = 1) => apply(progress, false, false, opening),
    };
    const play = shouldPlayOpening({
      scrollY: window.scrollY,
      hash: window.location.hash,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    apply(0, true, false, play ? 0 : 1);
    window.setTimeout(() => {
      for (const id of CATEGORY_IDS) {
        for (let step = 0; step < 12; step += 1) {
          const image = new Image();
          image.src = `/bay/${id}-${step}.webp`;
        }
      }
    });
    const observer = new ResizeObserver(() => {
      apply(Number.isNaN(last) ? 0 : last, true);
    });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      window.clearTimeout(snapTimer);
      handleRef.current = null;
      observer.disconnect();
    };
  }, [handleRef]);

  return (
    <div className="bay-figures" ref={rootRef} aria-hidden="true">
      {CATEGORY_IDS.map((id) => (
        <div
          key={id}
          className="bay-figure"
          ref={(node) => {
            nodes.current[id] = node;
          }}
        >
          <img alt="" data-yaw="0" src={`/bay/${id}-0.webp`} />
          <img alt="" data-yaw="1" src={`/bay/${id}-1.webp`} />
        </div>
      ))}
    </div>
  );
}
