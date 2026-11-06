import type { CategoryId } from "../content";
import { categories } from "../content";
import { scrollToId } from "../lib/motion";
import { Logo } from "./Logo";

const links = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "categories", label: "Product Categories" },
  { id: "wholesale", label: "Wholesale" },
  { id: "contact", label: "Contact" },
];

type FooterProps = {
  onOpenCategory: (id: CategoryId) => void;
};

const copyrightYear = new Date().getFullYear();

export function Footer({ onOpenCategory }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Logo variant="mono" onClick={(event) => {
            event.preventDefault();
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }} />
          <p>Low-voltage technology for homes, businesses, and buildings. Distributed and sold by MHM Global.</p>
        </div>
        <nav aria-label="Footer">
          <p className="footer-label">Navigate</p>
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    if (link.id === "top") {
                      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                      return;
                    }
                    scrollToId(link.id);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="footer-label">Categories</p>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#category-${category.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenCategory(category.id);
                  }}
                >
                  {category.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer-label">Contact</p>
          <ul className="footer-contact">
            <li>
              <span>Address</span>
              To be confirmed
            </li>
            <li>
              <span>Phone</span>
              To be confirmed
            </li>
            <li>
              <span>Email</span>
              To be confirmed
            </li>
            <li>
              <span>Storefront</span>
              To be confirmed
            </li>
          </ul>
        </div>
      </div>
      <p className="copyright">© {copyrightYear} MHM Global</p>
    </footer>
  );
}
