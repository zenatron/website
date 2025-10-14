"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-background/50 text-primary-foreground shadow-lg backdrop-blur-md border border-white/10 hover:bg-background/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
      aria-label="Scroll back to top"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
      title="Scroll back to top"
    >
      <FaArrowUp className="h-5 w-5 mix-blend-difference" />
    </button>
  );
};

export default BackToTopButton;
