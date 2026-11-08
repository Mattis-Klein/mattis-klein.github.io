import { useEffect, useRef } from "react";
import { CATEGORY_IDS } from "../content";
import { assemblyPose, bayCamera, plinthScale, projectPart, yawIndex, type PartId } from "../lib/bay";
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
      const scales = plinthScale(progress);
      const place = (id: PartId, scale: number, anchor: string) => {
        const node = nodes.current[id];
        if (!node) return;
        const point = projectPart(pose[id], camera, rect.width, rect.height);
        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, ${anchor}) scale(${point.scale * scale})`;
      };
      for (const id of CATEGORY_IDS) {
        place(id, 1, "-78%");
        const image = nodes.current[id]?.querySelector("img");
        if (!image) continue;
        const yaw = String(yawIndex(pose[id].ry));
        if (image.dataset.yaw !== yaw) {
          image.dataset.yaw = yaw;
          image.src = `/bay/${id}-${yaw}.webp`;
        }
      }
      place("plinthA", scales.a, "-50%");
      place("plinthB", Math.max(0.02, scales.b), "-50%");
      const hidden = nodes.current.plinthB;
      if (hidden) hidden.style.opacity = scales.b < 0.08 ? "0" : "1";
    };
    handleRef.current = { setFrame: (progress) => apply(progress) };
    apply(0);
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
      {(["plinthA", "plinthB"] as const).map((id) => (
        <div
          key={id}
          className="bay-plinth"
          ref={(node) => {
            nodes.current[id] = node;
          }}
        />
      ))}
      {CATEGORY_IDS.map((id) => (
        <div
          key={id}
          className="bay-figure"
          ref={(node) => {
            nodes.current[id] = node;
          }}
        >
          <img alt="" data-yaw="0" src={`/bay/${id}-0.webp`} />
        </div>
      ))}
    </div>
  );
}
