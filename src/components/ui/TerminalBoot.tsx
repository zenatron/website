import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/components/ui/TerminalWindow";

/* ── Resolve the user's selected theme palette ── */
function getThemePalette() {
  const name =
    typeof window !== "undefined"
      ? localStorage.getItem("terminal-theme") || "atom-one-dark"
      : "atom-one-dark";
  const colors = THEMES[name] || THEMES["atom-one-dark"];
  return {
    bg: colors.bg,
    fg: colors.fg,
    purple: colors.purple,
    blue: colors.blue,
    cyan: colors.cyan,
    green: colors.green,
    yellow: colors.yellow,
    orange: colors.orange,
    red: colors.red,
    comment: colors.comment,
    white: colors.white,
    gutter: colors.gutter,
    cursor: colors.cursor,
  };
}

type Seg = { text: string; color: string };

interface BootLine {
  segments: Seg[];
  delay: number;
  isLoading?: boolean;
}

const SPINNER_CHARS = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const COMMAND = "./phil --about";
const SESSION_KEY = "terminal-boot-played";

/* ── Spinning loader that resolves to ✓ ── */
function Spinner({
  resolved,
  resolveDelay,
  greenColor,
  yellowColor,
}: {
  resolved: boolean;
  resolveDelay: number;
  greenColor: string;
  yellowColor: string;
}) {
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (resolved) {
      const t = setTimeout(() => setDone(true), resolveDelay);
      return () => clearTimeout(t);
    }
  }, [resolved, resolveDelay]);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_CHARS.length);
    }, 80);
    return () => clearInterval(interval);
  }, [done]);

  if (done) {
    return <span style={{ color: greenColor }}>✓</span>;
  }
  return <span style={{ color: yellowColor }}>{SPINNER_CHARS[frame]}</span>;
}

