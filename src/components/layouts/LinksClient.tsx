"use client";

import { useState, useRef } from "react";
import { LinkItem } from "@/types/types";
import { motion } from "framer-motion";
import { FaList, FaTh } from "react-icons/fa";
import GradientText from "../ui/GradientText";
import VariableProximity from "../ui/VariableProximity";
import LinkCard from "../ui/LinkCard";

type ViewMode = "grid" | "list";

interface LinksClientProps {
  links: LinkItem[];
}

export default function LinksClient({ links }: LinksClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const containerRef = useRef(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10">
        <div
          ref={containerRef}
          style={{
            position: "relative",
            minHeight: "100px",
            width: "100%",
            padding: "10px",
          }}
        >
          <GradientText animationSpeed={24} transparent={true}>
            <VariableProximity
              label="Phil Vishnevsky"
              className="text-6xl md:text-6xl font-bold"
              fromFontVariationSettings="'wght' 100, 'opsz' 8"
              toFontVariationSettings="'wght' 900, 'opsz' 48"
              containerRef={
                containerRef as unknown as React.RefObject<HTMLElement>
              }
              radius={100}
              falloff="linear"
            />
          </GradientText>
        </div>
        <p className="text-lg md:text-xl text-muted-text leading-relaxed">
          Connect with me across platforms!
        </p>
      </section>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-8">
        <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5 ${
              viewMode === "list" ? "text-accent" : "text-muted-text"
            }`}
            aria-label="List View"
            title="List View"
          >
            <FaList />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 flex items-center gap-2 transition-colors hover:bg-white/5 ${
              viewMode === "grid" ? "text-accent" : "text-muted-text"
            }`}
            aria-label="Grid View"
            title="Grid View"
          >
            <FaTh />
          </button>
        </div>
      </div>

      {/* Links */}
      <motion.div
        layout
        key={viewMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "flex flex-col gap-4"
        }
      >
        {links.map((link) => (
          <motion.div
            layout
            key={link.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LinkCard item={link} viewMode={viewMode} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
