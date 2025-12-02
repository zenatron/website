"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Konami code sequence
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// Secret command sequences (like typing "pwd" or "ls")
const SECRET_COMMANDS: Record<string, { title: string; message: string }> = {
  pwd: {
    title: "Current Directory",
    message: "~/portfolio/you-found-an-easter-egg",
  },
  ls: {
    title: "Directory Contents",
    message: "secrets/  hidden/  easter-eggs/  .env.secrets",
  },
  whoami: {
    title: "User Identity",
    message: "A curious developer who reads source code 👀",
  },
  sudo: {
    title: "Permission Denied",
    message: "Nice try. You don't have root access here.",
  },
  help: {
    title: "Available Commands",
    message: "Try: pwd, ls, whoami, sudo, vim, exit",
  },
  vim: {
    title: "Vim",
    message: "You're now stuck in vim. Good luck exiting.",
  },
  exit: {
    title: "Exit",
    message: "There is no escape. You live here now.",
  },
  cd: {
    title: "Change Directory",
    message: "You're already where you need to be ✨",
  },
  rm: {
    title: "rm -rf /",
    message: "Nice try. This isn't a real terminal... or is it? 😈",
  },
  cat: {
    title: "cat",
    message: "🐱 meow",
  },
  git: {
    title: "git",
    message: "fatal: not a git repository (or any of the parent directories)",
  },
};

type Toast = {
  id: string;
  icon: string;
  title: string;
  message: string;
};

let toastCounter = 0;

export default function EasterEggs() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);

  // Use refs to avoid stale closure issues and duplicate triggers
  const typedCharsRef = useRef("");
  const lastCommandTimeRef = useRef(0);

  const showToast = useCallback(
    (icon: string, title: string, message: string) => {
      // Debounce: prevent duplicate toasts within 100ms
      const now = Date.now();
      if (now - lastCommandTimeRef.current < 100) {
        return;
      }
      lastCommandTimeRef.current = now;

      const id = `toast-${now}-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, icon, title, message }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Console easter egg - runs once on mount
  useEffect(() => {
    console.log(
      `
%c  ____  _     _ _  __     ___     _                          _          
%c |  _ \| |__ (_) | \ \   / (_)___| |__  _ __   _____   _____ | | ___   _ 
%c | |_) | '_ \| | |  \ \ / /| / __| '_ \| '_ \ / _ \ \ / / __|| |/ / | | |
%c |  __/| | | | | |   \ V / | \__ \ | | | | | |  __/\ V /\__ \|   <| |_| |
%c |_|   |_| |_|_|_|    \_/  |_|___/_| |_|_| |_|\___| \_/ |___/|_|\_\\__, |
%c                                                                   |___/ 
`,
      "color: #7c8aff",
      "color: #8a7cff",
      "color: #9c7cff",
      "color: #7c9aff",
      "color: #7cbfff",
      "color: #7cdfff"
    );
    console.log(
      "%c👋 Hey, fellow developer!",
      "font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%c🔍 Curious about the code? Check it out: https://github.com/zenatron/portfolio",
      "font-size: 12px;"
    );
    console.log(
      "%c💼 Open to opportunities! Let's chat.",
      "font-size: 12px; color: #7c8aff;"
    );
    console.log(
      '%c🥚 Psst... try typing "help" anywhere on the site.',
      "font-size: 11px; color: #888;"
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Check Konami code
      if (e.key === KONAMI_CODE[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);

        if (newIndex === KONAMI_CODE.length && !konamiUnlocked) {
          setKonamiUnlocked(true);
          showToast(
            "🎮",
            "Konami Code Activated!",
            "You found the secret. Here's some confetti... 🎊"
          );
          triggerConfetti();
          setKonamiIndex(0);
        }
      } else if (e.key === KONAMI_CODE[0]) {
        setKonamiIndex(1);
      } else {
        setKonamiIndex(0);
      }

      // Track typed characters for command detection
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        typedCharsRef.current = (
          typedCharsRef.current + e.key.toLowerCase()
        ).slice(-10);

        // Check if any command matches
        for (const cmd of Object.keys(SECRET_COMMANDS)) {
          if (typedCharsRef.current.endsWith(cmd)) {
            const { title, message } = SECRET_COMMANDS[cmd];
            showToast("💻", title, message);
            typedCharsRef.current = ""; // Reset after match
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex, konamiUnlocked, showToast]);

  // Simple confetti effect
  const triggerConfetti = () => {
    const colors = ["#7c8aff", "#ff7c8a", "#8aff7c", "#ffff7c", "#ff7cff"];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
      `;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }

    // Add keyframes if not already present
    if (!document.getElementById("confetti-style")) {
      const style = document.createElement("style");
      style.id = "confetti-style";
      style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto relative flex items-start gap-3 px-4 py-3 bg-primary-bg border border-accent/30 rounded-lg shadow-lg shadow-accent/10 min-w-[280px] max-w-[340px]"
          >
            <span className="text-2xl">{toast.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-accent font-medium uppercase tracking-wider">
                Easter Egg Found
              </p>
              <p className="text-sm text-primary-text font-semibold">
                {toast.title}
              </p>
              <p className="text-xs text-muted-text font-mono break-all">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 text-muted-text hover:text-primary-text transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
