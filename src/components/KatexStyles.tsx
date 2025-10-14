"use client";

import { useEffect, useState } from "react";

export default function KatexStyles() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Only load KaTeX CSS if not already loaded
    if (!loaded && !document.querySelector('link[href*="katex"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      link.integrity =
        "sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV";
      link.crossOrigin = "anonymous";
      link.media = "print";
      link.onload = function () {
        // @ts-ignore
        this.media = "all";
      };
      document.head.appendChild(link);
      setLoaded(true);
    }
  }, [loaded]);

  return null;
}
