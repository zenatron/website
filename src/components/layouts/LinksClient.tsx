"use client";

import { useRef } from "react";
import { LinkItem } from "@/types/types";
import { motion } from "framer-motion";
import GradientText from "../ui/GradientText";
import VariableProximity from "../ui/VariableProximity";
import LinkCard from "../ui/LinkCard";
import ShinyText from "../ui/ShinyText";

interface LinksClientProps {
  links: LinkItem[];
}

export default function LinksClient({ links }: LinksClientProps) {
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
          <GradientText
            animationSpeed={24}
            transparent={true}
            colors={["#00d4ff", "#0099ff", "#0047ff", "#00d4ff"]}
          >
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

      {/* Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2 max-w-md mx-auto"
      >
        {links.map((link) => (
          <motion.div
            key={link.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LinkCard item={link} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
