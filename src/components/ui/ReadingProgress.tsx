import { useEffect, useState, useRef, useCallback } from "react";
import { T, tA } from "@/components/ui/TerminalWindow";

interface ReadingProgressProps {
  readingTime?: string;
}

function parseReadingMinutes(readingTime?: string): number | null {
  if (!readingTime) return null;
  const match = readingTime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function ReadingProgress({ readingTime }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  const totalMinutes = parseReadingMinutes(readingTime);

  const update = useCallback(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const rect = article.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = rect.height;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const scrolled = scrollY - articleTop;
    const total = articleHeight - viewportHeight;

    if (total <= 0) {
      setProgress(100);
      return;
    }

    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    setProgress(pct);
    setVisible(pct > 5 && pct < 100);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const barWidth = 20;
  const filled = Math.round((progress / 100) * barWidth);
  const empty = barWidth - filled;
  const pctStr = `${Math.round(progress)}%`;

  let timeStr = "";
  if (totalMinutes !== null) {
    const remaining = Math.max(0, totalMinutes * (1 - progress / 100));
    if (remaining < 1) {
      timeStr = "< 1 min left";
    } else {
      timeStr = `${Math.ceil(remaining)} min left`;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "3.5rem", /* below h-14 header */
        left: 0,
        right: 0,
        zIndex: 30,
        background: tA(T.bg, "e6"),
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
    >
      <div
        style={{
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "0.35rem 1rem",
          fontFamily: "monospace",
          fontSize: "0.75rem",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          userSelect: "none",
        }}
      >
        <span style={{ color: T.comment }}>{"["}</span>
        <span style={{ color: T.green, letterSpacing: "0px" }}>
          {"█".repeat(filled)}
        </span>
        <span style={{ color: T.gutter, letterSpacing: "0px" }}>
          {"░".repeat(empty)}
        </span>
        <span style={{ color: T.comment }}>{"]"}</span>
        <span style={{ color: T.comment }}>
          {pctStr}
          {timeStr && ` — ${timeStr}`}
        </span>
      </div>
    </div>
  );
}
