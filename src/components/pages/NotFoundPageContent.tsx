import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

const getMessageForTime = (seconds: number): string => {
  if (seconds < 5) return "This page doesn't exist. But you do. That's nice.";
  if (seconds < 10) return "Still here? The page isn't coming back, I promise.";
  if (seconds < 20) return "Okay, you're committed. I respect that.";
  if (seconds < 30)
    return "At this point you're just seeing what happens next, aren't you?";
  if (seconds < 45)
    return "Fun fact: The average person leaves a 404 page in under 5 seconds. You're built different.";
  if (seconds < 60) return "One minute of your life, spent here. No refunds.";
  if (seconds < 90) return "You could've made a sandwich by now. Just saying.";
  if (seconds < 120) return "I'm genuinely impressed. And slightly concerned.";
  if (seconds < 180)
    return "Almost 3 minutes. You're in the top 0.01% of 404 page visitors.";
  if (seconds < 300) return "At five minutes, I'll tell you a secret...";
  if (seconds < 301) return "The secret is: there is no secret. Go outside.";
  return (
    "You've been here for " +
    Math.floor(seconds / 60) +
    " minutes. We should probably both move on."
  );
};

const errorCodes = [
  "404",
  "4\uFE0F\u20E30\uFE0F\u20E34\uFE0F\u20E3",
  "0x194",
  "ENOENT",
  "\u00AF\\_(\u30C4)_/\u00AF",
  "NULL",
  "undefined",
  "NaN",
];

/* Fake stack trace lines — revealed progressively */
const STACK_TRACE = [
  { file: "router.ts", line: 42, fn: "resolveRoute" },
  { file: "middleware.ts", line: 17, fn: "handleRequest" },
  { file: "server.ts", line: 203, fn: "processIncoming" },
  { file: "net.ts", line: 89, fn: "onConnection" },
];

