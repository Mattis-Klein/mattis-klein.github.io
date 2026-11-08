import { useEffect, useState } from "react";
import { categories } from "../content";
import { useWide } from "../hooks/useWide";

type RangeIndexProps = {
  onInquire: (title: string) => void;
  onWholesale: () => void;
};

export function RangeIndex({ onInquire, onWholesale }: RangeIndexProps) {
  const wide = useWide();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const motion = wide && !reduced;
  return (
    <>
      <section className="spec-index" aria-labelledby="spec-title">
        <div className="spec-intro">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            The range
          </p>
          <h2 id="spec-title">Five groups, one distributor.</h2>
          <p>
            Surveillance, networking, access, and life safety sit alongside smart home. Smart home is one
            group in the range, not the whole business. Everything here is sold as equipment. The pictures
            illustrate those groups. They are not products manufactured by MHM Global.
          </p>
        </div>
        <div className="spec-list">
          {categories.map((category) => (
            <article key={category.id} id={`category-${category.id}`}>
              <p>{category.index}</p>
              <div>
                <h3>{category.title}</h3>
                <p>{category.summary}</p>
                <ul>
                  {category.supplies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="spec-note">{category.note}</p>
                <button type="button" className="btn btn-primary" onClick={() => onInquire(category.title)}>
                  Inquire about this group
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="routes-note" id={motion ? undefined : "wholesale"} aria-labelledby="routes-title">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            How it is sold
          </p>
          <h2 id="routes-title">Retail and wholesale.</h2>
          <p>
            Individuals and businesses buy from the same range. Wholesale terms are discussed directly.
            Nothing on this page is a live catalog or a price list.
          </p>
          <button type="button" className="btn btn-primary" onClick={onWholesale}>
            Start a wholesale inquiry
          </button>
        </div>
      </section>
    </>
  );
}
