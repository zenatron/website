"use client";

import { useState, useRef } from "react";
import { LinkItem } from "@/types/types";
import { motion } from "framer-motion";
import { FaList, FaTh } from "react-icons/fa";
import GradientText from "../ui/GradientText";
import VariableProximity from "../ui/VariableProximity";
import LinkCard from "../ui/LinkCard";
import ShinyText from "../ui/ShinyText";

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
          <GradientText animationSpeed={24} transparent={true} colors={["#00d4ff", "#0099ff", "#0047ff", "#00d4ff"]}>
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
        <motion.div
          className="mt-2 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ShinyText
            text="Connect with me across platforms!"
            disabled={false}
            speed={3}
            className="tag-bubble text-sm md:text-lg border-gray-600 hover:border-gray-400 transition-all duration-300"
          />
          <motion.p
            className="text-secondary-text text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {"SWE • AI/ML • Games"}
          </motion.p>
        </motion.div>
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
            style={viewMode === "grid" ? { aspectRatio: "1 / 1" } : undefined}
          >
            <LinkCard item={link} viewMode={viewMode} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
