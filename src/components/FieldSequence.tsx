import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CategoryId } from "../content";
import { reducedMotion } from "../lib/motion";
import { CLUSTER, CLUSTER_ORDER } from "../lib/sequences";
import { Categories } from "./Categories";
import { SculptForm } from "./SculptForm";
import { ArrowIcon } from "./Icons";

gsap.registerPlugin(ScrollTrigger);

type FieldSequenceProps = {
  wide: boolean;
  openId: CategoryId;
  onSelect: (id: CategoryId) => void;
  onInquire: (title: string) => void;
  onWholesale: () => void;
};

export function FieldSequence({ wide, openId, onSelect, onInquire, onWholesale }: FieldSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion()) {
      document.documentElement.classList.remove("is-motion");
      return;
    }
    document.documentElement.classList.add("is-motion");
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const core = root.querySelector<HTMLElement>("[data-core]");
      const pieces = gsap.utils.toArray<HTMLElement>("[data-piece]", root);
      const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduceQuery.matches) return;

      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onMove = (event: PointerEvent) => {
        if (!core || (ScrollTrigger.getById("field")?.progress ?? 0) > 0.04) return;
        const rect = core.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(core, {
          rotateX: py * -7,
          rotateY: px * 9,
          transformPerspective: 1100,
          duration: 0.7,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const onLeave = () => {
        if (!core) return;
        gsap.to(core, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power2.out", overwrite: "auto" });
      };
      if (fine && core) {
        core.addEventListener("pointermove", onMove);
        core.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          core.removeEventListener("pointermove", onMove);
          core.removeEventListener("pointerleave", onLeave);
        });
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          id: "field",
          trigger: root,
          start: "top top",
          end: wide ? "+=140%" : "+=80%",
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.04 && core) gsap.set(core, { rotateX: 0, rotateY: 0 });
          },
        },
      });

      timeline.to("[data-hero-line]", { y: wide ? -90 : -48, opacity: 0, duration: 0.38, ease: "power2.in" }, 0.08);
      timeline.to("[data-hero-sub]", { y: -28, opacity: 0, duration: 0.32, ease: "power2.in" }, 0.12);
      timeline.to("[data-hero-ui]", { y: 16, opacity: 0, duration: 0.24, ease: "power1.in" }, 0.05);

      pieces.forEach((piece) => {
        const id = piece.dataset.piece as CategoryId;
        const start = CLUSTER[id];
        timeline.fromTo(
          piece,
          { x: start.x, y: start.y, rotation: start.r, scale: start.s },
          {
            x: () => landing(piece, id, wide).x,
            y: () => landing(piece, id, wide).y,
            rotation: 0,
            scale: () => landing(piece, id, wide).s,
            duration: 0.62,
            ease: "power2.inOut",
          },
          0.16,
        );
      });

      if (wide) {
        timeline.to("[data-range]", { opacity: 1, duration: 0.28, ease: "power1.out" }, 0.62);
        timeline.set("[data-range]", { pointerEvents: "auto" }, 0.78);
        timeline.to(pieces, { opacity: 0, duration: 0.18, ease: "power1.in" }, 0.8);
      } else {
        timeline.to(pieces, { opacity: 0.2, duration: 0.2 }, 0.72);
      }

      }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      cleanups.forEach((fn) => fn());
      window.removeEventListener("load", onLoad);
      ctx.revert();
      document.documentElement.classList.remove("is-motion");
    };
  }, [wide]);

  return (
    <section className="field" id={wide ? "categories" : undefined} ref={rootRef} aria-labelledby="hero-title">
      <div className="field-viewport">
        <div className="field-hero">
          <div className="field-copy">
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              Low-voltage distribution
            </p>
            <h1 id="hero-title">
              <span className="display-sup" data-hero-line>
                Supplied
              </span>
              <span className="display-sub" data-hero-sub>
                for every space<span className="dot">.</span>
              </span>
            </h1>
          </div>
          <div className="core-wrap">
            <div className="core" data-core>
              <div className="core-plate" aria-hidden="true">
                <span />
              </div>
              {CLUSTER_ORDER.map((id) => (
                <div key={id} className="piece" data-piece={id}>
                  <SculptForm id={id} />
                </div>
              ))}
            </div>
          </div>
          <div className="field-foot" data-hero-ui>
            <p className="lede">
              Electronics, equipment, and supplies. Sold at retail and at wholesale.
            </p>
            <div className="hero-actions">
              <a
                className="btn btn-primary"
                href="#categories"
                onClick={(event) => {
                  const trigger = ScrollTrigger.getById("field");
                  if (!trigger || reducedMotion()) return;
                  event.preventDefault();
                  window.scrollTo({ top: Math.max(0, trigger.end - 4), behavior: "smooth" });
                }}
              >
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
        </div>
        {wide ? (
          <div className="field-range" data-range>
            <Categories mode="overlay" openId={openId} onSelect={onSelect} onInquire={onInquire} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function landing(piece: HTMLElement, id: CategoryId, wide: boolean): { x: number; y: number; s: number } {
  const origin = piece.offsetParent?.getBoundingClientRect();
  const pieceWidth = piece.offsetWidth || 220;
  if (!origin) return { x: CLUSTER[id].x, y: CLUSTER[id].y, s: 0.4 };
  const originX = origin.left + origin.width / 2;
  const originY = origin.top + origin.height / 2;
  if (!wide) {
    const spread = 1.65;
    return { x: CLUSTER[id].x * spread, y: CLUSTER[id].y * spread, s: 0.72 };
  }
  const slot =
    id === "surveillance"
      ? document.querySelector<HTMLElement>("[data-stage-art]")
      : document.querySelector<HTMLElement>(`[data-module-slot="${id}"]`);
  if (!slot) return { x: CLUSTER[id].x * 1.8, y: CLUSTER[id].y * 1.4, s: 0.45 };
  const rect = slot.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - originX,
    y: rect.top + rect.height / 2 - originY,
    s: Math.max(0.28, Math.min(rect.width, rect.height) / Math.max(pieceWidth, 1)),
  };
}
