import { useEffect, useRef } from "react";
import { CATEGORY_IDS } from "../content";
import { assemblyPose, bayCamera, fitFigures, projectPart, yawFrame, type PartId } from "../lib/bay";
import type { AssemblyHandle } from "./AssemblyCanvas";

type BayFiguresProps = {
  handleRef: { current: AssemblyHandle | null };
};

export function BayFigures({ handleRef }: BayFiguresProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Partial<Record<PartId, HTMLDivElement | null>>>({});

  useEffect(() => {
    let last = Number.NaN;
    let crisp = false;
    let snapTimer = 0;
    const apply = (progress: number, force = false, settle = false) => {
      const root = rootRef.current;
      if (!root) return;
      const delta = Math.abs(progress - last);
      const moving = !settle && !Number.isNaN(last) && delta >= 0.0004;
      if (!force && !moving && crisp && delta < 0.0004) return;
      last = progress;
      const rect = root.getBoundingClientRect();
      const pose = assemblyPose(progress);
      const camera = bayCamera(progress);
      const fitted = fitFigures(
        CATEGORY_IDS.map((id) => ({ id, ...projectPart(pose[id], camera, rect.width, rect.height) })),
        rect.width,
        rect.height,
      );
      for (const point of fitted) {
        const node = nodes.current[point.id];
        if (!node) continue;
        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -78%) scale(${point.scale})`;
        const blend = yawFrame(pose[point.id].ry, moving);
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
    handleRef.current = { setFrame: (progress) => apply(progress) };
    apply(0);
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
