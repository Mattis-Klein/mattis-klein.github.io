import { ArrowIcon } from "./Icons";
import { LatticeStage } from "./LatticeStage";

type HeroProps = {
  onWholesale: () => void;
};

export function Hero({ onWholesale }: HeroProps) {
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
          Electronics, equipment, and supplies for individuals and for businesses. One range, sold at
          retail and wholesale.
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
      </div>
      <LatticeStage />
    </section>
  );
}
