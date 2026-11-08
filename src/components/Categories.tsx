import { useEffect, useState, type KeyboardEvent } from "react";
import { categories, type CategoryId } from "../content";
import { categoryFromKey } from "../lib/categoryStage";
import { SculptForm } from "./SculptForm";

type CategoriesProps = {
  openId: CategoryId;
  onSelect: (id: CategoryId) => void;
  onInquire: (title: string) => void;
  mode?: "section" | "overlay" | "stack";
};

export function Categories({ openId, onSelect, onInquire, mode = "section" }: CategoriesProps) {
  const [autoWide, setAutoWide] = useState(() => window.matchMedia("(min-width: 900px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const onChange = () => setAutoWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const wide = mode === "overlay" ? true : mode === "stack" ? false : autoWide;

  function onTabsKey(event: KeyboardEvent<HTMLDivElement>) {
    const next = categoryFromKey(openId, event.key);
    if (!next) return;
    event.preventDefault();
    onSelect(next);
    window.requestAnimationFrame(() => {
      document.getElementById(`tab-${next}`)?.focus();
    });
  }

  const selected = categories.find((category) => category.id === openId) ?? categories[0];

  const Tag = mode === "overlay" ? "div" : "section";

  return (
    <Tag
      className={mode === "overlay" ? "range-embed" : "section section-mist"}
      id={mode === "overlay" ? undefined : "categories"}
      aria-labelledby="categories-title"
      tabIndex={mode === "overlay" ? undefined : -1}
    >
      <div className="section-head">
        <p className="eyebrow">
          <span className="eyebrow-mark" aria-hidden="true" />
          The range
        </p>
        <h2 id="categories-title">
          <span className="mask">
            <span className="mask-inner">Five groups of equipment.</span>
          </span>
        </h2>
        <p className="lede">
          Cameras and recorders, networking, thermostats, locks, doorbells, and detectors. Choose a group
          to see what is sold.
        </p>
      </div>

      {wide ? (
        <div className="category-stage" id="category-grid">
          <div className="cat-tabs" role="tablist" aria-label="Product categories" onKeyDown={onTabsKey}>
            {categories.map((category) => {
              const selectedTab = category.id === selected.id;
              return (
                <button
                  key={category.id}
                  id={`tab-${category.id}`}
                  className="cat-tab"
                  type="button"
                  role="tab"
                  aria-selected={selectedTab}
                  aria-controls={`panel-${category.id}`}
                  tabIndex={selectedTab ? 0 : -1}
                  onClick={() => onSelect(category.id)}
                >
                  <span className="cat-anchor" data-module-slot={category.id} id={`category-${category.id}`}>
                    <SculptForm id={category.id} />
                  </span>
                  <span className="cat-tab-copy">
                    <span className="cat-index">{category.index}</span>
                    {category.title}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            className="cat-panel"
            role="tabpanel"
            id={`panel-${selected.id}`}
            aria-labelledby={`tab-${selected.id}`}
            key={selected.id}
          >
            <div className="stage-art" data-stage-art>
              <SculptForm id={selected.id} />
            </div>
            <div className="stage-copy">
              <h3>{selected.title}</h3>
              <p>{selected.summary}</p>
              <p className="range-label">Supplied</p>
              <ul>
                {selected.supplies.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="range-note">{selected.note}</p>
              <button type="button" className="btn btn-primary" onClick={() => onInquire(selected.title)}>
                Inquire about {selected.title}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="cat-stack" id="category-grid">
          {categories.map((category) => (
            <article key={category.id} id={`category-${category.id}`} className="stack-panel">
              <div className="stack-art" data-module-slot={category.id}>
                <SculptForm id={category.id} />
              </div>
              <div>
                <p className="cat-index">{category.index}</p>
                <h3>{category.title}</h3>
                <p>{category.summary}</p>
                <ul>
                  {category.supplies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="range-note">{category.note}</p>
                <button type="button" className="btn btn-primary" onClick={() => onInquire(category.title)}>
                  Inquire about {category.title}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Tag>
  );
}
