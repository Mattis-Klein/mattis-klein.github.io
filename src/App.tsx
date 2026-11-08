import { useRef, useState } from "react";
import { About } from "./components/About";
import { Categories } from "./components/Categories";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { ModuleFlight } from "./components/ModuleFlight";
import { Nav } from "./components/Nav";
import { PageRail } from "./components/PageRail";
import { Wholesale } from "./components/Wholesale";
import type { CategoryId } from "./content";
import { useStoryMotion } from "./hooks/useStoryMotion";
import type { InquiryKind } from "./lib/inquiry";
import { scrollToId } from "./lib/motion";

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryKind | "">("");
  const [regarding, setRegarding] = useState("");
  const [openCategory, setOpenCategory] = useState<CategoryId>("surveillance");
  const storyRef = useRef<HTMLDivElement>(null);
  useStoryMotion(storyRef);

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
          <PageRail />
          <div className="story-scope" ref={storyRef}>
            <Hero onWholesale={() => inquire("wholesale")} />
            <Categories
              openId={openCategory}
              onSelect={setOpenCategory}
              onInquire={(title) => inquire("business", title)}
            />
            <ModuleFlight />
          </div>
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
