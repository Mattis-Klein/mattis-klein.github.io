import { LATTICE, moduleVector } from "../lib/lattice";
import { SculptForm } from "./SculptForm";

export function LatticeStage() {
  return (
    <div
      className="sculpture"
      id="supply-stage"
      role="img"
      aria-label="A camera, network equipment, a lock, a thermostat, and a detector arranged as one supply range."
    >
      <div className="sculpture-ground" />
      <div className="sculpture-pieces lattice-art">
        {LATTICE.modules.map((mod, index) => {
          const vector = moduleVector(mod);
          return (
            <div
              key={mod.id}
              className="sculpt-piece"
              data-piece={mod.id}
              style={{
                left: `${mod.x}%`,
                top: `${mod.y}%`,
                ["--ox" as string]: vector.ox,
                ["--oy" as string]: vector.oy,
                ["--depth" as string]: mod.depth,
                ["--delay" as string]: `${index * 0.06}s`,
              }}
            >
              <div className="sculpt-assemble">
                <SculptForm id={mod.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
