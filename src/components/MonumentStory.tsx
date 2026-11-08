import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, type Category } from "../content";
import { reducedMotion, scrollToId } from "../lib/motion";
import { RingMark } from "./RingMark";

gsap.registerPlugin(ScrollTrigger);

type MonumentStoryProps = {
  onInquire: (title: string) => void;
  onWholesale: () => void;
};

const FIRST = categories[0];

export function MonumentStory({ onInquire, onWholesale }: MonumentStoryProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const desktop = window.matchMedia("(min-width: 900px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || reduce.matches) {
      document.documentElement.classList.remove("is-monument");
      return;
    }
    document.documentElement.classList.add("is-monument");

    let ctx = gsap.context(() => {
      /* replaced below */
    }, root);

    const build = () => {
      ctx.revert();
      ctx = gsap.context(() => {
        const ring = root.querySelector<HTMLElement>("[data-ring]");
        const plate = root.querySelector<HTMLElement>("[data-plate]");
        if (!ring || !plate) return;

        const measure = () => {
          const previous = ring.style.transform;
          ring.style.transform = "none";
          const from = ring.getBoundingClientRect();
          const to = plate.getBoundingClientRect();
          ring.style.transform = previous;
          const scale = Math.min(to.width / from.width, to.height / from.height);
          return {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale,
          };
        };
        let landing = measure();

        const timeline = gsap.timeline({
          scrollTrigger: {
            id: "monument",
            trigger: root,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.45,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              landing = measure();
            },
          },
        });

        timeline.to(".mon-hero", { y: -36, opacity: 0, duration: 0.4, ease: "power2.in" }, 0.08);
        timeline.to(
          ring,
          {
            x: () => landing.x,
            y: () => landing.y,
            scale: () => landing.scale,
            duration: 0.55,
            ease: "power2.inOut",
          },
          0.12,
        );
        timeline.to("[data-crops]", { opacity: 1, duration: 0.3 }, 0.4);
        timeline.fromTo(
          "[data-spread]",
          { opacity: 0 },
          { opacity: 1, duration: 0.32, ease: "power1.out" },
          0.38,
        );
        timeline.fromTo(
          "[data-num]",
          { scale: 0.2, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
          0.34,
        );
        timeline.fromTo(
          "[data-spec]",
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" },
          0.46,
        );
        timeline.set("[data-spread]", { pointerEvents: "auto" }, 0.62);
      }, root);
    };

    build();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const onDesktop = () => {
      if (!desktop.matches || reduce.matches) {
        ctx.revert();
        document.documentElement.classList.remove("is-monument");
      }
    };
    desktop.addEventListener("change", onDesktop);
    reduce.addEventListener("change", onDesktop);

    return () => {
      window.removeEventListener("load", onLoad);
      desktop.removeEventListener("change", onDesktop);
      reduce.removeEventListener("change", onDesktop);
      ctx.revert();
      document.documentElement.classList.remove("is-monument");
    };
  }, []);

  return (
    <section className="mon" id="categories" ref={rootRef} aria-labelledby="hero-title">
      <div className="mon-view">
        <div className="ring-mover" data-ring>
          <RingMark />
        </div>
        <div className="mon-hero">
          <div className="mon-words">
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              Low-voltage distribution
            </p>
            <h1 id="hero-title">
              <span data-supply="">Supply</span>
              <span data-range-line="">
                the <em>range.</em>
              </span>
            </h1>
          </div>
          <div className="mon-foot" data-hero-foot="">
            <p>Low-voltage electronics, equipment, and supplies. Sold to individuals and to businesses.</p>
            <div className="mon-index">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={category.id === FIRST.id ? "#categories" : `#category-${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    if (category.id === FIRST.id) {
                      const trigger = ScrollTrigger.getById("monument");
                      if (trigger && !reducedMotion()) {
                        const top = trigger.start + (trigger.end - trigger.start) * 0.92;
                        window.scrollTo({ top, behavior: "smooth" });
                        return;
                      }
                    }
                    scrollToId(category.id === FIRST.id ? "categories" : `category-${category.id}`);
                  }}
                >
                  <b>{category.index}</b>
                  <span>{shortName(category)}</span>
                </a>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={onWholesale}>
              Business inquiries
            </button>
          </div>
        </div>
        <div className="spread" data-spread="" id="category-surveillance">
          <div className="spread-num">
            <p>Range 01 of 05</p>
            <strong data-num="">{FIRST.index}</strong>
            <nav aria-label="Product categories">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={category.id === FIRST.id ? "#categories" : `#category-${category.id}`}
                  aria-current={category.id === FIRST.id ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId(category.id === FIRST.id ? "categories" : `category-${category.id}`);
                  }}
                >
                  {category.index}
                </a>
              ))}
            </nav>
            <p>Retail and wholesale</p>
          </div>
          <div className="spread-spec" data-spec="">
            <h2 id="ch-surveillance">{FIRST.title}</h2>
            <ul>
              {FIRST.supplies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{FIRST.note}</p>
            <button type="button" className="btn btn-primary" onClick={() => onInquire(FIRST.title)}>
              Inquire about this group
            </button>
            <div className="spread-plate" data-plate="" aria-hidden="true">
              <RingMark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function shortName(category: Category): string {
  if (category.id === "surveillance") return "Surveillance";
  if (category.id === "networking") return "Networking";
  if (category.id === "smart-home") return "Smart home";
  if (category.id === "access") return "Access";
  return "Life safety";
}
