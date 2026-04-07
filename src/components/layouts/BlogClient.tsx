import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { BlogPost } from "@/types/types";
import dateFormatter from "@/utils/dateFormatter";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";
import {
  CTA_TEXTS,
  CTAButton,
  TerminalDivider,
  ScrollReveal,
} from "@/components/ui/TerminalShared";

interface BlogClientProps {
  posts: BlogPost[];
}

/* ── Deterministic fake git hash ── */
const fakeHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 7).padStart(7, "0");
};

export default function BlogClient({ posts }: BlogClientProps) {
  const [searchParamsObj, setSearchParamsObj] = useState(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""));
  const initialTag = searchParamsObj.get("tag");

  const [searchQuery, setSearchQuery] = useState("");
  const [idleTime, setIdleTime] = useState(0);
  const [wordCountClicks, setWordCountClicks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);

  // Tag autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [tagQuery, setTagQuery] = useState(""); // tracks partial tag after #

  const [ctaIndex, setCtaIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaIndex((prev) => (prev + 1) % CTA_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total words across all posts
  const totalWords = useMemo(() => {
    return posts.reduce((acc, post) => {
      const wordCount =
        post.searchableContent?.split(/\s+/).filter(Boolean).length || 0;
      return acc + wordCount;
    }, 0);
  }, [posts]);

  // Sync URL → state on popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsObj(new URLSearchParams(window.location.search));
      const urlTag = new URLSearchParams(window.location.search).get("tag");
      setSelectedTag(urlTag);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Slash-to-focus keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Impatient placeholder - track idle time when focused on empty search
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const input = searchInputRef.current;

    const startIdleTimer = () => {
      if (searchQuery === "") {
        interval = setInterval(() => {
          setIdleTime((t) => t + 1);
        }, 1000);
      }
    };

    const stopIdleTimer = () => {
      clearInterval(interval);
      setIdleTime(0);
    };

    input?.addEventListener("focus", startIdleTimer);
    input?.addEventListener("blur", stopIdleTimer);

    return () => {
      clearInterval(interval);
      input?.removeEventListener("focus", startIdleTimer);
      input?.removeEventListener("blur", stopIdleTimer);
    };
  }, [searchQuery]);

  // Reset idle time when user types
  useEffect(() => {
    if (searchQuery !== "") {
      setIdleTime(0);
    }
  }, [searchQuery]);

  // Dynamic placeholder based on idle time
  const getPlaceholder = () => {
    if (idleTime < 5) return "grep posts... (use # for tags)";
    if (idleTime < 10) return "still thinking?";
    if (idleTime < 15) return "just type something...";
    if (idleTime < 20) return "literally anything...";
    if (idleTime < 30) return "i'm getting lonely here...";
    return "fine. i'll wait. forever, i guess.";
  };

  // Easter egg: Check for "42" search
  const is42Search = searchQuery.trim() === "42";

  // Easter egg: Check for "bug" search
  const isBugSearch = searchQuery.trim().toLowerCase() === "bug";

  // Word count click easter egg messages
  const getWordCountMessage = () => {
    if (wordCountClicks === 0) return null;
    if (wordCountClicks < 2)
      return `that's ${Math.round(totalWords / 280)} tweets worth`;
    if (wordCountClicks < 3)
      return `or ${Math.round(totalWords / 250)} pages in a book`;
    if (wordCountClicks < 4)
      return `about ${Math.round(totalWords / 150)} minutes to read it all`;
    if (wordCountClicks < 5)
      return `${Math.round(totalWords / 11)} average sentences`;
    if (wordCountClicks < 6)
      return `approximately ${(totalWords / 1320).toFixed(2)} Declarations of Independence`;
    if (wordCountClicks < 7)
      return `around ${Math.round(totalWords * (4 / 3))} LLM tokens`;
    if (wordCountClicks < 8) return "okay you really like clicking this huh";
    if (wordCountClicks < 10) return "alright, that's enough clicking for now.";
    if (wordCountClicks < 12) return "there's nothing more to see here.";
    if (wordCountClicks < 15) return "i promise";
    if (wordCountClicks < 16) return "okay fine...";
    if (wordCountClicks < 17) return "i'll tell you a joke:";
    if (wordCountClicks < 18)
      return "two types of programmers exist: those who can extrapolate from incomplete data.";
    return "pls read my blog";
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.metadata.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  // Filtered tag suggestions based on what user is typing after #
  const filteredSuggestions = useMemo(() => {
    if (!tagQuery) return allTags;
    const query = tagQuery.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(query));
  }, [allTags, tagQuery]);

  // Handle input change - detect # for tag autocomplete
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Check if user is typing a tag (starts with # or has # after space)
      const hashIndex = value.lastIndexOf("#");
      if (hashIndex !== -1) {
        const afterHash = value.slice(hashIndex + 1);
        // Only show suggestions if there's no space after the hash (still typing the tag)
        if (!afterHash.includes(" ")) {
          setTagQuery(afterHash);
          setShowSuggestions(true);
          setSuggestionIndex(0);
          return;
        }
      }
      setShowSuggestions(false);
      setTagQuery("");
    },
    []
  );

  // Handle selecting a tag from suggestions or clicking a topic
  const handleTagSelect = useCallback(
    (tag: string | null) => {
      setSelectedTag(tag);
      setSearchQuery(""); // Clear search when selecting/deselecting tag
      setShowSuggestions(false);
      setTagQuery("");

      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set("tag", tag);
      } else {
        url.searchParams.delete("tag");
      }
      window.history.pushState({}, "", url.toString());
      setSearchParamsObj(new URLSearchParams(url.search));
      // Focus back on input
      setTimeout(() => searchInputRef.current?.focus(), 0);
    },
    []
  );

  // Complete the tag from suggestions
  const completeTag = useCallback(
    (tag: string) => {
      handleTagSelect(tag);
    },
    [handleTagSelect]
  );

  // Handle keyboard in search input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          completeTag(filteredSuggestions[suggestionIndex]);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSuggestionIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
          return;
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
          return;
        }
      }

      // Handle backspace to delete chip
      if (e.key === "Backspace" && selectedTag && searchQuery === "") {
        e.preventDefault();
        handleTagSelect(null);
      }
    },
    [
      showSuggestions,
      filteredSuggestions,
      suggestionIndex,
      completeTag,
      selectedTag,
      searchQuery,
      handleTagSelect,
    ]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter posts with chip tag and text search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Check selected tag first (from chip)
      if (selectedTag !== null && !post.metadata.tags?.includes(selectedTag)) {
        return false;
      }

      // Check search query (text only, no hashtag parsing needed since we use chips)
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const itemContent =
          post.metadata.title.toLowerCase() +
          " " +
          (post.metadata.excerpt?.toLowerCase() || "") +
          " " +
          (post.searchableContent?.toLowerCase() || "");

        // Split into terms and check each (ignore any # terms as they're being typed)
        const terms = query.split(/\s+/).filter((t) => t && !t.startsWith("#"));
        if (terms.length > 0) {
          const matchesSearch = terms.every((term) =>
            itemContent.includes(term)
          );
          if (!matchesSearch) return false;
        }
      }

      return true;
    });
  }, [posts, searchQuery, selectedTag]);

  // Group by year
  const groupedPosts = useMemo(() => {
    const groups: { [year: string]: BlogPost[] } = {};

    filteredPosts.forEach((post) => {
      const year = new Date(post.metadata.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(post);
    });

    return Object.keys(groups)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year) => ({ year, posts: groups[year] }));
  }, [filteredPosts]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setShowSuggestions(false);
    setTagQuery("");
    const url = new URL(window.location.href);
    url.searchParams.delete("tag");
    window.history.pushState({}, "", url.toString());
    setSearchParamsObj(new URLSearchParams(url.search));
  };

  const hasActiveFilters = searchQuery !== "" || selectedTag !== null;

  return (
    <div className="px-4 pb-16 pt-24 sm:pb-24 sm:pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 sm:mb-16 space-y-4 font-mono">
          <p
            className="text-sm tracking-wider"
            style={{ color: T.comment }}
          >
            <span style={{ color: T.purple }}>//</span> BLOG
          </p>
          <h1 className="text-3xl tracking-tight md:text-4xl" style={{ color: T.fg }}>
            Barely Legible Organized Gibberish
          </h1>
          <p className="max-w-xl text-sm md:text-base" style={{ color: T.comment }}>
            thoughts on code, learning, and whatever else i&apos;m figuring out.{" "}
            <span
              className="tabular-nums cursor-pointer transition-colors duration-150"
              style={{ color: T.yellow }}
              onClick={() => setWordCountClicks((c) => c + 1)}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.purple; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.yellow; }}
              title="Click me!"
            >
              {totalWords.toLocaleString()}
            </span>{" "}
            words written so far.
            {getWordCountMessage() && (
              <span className="block text-xs mt-1" style={{ color: T.comment }}>
                // {getWordCountMessage()}
              </span>
            )}
          </p>
        </header>

        {/* Filters */}
        <div className="mb-12 space-y-4 font-mono">
          {/* Search with chip + autocomplete */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" style={{ color: T.comment }} />

            {/* Container with chip + input */}
            <div
              className="flex w-full items-center gap-1.5 rounded border py-2 pl-10 pr-12 transition-colors"
              style={{
                backgroundColor: T.bg,
                borderColor: T.gutter,
              }}
              onFocus={() => {
                const el = document.querySelector('[data-search-container]') as HTMLElement;
                if (el) el.style.borderColor = tA(T.purple, "66");
              }}
            >
              {/* Tag chip */}
              {selectedTag && (
                <span
                  ref={chipRef}
                  className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-sm"
                  style={{ backgroundColor: tA(T.purple, "20"), color: T.purple }}
                >
                  #{selectedTag}
                  <button
                    type="button"
                    onClick={() => handleTagSelect(null)}
                    className="ml-0.5 rounded p-0.5 transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${T.gutter}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Input */}
              <input
                ref={searchInputRef}
                data-search-container
                type="text"
                placeholder={
                  selectedTag ? "add search terms..." : getPlaceholder()
                }
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  // Style parent border
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderColor = tA(T.purple, "66");
                  // Show suggestions if user had typed a partial tag
                  if (searchQuery.includes("#")) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderColor = T.gutter;
                }}
                className="min-w-0 flex-1 bg-transparent text-sm md:text-base outline-none"
                style={{ color: T.fg }}
              />
            </div>

            {/* Keyboard hint */}
            <kbd
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline-block font-mono"
              style={{ borderColor: T.gutter, backgroundColor: tA(T.gutter, "40"), color: T.comment }}
            >
              /
            </kbd>

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded border shadow-xl"
                style={{ backgroundColor: T.bg, borderColor: T.gutter }}
              >
                <div className="p-1.5">
                  <div className="mb-1.5 px-2 text-[10px] uppercase tracking-wider" style={{ color: T.comment }}>
                    tags {tagQuery && `matching "${tagQuery}"`}
                  </div>
                  <div className="max-h-[180px] overflow-y-auto">
                    {filteredSuggestions.map((tag, index) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => completeTag(tag)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                          index === suggestionIndex
                            ? ""
                            : ""
                        )}
                        style={{
                          backgroundColor: index === suggestionIndex ? tA(T.purple, "20") : "transparent",
                          color: index === suggestionIndex ? T.purple : T.fg,
                        }}
                        onMouseEnter={(e) => {
                          if (index !== suggestionIndex) {
                            e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== suggestionIndex) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <span style={{ color: T.comment }}>#</span>
                        {tag}
                        {index === suggestionIndex && (
                          <span className="ml-auto text-[10px]" style={{ color: T.comment }}>
                            Tab ↹
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 42 Easter Egg */}
          {is42Search && (
            <div
              className="rounded border px-4 py-3 max-w-md font-mono"
              style={{ borderColor: tA(T.yellow, "44"), backgroundColor: tA(T.yellow, "08") }}
            >
              <p className="text-sm" style={{ color: T.yellow }}>
                // The Answer to Life, the Universe, and Everything
              </p>
              <p className="text-xs mt-1" style={{ color: T.comment }}>
                but what was the question? — Douglas Adams
              </p>
            </div>
          )}

          {/* Bug Easter Egg */}
          {isBugSearch && (
            <div
              className="rounded border px-4 py-3 max-w-md font-mono"
              style={{ borderColor: tA(T.green, "44"), backgroundColor: tA(T.green, "08") }}
            >
              <p className="text-sm" style={{ color: T.green }}>
                // No bugs here!
              </p>
              <p className="text-xs mt-1" style={{ color: T.comment }}>
                only &quot;undocumented features&quot; and &quot;creative
                interpretations of the spec.&quot;
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider" style={{ color: T.comment }}>
              topics:
            </span>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  handleTagSelect(selectedTag === tag ? null : tag)
                }
                className="rounded px-2 py-1 text-[11px] transition-colors duration-150"
                style={{
                  backgroundColor: selectedTag === tag ? tA(T.purple, "25") : tA(T.gutter, "40"),
                  color: selectedTag === tag ? T.purple : T.comment,
                  border: `1px solid ${selectedTag === tag ? tA(T.purple, "44") : "transparent"}`,
                }}
                onMouseEnter={(e) => {
                  if (selectedTag !== tag) {
                    e.currentTarget.style.color = T.fg;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "80");
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTag !== tag) {
                    e.currentTarget.style.color = T.comment;
                    e.currentTarget.style.backgroundColor = tA(T.gutter, "40");
                  }
                }}
              >
                [{tag}]
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors duration-150"
                style={{ color: T.comment }}
                onMouseEnter={(e) => { e.currentTarget.style.color = T.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.comment; }}
              >
                <X className="h-3 w-3" />
                clear
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-12">
          {filteredPosts.length === 0 ? (
            <TerminalWindow title="~/blog" statusBar={<span>0 results</span>}>
              <div className="py-8 text-center font-mono">
                <p className="text-sm" style={{ color: T.comment }}>
                  <span style={{ color: T.green }}>$</span> grep{" "}
                  <span style={{ color: T.orange }}>"{searchQuery || selectedTag}"</span>{" "}
                  <span style={{ color: T.cyan }}>~/blog/**</span>
                </p>
                <p className="text-sm mt-2" style={{ color: T.red }}>
                  error: no posts found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm transition-colors duration-150"
                  style={{ color: T.purple }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.blue; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.purple; }}
                >
                  $ clear-filters ↵
                </button>
              </div>
            </TerminalWindow>
          ) : (
            groupedPosts.map((group) => (
              <section key={group.year}>
                {/* Year header */}
                <div className="sticky top-24 z-10 mb-4 flex items-center gap-3 font-mono">
                  <span className="text-lg" style={{ color: T.purple }}>
                    {group.year}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{ backgroundColor: tA(T.gutter, "60"), color: T.comment }}
                  >
                    {group.posts.length}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: tA(T.gutter, "60") }}
                  />
                </div>

                {/* Posts in TerminalWindow */}
                <TerminalWindow
                  title={`~/blog/${group.year}`}
                  noPadding
                  statusBar={
                    <div className="flex items-center justify-between">
                      <span>
                        <span style={{ color: T.fg }}>{group.posts.length}</span> post{group.posts.length !== 1 ? "s" : ""}
                      </span>
                      <span>bLOG</span>
                    </div>
                  }
                >
                  {/* Command line */}
                  <div
                    className="px-3 sm:px-4 py-2 border-b font-mono text-xs md:text-sm"
                    style={{ borderColor: T.gutter, color: T.comment }}
                  >
                    <span style={{ color: T.green }}>$</span>{" "}
                    <span style={{ color: T.fg }}>git log</span>{" "}
                    <span style={{ color: T.purple }}>--oneline</span>{" "}
                    <span style={{ color: T.purple }}>--year</span>=<span style={{ color: T.orange }}>{group.year}</span>
                  </div>

                  {/* Post rows */}
                  <div>
                    {group.posts.map((post, i) => {
                      const hash = fakeHash(post.slug);
                      const isLast = i === group.posts.length - 1;
                      const prefix = isLast ? "└─" : "├─";
                      return (
                        <a
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="group flex items-start sm:items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 transition-colors duration-150 font-mono text-sm md:text-base"
                          style={{
                            borderBottom: isLast
                              ? "none"
                              : `1px solid ${tA(T.gutter, "30")}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tA(T.purple, "0a");
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span
                            className="shrink-0 hidden sm:inline text-xs md:text-sm"
                            style={{ color: T.gutter }}
                          >
                            {prefix}
                          </span>
                          <div className="shrink-0 flex flex-col items-start leading-tight">
                            <span
                              className="text-xs md:text-sm"
                              style={{ color: T.yellow }}
                            >
                              {hash}
                            </span>
                            <span className="text-[11px] tabular-nums" style={{ color: T.green }}>
                              {dateFormatter({
                                date: post.metadata.date,
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {post.metadata.readingTime && (
                              <span className="text-[11px]" style={{ color: T.cyan }}>
                                {post.metadata.readingTime}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-medium transition-colors duration-150" style={{ color: T.fg }}>
                                <span className="group-hover:hidden">{post.metadata.title}</span>
                                <span className="hidden group-hover:inline" style={{ color: T.purple }}>{post.metadata.title}</span>
                              </span>
                            </div>
                            {post.metadata.excerpt && (
                              <p className="text-xs mt-1 truncate" style={{ color: T.comment }}>
                                {post.metadata.excerpt}
                              </p>
                            )}
                          </div>
                          <div className="hidden md:flex items-center gap-2 shrink-0">
                            {post.metadata.tags && post.metadata.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[11px]">
                                <span style={{ color: T.gutter }}>[</span>
                                <span style={{ color: T.cyan }}>{tag}</span>
                                <span style={{ color: T.gutter }}>]</span>
                              </span>
                            ))}
                          </div>
                          <span
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                            style={{ color: T.purple }}
                          >
                            ↗
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </TerminalWindow>
              </section>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-6">
          <TerminalDivider />
          <div className="font-mono text-sm" style={{ color: T.comment }}>
            <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
            {" "}EOF{" "}
            <span style={{ color: T.gutter }}>{"─".repeat(3)}</span>
          </div>
          <CTAButton ctaIndex={ctaIndex} onClick={() => setIsModalOpen(true)} />
          <p className="font-mono text-xs" style={{ color: T.comment }}>
            <span style={{ color: T.green }}>exit 0</span> · thanks for reading
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}
