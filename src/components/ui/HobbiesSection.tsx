import { useState, useRef } from "react";
import { FaExternalLinkAlt, FaImage } from "react-icons/fa";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  favoriteItems,
  categoryLabels,
  type FavoriteItem,
} from "@/lib/favoriteItems";
import TerminalWindow, { T } from "@/components/ui/TerminalWindow";

/* ── Staggered list with tree-style prefixes ── */
function StaggeredList({ items }: { items: FavoriteItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref}>
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <motion.div
              key={item.name}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={
                isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }
              }
              exit={{ opacity: 0, x: 12 }}
              transition={{
                duration: 0.3,
                delay: Math.min(i * 0.03, 0.5),
                ease: [0.25, 0.46, 0.45, 0.94],
                layout: { duration: 0.25 },
              }}
            >
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <FavoriteItemRow item={item} isLast={isLast} />
                </a>
              ) : (
                <FavoriteItemRow item={item} isLast={isLast} />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function HobbiesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const categories = Array.from(
    new Set(favoriteItems.map((item) => item.category))
  );
  const filteredItems = selectedCategory
    ? favoriteItems.filter((item) => item.category === selectedCategory)
    : favoriteItems;

  const tabs = [
    { key: null, label: "*" },
    ...categories.map((c) => ({
      key: c,
      label: categoryLabels[c as keyof typeof categoryLabels],
    })),
  ];

  return (
    <TerminalWindow
      title="~/favorites/list.sh"
      statusBar={
        <div className="flex justify-between">
          <span className="truncate">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            <span className="hidden sm:inline">
              {selectedCategory
                ? ` · filtered: ${categoryLabels[selectedCategory as keyof typeof categoryLabels]}`
                : " · showing all"}
            </span>
          </span>
          <span className="shrink-0">hi :3</span>
        </div>
      }
    >
      {/* Command prompt with filter */}
      <div className="font-mono text-xs sm:text-sm mb-3 sm:mb-4">
        <span style={{ color: T.green }}>$</span>{" "}
        <span style={{ color: T.fg }}>ls</span>{" "}
        <span style={{ color: T.purple }}>--filter</span>{" "}
        <span style={{ color: T.yellow }}>
          {selectedCategory
            ? categoryLabels[
                selectedCategory as keyof typeof categoryLabels
              ].toLowerCase()
            : "all"}
        </span>
      </div>

      {/* Category filter — terminal tab bar */}
      <div
        className="flex flex-wrap gap-1 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b font-mono text-[11px] sm:text-xs"
        style={{ borderColor: T.gutter }}
      >
        {tabs.map((tab) => {
          const isActive = selectedCategory === tab.key;
          return (
            <button
              key={tab.key ?? "all"}
              onClick={() => setSelectedCategory(tab.key)}
              className="relative px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-all duration-150"
              style={{
                backgroundColor: isActive ? `${T.purple}22` : "transparent",
                color: isActive ? T.purple : T.comment,
                border: `1px solid ${isActive ? `${T.purple}44` : "transparent"}`,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = T.fg;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = T.comment;
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Items list — tree style */}
      <StaggeredList items={filteredItems} />
    </TerminalWindow>
  );
}

interface FavoriteItemRowProps {
  item: FavoriteItem;
  isLast: boolean;
}

function FavoriteItemRow({ item, isLast }: FavoriteItemRowProps) {
  const isImageIcon = typeof item.icon === "string";
  const IconComponent = !isImageIcon
    ? (item.icon as React.ElementType)
    : null;
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const prefix = isLast ? "└─ " : "├─ ";

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-1 rounded transition-colors duration-150 cursor-pointer font-mono text-xs sm:text-sm"
      style={{
        color: T.fg,
        backgroundColor: hovered ? `${T.purple}10` : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tree prefix — hidden on small mobile */}
      <span
        className="hidden sm:inline shrink-0 select-none"
        style={{ color: T.gutter }}
      >
        {prefix}
      </span>

      {/* Icon */}
      <div
        className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: `${T.fg}0a` }}
      >
        {isImageIcon ? (
          imageError ? (
            <FaImage
              className="w-3 h-3 sm:w-3.5 sm:h-3.5"
              style={{ color: T.comment }}
              title={`Failed to load icon for ${item.name}`}
            />
          ) : (
            <img
              src={item.icon as string}
              alt={item.name}
              width={14}
              height={14}
              className="object-contain"
              style={{ filter: item.invertIcon ? "invert(1)" : "none" }}
              onError={() => setImageError(true)}
            />
          )
        ) : IconComponent ? (
          <IconComponent
            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
            style={{ color: item.color }}
          />
        ) : (
          <div
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded"
            style={{ backgroundColor: T.comment }}
          />
        )}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="font-medium truncate"
            style={{ color: hovered ? T.purple : T.fg }}
          >
            {item.name}
          </span>
          {item.url && (
            <FaExternalLinkAlt
              className="w-2.5 h-2.5 shrink-0 transition-opacity"
              style={{
                color: T.comment,
                opacity: hovered ? 1 : 0,
              }}
            />
          )}
        </div>
        {item.description && (
          <p
            className="truncate"
            style={{ color: T.comment, fontSize: "11px" }}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Category on larger screens */}
      <span
        className="hidden md:block shrink-0"
        style={{ color: T.gutter, fontSize: "11px" }}
      >
        {categoryLabels[item.category as keyof typeof categoryLabels]}
      </span>
    </div>
  );
}