export default function NotFoundPageContent() {
  const [seconds, setSeconds] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [errorIndex, setErrorIndex] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [path, setPath] = useState("/unknown");

  const unlockAchievement = (achievement: Achievement) => {
    if (!unlockedIds.has(achievement.id)) {
      setUnlockedIds((prev) => new Set(prev).add(achievement.id));
      setAchievements((prev) => [...prev, achievement]);
    }
  };

  const dismissAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    setPath(window.location.pathname);
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const originalFavicon =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const originalHref = originalFavicon?.href;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "28px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\uD83D\uDC80", 16, 18);

      const link =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
        document.createElement("link");
      link.rel = "icon";
      link.href = canvas.toDataURL();
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(link);
      }
    }

    return () => {
      if (originalFavicon && originalHref) {
        originalFavicon.href = originalHref;
      }
    };
  }, []);

  useEffect(() => {
    if (seconds >= 120) {
      unlockAchievement({
        id: "time-enthusiast",
        icon: "\uD83C\uDFC6",
        title: "404 Enthusiast",
        description: "Spent 2 minutes on a page that doesn't exist",
      });
    }
  }, [seconds]);

  useEffect(() => {
    if (clicks >= 100) {
      unlockAchievement({
        id: "button-masher",
        icon: "\uD83D\uDDB1\uFE0F",
        title: "Button Masher",
        description: "Clicked the error code 100 times",
      });
    }
  }, [clicks]);

  const message = useMemo(() => getMessageForTime(seconds), [seconds]);

  const handleErrorClick = () => {
    setClicks((c) => c + 1);
    setErrorIndex((i) => (i + 1) % errorCodes.length);
  };

  const clickMessage =
    clicks >= 10
      ? "// " + clicks + " clicks... it's not a button. well, technically it is"
      : clicks >= 5
        ? "// " + clicks + " clicks... keep going?"
        : null;

  const timeStr =
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");

  return (
    <>
      {/* Achievement Toasts — TUI styled */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative flex items-center gap-3 px-4 py-3 rounded-lg border font-mono min-w-[280px]"
              style={{
                backgroundColor: T.bg,
                borderColor: tA(T.yellow, "44"),
              }}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: T.yellow }}
                >
                  Achievement Unlocked
                </p>
                <p className="text-sm font-semibold" style={{ color: T.fg }}>
                  {achievement.title}
                </p>
                <p className="text-xs" style={{ color: T.comment }}>
                  {achievement.description}
                </p>
              </div>
              <button
                onClick={() => dismissAchievement(achievement.id)}
                className="absolute top-2 right-2 transition-colors"
                style={{ color: T.comment }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          <TerminalWindow
            title="~/404"
            statusBar={
              <div className="flex items-center justify-between">
                <span>
                  <span style={{ color: T.red }}>EXIT 1</span>
                  {" \u2502 "}
                  <span className="tabular-nums" style={{ color: T.fg }}>
                    {timeStr}
                  </span>
                </span>
                <span>NOT FOUND</span>
              </div>
            }
          >
            <div className="font-mono text-xs sm:text-sm space-y-4">
              {/* Command that "caused" the error */}
              <div>
                <div style={{ color: T.comment }}>
                  <span style={{ color: T.green }}>$</span>{" "}
                  <span style={{ color: T.fg }}>cd</span>{" "}
                  <span style={{ color: T.yellow }}>{path}</span>
                </div>
              </div>

              {/* Error output */}
              <div className="space-y-1">
                <div style={{ color: T.red }}>
                  bash: cd: {path}: No such file or directory
                </div>
                <div style={{ color: T.red }}>
                  Error: ENOENT — path not found in filesystem
                </div>
              </div>

              {/* Clickable error code */}
              <div className="py-4 text-center">
                <motion.div
                  className="inline-block cursor-pointer select-none font-mono text-6xl sm:text-7xl font-bold"
                  onClick={handleErrorClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: [0, -5, 5, 0] }}
                  animate={{
                    color: seconds > 60
                      ? [T.red, T.yellow, T.purple, T.red]
                      : undefined,
                  }}
                  transition={{
                    color: { duration: 3, repeat: Infinity },
                  }}
                  style={{ color: T.red }}
                >
                  {errorCodes[errorIndex]}
                </motion.div>
              </div>

              {clickMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: T.comment }}
                  className="text-center text-xs"
                >
                  {clickMessage}
                </motion.div>
              )}

              {/* Stack trace — appears line by line */}
              <div
                className="rounded border px-3 py-2 space-y-0.5"
                style={{
                  borderColor: T.gutter,
                  backgroundColor: tA(T.red, "08"),
                }}
              >
                <div className="text-xs" style={{ color: T.comment }}>
                  stack trace:
                </div>
                {STACK_TRACE.map((frame, i) => (
                  <motion.div
                    key={frame.fn}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="text-xs"
                  >
                    <span style={{ color: T.comment }}>
                      {"  "}at{" "}
                    </span>
                    <span style={{ color: T.purple }}>{frame.fn}</span>
                    <span style={{ color: T.comment }}> (</span>
                    <span style={{ color: T.blue }}>{frame.file}</span>
                    <span style={{ color: T.comment }}>:</span>
                    <span style={{ color: T.yellow }}>{frame.line}</span>
                    <span style={{ color: T.comment }}>)</span>
                  </motion.div>
                ))}
              </div>

              {/* Escalating message */}
              <motion.div
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-2"
              >
                <span style={{ color: T.comment }}>// </span>
                <span style={{ color: T.fg }}>{message}</span>
              </motion.div>

              {/* Timer */}
              <div>
                <span style={{ color: T.comment }}>uptime: </span>
                <span className="tabular-nums" style={{ color: T.yellow }}>
                  {timeStr}
                </span>
                {seconds >= 30 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: T.comment }}
                    className="text-xs"
                  >
                    {" "}({seconds.toLocaleString()}s wasted)
                  </motion.span>
                )}
              </div>

              {/* Suggested commands */}
              <div
                className="border-t pt-3 mt-3 space-y-1.5"
                style={{ borderColor: T.gutter }}
              >
                <div style={{ color: T.comment }}>
                  did you mean:
                </div>
                {[
                  { cmd: "cd ~", label: "go home", href: "/" },
                  { cmd: "ls ~/blog", label: "read posts", href: "/blog" },
                  { cmd: "ls ~/projects", label: "see work", href: "/projects" },
                ].map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    className="flex items-center gap-2 group rounded px-2 py-1 -mx-2 transition-colors duration-150"
                    style={{ color: T.fg }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ color: T.green }}>$</span>
                    <span style={{ color: T.fg }}>{s.cmd}</span>
                    <span style={{ color: T.comment }}>
                      {"  "}# {s.label}
                    </span>
                    <span
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: T.purple }}
                    >
                      \u21B5
                    </span>
                  </a>
                ))}
              </div>

              {/* Growing CTA */}
              <motion.div
                className="pt-2 text-center"
                animate={{ scale: 1 + Math.min(seconds * 0.005, 0.3) }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200"
                  style={{
                    backgroundColor: tA(T.purple, "18"),
                    border: `1px solid ${tA(T.purple, "44")}`,
                    color: T.purple,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tA(T.purple, "28");
                    e.currentTarget.style.borderColor = tA(T.purple, "66");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tA(T.purple, "18");
                    e.currentTarget.style.borderColor = tA(T.purple, "44");
                  }}
                >
                  <span style={{ color: T.green }}>$</span>
                  {seconds < 30
                    ? "cd ~"
                    : seconds < 60
                      ? "please cd ~"
                      : "cd ~ # I'm begging you"}
                  <span style={{ color: T.comment }}>\u21B5</span>
                </a>
              </motion.div>
            </div>
          </TerminalWindow>
        </div>
      </main>
    </>
  );
}
