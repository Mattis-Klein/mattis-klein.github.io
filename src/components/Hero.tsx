import { useState } from "react";
import { categories, type CategoryId } from "../content";
import { ArrowIcon } from "./Icons";
import { LatticeStage } from "./LatticeStage";

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
        <p className="eyebrow">
          <span className="eyebrow-mark" aria-hidden="true" />
          Low-voltage distribution
        </p>
        <h1 id="hero-title">
          <span className="line">
            <span>Supplied for</span>
          </span>
          <span className="line">
            <span>
              every space<span className="dot">.</span>
            </span>
          </span>
        </h1>
        <p className="lede">
          MHM Global distributes and sells low-voltage electronics, equipment, and supplies for
          individuals and businesses. Surveillance, networking, smart home, access, and life safety
          belong to one range.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#categories">
            Explore the range
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
            Wholesale inquiries
          </a>
        </div>
        <p className="hero-meta">Retail and wholesale · Not an installer or manufacturer</p>
      </div>

      <div className="sheet">
        <LatticeStage
          activeId={activeId}
          onToggle={(id) => setActiveId((current) => (current === id ? null : id))}
        />
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
              Select a module in the range. Each mark is a kind of equipment MHM Global sells — not a
              system we install.
            </p>
          )}
        </div>
        <div className="sheet-meta">
          <span>Supply range</span>
          <span>Five groups</span>
        </div>
      </div>
    </section>
  );
}
