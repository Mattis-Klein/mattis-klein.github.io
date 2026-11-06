import { categories, type CategoryId } from "../content";
import { LATTICE, heroField, heroRoutes, moduleVector } from "../lib/lattice";
import { ModuleShapes } from "./ModuleMark";

type LatticeStageProps = {
  activeId: CategoryId | null;
  onToggle: (id: CategoryId) => void;
};

export function LatticeStage({ activeId, onToggle }: LatticeStageProps) {
  const jointX = (LATTICE.joint.x / 100) * LATTICE.width;
  const jointY = (LATTICE.joint.y / 100) * LATTICE.height;

  return (
    <div className="stage-wrap">
      <div className="scene-canvas" id="supply-stage">
        <div className="lattice-art">
          <svg
            className="scene-svg"
            viewBox={`0 0 ${LATTICE.width} ${LATTICE.height}`}
            role="img"
            aria-label="Five equipment groups — surveillance, networking, access, smart home, and life safety — arranged around one supply joint."
          >
            <g className="lattice-field">
              {heroField().map((d, index) => (
                <path key={index} d={d} className={index === 0 ? "field-ground" : "field-line"} />
              ))}
            </g>
            <g className="lattice-routes">
              {heroRoutes().map((d, index) => (
                <path key={index} className="lattice-route" d={d} pathLength={1} />
              ))}
            </g>
            <g className="lattice-joint">
              <circle cx={jointX} cy={jointY} r="16" />
              <circle cx={jointX} cy={jointY} r="5.5" />
            </g>
            {LATTICE.modules.map((mod) => {
              const vector = moduleVector(mod);
              const px = (mod.x / 100) * LATTICE.width;
              const py = (mod.y / 100) * LATTICE.height;
              const scale = mod.size / 160;
              return (
                <g key={mod.id} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${scale.toFixed(3)})`}>
                  <g
                    className="lattice-module-shift"
                    style={{ ["--ox" as string]: vector.ox, ["--oy" as string]: vector.oy, ["--depth" as string]: mod.depth }}
                  >
                    <g transform="translate(-80 -80)">
                      <ModuleShapes id={mod.id} variant="iso" />
                    </g>
                  </g>
                </g>
              );
            })}
          </svg>
          <div className="lattice-tags" aria-hidden="true">
            {LATTICE.modules.map((mod) => (
              <span key={mod.id} className="lattice-tag" style={{ left: `${mod.tagX}%`, top: `${mod.tagY}%` }}>
                <span>{mod.index}</span>
                {mod.short}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="range-index">
        {[...LATTICE.modules].sort((a, b) => a.index.localeCompare(b.index)).map((mod) => {
          const category = categories.find((item) => item.id === mod.id);
          if (!category) return null;
          const pressed = activeId === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              className="range-index-btn"
              style={{ left: `${mod.x}%`, top: `${mod.y}%` }}
              aria-pressed={pressed}
              aria-controls="scene-readout"
              onClick={() => onToggle(mod.id)}
            >
              <span className="range-index-num" aria-hidden="true">
                {mod.index}
              </span>
              <span className="range-index-name">{category.title}</span>
              <span className="sr-only">{pressed ? "Hide details" : "Show details"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
