import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories } from "../content";
import { reducedMotion } from "../lib/motion";
import { matrixScatter } from "../lib/sequences";
import { ArrowIcon } from "./Icons";
import { SculptForm } from "./SculptForm";

gsap.registerPlugin(ScrollTrigger);

type MatrixSequenceProps = {
  onInquire: () => void;
};

export function MatrixSequence({ onInquire }: MatrixSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion()) return;

    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", root);
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "matrix",
          trigger: root,
          start: "top top",
          end: "+=110%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo(
        "[data-matrix-title]",
        { y: 56, scale: 1.12 },
        { y: 0, scale: 1, duration: 0.55, ease: "power2.out", transformOrigin: "left center" },
        0,
      );
      timeline.fromTo(
        "[data-matrix-copy]",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power1.out" },
        0.18,
      );

      cells.forEach((cell) => {
        const index = Number(cell.dataset.index ?? 0);
        const row = Number(cell.dataset.row ?? 0) === 0 ? 0 : 1;
        const scatter = matrixScatter(index, row);
        timeline.fromTo(
          cell,
          { x: scatter.x, y: scatter.y, rotation: scatter.r, scale: 0.72 },
          { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: "power3.inOut" },
          0.08 + index * 0.03,
        );
      });

      timeline.fromTo(
        "[data-bridge]",
        { scaleY: 0 },
        { scaleY: 1, duration: 0.45, ease: "power2.inOut", stagger: 0.04 },
        0.42,
      );
      timeline.fromTo(
        "[data-matrix-label]",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 },
        0.5,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="matrix" id="wholesale" ref={rootRef} aria-labelledby="wholesale-title">
      <div className="matrix-viewport">
        <div className="matrix-copy">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Wholesale
          </p>
          <h2 id="wholesale-title" data-matrix-title>
            For business buyers.
          </h2>
          <div data-matrix-copy>
            <p className="lede">
              The same low-voltage equipment, supplied to commercial buyers. Tell us what you need.
              Pricing and availability are discussed directly.
            </p>
            <p className="quiet">
              This page does not publish programs, minimums, special pricing, or stock commitments.
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
        </div>
        <div className="matrix-board" aria-hidden="true">
          <p className="matrix-label" data-matrix-label>
            Retail
          </p>
          <div className="matrix-row">
            {categories.map((category, index) => (
              <div key={`r-${category.id}`} className="matrix-cell" data-cell data-index={index} data-row="0">
                <SculptForm id={category.id} />
              </div>
            ))}
          </div>
          <div className="matrix-bridges">
            {categories.map((category) => (
              <span key={category.id} data-bridge />
            ))}
          </div>
          <p className="matrix-label" data-matrix-label>
            Wholesale
          </p>
          <div className="matrix-row">
            {categories.map((category, index) => (
              <div key={`w-${category.id}`} className="matrix-cell" data-cell data-index={index} data-row="1">
                <SculptForm id={category.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
