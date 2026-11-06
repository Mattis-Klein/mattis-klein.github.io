import { categories, type CategoryId } from "../content";
import { ArrowIcon, CategoryIcon } from "./Icons";

type CategoriesProps = {
  openId: CategoryId | null;
  onToggle: (id: CategoryId) => void;
  onInquire: (title: string) => void;
};

export function Categories({ openId, onToggle, onInquire }: CategoriesProps) {
  return (
    <section className="section section-mist" id="categories" aria-labelledby="categories-title" data-reveal tabIndex={-1}>
      <div className="section-head">
        <p className="eyebrow">
          <span className="eyebrow-mark" aria-hidden="true" />
          Product categories
        </p>
        <h2 id="categories-title">Five groups of equipment.</h2>
        <p className="lede">
          MHM Global distributes and sells low-voltage technology for homes, businesses, and buildings.
          Open a category to see what is supplied, then start a business inquiry if you want to ask about
          a purchase.
        </p>
      </div>
      <div className="cat-grid">
        {categories.map((category) => {
          const open = openId === category.id;
          const panelId = `category-${category.id}-panel`;
          const buttonId = `category-${category.id}-toggle`;
          return (
            <article
              key={category.id}
              id={`category-${category.id}`}
              className={category.id === "surveillance" ? "cat-card feature" : "cat-card"}
            >
              <div className="cat-top">
                <span className="cat-index">{category.index}</span>
                <CategoryIcon id={category.id} />
              </div>
              <h3>{category.title}</h3>
              <p>{category.summary}</p>
              <button
                id={buttonId}
                className="text-btn"
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => onToggle(category.id)}
              >
                {open ? "Hide details" : "Range details"}
                <ArrowIcon />
              </button>
              <div className={open ? "range open" : "range"} id={panelId}>
                <div className="range-inner" inert={open ? undefined : true}>
                  <p className="range-label">Supplied</p>
                  <ul>
                    {category.supplies.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="range-note">{category.note}</p>
                  <button type="button" className="btn btn-primary btn-small" onClick={() => onInquire(category.title)}>
                    Inquire about {category.title}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
