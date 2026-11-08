import { lazy, Suspense, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { categories, categoryById, type CategoryId } from "../content";
import { useWide } from "../hooks/useWide";
import { copyOpacity, storyPhase, type StoryBeat } from "../lib/bay";
import { categoryFromKey } from "../lib/categoryStage";
import { scrollToId } from "../lib/motion";
import type { AssemblyHandle } from "../scene/AssemblyCanvas";

const AssemblyCanvas = lazy(() => import("../scene/AssemblyCanvas").then((mod) => ({ default: mod.AssemblyCanvas })));

type SupplyStoryProps = {
  onInquire: (title: string) => void;
  onWholesale: () => void;
};

const SHORT: Record<CategoryId, string> = {
  surveillance: "Surveillance",
  networking: "Networking",
  "smart-home": "Smart home",
  access: "Access",
  safety: "Life safety",
};

export function SupplyStory({ onInquire, onWholesale }: SupplyStoryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const handleRef = useRef<AssemblyHandle | null>(null);
  const wide = useWide();
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(true);
  const [focus, setFocus] = useState<CategoryId>("surveillance");
  const [beat, setBeat] = useState<StoryBeat>("assembly");
  const [pin, setPin] = useState<"start" | "fixed" | "end">("start");
  const motion = wide && !reduced;
  const selected = categoryById(focus) ?? categories[0];

  const onStatus = useCallback((ok: boolean) => setReady(ok), []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const read = () => {
      if (!motion) {
        handleRef.current?.setFrame(0, null);
        setBeat("assembly");
        setPin("start");
        return;
      }
      const sticky = root.querySelector<HTMLElement>(".bay-sticky");
      const nav = 80;
      const stickyH = sticky?.offsetHeight ?? window.innerHeight - nav;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, root.offsetHeight - stickyH);
      const scrolled = Math.min(travel, Math.max(0, nav - rect.top));
      const progress = scrolled / travel;
      const nextPin = rect.bottom <= nav + stickyH ? "end" : rect.top < nav ? "fixed" : "start";
      setPin((current) => (current === nextPin ? current : nextPin));
      handleRef.current?.setFrame(progress, focus);
      const next = storyPhase(progress);
      setBeat((current) => (current === next ? current : next));
      const opacity = copyOpacity(progress);
      root.style.setProperty("--hero-o", opacity.hero.toFixed(3));
      root.style.setProperty("--panel-o", opacity.panel.toFixed(3));
      root.style.setProperty("--routes-o", opacity.routes.toFixed(3));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [focus, motion, ready]);

  function onTabsKey(event: KeyboardEvent<HTMLDivElement>) {
    const next = categoryFromKey(focus, event.key);
    if (!next) return;
    event.preventDefault();
    setFocus(next);
    window.requestAnimationFrame(() => document.getElementById(`station-${next}`)?.focus());
  }

  return (
    <section
      className={`bay${motion ? " is-motion" : ""}${pin === "fixed" ? " is-fixed" : ""}${pin === "end" ? " is-end" : ""}`}
      id="categories"
      data-motion={motion ? "1" : "0"}
      ref={rootRef}
      aria-labelledby="hero-title"
    >
      <div className="bay-sticky">
        <div className="bay-stage">
          {ready ? (
            <Suspense fallback={null}>
              <AssemblyCanvas reduced={!motion} onStatus={onStatus} handleRef={handleRef} />
            </Suspense>
          ) : null}
          {ready ? null : (
            <div className="bay-fallback" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <div className="bay-hero" data-live={beat === "assembly" || beat === "separate" ? "1" : "0"}>
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Low-voltage distribution
          </p>
          <h1 id="hero-title">Equipment, supplied.</h1>
          <p>
            Electronics, equipment, and supplies for homes, businesses, and buildings. Retail and wholesale.
            MHM Global sells the equipment. It does not install it and does not manufacture it.
          </p>
          <div className="bay-jump">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setFocus(category.id);
                  if (motion) scrollToId("categories");
                  else scrollToId(`category-${category.id}`);
                }}
              >
                <b>{category.index}</b>
                {SHORT[category.id]}
              </a>
            ))}
          </div>
        </div>
        <div className="bay-panel" data-live={beat === "stations" ? "1" : "0"} inert={beat === "stations" ? undefined : true}>
          <div
            className="bay-tabs"
            role="tablist"
            aria-label="Product categories"
            onKeyDown={onTabsKey}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                id={`station-${category.id}`}
                type="button"
                role="tab"
                aria-selected={category.id === focus}
                aria-controls="station-panel"
                tabIndex={category.id === focus ? 0 : -1}
                onClick={() => setFocus(category.id)}
              >
                <b>{category.index}</b>
                {SHORT[category.id]}
              </button>
            ))}
          </div>
          <div className="bay-detail" id="station-panel" role="tabpanel" aria-labelledby={`station-${focus}`}>
            <h2>{selected.title}</h2>
            <ul>
              {selected.supplies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{selected.note}</p>
            <button type="button" className="btn btn-primary" onClick={() => onInquire(selected.title)}>
              Inquire about this group
            </button>
          </div>
        </div>
        <div className="bay-routes" id={motion ? "wholesale" : undefined} data-live={beat === "routes" || beat === "reroute" ? "1" : "0"} inert={beat === "routes" ? undefined : true}>
          <div>
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              Retail
            </p>
            <h2>For individuals</h2>
            <p>The same equipment, bought for a home or a smaller space.</p>
          </div>
          <div>
            <p className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true" />
              Wholesale
            </p>
            <h2>For businesses</h2>
            <p>The same range, discussed directly for larger purchasing.</p>
            <button type="button" className="btn btn-primary" onClick={onWholesale}>
              Start a wholesale inquiry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