export default function TerminalBoot({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [typedCmd, setTypedCmd] = useState("");
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());
  const [loadingResolved, setLoadingResolved] = useState(false);
  const [phase, setPhase] = useState<
    "init" | "typing" | "output" | "waiting" | "dissolve" | "done"
  >("init");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasSkipped = useRef(false);

  /* ── Resolve theme palette once on mount ── */
  const T = useMemo(() => getThemePalette(), []);

  /* ── Dynamic values ── */
  const daysOfCode = useMemo(() => {
    const start = new Date("2019-06-01");
    const now = new Date();
    return Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, []);

  /* ── Boot line definitions ── */
  const bootLines: BootLine[] = useMemo(
    () => [
      {
        delay: 0,
        segments: [
          { text: "phil", color: T.purple },
          { text: "@", color: T.comment },
          { text: "portfolio", color: T.blue },
        ],
      },
      {
        delay: 60,
        segments: [{ text: "─".repeat(40), color: T.gutter }],
      },
      {
        delay: 180,
        segments: [
          { text: "  os      ", color: T.comment },
          { text: "CachyOS", color: T.fg },
          { text: " / ", color: T.gutter },
          { text: "macOS", color: T.fg },
        ],
      },
      {
        delay: 280,
        segments: [
          { text: "  shell   ", color: T.comment },
          { text: "zsh", color: T.green },
        ],
      },
      {
        delay: 380,
        segments: [
          { text: "  host    ", color: T.comment },
          { text: "Hartford, CT", color: T.fg },
        ],
      },
      {
        delay: 480,
        segments: [
          { text: "  uptime  ", color: T.comment },
          { text: `${daysOfCode.toLocaleString()} days`, color: T.yellow },
          { text: " writing code", color: T.fg },
        ],
      },
      {
        delay: 580,
        segments: [
          { text: "  langs   ", color: T.comment },
          { text: "TypeScript", color: T.blue },
          { text: " · ", color: T.gutter },
          { text: "Python", color: T.yellow },
          { text: " · ", color: T.gutter },
          { text: "Rust", color: T.red },
        ],
      },
      {
        delay: 680,
        segments: [
          { text: "  editor  ", color: T.comment },
          { text: "VS Code", color: T.blue },
          { text: " / ", color: T.gutter },
          { text: "Neovim", color: T.green },
        ],
      },
      {
        delay: 780,
        segments: [
          { text: "  status  ", color: T.comment },
          { text: "Open to opportunities", color: T.green },
        ],
      },
      {
        delay: 980,
        segments: [{ text: "", color: T.fg }],
      },
      {
        delay: 1120,
        segments: [
          { text: "  loading ", color: T.fg },
          { text: "[experience]", color: T.purple },
          { text: " ········ ", color: T.gutter },
        ],
        isLoading: true,
      },
      {
        delay: 1360,
        segments: [
          { text: "  loading ", color: T.fg },
          { text: "[skills]    ", color: T.purple },
          { text: " ········ ", color: T.gutter },
        ],
        isLoading: true,
      },
      {
        delay: 1600,
        segments: [
          { text: "  loading ", color: T.fg },
          { text: "[hobbies]   ", color: T.purple },
          { text: " ········ ", color: T.gutter },
        ],
        isLoading: true,
      },
      {
        delay: 2000,
        segments: [{ text: "", color: T.fg }],
      },
      {
        delay: 2150,
        segments: [
          { text: "  > ", color: T.green },
          { text: "ready", color: T.white },
        ],
      },
    ],
    [daysOfCode, T]
  );

  /* ── Cleanup helper ── */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  /* ── Dissolve and complete ── */
  const dissolve = useCallback(() => {
    if (phase === "dissolve" || phase === "done") return;
    clearTimers();
    setPhase("dissolve");
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 700);
    timersRef.current.push(t);
  }, [phase, onComplete, clearTimers]);

  /* ── Skip handler (during typing/output phase) ── */
  const skip = useCallback(() => {
    if (hasSkipped.current || phase === "done" || phase === "dissolve") return;

    if (phase === "typing" || phase === "output") {
      // Fast-forward: show everything immediately, go to waiting
      hasSkipped.current = true;
      clearTimers();
      setTypedCmd(COMMAND);
      setVisibleLines(new Set(bootLines.map((_, i) => i)));
      setLoadingResolved(true);
      setPhase("waiting");
    } else if (phase === "waiting") {
      dissolve();
    }
  }, [phase, clearTimers, bootLines, dissolve]);

  /* ── Check if already played ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (sessionStorage.getItem(SESSION_KEY) || prefersReduced) {
      setPhase("done");
      onComplete();
      return;
    }
    setPhase("typing");
  }, [onComplete]);

  /* ── Keypress/click handlers ── */
  useEffect(() => {
    if (phase === "done" || phase === "dissolve") return;

    const handler = (e: Event) => {
      if (
        e instanceof KeyboardEvent &&
        (e.key === "Tab" || e.key === "Escape")
      )
        return;

      if (phase === "waiting") {
        dissolve();
      } else {
        skip();
      }
    };

    // Small delay to avoid instant-skip from page navigation click
    const t = setTimeout(() => {
      window.addEventListener("keydown", handler);
      window.addEventListener("click", handler);
    }, 200);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("click", handler);
    };
  }, [phase, skip, dissolve]);

  /* ── Type command character by character ── */
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedCmd(COMMAND.slice(0, i));
      if (i >= COMMAND.length) {
        clearInterval(interval);
        const t = setTimeout(() => setPhase("output"), 250);
        timersRef.current.push(t);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  /* ── Schedule output lines ── */
  useEffect(() => {
    if (phase !== "output") return;

    bootLines.forEach((line, idx) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => new Set([...prev, idx]));
      }, line.delay);
      timersRef.current.push(t);
    });

    // Resolve loading spinners
    const resolveTimer = setTimeout(() => {
      setLoadingResolved(true);
    }, 1850);
    timersRef.current.push(resolveTimer);

    // Transition to waiting (paused) instead of auto-dissolve
    const waitTimer = setTimeout(() => {
      setPhase("waiting");
    }, 2700);
    timersRef.current.push(waitTimer);

    return clearTimers;
  }, [phase, bootLines, clearTimers]);

  /* ── Don't render if done ── */
  if (phase === "done") return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="terminal-boot"
          initial={{ opacity: 1 }}
          animate={
            phase === "dissolve"
              ? {
                  opacity: [1, 1, 0],
                  scaleY: [1, 0.008, 0.008],
                  filter: [
                    "brightness(1) blur(0px)",
                    "brightness(2.5) blur(0px)",
                    "brightness(0) blur(4px)",
                  ],
                }
              : { opacity: 1 }
          }
          transition={
            phase === "dissolve"
              ? { duration: 0.7, times: [0, 0.4, 1], ease: "easeInOut" }
              : undefined
          }
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            backgroundColor: T.bg,
            fontFamily: 'var(--font-mono-terminal)',
            fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1',
          }}
        >
          {/* Subtle CRT scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
            }}
          />

          {/* Terminal content */}
          <div
            className="relative w-full max-w-lg px-6 text-sm leading-7 sm:text-base sm:leading-8"
            style={{ whiteSpace: "pre" }}
          >
            {/* Command line */}
            <div>
              <span style={{ color: T.green }}>$ </span>
              <span style={{ color: T.fg }}>{typedCmd}</span>
              {phase === "typing" && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{ color: T.cursor }}
                >
                  ▋
                </motion.span>
              )}
            </div>

            {/* Output lines */}
            {phase !== "typing" && (
              <div className="mt-1">
                {bootLines.map((line, idx) => {
                  if (!visibleLines.has(idx)) return null;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -3 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      {line.segments.map((seg, j) => (
                        <span key={j} style={{ color: seg.color }}>
                          {seg.text}
                        </span>
                      ))}
                      {line.isLoading && (
                        <Spinner
                          resolved={loadingResolved}
                          greenColor={T.green}
                          yellowColor={T.yellow}
                          resolveDelay={
                            idx === 10 ? 0 : idx === 11 ? 150 : 300
                          }
                        />
                      )}
                      {/* Blinking cursor on "ready" line */}
                      {idx === bootLines.length - 1 && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          style={{ color: T.cursor }}
                        >
                          _
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom hint — changes based on phase */}
          <div className="absolute bottom-8 text-xs tracking-wide">
            {(phase === "typing" || phase === "output") && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                style={{ color: T.comment }}
              >
                press any key to skip
              </motion.span>
            )}
            {phase === "waiting" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ color: T.fg }}
              >
                press any key to continue
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
