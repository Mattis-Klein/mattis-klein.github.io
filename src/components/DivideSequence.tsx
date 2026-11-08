import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RingMark } from "./RingMark";

gsap.registerPlugin(ScrollTrigger);

type DivideSequenceProps = {
  onInquire: () => void;
};

export function DivideSequence({ onInquire }: DivideSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const desktop = window.matchMedia("(min-width: 900px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || reduce.matches) return;

    const ctx = gsap.context(() => {
      const ring = root.querySelector<HTMLElement>("[data-divide-ring]");
      const center = root.querySelector<HTMLElement>("[data-divide-center]");
      if (!ring || !center) return;

      const measure = () => {
        const previous = ring.style.transform;
        ring.style.transform = "none";
        const from = ring.getBoundingClientRect();
        const to = center.getBoundingClientRect();
        ring.style.transform = previous;
        return {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: Math.min(to.width / from.width, to.height / from.height),
        };
      };
      let landing = measure();

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "divide",
          trigger: root,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            landing = measure();
          },
        },
      });

      timeline.to("[data-divide-kicker]", { y: -30, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.08);
      timeline.to(
        ring,
        {
          x: () => landing.x,
          y: () => landing.y,
          scale: () => landing.scale,
          duration: 0.62,
          ease: "power2.inOut",
        },
        0.1,
      );
      timeline.fromTo(
        ".divide-band",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.48,
      );
      timeline.set("[data-divide-cta]", { pointerEvents: "auto" }, 0.7);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="divide" id="wholesale" ref={rootRef} aria-labelledby="wholesale-title">
      <div className="divide-view">
        <div>
          <p className="eyebrow" data-divide-kicker="">
            <span className="eyebrow-mark" aria-hidden="true" />
            Wholesale
          </p>
          <h2 id="wholesale-title">
            Same range.
            <br />
            Two ways.
          </h2>
        </div>
        <div className="divide-stage">
          <div className="divide-ring" data-divide-ring="">
            <RingMark />
          </div>
          <div className="divide-center" data-divide-center="" aria-hidden="true" />
        </div>
        <div className="divide-band">
          <p className="divide-side" data-side="">
            Retail
            <span>For individuals</span>
          </p>
          <p data-side="">The same equipment, sold both ways. Pricing and availability are discussed directly.</p>
          <p className="divide-side" data-side="">
            Wholesale
            <span>For businesses</span>
          </p>
          <div data-divide-cta="">
            <button type="button" className="btn btn-primary" onClick={onInquire}>
              Start a wholesale inquiry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
