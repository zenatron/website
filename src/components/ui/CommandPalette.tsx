import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { T, tA, THEMES, THEME_NAMES } from "@/components/ui/TerminalWindow";
import {
  Home, FileText, FolderOpen, User, Link, Search, Mail,
  Palette, ExternalLink,
  ArrowUp, ArrowDown, CornerDownLeft, Command, Tag,
} from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import pkg from "../../../package.json";

interface PaletteItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string;
}

const THEME_LABELS: Record<string, string> = {
  "atom-one-dark": "Atom One Dark",
  dracula: "Dracula",
  gruvbox: "Gruvbox",
  nord: "Nord",
  catppuccin: "Catppuccin",
  "high-contrast": "High Contrast",
  "tokyo-night": "Tokyo Night",
  "solarized-dark": "Solarized Dark",
  monokai: "Monokai",
  "i-hate-colors": "I Hate Colors",
};

function navigate(path: string) {
  window.location.href = path;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = [
      { id: "home", label: "Home", category: "Navigation", icon: Home, action: () => navigate("/"), keywords: "index landing main" },
      { id: "blog", label: "Blog", category: "Navigation", icon: FileText, action: () => navigate("/blog"), keywords: "posts articles writing" },
      { id: "projects", label: "Projects", category: "Navigation", icon: FolderOpen, action: () => navigate("/projects"), keywords: "work portfolio code" },
      { id: "about", label: "About", category: "Navigation", icon: User, action: () => navigate("/about"), keywords: "bio resume info" },
      { id: "links", label: "Links", category: "Navigation", icon: Link, action: () => navigate("/links"), keywords: "social media contact" },
    ];

    const sections: PaletteItem[] = [
      { id: "resume", label: "Resume / Experience", category: "Sections", icon: FileText, action: () => navigate("/about#resume"), keywords: "work jobs career" },
      { id: "now", label: "What I'm Up To", category: "Sections", icon: Search, action: () => navigate("/about#now"), keywords: "currently building learning" },
      { id: "hobbies", label: "Hobbies & Setup", category: "Sections", icon: User, action: () => navigate("/about#hobbies"), keywords: "interests apps tools neofetch" },
      { id: "principles", label: "Principles", category: "Sections", icon: FileText, action: () => navigate("/about#principles"), keywords: "rules values philosophy" },
    ];

    const themeItems: PaletteItem[] = THEME_NAMES.map((name) => ({
      id: `theme-${name}`,
      label: `Theme: ${THEME_LABELS[name] || name}`,
      category: "Themes",
      icon: Palette,
      action: () => {
        localStorage.setItem("terminal-theme", name);
        document.documentElement.setAttribute("data-theme", name);
      },
      keywords: `theme color scheme ${name}`,
    }));

    const actions: PaletteItem[] = [
      { id: "contact", label: "Contact", category: "Actions", icon: Mail, action: () => window.dispatchEvent(new CustomEvent("open-contact-modal")), keywords: "email reach out message hello get in touch say hello shoot dm" },
      {
        id: "version",
        label: `Version (v${pkg.version})`,
        category: "Actions",
        icon: Tag,
        action: () =>
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: {
                icon: "🏷️",
                title: `${pkg.name} v${pkg.version}`,
                message: `$ cat package.json | jq .version → "${pkg.version}"`,
              },
            })
          ),
        keywords: "build release semver pkg package",
      },
      { id: "github", label: "GitHub", category: "Links", icon: SiGithub, action: () => window.open("https://github.com/zenatron", "_blank"), keywords: "source code repo" },
      { id: "linkedin", label: "LinkedIn", category: "Links", icon: SiLinkedin, action: () => window.open("https://www.linkedin.com/in/philvishnevsky/", "_blank"), keywords: "professional network" },
    ];

    return [...nav, ...sections, ...themeItems, ...actions];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const execute = useCallback(
    (index: number) => {
      const item = filtered[index];
      if (item) {
        setOpen(false);
        // Small delay so the palette closes visually before navigation
        requestAnimationFrame(() => item.action());
      }
    },
    [filtered]
  );

  // Global keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        execute(selectedIndex);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIndex, execute]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Group filtered items by category
  const grouped: { category: string; items: (PaletteItem & { globalIndex: number })[] }[] = [];
  let globalIdx = 0;
  const categoryMap = new Map<string, (PaletteItem & { globalIndex: number })[]>();
  for (const item of filtered) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push({ ...item, globalIndex: globalIdx });
    globalIdx++;
  }
  for (const [category, catItems] of categoryMap) {
    grouped.push({ category, items: catItems });
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Centering wrapper — keeps translate(-50%,-50%) away from Framer Motion's transform */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-lg border shadow-2xl pointer-events-auto"
            style={{
              backgroundColor: T.bg,
              borderColor: T.gutter,
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-4 py-2 border-b"
              style={{ borderColor: T.gutter }}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2.5 w-2.5 rounded-full opacity-80" style={{ backgroundColor: T.red }} />
                <span className="h-2.5 w-2.5 rounded-full opacity-80" style={{ backgroundColor: T.yellow }} />
                <span className="h-2.5 w-2.5 rounded-full opacity-80" style={{ backgroundColor: T.green }} />
              </div>
              <span className="flex-1 text-center font-mono text-xs" style={{ color: T.comment }}>
                command palette
              </span>
              <div className="w-[44px] shrink-0" />
            </div>

            {/* Search input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: T.gutter }}>
              <span className="font-mono text-sm" style={{ color: T.green }}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="type a command..."
                className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:opacity-40"
                style={{ color: T.fg, caretColor: T.cursor }}
              />
              <kbd
                className="hidden sm:flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                style={{ borderColor: T.gutter, color: T.comment }}
              >
                esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[50vh] overflow-y-auto scrollbar-hide"
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center font-mono text-sm" style={{ color: T.comment }}>
                  <span style={{ color: T.red }}>command not found:</span> {query}
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.category}>
                    <div
                      className="sticky top-0 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider"
                      style={{
                        color: T.comment,
                        backgroundColor: T.bg,
                        borderBottom: `1px solid ${T.gutter}`,
                      }}
                    >
                      // {group.category}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = item.globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={item.globalIndex}
                          onClick={() => execute(item.globalIndex)}
                          onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-sm transition-colors duration-75 text-left"
                          style={{
                            color: isSelected ? T.fg : T.comment,
                            backgroundColor: isSelected ? tA(T.purple, "12") : "transparent",
                          }}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0"
                            style={{ color: isSelected ? T.purple : T.comment }}
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.category === "Links" && (
                            <ExternalLink className="h-3 w-3 shrink-0" style={{ color: T.comment }} />
                          )}
                          {isSelected && (
                            <CornerDownLeft className="h-3 w-3 shrink-0" style={{ color: T.purple }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hints */}
            <div
              className="flex items-center justify-between px-4 py-2 border-t font-mono text-[10px]"
              style={{ borderColor: T.gutter, color: T.comment }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-2.5 w-2.5" />
                  <ArrowDown className="h-2.5 w-2.5" />
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command className="h-2.5 w-2.5" />K to toggle
              </span>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
