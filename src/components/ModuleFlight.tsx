import { LATTICE } from "../lib/lattice";
import { ModuleMark } from "./ModuleMark";

export function ModuleFlight() {
  return (
    <div className="flight-layer" aria-hidden="true">
      <svg className="flight-routes">
        {LATTICE.modules.map((mod) => (
          <line key={mod.id} data-route={mod.id} x1="0" y1="0" x2="0" y2="0" />
        ))}
      </svg>
      {LATTICE.modules.map((mod) => (
        <div key={mod.id} className="flight-module" data-flight={mod.id}>
          <div data-iso>
            <ModuleMark id={mod.id} variant="iso" />
          </div>
          <div data-flat>
            <ModuleMark id={mod.id} variant="flat" />
          </div>
        </div>
      ))}
    </div>
  );
}
