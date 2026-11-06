import { useEffect, useState } from "react";
import { About } from "./components/About";
import { Categories } from "./components/Categories";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Wholesale } from "./components/Wholesale";
import type { CategoryId } from "./content";
import type { InquiryKind } from "./lib/inquiry";
import { scrollToId } from "./lib/motion";

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryKind | "">("");
  const [regarding, setRegarding] = useState("");
  const [openCategory, setOpenCategory] = useState<CategoryId | null>(null);

  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (node: HTMLElement) => node.classList.add("is-in");
    if (reduced) {
      nodes.forEach(show);
      return;
    }
    const revealVisible = () => {
      const line = window.innerHeight * 0.92;
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.height > 0 && rect.top < line) show(node);
      });
    };
    revealVisible();
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target as HTMLElement);
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      nodes.forEach((node) => observer?.observe(node));
    } catch {
      nodes.forEach(show);
    }
    window.addEventListener("scroll", revealVisible, { passive: true });
    window.addEventListener("resize", revealVisible);
    document.addEventListener("focusin", revealVisible);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", revealVisible);
      window.removeEventListener("resize", revealVisible);
      document.removeEventListener("focusin", revealVisible);
    };
  }, []);

  function inquire(type: InquiryKind, about = "") {
    setInquiryType(type);
    setRegarding(about);
    setMenuOpen(false);
    scrollToId("contact");
    window.setTimeout(() => {
      document.getElementById("inquiry-type")?.focus({ preventScroll: true });
    }, 0);
  }

  function showCategory(id: CategoryId) {
    setOpenCategory(id);
    setMenuOpen(false);
    scrollToId(`category-${id}`);
  }

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Nav open={menuOpen} setOpen={setMenuOpen} onInquire={() => inquire("business")} />
      <div inert={menuOpen ? true : undefined}>
        <main id="content" tabIndex={-1}>
          <Hero
            onWholesale={() => inquire("wholesale")}
            onShowCategory={showCategory}
            onInquire={(title) => inquire("business", title)}
          />
          <Categories
            openId={openCategory}
            onToggle={(id) => setOpenCategory((current) => (current === id ? null : id))}
            onInquire={(title) => inquire("business", title)}
          />
          <About />
          <Wholesale onInquire={() => inquire("wholesale")} />
          <Contact
            inquiryType={inquiryType}
            setInquiryType={setInquiryType}
            regarding={regarding}
            setRegarding={setRegarding}
          />
        </main>
        <Footer onOpenCategory={showCategory} />
      </div>
    </>
  );
}
