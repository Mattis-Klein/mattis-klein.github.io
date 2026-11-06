import type { ReactNode } from "react";
import type { CategoryId } from "../content";
import { moduleShapes, type DrawShape } from "../lib/lattice";

function paint(shape: DrawShape, key: number): ReactNode {
  const shared = {
    fill: shape.fill ?? "none",
    stroke: shape.stroke,
    strokeWidth: shape.sw,
    className: shape.draw ? "draw" : undefined,
    pathLength: shape.draw ? 1 : undefined,
  };
  if (shape.kind === "circle") {
    return <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} {...shared} />;
  }
  if (shape.kind === "line") {
    return <line key={key} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} {...shared} />;
  }
  return <path key={key} d={shape.d} {...shared} />;
}

export function ModuleShapes({ id, variant }: { id: CategoryId; variant: "iso" | "flat" }) {
  const join = variant === "flat" ? "round" : "miter";
  const cap = variant === "flat" ? "round" : "butt";
  return (
    <g strokeLinejoin={join} strokeLinecap={cap}>
      {moduleShapes(id, variant).map((shape, index) => paint(shape, index))}
    </g>
  );
}

export function ModuleMark({
  id,
  variant,
  className,
}: {
  id: CategoryId;
  variant: "iso" | "flat";
  className?: string;
}) {
  const size = variant === "iso" ? 160 : 64;
  return (
    <svg className={className ?? "glyph"} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <ModuleShapes id={id} variant={variant} />
    </svg>
  );
}
