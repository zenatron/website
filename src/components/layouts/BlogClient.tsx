import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { BlogPost } from "@/types/types";
import dateFormatter from "@/utils/dateFormatter";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";
import TerminalWindow, { T, tA } from "@/components/ui/TerminalWindow";
import type { SeriesData } from "@/components/layouts/BlogLayout";
import SeriesStrip from "@/components/blog/SeriesStrip";
import {
  CTA_TEXTS,
  CTAButton,
  TerminalDivider,
} from "@/components/ui/TerminalShared";

interface BlogClientProps {
  posts: BlogPost[];
  series?: SeriesData;
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

/* ── Highlight search terms in text ── */
function highlightTextFixed(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query) return [{ text, highlight: false }];
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t && !t.startsWith("#"));
  if (terms.length === 0) return [{ text, highlight: false }];

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }
    parts.push({ text: match[0], highlight: true });
    lastIndex = match.index + match[0].length;
    if (!regex.lastIndex) break;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }
  if (parts.length === 0) return [{ text, highlight: false }];
  return parts;
}

const POSTS_PER_PAGE = 10;

export default function BlogClient({ posts, series }: BlogClientProps) {
  const [searchParamsObj, setSearchParamsObj] = useState(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""));
  const initialTag = searchParamsObj.get("tag");

  const [searchQuery, setSearchQuery] = useState("");
  const [idleTime, setIdleTime] = useState(0);
  const [wordCountClicks, setWordCountClicks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);

  // Tag autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [tagQuery, setTagQuery] = useState("");

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

  const totalWords = useMemo(() => {
    return posts.reduce((acc, post) => {
      const wordCount =
        post.searchableContent?.split(/\s+/).filter(Boolean).length || 0;
      return acc + wordCount;
    }, 0);
  }, [posts]);

  // Sync URL → state on popstate
  useEffect(() => {
    const handlePopState = () => {
      setSearchParamsObj(new URLSearchParams(window.location.search));
      const urlTag = new URLSearchParams(window.location.search).get("tag");
      setSelectedTag(urlTag);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Slash-to-focus
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

  // Impatient placeholder
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

  useEffect(() => {
    if (searchQuery !== "") {
      setIdleTime(0);
    }
  }, [searchQuery]);

  const getPlaceholder = () => {
    if (idleTime < 5) return "grep posts... (use # for tags)";
    if (idleTime < 10) return "still thinking?";
    if (idleTime < 15) return "just type something...";
    if (idleTime < 20) return "literally anything...";
    if (idleTime < 30) return "i'm getting lonely here...";
    return "fine. i'll wait. forever, i guess.";
  };

  const is42Search = searchQuery.trim() === "42";
  const isBugSearch = searchQuery.trim().toLowerCase() === "bug";

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

  // All tags with counts
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    posts.forEach((post) => {
      post.metadata.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const filteredSuggestions = useMemo(() => {
    if (!tagQuery) return allTags.map((t) => t.tag);
    const query = tagQuery.toLowerCase();
    return allTags
      .filter(({ tag }) => tag.toLowerCase().includes(query))
      .map((t) => t.tag);
  }, [allTags, tagQuery]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      const hashIndex = value.lastIndexOf("#");
      if (hashIndex !== -1) {
        const afterHash = value.slice(hashIndex + 1);
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

  const handleTagSelect = useCallback(
    (tag: string | null) => {
      setSelectedTag(tag);
      setSearchQuery("");
      setShowSuggestions(false);
      setTagQuery("");
      setDisplayCount(POSTS_PER_PAGE);

      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set("tag", tag);
      } else {
        url.searchParams.delete("tag");
      }
      window.history.pushState({}, "", url.toString());
      setSearchParamsObj(new URLSearchParams(url.search));
      setTimeout(() => searchInputRef.current?.focus(), 0);
    },
    []
  );

  const completeTag = useCallback(
    (tag: string) => {
      handleTagSelect(tag);
    },
    [handleTagSelect]
  );

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

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedTag !== null && !post.metadata.tags?.includes(selectedTag)) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const itemContent =
          post.metadata.title.toLowerCase() +
          " " +
          (post.metadata.excerpt?.toLowerCase() || "") +
          " " +
          (post.searchableContent?.toLowerCase() || "");

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

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(POSTS_PER_PAGE);
  }, [searchQuery, selectedTag]);

  // Visible posts (limited by displayCount)
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, displayCount);
  }, [filteredPosts, displayCount]);

  const hasMore = displayCount < filteredPosts.length;

  // Group visible posts by year
  const groupedPosts = useMemo(() => {
    const groups: { [year: string]: BlogPost[] } = {};

    visiblePosts.forEach((post) => {
      const year = new Date(post.metadata.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(post);
    });

    return Object.keys(groups)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year) => ({ year, posts: groups[year] }));
  }, [visiblePosts]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setShowSuggestions(false);
    setTagQuery("");
    setDisplayCount(POSTS_PER_PAGE);
    const url = new URL(window.location.href);
    url.searchParams.delete("tag");
    window.history.pushState({}, "", url.toString());
    setSearchParamsObj(new URLSearchParams(url.search));
  };

  const hasActiveFilters = searchQuery !== "" || selectedTag !== null;

  // Search result description
  const resultDescription = useMemo(() => {
    if (!hasActiveFilters) return null;
    const total = filteredPosts.length;
    if (total === 0) return "no posts found";
    const terms: string[] = [];
    if (selectedTag) terms.push(`tagged "${selectedTag}"`);
    if (searchQuery) terms.push(`matching "${searchQuery.trim()}"`);
    const prefix = terms.join(", ");
    if (hasMore) {
      return `${total} post${total !== 1 ? "s" : ""} ${prefix} (showing first ${displayCount})`;
    }
    return `${total} post${total !== 1 ? "s" : ""} ${prefix}`;
  }, [hasActiveFilters, filteredPosts.length, selectedTag, searchQuery, hasMore, displayCount]);

  return (
    <div className="px-4 pb-16 pt-10 sm:pb-24 sm:pt-14 sm:px-6">
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

        {/* Series Strip */}
        {series && <SeriesStrip series={series} />}

        {/* Filters */}
        <div className="mb-8 space-y-4 font-mono">
          {/* Search with chip + autocomplete */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" style={{ color: T.comment }} />

            <div
              className="flex w-full items-center gap-1.5 rounded border py-2 pl-10 pr-12 transition-colors"
              style={{
                backgroundColor: T.bg,
                borderColor: T.gutter,
              }}
            >
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
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.borderColor = tA(T.purple, "66");
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
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors"
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

          {/* Tags with counts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider" style={{ color: T.comment }}>
              topics:
            </span>
            {allTags.slice(0, 8).map(({ tag, count }) => (
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
                [{tag}] <span className="opacity-60">({count})</span>
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

          {/* Search result count */}
          {resultDescription && (
            <div
              className="text-xs font-mono"
              style={{ color: T.comment }}
            >
              <span style={{ color: T.green }}>$</span>{" "}
              found <span style={{ color: T.purple }}>{resultDescription}</span>
            </div>
          )}
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
                      const titleParts = highlightTextFixed(post.metadata.title, searchQuery);
                      const excerptParts = post.metadata.excerpt
                        ? highlightTextFixed(post.metadata.excerpt, searchQuery)
                        : null;

                      return (
                        <a
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="group block px-3 sm:px-4 py-3 sm:py-4 transition-colors duration-150"
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
                          {/* Main row */}
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Tree prefix + hash: hidden on mobile */}
                            <div className="shrink-0 hidden sm:flex items-center gap-2 font-mono text-xs md:text-sm">
                              <span style={{ color: T.gutter }}>{prefix}</span>
                              <span style={{ color: T.yellow }}>{hash}</span>
                            </div>

                            {/* Content column */}
                            <div className="flex-1 min-w-0">
                              {/* Title row */}
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0 font-mono text-sm md:text-base font-medium leading-snug">
                                  <span className="group-hover:hidden">
                                    {titleParts.map((part, j) =>
                                      part.highlight ? (
                                        <mark key={j} style={{ backgroundColor: tA(T.yellow, "40"), color: T.yellow, borderRadius: 2, padding: "0 1px" }}>
                                          {part.text}
                                        </mark>
                                      ) : (
                                        <span key={j} style={{ color: T.fg }}>{part.text}</span>
                                      )
                                    )}
                                  </span>
                                  <span className="hidden group-hover:inline">
                                    {titleParts.map((part, j) =>
                                      part.highlight ? (
                                        <mark key={j} style={{ backgroundColor: tA(T.yellow, "40"), color: T.yellow, borderRadius: 2, padding: "0 1px" }}>
                                          {part.text}
                                        </mark>
                                      ) : (
                                        <span key={j} style={{ color: T.purple }}>{part.text}</span>
                                      )
                                    )}
                                  </span>
                                </div>
                                {/* Arrow: visible on mobile, opacity transition on desktop */}
                                <span
                                  className="shrink-0 font-mono text-sm md:text-base transition-opacity duration-150 opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                                  style={{ color: T.purple }}
                                >
                                  ↗
                                </span>
                              </div>

                              {/* Metadata row */}
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                {/* Date + reading time: always visible */}
                                <span className="font-mono text-[11px] sm:text-xs tabular-nums" style={{ color: T.green }}>
                                  {dateFormatter({
                                    date: post.metadata.date,
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                {post.metadata.readingTime && (
                                  <span className="font-mono text-[11px] sm:text-xs" style={{ color: T.cyan }}>
                                    {post.metadata.readingTime}
                                  </span>
                                )}

                                {/* Tags: hidden on mobile */}
                                {post.metadata.tags && post.metadata.tags.length > 0 && (
                                  <span className="hidden md:inline-flex items-center gap-1">
                                    {post.metadata.tags.slice(0, 2).map((tag) => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleTagSelect(tag);
                                        }}
                                        className="font-mono text-[10px] sm:text-xs rounded px-1.5 py-0.5 transition-colors duration-150"
                                        style={{
                                          color: selectedTag === tag ? T.purple : T.cyan,
                                          backgroundColor: selectedTag === tag ? tA(T.purple, "15") : "transparent",
                                          border: `1px solid ${selectedTag === tag ? tA(T.purple, "30") : "transparent"}`,
                                        }}
                                        onMouseEnter={(e2) => {
                                          e2.currentTarget.style.backgroundColor = selectedTag === tag
                                            ? tA(T.purple, "25")
                                            : tA(T.gutter, "40");
                                        }}
                                        onMouseLeave={(e2) => {
                                          e2.currentTarget.style.backgroundColor = selectedTag === tag
                                            ? tA(T.purple, "15")
                                            : "transparent";
                                        }}
                                        title={`Filter by ${tag}`}
                                      >
                                        [{tag}]
                                      </button>
                                    ))}
                                  </span>
                                )}
                              </div>

                              {/* Excerpt */}
                              {post.metadata.excerpt && (
                                <p
                                  className="mt-1 font-mono text-[11px] sm:text-xs line-clamp-1"
                                  style={{ color: T.comment }}
                                >
                                  {excerptParts
                                    ? excerptParts.map((part, j) =>
                                        part.highlight ? (
                                          <mark key={j} style={{ backgroundColor: tA(T.yellow, "30"), color: T.yellow, borderRadius: 2, padding: "0 1px" }}>
                                            {part.text}
                                          </mark>
                                        ) : (
                                          <span key={j}>{part.text}</span>
                                        )
                                      )
                                    : post.metadata.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </TerminalWindow>
              </section>
            ))
          )}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setDisplayCount((c) => c + POSTS_PER_PAGE)}
              className="group inline-flex items-center gap-2 rounded px-5 py-2.5 font-mono text-sm transition-all duration-200 hover:brightness-125"
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
              <span>load more posts</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>
          </div>
        )}

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
