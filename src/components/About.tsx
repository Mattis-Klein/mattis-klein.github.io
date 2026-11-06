import { categories } from "../content";
import { LATTICE } from "../lib/lattice";
import { LogoMark } from "./Logo";
import { ModuleMark } from "./ModuleMark";

const points = [
  {
    index: "01",
    title: "What we do",
    body: "Distribute and sell low-voltage electronics, equipment, and supplies. Retail and wholesale.",
  },
  {
    index: "02",
    title: "Who it’s for",
    body: "Individual consumers, households, businesses, and wholesale purchasers.",
  },
  {
    index: "03",
    title: "What we don’t do",
    body: "MHM Global is not an installer, a manufacturer, or a security installation company.",
  },
];

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title" data-scrub tabIndex={-1}>
      <div className="about-grid">
        <div className="about-copy">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            About
          </p>
          <div className="about-mark" aria-hidden="true">
            <LogoMark />
          </div>
          <h2 id="about-title">
            <span className="mask">
              <span className="mask-inner">A distributor of electronics, equipment, and supplies.</span>
            </span>
          </h2>
          <p className="lede">
            MHM Global sells security, recording, networking, smart-home, access, and life-safety
            products. People buy for their own spaces, and businesses buy at wholesale.
          </p>
          <p>
            Retail sales are also made through channels such as Amazon and others. A storefront link is
            not published here.
          </p>
        </div>
        <dl className="about-list">
          {points.map((point) => (
            <div key={point.index}>
              <dt>
                <span>{point.index}</span>
                {point.title}
              </dt>
              <dd>{point.body}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="range-strip" aria-hidden="true">
        <span className="range-strip-line" />
        {[...LATTICE.modules].sort((a, b) => a.index.localeCompare(b.index)).map((mod, index) => {
          const category = categories.find((item) => item.id === mod.id);
          return (
            <div key={mod.id} className="range-strip-item" style={{ ["--i" as string]: index }}>
              <ModuleMark id={mod.id} variant="flat" />
              <span className="range-strip-index">{mod.index}</span>
              <span>{category?.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
