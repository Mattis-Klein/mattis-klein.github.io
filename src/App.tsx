import { useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { About } from "./components/About";
import { Categories } from "./components/Categories";
import { Contact } from "./components/Contact";
import { FieldSequence } from "./components/FieldSequence";
import { Footer } from "./components/Footer";
import { MatrixSequence } from "./components/MatrixSequence";
import { Nav } from "./components/Nav";
import type { CategoryId } from "./content";
import { useWide } from "./hooks/useWide";
import type { InquiryKind } from "./lib/inquiry";
import { reducedMotion, scrollToId } from "./lib/motion";

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryKind | "">("");
  const [regarding, setRegarding] = useState("");
  const [openCategory, setOpenCategory] = useState<CategoryId>("surveillance");
  const wide = useWide();

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
    if (wide && !reducedMotion()) {
      const trigger = ScrollTrigger.getById("field");
      if (trigger) {
        window.scrollTo({
          top: Math.max(0, trigger.end - 6),
          behavior: reducedMotion() ? "auto" : "smooth",
        });
        window.setTimeout(() => document.getElementById(`tab-${id}`)?.focus(), 0);
        return;
      }
    }
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
          <FieldSequence
            wide={wide}
            openId={openCategory}
            onSelect={setOpenCategory}
            onInquire={(title) => inquire("business", title)}
            onWholesale={() => inquire("wholesale")}
          />
          {wide ? null : (
            <Categories
              mode="stack"
              openId={openCategory}
              onSelect={setOpenCategory}
              onInquire={(title) => inquire("business", title)}
            />
          )}
          <About />
          <MatrixSequence onInquire={() => inquire("wholesale")} />
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
