import { useEffect, useRef, useState, type MouseEvent } from "react";
import { scrollToId } from "../lib/motion";
import { Logo } from "./Logo";

const LINKS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "categories", label: "Product Categories" },
  { id: "wholesale", label: "Wholesale" },
  { id: "contact", label: "Contact" },
] as const;

type NavProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onInquire: () => void;
};

export function Nav({ open, setOpen, onInquire }: NavProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(true);
  const [current, setCurrent] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = ["categories", "about", "wholesale", "contact"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    const onScroll = () => {
      if (window.scrollY < 48) setCurrent("home");
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 961px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = true;
    const dialog = dialogRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () =>
      dialog
        ? [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")]
        : [];
    dialog?.querySelector<HTMLElement>(".nav-close")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const toggle = toggleRef.current;
    document.addEventListener("keydown", onKey);
    document.body.classList.add("nav-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-open");
      if (returnFocus.current) (previous ?? toggle)?.focus();
    };
  }, [open, setOpen]);

  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    returnFocus.current = false;
    setOpen(false);
    if (id === "top") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    scrollToId(id);
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
  }

  function inquire(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    returnFocus.current = false;
    setOpen(false);
    onInquire();
  }

  return (
    <>
    <header className="site-header" id="top" data-scrolled={scrolled ? "true" : "false"} inert={open ? true : undefined}>
      <nav className="nav" aria-label="Primary">
        <Logo onClick={(event) => go(event, "top")} />
        <div className="nav-links">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={current === (link.id === "top" ? "home" : link.id) ? "true" : undefined}
              onClick={(event) => go(event, link.id)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a className="btn btn-primary nav-cta" href="#contact" onClick={inquire}>
          Business Inquiries
        </a>
        <button
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
      </nav>
    </header>
      {open ? (
        <div
          ref={dialogRef}
          id="mobile-menu"
          className="nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="nav-panel-bar">
            <Logo onClick={(event) => go(event, "top")} />
            <button className="nav-close" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="nav-panel-links">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={current === (link.id === "top" ? "home" : link.id) ? "true" : undefined}
                onClick={(event) => go(event, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a className="btn btn-primary nav-panel-cta" href="#contact" onClick={inquire}>
            Business Inquiries
          </a>
        </div>
      ) : null}
    </>
  );
}
