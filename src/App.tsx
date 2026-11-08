import { useEffect, useState } from "react";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { DivideSequence } from "./components/DivideSequence";
import { Footer } from "./components/Footer";
import { MonumentStory } from "./components/MonumentStory";
import { Nav } from "./components/Nav";
import { RangeChapter } from "./components/RangeChapter";
import { categories, type CategoryId } from "./content";
import type { InquiryKind } from "./lib/inquiry";
import { scrollToId } from "./lib/motion";

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryKind | "">("");
  const [regarding, setRegarding] = useState("");
  const [, setOpenCategory] = useState<CategoryId>("surveillance");

  useEffect(() => {
    function followHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (!id || id === "top") {
        if (window.scrollY > 2) window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      if (Math.abs(target.getBoundingClientRect().top) < 120) return;
      scrollToId(id, "auto");
    }
    followHash();
    const frame = window.requestAnimationFrame(followHash);
    const timer = window.setTimeout(followHash, 400);
    window.addEventListener("hashchange", followHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", followHash);
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
    scrollToId(id === "surveillance" ? "categories" : `category-${id}`);
  }

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Nav open={menuOpen} setOpen={setMenuOpen} onInquire={() => inquire("business")} />
      <div inert={menuOpen ? true : undefined}>
        <main id="content" tabIndex={-1}>
          <MonumentStory
            onInquire={(title) => inquire("business", title)}
            onWholesale={() => inquire("wholesale")}
          />
          {categories.slice(1).map((category) => (
            <RangeChapter
              key={category.id}
              category={category}
              onInquire={(title) => inquire("business", title)}
            />
          ))}
          <DivideSequence onInquire={() => inquire("wholesale")} />
          <About />
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
