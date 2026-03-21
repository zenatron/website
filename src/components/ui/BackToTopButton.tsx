"use client";

import { useEffect, useState } from "react";
import { T, tA } from "@/components/ui/TerminalWindow";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      style={{
        backgroundColor: tA(T.purple, "25"),
        color: T.purple,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = tA(T.purple, "40");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = tA(T.purple, "25");
      }}
      aria-label="Scroll back to top"
      title="Scroll back to top"
    >
      ↑
    </button>
  );
};

export default BackToTopButton;
