import { useEffect, useRef } from "react";
import { CATEGORY_IDS } from "../content";
import { assemblyPose, bayCamera, projectPart, yawBlend, type PartId } from "../lib/bay";
import type { AssemblyHandle } from "./AssemblyCanvas";

type BayFiguresProps = {
  handleRef: { current: AssemblyHandle | null };
};

export function BayFigures({ handleRef }: BayFiguresProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Partial<Record<PartId, HTMLDivElement | null>>>({});

  useEffect(() => {
    let last = Number.NaN;
    const apply = (progress: number, force = false) => {
      if (!force && Math.abs(progress - last) < 0.0004) return;
      last = progress;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const pose = assemblyPose(progress);
      const camera = bayCamera(progress);
      for (const id of CATEGORY_IDS) {
        const node = nodes.current[id];
        if (!node) continue;
        const point = projectPart(pose[id], camera, rect.width, rect.height);
        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -78%) scale(${point.scale})`;
        const blend = yawBlend(pose[id].ry);
        const images = node.querySelectorAll("img");
        const sources = [String(blend.lo), String(blend.hi)];
        images.forEach((image, index) => {
          if (image.dataset.yaw !== sources[index]) {
            image.dataset.yaw = sources[index];
            image.src = `/bay/${id}-${sources[index]}.webp`;
          }
          image.style.opacity = index === 0 ? String(1 - blend.mix) : String(blend.mix);
        });
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
