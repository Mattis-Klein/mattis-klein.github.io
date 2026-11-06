import { categories } from "../content";
import { ArrowIcon } from "./Icons";
import { ModuleMark } from "./ModuleMark";

type WholesaleProps = {
  onInquire: () => void;
};

export function Wholesale({ onInquire }: WholesaleProps) {
  return (
    <section
      className="section section-mist"
      id="wholesale"
      aria-labelledby="wholesale-title"
      data-scrub
      tabIndex={-1}
    >
      <div className="wholesale-grid">
        <div className="wholesale-copy">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Wholesale
          </p>
          <h2 id="wholesale-title">
            <span className="mask">
              <span className="mask-inner">Wholesale for business buyers.</span>
            </span>
          </h2>
          <p className="lede">
            Commercial buyers and wholesale purchasers can ask about the same low-voltage electronics,
            equipment, and supplies. Describe what you need. Pricing, availability, and order details are
            handled in a direct conversation.
          </p>
          <p className="quiet">
            This page does not publish purchasing programs, order minimums, special pricing, or stock
            commitments.
          </p>
          <a
            className="btn btn-primary"
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              onInquire();
            }}
          >
            Start a wholesale inquiry
            <ArrowIcon />
          </a>
        </div>
        <figure className="channels">
          <div className="channel">
            <p className="channel-label">Retail</p>
            <div className="channel-row" aria-hidden="true">
              {categories.map((category) => (
                <div key={category.id} className="channel-icon">
                  <ModuleMark id={category.id} variant="flat" />
                </div>
              ))}
            </div>
          </div>
          <div className="channel-joint" aria-hidden="true">
            <span />
          </div>
          <div className="channel">
            <p className="channel-label">Wholesale</p>
            <div className="channel-row" aria-hidden="true">
              {categories.map((category) => (
                <div key={category.id} className="channel-icon">
                  <ModuleMark id={category.id} variant="flat" />
                </div>
              ))}
            </div>
          </div>
          <figcaption>The same range, offered to individuals and to businesses.</figcaption>
        </figure>
      </div>
    </section>
  );
}
