import { categories, type Category } from "../content";
import { scrollToId } from "../lib/motion";
import { RingMark } from "./RingMark";

type RangeChapterProps = {
  category: Category;
  onInquire: (title: string) => void;
};

export function RangeChapter({ category, onInquire }: RangeChapterProps) {
  return (
    <section className="chapter" id={`category-${category.id}`} aria-labelledby={`ch-${category.id}`}>
      <div className="chapter-num">
        <p>Range {category.index} of 05</p>
        <strong>{category.index}</strong>
        <nav aria-label="Product categories">
          {categories.map((item) => (
            <a
              key={item.id}
              href={`#category-${item.id}`}
              aria-current={item.id === category.id ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToId(`category-${item.id}`);
              }}
            >
              {item.index}
            </a>
          ))}
        </nav>
        <p>Retail and wholesale</p>
      </div>
      <div className="chapter-spec">
        <h2 id={`ch-${category.id}`}>{category.title}</h2>
        <ul>
          {category.supplies.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{category.note}</p>
        <button type="button" className="btn btn-primary" onClick={() => onInquire(category.title)}>
          Inquire about this group
        </button>
        <div className="chapter-plate" aria-hidden="true">
          <RingMark />
        </div>
      </div>
    </section>
  );
}
