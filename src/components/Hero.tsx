import { useState } from "react";
import { categories, type CategoryId } from "../content";
import { buildScene } from "../lib/sceneModel";
import { ArrowIcon } from "./Icons";

const scene = buildScene();

type HeroProps = {
  onWholesale: () => void;
  onShowCategory: (id: CategoryId) => void;
  onInquire: (title: string) => void;
};

export function Hero({ onWholesale, onShowCategory, onInquire }: HeroProps) {
  const [activeId, setActiveId] = useState<CategoryId | null>(null);
  const active = categories.find((category) => category.id === activeId) ?? null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow rise">
          <span className="eyebrow-mark" aria-hidden="true" />
          Low-voltage distribution
        </p>
        <h1 id="hero-title">
          Technology for Every Space<span className="dot">.</span>
        </h1>
        <p className="lede">
          Security, connectivity, and smart-building technology for homes and businesses. Supplied by
          MHM Global.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#categories">
            Explore Our Products
            <ArrowIcon />
          </a>
          <a
            className="btn btn-secondary"
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              onWholesale();
            }}
          >
            Wholesale Inquiries
          </a>
        </div>
        <p className="hero-meta">Retail and wholesale · Homes, businesses, and buildings</p>
      </div>

      <div className="sheet">
        <div className="scene-canvas" style={{ aspectRatio: `${scene.width} / ${scene.height}` }}>
          <svg
            className="scene-svg"
            viewBox={`0 0 ${scene.width} ${scene.height}`}
            role="img"
            aria-label="Architectural study of a home linked to a larger building, with five supply points."
          >
            <g transform={scene.transform}>
              {scene.shapes.map((shape, index) => (
                <path
                  key={index}
                  d={shape.d}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.sw}
                  strokeOpacity={shape.strokeOpacity}
                  strokeLinejoin="miter"
                />
              ))}
              {scene.routes.map((route, index) => (
                <path key={`route-${index}`} className="route" d={route} pathLength={1} />
              ))}
              {scene.labels.map((label) => (
                <text
                  key={label.text}
                  className="scene-label"
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor ?? "start"}
                >
                  {label.text}
                </text>
              ))}
            </g>
          </svg>
          {scene.hotspots.map((spot) => {
            const category = categories.find((item) => item.id === spot.id);
            if (!category) return null;
            const pressed = activeId === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                className="hotspot"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-pressed={pressed}
                aria-controls="scene-readout"
                onClick={() => setActiveId(pressed ? null : spot.id)}
              >
                <span aria-hidden="true">{spot.index}</span>
                <span className="sr-only">
                  {category.title}. {pressed ? "Hide details" : "Show details"}
                </span>
              </button>
            );
          })}
        </div>
        <div id="scene-readout" className="readout" aria-live="polite">
          {active ? (
            <>
              <p className="readout-kicker">
                {active.index} · {active.title}
              </p>
              <p>{active.point}</p>
              <div className="readout-actions">
                <button type="button" className="btn btn-primary btn-small" onClick={() => onShowCategory(active.id)}>
                  Show category
                </button>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => onInquire(active.title)}>
                  Inquire
                </button>
              </div>
            </>
          ) : (
            <p>
              Select a numbered point on the drawing. Each mark is a kind of low-voltage technology MHM
              Global supplies — not a project we install.
            </p>
          )}
        </div>
        <div className="sheet-meta">
          <span>Connected volumes</span>
          <span>Not to scale</span>
        </div>
      </div>
    </section>
  );
}
