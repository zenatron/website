"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BlogPost } from "@/types/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import dateFormatter from "@/utils/dateFormatter";
import { ArrowRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ContactModal from "@/components/ui/ContactModal";

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTag = searchParams.get("tag");

  const [searchQuery, setSearchQuery] = useState("");
  const [idleTime, setIdleTime] = useState(0);
  const [wordCountClicks, setWordCountClicks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate total words across all posts
  const totalWords = useMemo(() => {
    return posts.reduce((acc, post) => {
      const wordCount =
        post.searchableContent?.split(/\s+/).filter(Boolean).length || 0;
      return acc + wordCount;
    }, 0);
  }, [posts]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync URL tag param with state
  useEffect(() => {
    const urlTag = searchParams.get("tag");
    setSelectedTag(urlTag);
  }, [searchParams]);

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
    if (idleTime < 5) return "Search posts... (use # for tags)";
    if (idleTime < 10) return "Still thinking?";
    if (idleTime < 15) return "Just type something...";
    if (idleTime < 20) return "Literally anything...";
    if (idleTime < 30) return "I'm getting lonely here...";
    return "Fine. I'll wait. Forever, I guess.";
  };

  // Easter egg: Check for "42" search
  const is42Search = searchQuery.trim() === "42";

  // Easter egg: Check for "bug" search
  const isBugSearch = searchQuery.trim().toLowerCase() === "bug";

  // Word count click easter egg messages
  const getWordCountMessage = () => {
    if (wordCountClicks === 0) return null;
    if (wordCountClicks < 2)
      return `That's ${Math.round(totalWords / 280)} tweets worth`;
    if (wordCountClicks < 3)
      return `Or ${Math.round(totalWords / 250)} pages in a book`;
    if (wordCountClicks < 4)
      return `About ${Math.round(totalWords / 150)} minutes to read it all`;
    if (wordCountClicks < 5)
      return `${Math.round(totalWords / 11)} average sentences`;
    if (wordCountClicks < 6)
      return `Approximately ${(totalWords / 1320).toFixed(2)} Declarations of Independence`;
    if (wordCountClicks < 7)
      return `Around ${Math.round(totalWords * (4 / 3))} LLM tokens`;
    if (wordCountClicks < 8)
      return "Okay you really like clicking this huh";
    if (wordCountClicks < 10)
      return "Alright, that's enough clicking for now.";
    if (wordCountClicks < 12)
      return "There's nothing more to see here.";
    if (wordCountClicks < 15)
      return "I promise";
    if (wordCountClicks < 16)
      return "Okay fine...";
    if (wordCountClicks < 17)
      return "I'll tell you a joke:";
    if (wordCountClicks < 18)
      return "Two types of programmers exist: those who can extrapolate from incomplete data.";
    return "pls read my blog";
  };

  // Handle tag selection - update URL
  const handleTagSelect = (tag: string | null) => {
    if (tag) {
      router.push(`/blog?tag=${encodeURIComponent(tag)}`, { scroll: false });
    } else {
      router.push("/blog", { scroll: false });
    }
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.metadata.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  // Filter posts with hashtag support
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Check selected tag first
      if (selectedTag !== null && !post.metadata.tags?.includes(selectedTag)) {
        return false;
      }

      // Check search query
      if (searchQuery) {
        const itemContent =
          post.metadata.title.toLowerCase() +
          " " +
          (post.metadata.excerpt?.toLowerCase() || "") +
          " " +
          (post.searchableContent?.toLowerCase() || "");

        // Split search query into terms
        const terms = searchQuery.toLowerCase().split(" ");

        // Check if all terms match
        const matchesSearch = terms.every((term) => {
          if (term === "") return true;

          // If term is a tag search (starts with #)
          if (term.startsWith("#")) {
            const tagQuery = term.slice(1).toLowerCase();
            if (!tagQuery) return true;
            const itemTagsLower =
              post.metadata.tags?.map((tag) => tag.toLowerCase().trim()) || [];
            return itemTagsLower.some((tag) => tag.includes(tagQuery));
          }

          // For regular search terms
          return itemContent.includes(term);
        });

        if (!matchesSearch) return false;
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
    router.push("/blog", { scroll: false });
  };

  const hasActiveFilters = searchQuery !== "" || selectedTag !== null;

  return (
    <div className="px-4 pb-24 pt-32 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-16 space-y-6">
          <p className="text-sm font-medium tracking-[0.2em] text-accent">
            BLOG
          </p>
          <h1 className="text-4xl tracking-tight md:text-5xl">
            Barely Legible Organized Gibberish
          </h1>
          <p className="max-w-xl text-secondary-text">
            Thoughts on code, learning, and whatever else I&apos;m figuring out.{" "}
            <span
              className="tabular-nums text-accent cursor-pointer hover:underline"
              onClick={() => setWordCountClicks((c) => c + 1)}
              title="Click me!"
            >
              {totalWords.toLocaleString()}
            </span>{" "}
            words written so far.
            {getWordCountMessage() && (
              <span className="block text-xs text-muted-text mt-1 italic">
                ({getWordCountMessage()})
              </span>
            )}
          </p>
        </header>

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={getPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-12 text-base sm:text-sm text-primary-text placeholder-muted-text outline-none transition-colors focus:border-accent/30 focus:bg-white/[0.04]"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-text sm:inline-block">
              /
            </kbd>
          </div>

          {/* 42 Easter Egg */}
          {is42Search && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 max-w-md">
              <p className="text-sm text-accent font-medium">
                🌌 The Answer to Life, the Universe, and Everything
              </p>
              <p className="text-xs text-muted-text mt-1">
                But what was the question? - Douglas Adams
              </p>
            </div>
          )}

          {/* Bug Easter Egg */}
          {isBugSearch && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 max-w-md">
              <p className="text-sm text-accent font-medium">
                🐛 No bugs here!
              </p>
              <p className="text-xs text-muted-text mt-1">
                Only &quot;undocumented features&quot; and &quot;creative
                interpretations of the spec.&quot;
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs uppercase tracking-wider text-muted-text">
              Topics:
            </span>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  handleTagSelect(selectedTag === tag ? null : tag)
                }
                className={cn(
                  "tag-bubble",
                  selectedTag === tag
                    ? "!bg-accent/30"
                    : "opacity-80 hover:opacity-100"
                )}
              >
                #{tag}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-text transition-colors hover:text-primary-text"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-16">
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-secondary-text">
                No posts found matching your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-accent hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            groupedPosts.map((group) => (
              <section key={group.year} className="relative">
                {/* Year marker */}
                <div className="sticky top-24 z-10 mb-6 flex items-center gap-4">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                    {group.year}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-accent/20 to-transparent" />
                </div>

                {/* Posts list */}
                <div className="space-y-2">
                  {group.posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group relative block rounded-xl py-5 px-4 transition-colors hover:bg-white/[0.02] sm:pl-8"
                    >
                      {/* Timeline dot - hidden on mobile */}
                      <span className="absolute left-3 top-7 hidden h-2 w-2 rounded-full border-2 border-accent/40 bg-primary-bg transition-colors group-hover:border-accent group-hover:bg-accent sm:block" />

                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-2">
                          <h2 className="text-lg font-medium text-primary-text transition-colors group-hover:text-accent">
                            {post.metadata.title}
                          </h2>
                          {post.metadata.excerpt && (
                            <p className="text-sm text-secondary-text line-clamp-2">
                              {post.metadata.excerpt}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-text">
                            <time>
                              {dateFormatter({
                                date: post.metadata.date,
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                            {post.metadata.readingTime && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-white/20" />
                                <span>{post.metadata.readingTime}</span>
                              </>
                            )}
                            {post.metadata.tags &&
                              post.metadata.tags.length > 0 && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-white/20" />
                                  <div className="flex gap-2">
                                    {post.metadata.tags
                                      .slice(0, 2)
                                      .map((tag) => (
                                        <span key={tag} className="tag">
                                          {tag}
                                        </span>
                                      ))}
                                  </div>
                                </>
                              )}
                          </div>
                        </div>

                        <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-text opacity-0 transition-all group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100 sm:block" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-5 py-2 text-sm font-medium text-accent transition-colors"
            style={{
              backgroundColor: "rgba(124, 138, 255, 0.15)",
              border: "1px solid rgba(124, 138, 255, 0.3)",
            }}
          >
            Get in touch
          </button>
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
